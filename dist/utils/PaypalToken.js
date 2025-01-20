"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentToken = exports.PAYPAL_BASE_URL = exports.clientSecret = exports.clientId = void 0;
const axios_1 = __importDefault(require("axios"));
let currentToken = null;
let tokenExpirationTime = null;
let isTokenRefreshing = false;
let tokenQueue = []; // Queue to handle other requests while waiting for a new token
exports.clientId = process.env.PAYPAL_CLIENT_ID;
exports.clientSecret = process.env.PAYPAL_SECRET;
exports.PAYPAL_BASE_URL = process.env.PAYPAL_BASE_URL;
const getCurrentToken = () => __awaiter(void 0, void 0, void 0, function* () {
    if (currentToken && tokenExpirationTime && Date.now() < tokenExpirationTime) {
        return currentToken;
    }
    // If token is expired or unavailable, refresh it
    return yield refreshToken();
});
exports.getCurrentToken = getCurrentToken;
const refreshToken = () => __awaiter(void 0, void 0, void 0, function* () {
    // If a refresh is already in progress, wait until it's completed
    if (isTokenRefreshing) {
        return new Promise((resolve) => {
            tokenQueue.push(() => resolve(currentToken));
        });
    }
    isTokenRefreshing = true;
    try {
        // Make the request to PayPal to get a new token
        const token = yield requestNewToken();
        return token;
    }
    finally {
        isTokenRefreshing = false;
        // Process the queued requests
        tokenQueue.forEach((callback) => callback());
        tokenQueue = []; // Reset the queue
    }
});
const requestNewToken = () => __awaiter(void 0, void 0, void 0, function* () {
    const auth = Buffer.from(`${exports.clientId}:${exports.clientSecret}`).toString("base64");
    try {
        const response = yield axios_1.default.post(`${exports.PAYPAL_BASE_URL}/v1/oauth2/token`, "grant_type=client_credentials", {
            headers: {
                Authorization: `Basic ${auth}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });
        const token = response.data.access_token;
        const expiresIn = response.data.expires_in * 1000;
        currentToken = token;
        tokenExpirationTime = Date.now() + expiresIn;
        return token;
    }
    catch (error) {
        console.error("Error requesting PayPal token:", error);
        throw new Error("Unable to retrieve the token at this moment. Please try again later.");
    }
});
