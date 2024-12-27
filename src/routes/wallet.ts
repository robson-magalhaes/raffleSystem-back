import { Router } from 'express';
import WalletController from '../controllers/WalletController';
import { Auth } from '../middlewares/auth';

const route = Router();

route.post('/add_balance', WalletController.addBalance);
route.post('/check_balance', Auth.private, WalletController.checkBalance);
route.post('/pix_send', Auth.private, WalletController.pixSend);

export default route;