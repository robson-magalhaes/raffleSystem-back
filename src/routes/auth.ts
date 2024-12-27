import Router from 'express'
import * as AuthController from '../controllers/AuthController'
import * as UserController from '../controllers/UserController'
import { Auth } from '../middlewares/auth';
const route = Router()

route.post('/login', AuthController.login);
route.post('/verifyToken', AuthController.verifyAuth);
    
route.post('/register', UserController.register);
route.get('/list_user', Auth.private, UserController.listAll);
route.get('/one_user/:id', UserController.listOne)
route.post('/edit_user',Auth.private, UserController.editUser)
route.delete('/delete_user/:id',Auth.private, UserController.deleteUser)

export default route;