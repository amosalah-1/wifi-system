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

/**
 * Get all plans from database
 */
export const handleGetPlans: RequestHandler = async (req, res) => {
  try {
    const { data: plans, error } = await supabase
      .from("plans")
      .select("id, name, price, data_limit, duration_hours, description")
      .order("price", { ascending: true });

    if (error) throw error;

    return res.json({
      success: true,
      plans: plans || [],
    } as PlansResponse);
  } catch (error) {
    console.error("Error fetching plans:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch plans",
    } as PlansResponse);
  }
};
