import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || "https://dfpbqqrmxpaoqcebxzuf.supabase.co";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmcGJxcXJteHBhb3FjZWJ4enVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NTQzODUsImV4cCI6MjA4NzQzMDM4NX0.umE5CmaWh-RZWyoeH36eUdjkpcqDB5QEXLyq8WqJ5sk";

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
