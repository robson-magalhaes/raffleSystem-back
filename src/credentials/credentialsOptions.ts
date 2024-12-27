import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const certPath = path.join(__dirname + '/producao-647172-certificado_sorteiosTec.p12');

export const credentialsOptions: any = {
    sandbox: false,
    client_id: process.env.CLIENT_ID as string,
    client_secret: process.env.CLIENT_SECRET as string,
    certificate: certPath
};
