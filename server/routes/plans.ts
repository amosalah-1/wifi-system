import { RequestHandler } from "express";
import { supabase } from "../lib/supabase";

export interface PlansResponse {
  success: boolean;
  plans?: Array<{
    id: number;
    name: string;
    price: number;
    data_limit?: string;
    duration_hours?: number;
    description: string;
  }>;
  error?: string;
}

// Fallback mock plans for development
const mockPlans = [
  { id: 1, name: "500MB 1HR", price: 5, data_limit: "500MB", duration_hours: 1, description: "1 Hrs Limited" },
  { id: 2, name: "UNLIMITED 1HR", price: 10, data_limit: "Unlimited", duration_hours: 1, description: "1 Hrs Unlimited" },
  { id: 3, name: "1GB DAILY", price: 20, data_limit: "1GB", duration_hours: 24, description: "1 Day Limited" },
  { id: 4, name: "2GB DAILY", price: 30, data_limit: "2GB", duration_hours: 24, description: "1 Day Limited" },
  { id: 5, name: "UNLIMITED 24HRS", price: 35, data_limit: "Unlimited", duration_hours: 24, description: "1 Days Unlimited" },
  { id: 6, name: "2GB WEEKLY", price: 50, data_limit: "2GB", duration_hours: 168, description: "7 Days Limited" },
  { id: 7, name: "5GB WEEKLY", price: 100, data_limit: "5GB", duration_hours: 168, description: "7 Days Limited" },
  { id: 8, name: "UNLIMITED 1WEEK", price: 200, data_limit: "Unlimited", duration_hours: 168, description: "7 Days Unlimited" },
  { id: 9, name: "30GB MONTHLY", price: 450, data_limit: "30GB", duration_hours: 720, description: "1 Months Limited" },
  { id: 10, name: "UNLIMITED 1MONTH", price: 700, data_limit: "Unlimited", duration_hours: 720, description: "1 Months Unlimited" },
];

/**
 * Get all plans from database
 */
export const handleGetPlans: RequestHandler = async (req, res) => {
  try {
    const { data: plans, error } = await supabase
      .from("plans")
      .select("id, name, price, data_limit, duration_hours, description")
      .order("price", { ascending: true });

    if (error) {
      console.warn("Supabase error, using fallback plans:", error);
      return res.json({
        success: true,
        plans: mockPlans,
      } as PlansResponse);
    }

    // If no plans from database, use fallback
    if (!plans || plans.length === 0) {
      console.warn("No plans found in database, using fallback plans");
      return res.json({
        success: true,
        plans: mockPlans,
      } as PlansResponse);
    }

    return res.json({
      success: true,
      plans: plans || [],
    } as PlansResponse);
  } catch (error) {
    console.warn("Error fetching plans from Supabase, using fallback:", error);
    // Return mock plans as fallback
    return res.json({
      success: true,
      plans: mockPlans,
    } as PlansResponse);
  }
};
