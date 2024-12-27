import { NextFunction, Request, Response } from "express";
import dotenv from 'dotenv';
import JWT from 'jsonwebtoken';

dotenv.config();

export const Auth = {
    private: async (req: Request, res: Response, next: NextFunction) => {
        let success = false;
        if (req.headers.authorization) {
            const [authType, token] = req.headers.authorization.toString().split(' ');
            if (authType === 'Bearer') {
                try {
                    JWT.verify(token, process.env.JWT_SECRET_KEY as string);
                    success = true;
                } catch {
                    console.log('Deu erro no JWT');
                }
            }
        }
        if (success) {
            next();
        } else {
            res.status(403)
            res.json({ error: "Não Autorizado!!", success: false });
        }
    }
}