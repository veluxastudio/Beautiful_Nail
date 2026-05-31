import { supabase } from "@/lib/supabase/client";

/**
 * Ambil semua customer (yang pernah daftar),
 * enriched dengan data dari appointments:
 * - total_visits  : jumlah appointment (semua status kecuali Cancelled)
 * - total_spent   : total harga dari appointment yang Completed
 * - last_visit    : tanggal appointment Completed terakhir
 * - favorite_service: nama service yang paling sering dipesan
 */
export async function getCustomers() {
  // 1. Ambil semua customer
  const { data: customerData, error: customerError } = await supabase
    .from("customers")
    .select("*")
    .order("full_name", { ascending: true });

  if (customerError) throw customerError;
  if (!customerData || customerData.length === 0) return [];

  // 2. Ambil semua appointments sekaligus (1 query, bukan per-customer)
  const { data: aptData, error: aptError } = await supabase
    .from("appointments")
    .select(`
      customer_id,
      status,
      total_price,
      appointment_date,
      services ( name )
    `)
    .neq("status", "Cancelled");

  if (aptError) throw aptError;

  // 3. Group appointments per customer_id
  const aptMap: Record<string, any[]> = {};
  for (const apt of aptData ?? []) {
    if (!apt.customer_id) continue;
    if (!aptMap[apt.customer_id]) aptMap[apt.customer_id] = [];
    aptMap[apt.customer_id].push(apt);
  }

  // 4. Enrich tiap customer
  const enriched = customerData.map((c) => {
    const apts = aptMap[c.id] ?? [];

    // total visits = semua appointment (non-cancelled)
    const total_visits = apts.length;

    // total spent = sum harga yang Completed
    const total_spent = apts
      .filter((a) => a.status === "Completed")
      .reduce((sum, a) => sum + Number(a.total_price ?? 0), 0);

    // last visit = tanggal Completed terbaru
    const completedDates = apts
      .filter((a) => a.status === "Completed" && a.appointment_date)
      .map((a) => a.appointment_date as string)
      .sort()
      .reverse();
    const last_visit = completedDates[0] ?? c.last_visit ?? null;

    // favorite service = nama service yang paling sering muncul
    const serviceCount: Record<string, number> = {};
    for (const a of apts) {
      const name = a.services?.name;
      if (name) serviceCount[name] = (serviceCount[name] ?? 0) + 1;
    }
    const favorite_service =
      Object.entries(serviceCount).sort((x, y) => y[1] - x[1])[0]?.[0] ??
      c.favorite_service ??
      null;

    // member_type: VIP jika total_spent >= 1.000.000 atau total_visits >= 5
    const member_type =
      c.member_type ??
      (total_spent >= 1_000_000 || total_visits >= 5 ? "VIP" : "Regular");

    return {
      ...c,
      total_visits,
      total_spent,
      last_visit,
      favorite_service,
      member_type,
    };
  });

  return enriched;
}

export async function createCustomer(values: any) {
  const { data, error } = await supabase
    .from("customers")
    .insert(values)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCustomer(id: string) {
  const { error } = await supabase
    .from("customers")
    .delete()
    .eq("id", id);

  if (error) throw error;
}