import { Request, Response } from "express";
import JWT from 'jsonwebtoken'
import dotenv from 'dotenv';
import { prisma } from "../database/client";

dotenv.config();

const secretKey = process.env.JWT_SECRET_KEY;

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const bcrypt = require('bcryptjs');

    try {
        const user = await prisma.user.findFirst({
            where: { email }
        })
        console.log("inValid");
        bcrypt.compare(password, user?.password, function (err: any, response: any) {
            if (response == true) {
                const token = JWT.sign(
                    { userId: user?.id },
                    process.env.JWT_SECRET_KEY as string,
                    { expiresIn: '2h' }
                )
                res.json({ status: true, token });
            } else {
                console.error("inValid")
                res.status(401).json({ message: 'Invalid credentials' });
            }
        });
    } catch (err) {
        res.status(401).json({ error: err });
    }

}

export const verifyAuth = (req: Request, res: Response) => {
    const { token } = req.body;

    try {
        JWT.verify(token, secretKey as string);
        res.json({ valid: true });
    } catch (err) {
        res.json({ valid: false });
    }
}
