import { Router } from 'express';
import PurchaseController from '../controllers/PurchaseController';

const route = Router();

route.get('/list_purchase/:userId', PurchaseController.listAll)
route.post('/buy_raffle_only', PurchaseController.buy_raffle_only);
route.post('/buy_for_quota', PurchaseController.buy_for_quota);

route.delete('/delete_purchase', PurchaseController.delete_purchase_only);

export default route;