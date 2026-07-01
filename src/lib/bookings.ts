import { supabase } from "@/integrations/supabase/client";

export type BookingType = "flight" | "hotel" | "car" | "visa" | "kakande" | "package" | "transfer" | "insurance";

export interface CreateBookingInput {
  type: BookingType;
  reference: string;
  total_amount: number;
  currency?: string;
  travel_date?: string | null;
  status?: string;
  payment_status?: string;
  details: Record<string, unknown>;
}

export const createBooking = async (input: CreateBookingInput) => {
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) throw new Error("You must be signed in to complete a booking.");

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      user_id: user.id,
      type: input.type,
      reference: input.reference,
      total_amount: input.total_amount,
      currency: input.currency ?? "USD",
      travel_date: input.travel_date ?? null,
      status: input.status ?? "confirmed",
      payment_status: input.payment_status ?? "pending",
      details: input.details,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const generateReference = (prefix: string) =>
  prefix + Math.random().toString(36).slice(2, 8).toUpperCase();
