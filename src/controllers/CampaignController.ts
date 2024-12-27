import { Request, Response } from "express";
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const listAll = async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const campaigns = await prisma.campaign.findMany({ where: { userId: Number(userId) } });
        const raffles = await prisma.raffles.findMany({ where: { userId: Number(userId) } });

        if (campaigns && raffles) {
            let totalProductValue = 0;
            campaigns.map(c => {
                raffles.map(x => {
                    totalProductValue += Number(x.productValue) //* x.productQnt;
                });
                c.totalProductValue = new Prisma.Decimal(totalProductValue);
                prisma.campaign.update({
                    where: { id: c.id },
                    data: { totalProductValue }
                });
            });
        }
        res.json(campaigns);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar campanhas.' });
    }
}

export const createCampaign = async (req: Request, res: Response) => {
    const { name, quota, minValue, description } = req.body;
    const { userId } = req.params
    try {
        const newCampaign = await prisma.campaign.create({
            data: { userId: Number(userId), name, quota, minValue, description, soldTicket: 0, totalProductValue: 0, totalSoldTicketValue: 0 }
        });
        res.status(201).json({
            success: true,
            ...newCampaign
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar campanha.' });
    }
}

export const editCampaign = async (req: Request, res: Response) => {
    const { id, name, quota, minValue, description } = req.body;

    try {
        const campaign = await prisma.campaign.findUnique({
            where: { id }
        });

        if (campaign) {
            const updatedCampaign = await prisma.campaign.update({
                where: { id: campaign.id },
                data: { name, quota, minValue, description }
            });
            res.json(updatedCampaign);
        } else {
            res.status(404).json({ result: 'Campanha não encontrada.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao editar campanha.' });
    }
}

export const deleteCampaign = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const campaign = await prisma.campaign.findUnique({
            where: { id: Number(id) }
        });

        if (campaign) {
            await prisma.campaign.delete({
                where: { id: Number(id) }
            });
            res.json({ Resultado: `A campanha com id [${id}], foi removida com sucesso!!` });
        } else {
            res.status(404).json({ error: "Id não encontrado!!" });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar campanha.' });
    }
}
