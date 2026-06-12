import crypto from "crypto";
import { env } from "../../config/env.js";

type RazorpayOrderInput = {
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
};

type RazorpayErrorResponse = {
  error?: {
    description?: string;
  };
};

function assertRazorpayConfigured() {
  if (!env.RAZORPAY_KEY_ID?.trim() || !env.RAZORPAY_KEY_SECRET?.trim()) {
    const err = new Error(
      "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to backend/.env, then restart the server."
    ) as Error & { statusCode?: number; code?: string };
    err.statusCode = 503;
    err.code = "RAZORPAY_NOT_CONFIGURED";
    throw err;
  }
}

export function getRazorpayConfig() {
  assertRazorpayConfigured();
  return { keyId: env.RAZORPAY_KEY_ID!.trim() };
}

export async function createRazorpayOrder(input: RazorpayOrderInput) {
  assertRazorpayConfigured();

  const amountInPaise = Math.round(input.amount * 100);
  const keyId = env.RAZORPAY_KEY_ID!.trim();
  const keySecret = env.RAZORPAY_KEY_SECRET!.trim();
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      amount: amountInPaise,
      currency: input.currency || "INR",
      receipt: input.receipt || `qk_${Date.now()}`,
      notes: input.notes || {}
    })
  });

  const data = (await response.json()) as RazorpayErrorResponse;
  if (!response.ok) {
    const message = data?.error?.description || "Unable to create Razorpay order";
    const err = new Error(message) as Error & { statusCode?: number };
    err.statusCode = response.status;
    throw err;
  }

  return data;
}

export function verifyRazorpayPayment({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature
}: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  assertRazorpayConfigured();

  const expectedSignature = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET!.trim())
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature);
  const receivedBuffer = Buffer.from(razorpay_signature);
  return expectedBuffer.length === receivedBuffer.length && crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}
