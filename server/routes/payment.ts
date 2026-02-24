import { RequestHandler } from "express";
import {
  PaymentInitiateRequest,
  PaymentInitiateResponse,
} from "@shared/api";

// Mpesa API configuration
// These should be environment variables in production
const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || "";
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || "";
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE || "174379";
const MPESA_PASSKEY = process.env.MPESA_PASSKEY || "";
const MPESA_CALLBACK_URL = process.env.MPESA_CALLBACK_URL || "";
const ENVIRONMENT = process.env.MPESA_ENVIRONMENT || "sandbox"; // sandbox or production

/**
 * Get Mpesa access token
 */
async function getMpesaAccessToken(): Promise<string> {
  if (!MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET) {
    // Return a mock token for demo purposes if credentials not set
    return "mock-token";
  }

  try {
    const auth = Buffer.from(
      `${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`
    ).toString("base64");

    const url =
      ENVIRONMENT === "production"
        ? "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
        : "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error getting Mpesa access token:", error);
    throw new Error("Failed to authenticate with Mpesa");
  }
}

/**
 * Initiate Mpesa STK Push
 */
async function initiateMpesaSTKPush(
  phoneNumber: string,
  amount: number,
  orderId: string
): Promise<{ transactionId: string; message: string }> {
  const accessToken = await getMpesaAccessToken();

  // If credentials not set, return mock response
  if (!MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET) {
    return {
      transactionId: `TRX-${Date.now()}`,
      message:
        "Payment request sent. Check your phone for Mpesa prompt (Demo Mode)",
    };
  }

  // Format phone number: remove leading 0 and add country code if needed
  let formattedPhone = phoneNumber.replace(/^0/, "254");
  if (!formattedPhone.startsWith("254")) {
    formattedPhone = "254" + formattedPhone;
  }

  try {
    const url =
      ENVIRONMENT === "production"
        ? "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
        : "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, -3);

    const password = Buffer.from(
      `${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`
    ).toString("base64");

    const payload = {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.ceil(amount),
      PartyA: formattedPhone,
      PartyB: MPESA_SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: MPESA_CALLBACK_URL,
      AccountReference: orderId,
      TransactionDesc: `WiFi Plan - ${orderId}`,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || !data.ResponseCode || data.ResponseCode !== "0") {
      throw new Error(
        data.ResponseDescription || "Failed to initiate STK push"
      );
    }

    return {
      transactionId: data.CheckoutRequestID,
      message: "Mpesa payment prompt sent to your phone",
    };
  } catch (error) {
    console.error("Error initiating Mpesa STK push:", error);
    throw error;
  }
}

/**
 * Payment initiation handler
 */
export const handlePaymentInitiate: RequestHandler = async (req, res) => {
  try {
    const { phoneNumber, amount, planName } =
      req.body as PaymentInitiateRequest;

    // Validation
    if (!phoneNumber || !amount || !planName) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: phoneNumber, amount, planName",
      } as PaymentInitiateResponse);
    }

    // Validate phone number format
    const phoneRegex = /^(254|\+254|0)?[71][0-9]{8}$/;
    const normalizedPhone = phoneNumber.replace("+", "");
    if (!phoneRegex.test(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        error: "Invalid Kenyan phone number format",
      } as PaymentInitiateResponse);
    }

    // Validate amount
    if (amount < 1 || amount > 150000) {
      return res.status(400).json({
        success: false,
        error: "Amount must be between 1 and 150000 KES",
      } as PaymentInitiateResponse);
    }

    // Generate order ID
    const orderId = `WIFI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Initiate Mpesa payment
    const result = await initiateMpesaSTKPush(
      normalizedPhone,
      amount,
      orderId
    );

    // Log transaction (in production, save to database)
    console.log(`Payment initiated - Order: ${orderId}, Amount: ${amount} KES`);

    return res.json({
      success: true,
      message: result.message,
      transactionId: result.transactionId,
    } as PaymentInitiateResponse);
  } catch (error) {
    console.error("Payment initiation error:", error);
    return res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to initiate payment",
    } as PaymentInitiateResponse);
  }
};
