import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import mainRoutes from './routes/index';
import rafflesRoute from './routes/raffles';
import purchaseRoute from './routes/purchase';
import campaignRoute from './routes/campaign';
import authRoute from './routes/auth';
import paymentRoute from './routes/payment';
import walletRoute from './routes/wallet';

dotenv.config();
const server = express();

server.use(cors({
  origin: `${process.env.ACESS_CORS}`,
}));

server.use(express.json());
server.use(express.static(path.join(__dirname, '../public')));
server.use(express.urlencoded({ extended: true }));


// Rotas
server.use(mainRoutes);
server.use(rafflesRoute);
server.use(purchaseRoute);
server.use(campaignRoute);
server.use(authRoute);
server.use(paymentRoute);
server.use(walletRoute);

server.use((req: Request, res: Response) => {
  res.status(404);
  res.json({ error: 'Endpoint não encontrado.' });
});

// Porta
server.listen(process.env.PORT, () => {
  try {
    console.log(`Servidor rodando na porta ${process.env.PORT}`)
  } catch {
    console.log('Erro ao conectar ao servidor.')
  }
}
);