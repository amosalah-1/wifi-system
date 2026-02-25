/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Payment initiation request
 */
export interface PaymentInitiateRequest {
  phoneNumber: string;
  amount: number;
  planName: string;
}

/**
 * Payment initiation response
 */
export interface PaymentInitiateResponse {
  success: boolean;
  message: string;
  transactionId?: string;
  error?: string;
}

/**
 * Plan details
 */
export interface Plan {
  id: number;
  name: string;
  price: number;
  data_limit?: string;
  duration_hours?: number;
  description: string;
}

/**
 * Plans list response
 */
export interface PlansResponse {
  success: boolean;
  plans?: Plan[];
  error?: string;
}
