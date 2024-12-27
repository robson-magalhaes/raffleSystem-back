import { Request, Response } from "express";
import { prisma } from "../database/client";

export const register = async (req: Request, res: Response) => {
    const bcrypt = require('bcryptjs');
    const { userName, lastName, telephone, email, password, chavePix } = req.body;
    const hash = bcrypt.hashSync(password, 8);
    
    try {
        await prisma.user.create({
            data: {
                userName,
                lastName,
                telephone,
                email,
                password: hash,
                chave_pix: chavePix
            }
        })

        res.status(200)
        res.json({ success: true })
    } catch (err) {
        res.json({ success: false, message: err });
    }
}

export const deleteUser = async (req: Request, res: Response) => {
    const id = req.params.id;
    try {
        await prisma.user.delete({
            where: { id: Number(id) }
        })
        res.json({ status: 'success!' })
    } catch (error) {
        res.json(error)
    }
}

export const listAll = async (req: Request, res: Response) => {
    const list = await prisma.user.findMany();
    if (list.length > 0) {
        res.json(list)
    } else {
        res.json({ list: 'Não há registros de usuarios!' })
    }
}
export const listOne = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const data = await prisma.user.findFirst({
            where: { id: Number(id) }
        })
        res.status(200);
        res.json(data);
    } catch (err) {
        console.log(err)
        res.json({ error: err });
    }
}
export const editUser = async (req: Request, res: Response) => {
    const bcrypt = require('bcryptjs');
    const { id, userName, lastName, telephone, email, password, chavePix } = req.body;

    try {
        const data: any = {
            userName,
            lastName,
            telephone,
            email,
            chave_pix:chavePix
        };
        
        if (password) {
            const hash = bcrypt.hashSync(password, 8);
            data.password = hash;
        }

        await prisma.user.update({
            where: { id: id },
            data: data,
        });

        res.json({ success: true });
    } catch (err) {
        console.log(err);
        res.json({ success: false });
    }
};
