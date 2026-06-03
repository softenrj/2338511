import { CentralLogger } from 'logging-middleware';

const authToken = "api-key";
const serverUrl = `http://4.224.186.213/evaluation-service`;

export const logger = new CentralLogger({
    authToken,
    serverUrl,
});