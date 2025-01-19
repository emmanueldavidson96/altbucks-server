import { Request, Response } from "express";
import axios from "axios";
import { PayoutResponse } from "../@types/paypalResponse";
import { getCurrentToken } from "../utils/PaypalToken";
import paypalClient from "../utils/paypalClient";
import { OrdersController, ApiError, PaypalExperienceUserAction, OrderRequest, CheckoutPaymentIntent, OrderApplicationContextShippingPreference, ShippingPreference } from "@paypal/paypal-server-sdk";
import walletModel from "../models/wallet.model";
import { addToWallet, deductMoneyFromWallet } from "./wallet.controller";
const ordersController = new OrdersController(paypalClient);



export const WithdrawalHandler = async (req: Request, res: Response): Promise<void> => {
    const { paypalEmail, amount } = req.body;
    const userId = req.userId as string;

    if (!paypalEmail || !amount) {
        res.status(400).json({
            message: 'Paypal email and amount are required fields.',
        });
        return;
    }

     const wallet = await walletModel.findOne({userId});

     if (!wallet){
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
        
        const token = await getCurrentToken();
        

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

        const response = await axios.post(PAYPAL_API_URL, payoutData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const data:PayoutResponse =  response.data;
        if (!data?.batch_header) {
            throw new Error("Invalid response structure from PayPal API: Missing batch_header");
        }

        if (data.batch_header.batch_status === 'PENDING') {

            await deductMoneyFromWallet(userId,amount);
            
             res.status(202).json({
                message: 'Payment is being processed. Please check your Paypal wallet shortly.',
                payout_batch_id: data.batch_header.payout_batch_id,
            });
            
            return;
        }
       

         res.status(500).json({
            message: 'Payment failed. Please try again.',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "An error occurred during the withdrawal process",
        });
    }
}




export const createOrderHandler =  async (req: Request, res: Response) => {
    const { amount} = req.body;
    const userId = req.userId;
    
    

    const orderRequest = {
        intent: CheckoutPaymentIntent.Capture,
        purchaseUnits: [
            {
                amount: {
                    currencyCode:"USD",
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
                        quantity: '1',// Quantity of the item (in this case, always 1)
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
                    cancelUrl: 'https://altbucks.com/cancel-deposit',   //  If the user cancels the payment on paypal checkout page, they will be redirected to this URL. Modify it
                    userAction: PaypalExperienceUserAction.PayNow,

                    // Shipping preference: 'NoShipping' means no shipping information is required for this transaction
                    shippingPreference: ShippingPreference.NoShipping,
                },
            },
        },
    };

    try {
        
        const { result, statusCode } = await ordersController.ordersCreate({
            body: orderRequest,
            prefer: 'return=representation',
        });

       
        if (statusCode !== 200) {
            console.error("Unexpected status code:", statusCode);
            res.status(500).json({
                message: "Order creation failed",
            });
            
        }

        const approveLink = result.links?.find((link: { rel: string }) => link.rel === "payer-action")?.href;

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
    } catch (error) {
        console.error("Failed to create order:", error);

        const message = error instanceof Error ? error.message : "An unknown error occurred.";

        res.status(500).json({
            message: "Failed to create order.",
        });
    }
}


export const captureOrderHandler = async (req: Request, res: Response) => {
    const orderId = req.query.token as string;
        const userId = req.query.userId as string;

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
        const { result, ...httpResponse } = await ordersController.ordersCapture(collect);

        
        if (result.status === "COMPLETED") {
            const purchaseUnits = result.purchaseUnits;

            if (purchaseUnits && purchaseUnits.length > 0) {

                const capture = purchaseUnits[0]?.payments?.captures?.[0];

                if (capture && capture.amount && capture.amount.value) {
                    const amount = parseFloat(capture.amount.value);

                    // AddTowallet() is from wallet controller
                    await addToWallet(userId, amount);

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

    } catch (error) {
        console.error("Failed to capture payment:", error);

        if (error instanceof ApiError) {
            console.error("PayPal API Error:", error.message, error.result);
            res.status(400).json({
                message: "Failed to capture payment. Please try again later.",
            });
        } else {
            console.error("Unexpected error:", error);
            res.status(500).json({
                message: "An unexpected error occurred. Please try again later.",
            });
        }
        return;
    }
}
    
