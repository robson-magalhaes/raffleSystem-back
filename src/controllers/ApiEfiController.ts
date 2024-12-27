import { Request, Response } from "express";
import { prisma } from "../database/client";
import EfiPay from "sdk-node-apis-efi";
import dotenv from 'dotenv';
import { credentialsOptions } from '../credentials/credentialsOptions';

dotenv.config();

export default {
    create_payment: async (req: Request, res: Response) => {
        const { first_name, last_name, telephone, unit_price, quantity, raffleId, userId } = req.body;
        const buyer = `${first_name} ${last_name}`;
        const transaction_amount = (quantity * unit_price).toFixed(2);

        const body = {
            calendario: {
                expiracao: 120,
            },
            valor: {
                original: transaction_amount,
            },
            chave: process.env.CHAVE_PIX as string,
            infoAdicionais: [
                {
                    nome: "Devedor",
                    valor: `${buyer}`
                },
                {
                    nome: 'Telefone',
                    valor: telephone,
                },
                // {
                //     nome: 'E-mail',
                //     valor: 'email@hotmail.com',
                // },
            ],
        };

        const efipay = new EfiPay(credentialsOptions);

        try {
            const paymentData: any = await efipay.pixCreateImmediateCharge({}, body);
            const pix_data = await efipay.pixGenerateQRCode({ id: paymentData.loc.id });

            if (!raffleId) {
                await prisma.purchaseByQuota.create({
                    data: {
                        buyer,
                        telephone,
                        ticketNumber: quantity,
                        paymentStatus: paymentData.status,
                        txid: paymentData.txid,
                        userId: parseInt(userId)
                    }
                });
            } else {
                await prisma.purchase.create({
                    data: {
                        raffleId,
                        buyer,
                        telephone,
                        ticketNumber: quantity,
                        paymentStatus: paymentData.status,
                        txid: paymentData.txid,
                        userId: parseInt(userId)
                    }
                });
            }
            paymentData["pix_data"] = pix_data;
            res.status(200).json({ paymentData });


        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    get_payment: async (req: Request, res: Response) => {
        const efipay = new EfiPay(credentialsOptions);

        try {
            const paymentData: any = await efipay.pixDetailCharge({ txid: req.body.txid });

            if (paymentData) {
                const purchase = await prisma.purchase.findMany({
                    where: { txid: req.body.txid }
                })
                const purchaseByQuota = await prisma.purchaseByQuota.findMany({
                    where: { txid: req.body.txid }
                })

                const dateNow = new Date();
                const creationDate = new Date(paymentData.calendario.criacao);

                const differenceInMilliseconds = dateNow.getTime() - creationDate.getTime();
                const differenceInSeconds = Math.floor(differenceInMilliseconds / 1000);

                const expire = paymentData.calendario.expiracao;

                if (differenceInSeconds >= expire) {

                    if (purchase.length > 0) {
                        await prisma.purchase.updateMany({
                            where: { txid: req.body.txid },
                            data: { paymentStatus: "EXPIRED" }
                        });
                    }
                    if (purchaseByQuota.length > 0) {
                        await prisma.purchaseByQuota.updateMany({
                            where: { txid: req.body.txid },
                            data: { paymentStatus: "EXPIRED" }
                        });
                    }
                    res.status(200).json({ paymentData, expired: true, expireCurrent: differenceInSeconds })
                } else {
                    res.status(200).json({ paymentData, expired: false, expireCurrent: differenceInSeconds })
                }
            }

        } catch (error: any) {
            console.error('Erro ao obter dados de pagamento:', error.message);
            res.json({ error: error.message });
        }

    },

    webhooks: async (req: Request, res: Response) => {
        credentialsOptions['validateMtls'] = false;

        const body = {
            webhookUrl: 'https://raffle-robyntec-back.vercel.app/webhooks',
        };
        const params = {
            chave: process.env.CHAVE_PIX as string,
        };
        const efipay = new EfiPay(credentialsOptions);

        efipay.pixConfigWebhook(params, body)
            .then((resposta: any) => {
                console.log("Request webhooks: ", req.body)
                console.log('Webhooks Config: ', resposta);
            })
            .catch((error: any) => {
                console.log(error);
            });
    },

    webhooks_pix: async (req: Request, res: Response) => {
        try {
            const txid = req.body.pix[0].txid
            const efipay = new EfiPay(credentialsOptions);
            const paymentData: any = await efipay.pixDetailCharge({ txid });

            const dateNow = new Date();
            const creationDate = new Date(paymentData.calendario.criacao);
            const differenceInMilliseconds = dateNow.getTime() - creationDate.getTime();
            const differenceInSeconds = Math.floor(differenceInMilliseconds / 1000);
            const expire = paymentData.calendario.expiracao;
            if (differenceInSeconds >= expire) {
                paymentData.status = "EXPIRED";
            }
            
            const purchase = await prisma.purchase.findMany({
                where: { txid }
            })
            const purchaseByQuota = await prisma.purchaseByQuota.findMany({
                where: { txid }
            })

            if (purchase.length > 0) {
                await prisma.purchase.updateMany({
                    where: { txid },
                    data: { paymentStatus: paymentData.status }
                });
            }
            if (purchaseByQuota.length > 0) {
                await prisma.purchaseByQuota.updateMany({
                    where: { txid },
                    data: { paymentStatus: paymentData.status }
                });
            }
            res.status(200).end();
        } catch {
            res.status(401).end();
        }
    }
};
