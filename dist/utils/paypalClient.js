"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const paypal_server_sdk_1 = require("@paypal/paypal-server-sdk");
const PaypalToken_1 = require("../utils/PaypalToken");
const paypalClient = new paypal_server_sdk_1.Client({
    clientCredentialsAuthCredentials: {
        oAuthClientId: PaypalToken_1.clientId,
        oAuthClientSecret: PaypalToken_1.clientSecret,
    },
    timeout: 0,
    environment: paypal_server_sdk_1.Environment.Sandbox, // Use 'Environment.Live' in production
    logging: {
        logLevel: paypal_server_sdk_1.LogLevel.Info,
        logRequest: { logBody: false },
        logResponse: { logHeaders: false },
    },
});
exports.default = paypalClient;
