import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing required environment variables: SUPABASE_URL and SUPABASE_ANON_KEY");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types for our database
export interface Customer {
  id: number;
  phone_number: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  customer_id: number;
  plan_id: number;
  amount: number;
  mpesa_transaction_id?: string;
  status: "pending" | "success" | "failed";
  payment_date: string;
  created_at: string;
  updated_at: string;
}

export interface WiFiCredential {
  id: number;
  payment_id: number;
  customer_id: number;
  username: string;
  password: string;
  ssid: string;
  validity_start: string;
  validity_end: string;
  status: "active" | "expired" | "disabled";
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: number;
  name: string;
  price: number;
  data_limit?: string;
  duration_hours?: number;
  description: string;
  created_at: string;
}

export interface Subscription {
  id: number;
  customer_id: number;
  plan_id: number;
  payment_id: number;
  wifi_credential_id: number;
  start_date: string;
  end_date: string;
  status: "active" | "expired" | "cancelled";
  created_at: string;
  updated_at: string;
}
