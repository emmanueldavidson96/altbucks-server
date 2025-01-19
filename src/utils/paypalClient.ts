import {Client, Environment, LogLevel} from "@paypal/paypal-server-sdk";
import { clientId , clientSecret} from "../utils/PaypalToken"

const paypalClient = new Client({
    clientCredentialsAuthCredentials: {
        oAuthClientId: clientId!,
        oAuthClientSecret: clientSecret!,
    },
    timeout: 0,
    environment: Environment.Sandbox, // Use 'Environment.Live' in production
    logging: {
        logLevel: LogLevel.Info,
        logRequest: { logBody: false },
        logResponse: { logHeaders: false },
    },
});

export default paypalClient;