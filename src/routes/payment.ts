import { Router } from "express";
import ApiEfiController from "../controllers/ApiEfiController";

const route = Router();

route.post('/create_payment', ApiEfiController.create_payment);
route.post('/get_payment', ApiEfiController.get_payment);
route.put('/webhooks', ApiEfiController.webhooks);
route.post('/webhooks/pix', ApiEfiController.webhooks_pix);

export default route;
