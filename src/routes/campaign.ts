import { Router } from 'express';
import * as CampaignController from '../controllers/CampaignController';
import { Auth } from '../middlewares/auth';
const route = Router();

route.get('/list_campaign/:userId', CampaignController.listAll);
route.post('/create_campaign/:userId', Auth.private, CampaignController.createCampaign);
route.post('/edit_campaign', Auth.private, CampaignController.editCampaign);
route.delete('/delete_campaign/:id', Auth.private, CampaignController.deleteCampaign);

export default route;