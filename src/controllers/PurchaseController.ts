import { Request, Response } from "express";
import { prisma } from "../database/client";
import stringUtils from "../utils/stringUtils";
import { Prisma } from "@prisma/client";

export default {
    listAll: async (req: Request, res: Response) => {
        const raffles = await prisma.raffles.findMany({
            where: { userId: Number(req.params.userId) }
        });
        const purchase = await prisma.purchase.findMany({
            where: { userId: Number(req.params.userId) }
        });
        const purchaseByQuota = await prisma.purchaseByQuota.findMany({
            where: { userId: Number(req.params.userId) }
        });

        purchase.forEach((x: any) => {
            const raffle = raffles.find(r => r.id === x.raffleId);
            if (raffle) {
                x['raffleName'] = raffle.productName;
            }
        });

        res.json({
            purchase: JSON.parse(
                JSON.stringify(purchase, (key, value) =>
                    typeof value === 'bigint' ? value.toString() : value
                )),
            purchaseByQuota: JSON.parse(
                JSON.stringify(purchaseByQuota, (key, value) =>
                    typeof value === 'bigint' ? value.toString() : value
                ))
        });
    },
    buy_raffle_only: async (req: Request, res: Response) => {
        const { txid, raffleId, telephone, buyer, soldTicketValue, ticketNumber } = req.body;

        if (!raffleId || !telephone || !buyer || isNaN(parseFloat(soldTicketValue))) {
            return res.status(400).json({ success: false, message: 'Dados inválidos.' });
        }

        const soldTicketValueDecimal = new Prisma.Decimal(parseFloat(soldTicketValue));
        const cleanedBuyer = stringUtils(buyer);

        try {
            const raffle = await prisma.raffles.findFirst({ where: { id: raffleId } });
            const purchase: any | null = await prisma.purchase.findFirst({
                where: { txid: txid }
            });


            if (purchase.paymentStatus == 'CONCLUIDA' &&
                raffle && raffle.totalTicketValue.lessThan(raffle.productValue) && raffle.productQnt > 0) {
                raffle.totalTicketValue = raffle.totalTicketValue.add(soldTicketValueDecimal);
                raffle.soldTickets = raffle.soldTickets.add(1);

                const user = await prisma.user.findFirst({
                    where: { id: purchase.userId }
                });
                if (purchase.paymentStatus == 'CONCLUIDA' &&
                    user) {
                    await prisma.user.update({
                        where: {
                            id: purchase.userId
                        },
                        data: {
                            balance_pix: user?.balance_pix?.add(soldTicketValueDecimal)
                        }
                    })
                }
                const campaign = await prisma.campaign.findFirst();
                if (campaign) {
                    campaign.totalSoldTicketValue = campaign.totalSoldTicketValue.add(parseFloat(soldTicketValue));
                    campaign.soldTicket = campaign.soldTicket + ticketNumber
                    await prisma.campaign.update({
                        where: { id: campaign.id },
                        data: {
                            totalSoldTicketValue: campaign.totalSoldTicketValue,
                            soldTicket: campaign.soldTicket
                        }
                    });
                }

                if (raffle.totalTicketValue.greaterThanOrEqualTo(raffle.productValue)) {
                    raffle.winner = purchase.id + ' - ' + cleanedBuyer;
                    raffle.productQnt -= 1;
                }

                await prisma.raffles.update({
                    where: { id: raffle.id },
                    data: {
                        totalTicketValue: raffle.totalTicketValue,
                        soldTickets: raffle.soldTickets,
                        productQnt: raffle.productQnt,
                        winner: raffle.winner
                    }
                });

                res.json({
                    success: true,
                    awardedQuota: raffle.awardedQuota,
                    soldTicketValue: soldTicketValue,
                    winner: raffle.winner,
                    txid,
                    buyer: cleanedBuyer,
                    productName: raffle.productName,
                    purchaseId: purchase.id
                });

            } else {
                res.json({ success: false, message: 'Prêmio ja contemplado ou pagamento não aprovado' });
            }
        } catch (error) {
            console.error('Erro ao comprar rifa:', error);
            res.status(500).json({ error: 'Erro ao processar compra.' });
        }
    },
    buy_for_quota: async (req: Request, res: Response) => {
        const { ticketNumber, soldTicketValue, txid } = req.body;
        const buyer = stringUtils(req.body.buyer);
        try {
            const totalRows = await prisma.raffles.count();
            if (totalRows === 0) {
                return res.status(404).json({ success: false, message: 'Nenhum sorteio disponível.' });
            }

            let randomRecord = null;
            let attempts = 0;
            const maxAttempts = 10;

            while (attempts < maxAttempts) {
                const randomOffset = Math.floor(Math.random() * totalRows);
                randomRecord = await prisma.raffles.findFirst({ skip: randomOffset });
                if (randomRecord && randomRecord.productQnt > 0) {
                    break;
                }
                attempts += 1;
            }

            if (!randomRecord || randomRecord.productQnt === 0) {
                return res.status(404).json({ success: false, message: 'Nenhum produto de rifa disponível.' });
            }

            const raffle = await prisma.raffles.findUnique({ where: { id: randomRecord.id } });
            const campaign = await prisma.campaign.findFirst();
            const purchase: any | null = await prisma.purchaseByQuota.findFirst({
                where: { txid: txid }
            });
            if (purchase.paymentStatus == 'CONCLUIDA' &&
                raffle && campaign && raffle.totalTicketValue.lessThan(raffle.productValue) && raffle.productQnt > 0) {

                raffle.totalTicketValue = raffle.totalTicketValue.add(parseFloat(soldTicketValue));
                raffle.soldTickets = raffle.soldTickets.add(1);
                campaign.totalSoldTicketValue = campaign.totalSoldTicketValue.add(parseFloat(soldTicketValue));
                campaign.soldTicket = campaign.soldTicket + ticketNumber;

                const user = await prisma.user.findFirst({
                    where: { id: purchase.userId }
                });
                if (purchase.paymentStatus == 'CONCLUIDA' &&
                    user) {
                    await prisma.user.update({
                        where: {
                            id: purchase.userId
                        },
                        data: {
                            balance_pix: user?.balance_pix?.add(soldTicketValue)
                        }
                    })
                }
                if (raffle.totalTicketValue.greaterThanOrEqualTo(raffle.productValue)) {
                    raffle.winner = purchase.id + ' - ' + buyer;
                    raffle.productQnt -= 1;
                }

                await prisma.campaign.update({
                    where: { id: campaign.id },
                    data: {
                        totalSoldTicketValue: campaign.totalSoldTicketValue,
                        soldTicket: campaign.soldTicket
                    }
                });

                await prisma.raffles.update({
                    where: { id: raffle.id },
                    data: {
                        totalTicketValue: raffle.totalTicketValue,
                        soldTickets: raffle.soldTickets,
                        productQnt: raffle.productQnt,
                        winner: raffle.winner
                    }
                });

                res.json({
                    success: true,
                    awardedQuota: raffle.awardedQuota,
                    soldTicketValue: soldTicketValue,
                    winner: raffle.winner,
                    txid,
                    buyer,
                    productName: raffle.productName,
                    purchaseId: purchase.id
                });
            } else {
                res.json({ success: false, message: 'Prêmio ja contemplado ou pagamento não aprovado' });
            }
        } catch (error) {
            console.error('Erro ao comprar rifa:', error);
            res.status(500).json({ error: 'Erro ao processar compra.' });
        }
    }
    ,

    delete_purchase_only: async (req: Request, res: Response) => {
        const purchase = await prisma.purchaseByQuota.findMany();
        if (purchase.length > 0) {
            await prisma.purchaseByQuota.deleteMany();
        }
        res.json({
            success: true
        })
    }
}