import { Router } from 'express';
import RafflesController from '../controllers/RafflesController';
import { Auth } from '../middlewares/auth';

const route = Router();

route.get('/list_allRaffles/:id', RafflesController.listAllRaffles);
route.post('/create_raffle/:id', Auth.private, RafflesController.createRaffles);
route.delete('/delete_raffle/:id', Auth.private, RafflesController.deleteRaffle);

export default route;