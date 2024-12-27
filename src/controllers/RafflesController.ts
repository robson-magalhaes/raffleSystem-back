import { Request, Response } from "express";
import { generateRandomNumbers } from "../utils/generateNumbers";
import { prisma } from "../database/client";

export default {
    listAllRaffles: async (req: Request, res: Response) => {
        try {
            const raffles = await prisma.raffles.findMany({
                where: { userId: Number(req.params.id) },
                orderBy: {
                    id: 'asc'
                },
            });
            res.json(raffles.sort());
        } catch (error) {
            console.error('Erro ao buscar rifas:', error);
            res.status(500).json({ error: 'Erro ao buscar rifas.' });
        }
    },
    createRaffles: async (req: Request, res: Response) => {
        let userId = req.params.id;
        let productName = req.body.productName;
        let productValue = parseFloat(req.body.productValue).toFixed(2);
        let ticketValue = parseFloat(req.body.ticketValue).toFixed(2);
        let productQnt = req.body.productQnt;
        for (let uni = 1; uni <= productQnt; uni++) {
            let awardedQuota = generateRandomNumbers().toString().replace(/,/g, '');
            let raffles = await prisma.raffles.create({
                data: {
                    productName,
                    productValue,
                    ticketValue,
                    productQnt: 1,
                    awardedQuota,
                    user: {
                        connect: {
                            id: Number(userId),
                        },
                    },
                }
            });
            raffles.awardedQuota = raffles.awardedQuota + raffles.id.toString().charAt(0) + raffles.id.toString().slice(-1);
            await prisma.raffles.update({
                where: { id: raffles.id },
                data: { awardedQuota: raffles.awardedQuota }
            })
        }
        const campaign = await prisma.campaign.findFirst({
            where: { userId: Number(userId) }
        });
        
        if (campaign) {
            await prisma.campaign.update({
                where: { id: campaign?.id },
                data: {
                    totalProductValue: campaign?.totalProductValue.add(productValue)
                }
            })
        }

        res.status(201);
        res.json({ status: 'Sorteio criado com sucesso!!' });

    },
    deleteRaffle: async (req: Request, res: Response) => {
        let { id } = req.params;
        let raffle = await prisma.raffles.findUnique({ where: { id: parseInt(id) } });
        if (raffle) {
            await prisma.raffles.delete({ where: { id: parseInt(id) } });
            res.json({ Resultado: `O sorteio com id [${id} - ${raffle.productName}], foi removido com sucesso!!` })
        } else {
            res.json({ error: "Id nao encontrado!!" })
        }
    }
}

