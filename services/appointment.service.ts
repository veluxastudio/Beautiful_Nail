import { supabase } from "@/lib/supabase/client";

export async function getAppointments() {
  const { data, error } = await supabase
    .from("appointments")
    .select(`
      *,
      customers ( full_name, email, phone ),
      services  ( name, category ),
      staff     ( full_name )
    `)
    .eq("services.category", "Nail")
    .order("appointment_date", { ascending: true });

  if (error) throw error;
  return data;
}

export async function updateAppointmentStatus(id: string, status: string) {
  const { error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", id);

  if (error) throw error;
}