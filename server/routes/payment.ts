import { RequestHandler } from "express";
import { z } from "zod";
import {
  PaymentInitiateRequest,
  PaymentInitiateResponse,
} from "@shared/api";
import { supabase } from "../lib/supabase";
import {
  generateWiFiCredentials,
  calculateValidityEndDate,
  formatCredentialsForDisplay,
  generateSMSText,
} from "../lib/wifi-generator";

// Validation schema
const PaymentInitiateSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^(254|\+254|0)?[71][0-9]{8}$/, "Invalid Kenyan phone number format"),
  amount: z
    .number()
    .min(1, "Amount must be at least 1 KES")
    .max(150000, "Amount cannot exceed 150000 KES"),
  planName: z.string().min(1, "Plan name is required"),
});

// Mpesa API configuration
const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || "";
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || "";
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE || "174379";
const MPESA_PASSKEY = process.env.MPESA_PASSKEY || "";
const MPESA_CALLBACK_URL = process.env.MPESA_CALLBACK_URL || "";
const ENVIRONMENT = process.env.MPESA_ENVIRONMENT || "sandbox";
const WIFI_SSID = process.env.WIFI_SSID || "OLOIKA_WIFI";

/**
 * Get Mpesa access token
 */
async function getMpesaAccessToken(): Promise<string> {
  if (!MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET) {
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

  if (!MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET) {
    return {
      transactionId: `TRX-${Date.now()}`,
      message:
        "Payment request sent. Check your phone for Mpesa prompt (Demo Mode)",
    };
  }

  let formattedPhone = phoneNumber.replace(/^0/, "254");
  if (!formattedPhone.startsWith("254")) {
    formattedPhone = "254" + phoneNumber;
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
 * Get plan details by ID
 */
async function getPlanById(planId: number) {
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("id", planId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get or create customer
 */
async function getOrCreateCustomer(phoneNumber: string, email?: string) {
  // Try to get existing customer
  const { data: existing } = await supabase
    .from("customers")
    .select("*")
    .eq("phone_number", phoneNumber)
    .single();

  if (existing) {
    return existing;
  }

  // Create new customer
  const { data: newCustomer, error } = await supabase
    .from("customers")
    .insert([
      {
        phone_number: phoneNumber,
        email: email || null,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return newCustomer;
}

/**
 * Create payment record
 */
async function createPayment(
  customerId: number,
  planId: number,
  amount: number,
  mpesaTransactionId?: string
) {
  const { data, error } = await supabase
    .from("payments")
    .insert([
      {
        customer_id: customerId,
        plan_id: planId,
        amount,
        mpesa_transaction_id: mpesaTransactionId || null,
        status: "pending",
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update payment status
 */
async function updatePaymentStatus(
  paymentId: number,
  status: "success" | "failed"
) {
  const { data, error } = await supabase
    .from("payments")
    .update({ status })
    .eq("id", paymentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create WiFi credentials
 */
async function createWiFiCredentials(
  paymentId: number,
  customerId: number,
  durationHours?: number
) {
  const { username, password } = generateWiFiCredentials();
  const validityEnd = calculateValidityEndDate(durationHours);

  const { data, error } = await supabase
    .from("wifi_credentials")
    .insert([
      {
        payment_id: paymentId,
        customer_id: customerId,
        username,
        password,
        ssid: WIFI_SSID,
        validity_end: validityEnd.toISOString(),
        status: "active",
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create subscription
 */
async function createSubscription(
  customerId: number,
  planId: number,
  paymentId: number,
  wifiCredentialId: number,
  durationHours?: number
) {
  const startDate = new Date();
  const endDate = calculateValidityEndDate(durationHours);

  const { data, error } = await supabase
    .from("subscriptions")
    .insert([
      {
        customer_id: customerId,
        plan_id: planId,
        payment_id: paymentId,
        wifi_credential_id: wifiCredentialId,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: "active",
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Payment initiation handler
 */
export const handlePaymentInitiate: RequestHandler = async (req, res) => {
  try {
    // Validate request payload
    const validationResult = PaymentInitiateSchema.safeParse(req.body);

    if (!validationResult.success) {
      const errors = validationResult.error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join("; ");

      return res.status(400).json({
        success: false,
        error: `Validation error: ${errors}`,
      } as PaymentInitiateResponse);
    }

    const { phoneNumber, amount, planName } = validationResult.data;

    // Normalize phone number
    const normalizedPhone = phoneNumber.replace("+", "").replace(/^0/, "254");

    // Get or create customer
    const customer = await getOrCreateCustomer(normalizedPhone);

    // Get plan by name (case-insensitive)
    const { data: plans } = await supabase
      .from("plans")
      .select("*")
      .ilike("name", `%${planName}%`)
      .limit(1);

    if (!plans || plans.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Plan not found",
      } as PaymentInitiateResponse);
    }

    const plan = plans[0];

    // Generate order ID
    const orderId = `WIFI-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Initiate Mpesa payment
    const mpesaResult = await initiateMpesaSTKPush(
      normalizedPhone,
      amount,
      orderId
    );

    // Create payment record (with pending status - will be confirmed by callback)
    const payment = await createPayment(
      customer.id,
      plan.id,
      amount,
      mpesaResult.transactionId
    );

    // Log payment initiated
    console.log(`Payment initiated - Order: ${orderId}, TransactionID: ${mpesaResult.transactionId}, Customer: ${customer.id}`);

    return res.json({
      success: true,
      message: mpesaResult.message,
      transactionId: mpesaResult.transactionId,
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

/**
 * M-Pesa callback handler
 * Called by Safaricom when payment is completed or fails
 */
export const handlePaymentCallback: RequestHandler = async (req, res) => {
  try {
    const callbackData = req.body;

    // M-Pesa callback structure for STK Push
    const result = callbackData?.Body?.stkCallback;

    if (!result) {
      console.error("Invalid callback format:", callbackData);
      return res.status(400).json({ ResultCode: 1 });
    }

    const checkoutRequestId = result.CheckoutRequestID;
    const resultCode = result.ResultCode;
    const resultDesc = result.ResultDesc;
    const callbackMetadata = result.CallbackMetadata?.Item;

    console.log(`Callback received - CheckoutID: ${checkoutRequestId}, Code: ${resultCode}`);

    // Find payment by transaction ID
    const { data: payments, error: findError } = await supabase
      .from("payments")
      .select("*")
      .eq("mpesa_transaction_id", checkoutRequestId)
      .limit(1);

    if (findError || !payments || payments.length === 0) {
      console.error("Payment not found for transaction:", checkoutRequestId);
      return res.status(200).json({ ResultCode: 0 }); // Acknowledge to M-Pesa
    }

    const payment = payments[0];

    // Check if payment was successful (ResultCode 0 = success)
    if (resultCode === 0) {
      // Extract metadata
      let mpesaReceiptNumber = "";
      let phoneNumber = "";
      let amount = payment.amount;

      if (callbackMetadata && Array.isArray(callbackMetadata)) {
        callbackMetadata.forEach((item: any) => {
          if (item.Name === "MpesaReceiptNumber") {
            mpesaReceiptNumber = item.Value;
          } else if (item.Name === "PhoneNumber") {
            phoneNumber = item.Value;
          } else if (item.Name === "Amount") {
            amount = item.Value;
          }
        });
      }

      // Update payment to success
      await updatePaymentStatus(payment.id, "success");

      // Get plan details
      const plan = await getPlanById(payment.plan_id);

      // Create WiFi credentials now that payment is confirmed
      const wifiCred = await createWiFiCredentials(
        payment.id,
        payment.customer_id,
        plan.duration_hours
      );

      // Create subscription
      await createSubscription(
        payment.customer_id,
        payment.plan_id,
        payment.id,
        wifiCred.id,
        plan.duration_hours
      );

      console.log(`Payment confirmed - Receipt: ${mpesaReceiptNumber}, PaymentID: ${payment.id}`);
    } else {
      // Payment failed
      await updatePaymentStatus(payment.id, "failed");
      console.log(`Payment failed - CheckoutID: ${checkoutRequestId}, Reason: ${resultDesc}`);
    }

    // Always return success to M-Pesa (we've acknowledged)
    return res.status(200).json({ ResultCode: 0 });
  } catch (error) {
    console.error("Payment callback error:", error);
    return res.status(200).json({ ResultCode: 0 }); // Still acknowledge to M-Pesa
  }
};
