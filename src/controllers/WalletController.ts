import { Request, Response } from "express";
import { prisma } from "../database/client"
import { Prisma } from "@prisma/client";
import { credentialsOptions } from "../credentials/credentialsOptions";
import EfiPay from "sdk-node-apis-efi";
import dotenv from 'dotenv';
dotenv.config();

export default {
    addBalance: async (req: Request, res: Response) => {
        const user = await prisma.user.findUnique({
            where: { id: req.body.id }
        });
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }
        const balanceToAdd = new Prisma.Decimal(req.body.balance);
        const updatedBalance = user.balance_pix
            ? user.balance_pix.add(balanceToAdd)
            : balanceToAdd;

        const result = await prisma.user.update({
            where: { id: req.body.id },
            data: {
                balance_pix: updatedBalance,
            },
        });
        res.json({ result })
    },
    checkBalance: async (req: Request, res: Response) => {
        const response = await prisma.user.findUnique({ where: { id: req.body.id } })
        res.json({ response })
    },
    pixSend: async (req: Request, res: Response) => {
        const efipay = new EfiPay(credentialsOptions);
        const user = await prisma.user.findUnique({
            where: { id: req.body.userId }
        });

        if (!user || !user.chave_pix) {
            return res.status(400).json({ error: "Usuário não encontrado ou chave Pix não está cadastrada." });
        }

        let params = {
            idEnvio: req.body.idEnvio,
        }

        let chave = user?.chave_pix.toString();
        chave = chave.replace(/\D/g, '');

        if (chave.length === 11 && /^([1-9]{2})(9[0-9]{8})$/.test(chave)) {
            chave = `+55${chave}`;
        }
        const chaveFavorecido = chave

        let body = {
            valor: req.body.valor,
            pagador: {
                chave: process.env.CHAVE_PIX as string,
            },
            favorecido: {
                chave: chaveFavorecido,
            },
        }

        const response = await efipay.pixSend(params, body)
            .then((resposta) => {
                return { resposta, success: true }
            }).catch(error => {
                return { error, success: false }
            });
        if (response.success) {
            await prisma.user.update({
                where: { id: req.body.userId },
                data: { balance_pix: 0 }
            })
        }

        console.log('Resposta: ', response)
        
        res.json({ response })
    }
}