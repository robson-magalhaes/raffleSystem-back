// import { Request, Response } from "express";
// import MercadoPagoConfig, { Payment } from "mercadopago";
// import { prisma } from "../database/client";
// import dotenv from 'dotenv';
// import axios from "axios";
// import fs from 'fs'
// import https from 'https';
// import path from 'path';
// import EfiPay from "sdk-node-apis-efi";

// dotenv.config();

// const api = axios.create({
//     baseURL: "https://pix.api.efipay.com.br",
//     headers: {
//         "Content-Type": "Application/json"
//     }
// });

// const intervals: { [key: string]: NodeJS.Timeout } = {};

// const create_Auth = async () => {
//     const certPath = path.join(__dirname, '..', '..', 'src', 'data', 'producao-647172-certificado_sorteiosTec.p12');

//     var certificado = fs.readFileSync(certPath);

//     var credenciais = {
//         client_id: "Client_Id_4ba2a0e870821dd21503321af7cd4209440b2422",
//         client_secret: "Client_Secret_e7b749107ee645c7681f759eb72e9f4916633c67",
//     };

//     var data = JSON.stringify({ grant_type: "client_credentials" });
//     var data_credentials = credenciais.client_id + ":" + credenciais.client_secret;

//     var auth = Buffer.from(data_credentials).toString("base64");

//     const agent = new https.Agent({
//         pfx: certificado,
//         passphrase: "",
//     });

//     try {
//         const response = await api.post('/oauth/token', data, {
//             headers: {
//                 Authorization: "Basic " + auth,
//                 "Content-Type": "application/json",
//             },
//             httpsAgent: agent
//         });

//         console.log(response.data);
//         return response.data.access_token;  // Retorna o access_token da resposta
//     } catch (error) {
//         console.error('Erro na autenticação:', error);
//         throw error;  // Lança o erro para o controle posterior
//     }
// }

// const certPath = path.join(__dirname, '..', '..', 'src', 'data', 'producao-647172-certificado_sorteiosTec.p12');

// const options = {
//     sandbox: false,
//     client_id:"Client_Id_4ba2a0e870821dd21503321af7cd4209440b2422",
//     client_secret: "Client_Secret_e7b749107ee645c7681f759eb72e9f4916633c67",
//     certificate: certPath,
// }
// export default {
//     // create_payment: async (req: Request, res: Response) => {
//     //     const valor = 4;
//     //     const descricao = 'Foi eu'
//     //     const token = await create_Auth();
//     //     try {
//     //         const data = {
//     //             valor: {
//     //                 original: valor.toFixed(2),
//     //             },
//     //             calendario: {
//     //                 expiracao: 3600,
//     //             },
//     //             chave: 'd5bd2784-be96-48cc-b65e-75d348405b34', // Chave Pix configurada no Efi Bank
//     //             devedor: {
//     //                 cpf: '14674541760',
//     //                 nome: 'Nome do Devedor',
//     //             },
//     //             infoAdicionais: [
//     //                 {
//     //                     nome: 'Descrição',
//     //                     valor: descricao,
//     //                 },
//     //             ],
//     //         }
//     //         const response = await api.post('/v2/cob', data, {
//     //             headers: {
//     //                 Authorization: `Bearer ${token}`,
//     //             },
//     //         });

//     //         res.json(response.data);
//     //     } catch (error: any) {
//     //         console.error('Erro ao criar cobrança Pix:', error.response ? error.response.data : error.message);
//     //         res.json(error);
//     //     }
//     // },
//     create_payment: async (req: Request, res: Response) => {
//         const { first_name, last_name, telephone, unit_price, quantity, uuidKey, raffleId, userId } = req.body;
//         const user = await prisma.user.findUnique({
//             where: { id: parseInt(userId) }
//         })

//         const buyer = `${first_name} ${last_name}`;
//         // const unit_price_number = parseFloat(unit_price);
//         // const transaction_amount = parseFloat((unit_price_number * quantity).toFixed(2));

//         const transaction_amount = (quantity * unit_price).toFixed(2);

//         let body = {
//             calendario: {
//                 expiracao: 100,//3600,
//             },
//             valor: {
//                 original: transaction_amount,
//             },
//             chave: 'd5bd2784-be96-48cc-b65e-75d348405b34',
//             infoAdicionais: [
//                 {
//                     nome: "Devedor",
//                     valor: `${buyer}`
//                 },
//                 {
//                     nome: 'Telefone',
//                     valor: telephone,
//                 },
//                 {
//                     nome: 'E-mail',
//                     valor: 'email@hotmail.com',
//                 },
//             ],
//         }

//         try {

//             let params = {
//                 txid: uuidKey,
//             }
//             const efipay = new EfiPay(options)

//             const paymentData = await efipay.pixCreateCharge(params, body);
//             const pix = await efipay.pixGenerateQRCode({ id: paymentData.loc.id });
//             console.log(pix);
//             // if (!raffleId) {
//             //     await prisma.purchaseByQuota.create({
//             //         data: {
//             //             buyer,
//             //             telephone,
//             //             ticketNumber: quantity,
//             //             paymentStatus: paymentData.status,
//             //             paymentId: paymentData.loc.id,
//             //             userId: parseInt(userId)
//             //         }
//             //     });
//             // } else {
//             //     await prisma.purchase.create({
//             //         data: {
//             //             raffleId,
//             //             buyer,
//             //             telephone,
//             //             ticketNumber: quantity,
//             //             paymentStatus: paymentData.status,
//             //             paymentId: paymentData.loc.id,
//             //             userId: parseInt(userId)
//             //         }
//             //     });
//             // }
//             res.status(200);
//             res.json({ paymentData, pix })

//         } catch (error) {
//             res.json(error)
//         }

//     },
//     create_preference: async (req: Request, res: Response) => {
//         const { first_name, last_name, telephone, unit_price, quantity, uuidKey, raffleId, userId } = req.body;
//         const user = await prisma.user.findUnique({
//             where: { id: parseInt(userId) }
//         })
//         console.log(user);
//         const client: any = new MercadoPagoConfig({ accessToken: user?.accessToken as string });
//         const payment: any = new Payment(client);

//         const buyer = `${first_name} ${last_name}`;
//         const unit_price_number = parseFloat(unit_price);
//         const transaction_amount = parseFloat((unit_price_number * quantity).toFixed(2));

//         try {
//             const paymentData = await payment.create({
//                 body: {
//                     additional_info: {
//                         items: [
//                             {
//                                 id: Math.floor(Math.random() * 3),
//                                 category_id: 'Sorteio',
//                                 title: 'Sistema de sorteios',
//                                 description: 'Compra de cotas',
//                                 quantity,
//                                 unit_price: parseFloat(unit_price).toFixed(2),
//                             }
//                         ]
//                     },
//                     payer: {
//                         email: 'testrobyntec@hotmail.com',
//                         first_name,
//                         last_name
//                     },
//                     binary_mode: true,
//                     payment_method_id: 'pix',
//                     external_reference: `MP${Math.floor(Math.random() * 4)}`,
//                     installments: 1,
//                     notification_url: process.env.NOTIFICATION_URL,
//                     transaction_amount,
//                     description: 'Sistema de Sorteios'
//                 },
//                 requestOptions: { idempotencyKey: uuidKey }
//             });

//             if (!raffleId) {
//                 await prisma.purchaseByQuota.create({
//                     data: {
//                         buyer,
//                         telephone,
//                         ticketNumber: quantity,
//                         paymentStatus: paymentData.status,
//                         paymentId: paymentData.id,
//                         userId: parseInt(userId)
//                     }
//                 });
//             } else {
//                 await prisma.purchase.create({
//                     data: {
//                         raffleId,
//                         buyer,
//                         telephone,
//                         ticketNumber: quantity,
//                         paymentStatus: paymentData.status,
//                         paymentId: paymentData.id,
//                         userId: parseInt(userId)
//                     }
//                 });
//             }

//             res.status(200).json({ paymentData });
//         } catch (error) {
//             console.error(error);
//             res.status(500).json({ error: 'Erro ao criar preferência de pagamento.' });
//         }
//     },
//     get_payment: async (req:any, res:any)=>{
//         let params = {
//             txid: '31s23a1aa121po1ipoipoi2211pp1o2i',
//         }
        
//         const efipay = new EfiPay(options)
        
//         // O método pixDetailCharge indica os campos que devem ser enviados e que serão retornados
//         efipay.pixDetailCharge(params)
//             .then((resposta) => {
//                 console.log(resposta) // Aqui você tera acesso a resposta da API e os campos retornados de forma intuitiva
//                 res.json(resposta)
//             })
//             .catch((error) => {
//                 console.log(error)
//             })
//     },
//     weebWooks: async (req: Request, res: Response) => {
//         const { type, data } = req.body;
//         try {
//             if (type && data) {
//                 const purchase = await prisma.purchaseByQuota.findFirst({
//                     where: { paymentId: data.id }
//                 });

//                 const purchaseOnly = await prisma.purchase.findFirst({
//                     where: { paymentId: data.id }
//                 });

//                 const userId = purchase?.userId || purchaseOnly?.userId;

//                 if (!userId) {
//                     return res.status(400).json({ message: 'Usuário não encontrado para esta compra.' });
//                 }

//                 const user = await prisma.user.findUnique({ where: { id: userId } });
//                 if (!user || !user.accessToken) {
//                     return res.status(400).json({ message: 'Access Token não encontrado para o usuário.' });
//                 }
//                 const accessToken = user?.accessToken;

//                 const response = await axios.get(`https://api.mercadopago.com/v1/payments/${data.id}`, {
//                     headers: {
//                         "Content-Type": "application/json",
//                         "Authorization": `Bearer ${accessToken}`
//                     }
//                 });

//                 const status = response.data.status;

//                 if (purchase) {
//                     await prisma.purchaseByQuota.update({
//                         where: { id: purchase?.id },
//                         data: { paymentStatus: status }
//                     });
//                 }

//                 if (purchaseOnly) {
//                     await prisma.purchase.update({
//                         where: { id: purchaseOnly?.id },
//                         data: { paymentStatus: status }
//                     });
//                 }

//                 if (status !== 'approved') {
//                     if (!intervals[data.id]) {
//                         intervals[data.id] = setTimeout(async () => {
//                             await axios.put(`https://api.mercadopago.com/v1/payments/${data.id}`, { status: "cancelled" }, {
//                                 headers: {
//                                     "Content-Type": "application/json",
//                                     "Authorization": `Bearer ${accessToken}`
//                                 }
//                             });
//                             delete intervals[data.id];
//                         }, 45000);
//                     }
//                 } else {
//                     if (intervals[data.id]) {
//                         clearTimeout(intervals[data.id]);
//                         delete intervals[data.id];
//                     }
//                 }

//                 res.status(200).json({
//                     paymentId: data.id,
//                     status
//                 });
//             } else {
//                 res.status(400).json({ message: 'Dados insuficientes para processar o webhook.' });
//             }
//         } catch (err) {
//             console.error(err);
//             res.status(500).json({ error: 'Erro ao processar o webhook.' });
//         }
//     },

//     getPayment: async (req: Request, res: Response) => {
//         const { id } = req.body;

//         try {
//             const purchase = await prisma.purchaseByQuota.findFirst({
//                 where: { paymentId: id },
//                 select: { user: true }
//             }) || await prisma.purchase.findFirst({
//                 where: { paymentId: id },
//                 select: { user: true }
//             });

//             if (!purchase || !purchase.user?.accessToken) {
//                 return res.status(400).json({ message: 'Compra ou Access Token não encontrado.' });
//             }
//             const accessToken = purchase.user.accessToken;
//             const response = await axios.get(`https://api.mercadopago.com/v1/payments/${id}`, {
//                 headers: {
//                     "Content-Type": "application/json",
//                     "Authorization": `Bearer ${accessToken}`
//                 }
//             });

//             res.json(response.data);
//         } catch (error) {
//             console.error(error);
//             res.status(500).json({ error: 'Erro ao obter o pagamento.' });
//         }
//     }

// };
