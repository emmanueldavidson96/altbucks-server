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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.captureOrderHandler = exports.createOrderHandler = exports.WithdrawalHandler = void 0;
const axios_1 = __importDefault(require("axios"));
const PaypalToken_1 = require("../utils/PaypalToken");
const paypalClient_1 = __importDefault(require("../utils/paypalClient"));
const paypal_server_sdk_1 = require("@paypal/paypal-server-sdk");
const wallet_model_1 = __importDefault(require("../models/wallet.model"));
const wallet_controller_1 = require("./wallet.controller");
const ordersController = new paypal_server_sdk_1.OrdersController(paypalClient_1.default);
const WithdrawalHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { paypalEmail, amount } = req.body;
    const userId = req.userId;
    if (!paypalEmail || !amount) {
        res.status(400).json({
            message: 'Paypal email and amount are required fields.',
        });
        return;
    }
    const wallet = yield wallet_model_1.default.findOne({ userId });
    if (!wallet) {
        res.status(400).json({
            message: 'Wallet not found'
        });
        return;
    }
    if (wallet.availableBalance < amount) {
        res.status(400).json({
            message: 'Insufficient balance.',
        });
        return;
    }
    try {
        const token = yield (0, PaypalToken_1.getCurrentToken)();
        const payoutData = {
            sender_batch_header: {
                sender_batch_id: `Payouts_${Date.now()}`,
                email_subject: "You have a payout!",
                email_message: "You have received a payout from altbucks! Thanks for using our service!",
            },
            items: [
                {
                    recipient_type: "EMAIL",
                    amount: { value: amount, currency: "USD" },
                    note: "Thanks for using our platform!",
                    sender_item_id: `item_${Date.now()}`,
                    receiver: paypalEmail,
                    notification_language: "en-US",
                },
            ],
        };
        const PAYPAL_BASE_URL = process.env.PAYPAL_BASE_URL;
        const PAYPAL_API_URL = `${PAYPAL_BASE_URL}/v1/payments/payouts`;
        const response = yield axios_1.default.post(PAYPAL_API_URL, payoutData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        const data = response.data;
        if (!(data === null || data === void 0 ? void 0 : data.batch_header)) {
            throw new Error("Invalid response structure from PayPal API: Missing batch_header");
        }
        if (data.batch_header.batch_status === 'PENDING') {
            yield (0, wallet_controller_1.deductMoneyFromWallet)(userId, amount);
            res.status(202).json({
                message: 'Payment is being processed. Please check your Paypal wallet shortly.',
                payout_batch_id: data.batch_header.payout_batch_id,
            });
            return;
        }
        res.status(500).json({
            message: 'Payment failed. Please try again.',
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "An error occurred during the withdrawal process",
        });
    }
});
exports.WithdrawalHandler = WithdrawalHandler;
const createOrderHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { amount } = req.body;
    const userId = req.userId;
    const orderRequest = {
        intent: paypal_server_sdk_1.CheckoutPaymentIntent.Capture,
        purchaseUnits: [
            {
                amount: {
                    currencyCode: "USD",
                    value: amount,
                    breakdown: {
                        itemTotal: {
                            currencyCode: "USD",
                            value: amount,
                        },
                    },
                },
                items: [
                    {
                        name: 'Task Creator Deposit',
                        description: 'Deposit made by the task creator on Alt Bucks',
                        quantity: '1', // Quantity of the item (in this case, always 1)
                        unitAmount: {
                            currencyCode: "USD",
                            value: amount,
                        },
                    },
                ],
            },
        ],
        paymentSource: {
            paypal: {
                experienceContext: {
                    // URL to redirect the user after a successful payment
                    returnUrl: `https://b838-102-89-76-123.ngrok-free.app/api/v1/paypal/confirm-deposit?userId=${userId}`,
                    cancelUrl: 'https://altbucks.com/cancel-deposit', //  If the user cancels the payment on paypal checkout page, they will be redirected to this URL. Modify it
                    userAction: paypal_server_sdk_1.PaypalExperienceUserAction.PayNow,
                    // Shipping preference: 'NoShipping' means no shipping information is required for this transaction
                    shippingPreference: paypal_server_sdk_1.ShippingPreference.NoShipping,
                },
            },
        },
    };
    try {
        const { result, statusCode } = yield ordersController.ordersCreate({
            body: orderRequest,
            prefer: 'return=representation',
        });
        if (statusCode !== 200) {
            console.error("Unexpected status code:", statusCode);
            res.status(500).json({
                message: "Order creation failed",
            });
        }
        const approveLink = (_b = (_a = result.links) === null || _a === void 0 ? void 0 : _a.find((link) => link.rel === "payer-action")) === null || _b === void 0 ? void 0 : _b.href;
        if (!approveLink) {
            res.status(400).json({
                message: "Approval link is missing.",
            });
        }
        res.status(201).json({
            message: "Order created successfully!",
            data: {
                id: result.id,
                status: result.status,
                links: approveLink,
            },
        });
    }
    catch (error) {
        console.error("Failed to create order:", error);
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        res.status(500).json({
            message: "Failed to create order.",
        });
    }
});
exports.createOrderHandler = createOrderHandler;
const captureOrderHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const orderId = req.query.token;
    const userId = req.query.userId;
    if (!orderId || !userId) {
        res.status(400).json({
            message: "Both token and userId are required.",
        });
        return;
    }
    try {
        const collect = {
            id: orderId,
            prefer: 'return=minimal',
        };
        // Call the ordersController from paypal sdk to capture the order
        const _d = yield ordersController.ordersCapture(collect), { result } = _d, httpResponse = __rest(_d, ["result"]);
        if (result.status === "COMPLETED") {
            const purchaseUnits = result.purchaseUnits;
            if (purchaseUnits && purchaseUnits.length > 0) {
                const capture = (_c = (_b = (_a = purchaseUnits[0]) === null || _a === void 0 ? void 0 : _a.payments) === null || _b === void 0 ? void 0 : _b.captures) === null || _c === void 0 ? void 0 : _c[0];
                if (capture && capture.amount && capture.amount.value) {
                    const amount = parseFloat(capture.amount.value);
                    // AddTowallet() is from wallet controller
                    yield (0, wallet_controller_1.addToWallet)(userId, amount);
                    res.status(200).json({
                        message: "Payment captured and added to wallet successfully.",
                        // result, 
                    });
                    return;
                }
            }
        }
        res.status(400).json({
            message: "Payment capture failed. Please try again later.",
        });
        return;
    }
    catch (error) {
        console.error("Failed to capture payment:", error);
        if (error instanceof paypal_server_sdk_1.ApiError) {
            console.error("PayPal API Error:", error.message, error.result);
            res.status(400).json({
                message: "Failed to capture payment. Please try again later.",
            });
        }
        else {
            console.error("Unexpected error:", error);
            res.status(500).json({
                message: "An unexpected error occurred. Please try again later.",
            });
        }
        return;
    }
});
exports.captureOrderHandler = captureOrderHandler;
