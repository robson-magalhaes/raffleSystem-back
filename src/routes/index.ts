import { Router } from 'express';
import { prisma } from '../database/client';
import { Auth } from '../middlewares/auth';
const route = Router();

route.get('/', async (req, res) => {
    res.json({ status: 'Servidor OK' })
})

route.delete('/destroy_all', Auth.private, async (req, res) => {
    const userId = req.body.userId;

    try {
        const tablesToDeleteFrom = [
            'Raffles',
            'Purchase',
            'PurchaseByQuota',
            'Campaign'
        ];

        for (const table of tablesToDeleteFrom) {
            await prisma.$executeRawUnsafe(`
                DELETE FROM "${table}" WHERE "userId" = ${userId}
            `);
        }

        res.json({ status: 'Todos os registros do usuário foram excluídos.' });
    } catch (error) {
        console.log('Failed to delete user data.', error);
        res.status(500).json({ error: 'Erro ao deletar registros das tabelas.' });
    }
});


export default route;
