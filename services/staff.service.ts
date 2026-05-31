import { supabase } from "@/lib/supabase/client";

type StaffCreateValues = {
  full_name: string;
  email: string;
  phone: string;
  role: string;
  specialties?: string[];
  status?: string;
};

type StaffUpdateValues = Partial<StaffCreateValues>;

export async function getStaff() {
  const { data: staffData, error: staffError } = await supabase
    .from("staff")
    .select("*")
    .order("created_at", { ascending: false });

  if (staffError) throw staffError;

  const enrichedStaff = await Promise.all(
    (staffData || []).map(async (staff) => {
      const { data: completed } = await supabase
        .from("appointments")
        .select("id", { count: "exact" })
        .eq("staff_id", staff.id)
        .eq("status", "Completed");

      const services_done = completed?.length ?? 0;

      const { data: ratings } = await supabase
        .from("appointments")
        .select("rating")
        .eq("staff_id", staff.id)
        .not("rating", "is", null);

      const ratingValues = (ratings || [])
        .map((r: { rating?: number | null }) => Number(r.rating))
        .filter((r) => !isNaN(r) && r > 0);

      const rating =
        ratingValues.length > 0
          ? ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length
          : 0;

      return {
        ...staff,
        services_done,
        rating: parseFloat(rating.toFixed(2)),
      };
    })
  );

  return enrichedStaff;
}

export async function createStaff(values: StaffCreateValues) {
  const staffPayload = {
    ...values,
    specialties: values.specialties || [],
    status: values.status || "active",
    services_done: 0,
    rating: 0,
  };

  const { data, error } = await supabase
    .from("staff")
    .insert(staffPayload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateStaff(id: string, values: StaffUpdateValues) {
  const { data, error } = await supabase
    .from("staff")
    .update(values)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteStaff(id: string) {
  const { error } = await supabase.from("staff").delete().eq("id", id);
  if (error) throw error;
}

// ─────────────────────────────────────────────────────────────────────────────
// AVAILABILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Kembalikan daftar staff aktif yang BEBAS pada tanggal + waktu + durasi tertentu.
 * Logika overlap: bentrok jika existing_start < req_end AND existing_end > req_start
 *
 * @param date       "YYYY-MM-DD"
 * @param time       "HH:MM"
 * @param duration   menit
 * @param excludeId  id appointment yang sedang diedit
 */
export async function getAvailableStaff(
  date: string,
  time: string,
  duration: number,
  excludeId?: string
) {
  const { data: staffData, error: staffError } = await supabase
    .from("staff")
    .select("id, full_name, role, specialties, status, rating, services_done")
    .eq("status", "active")
    .order("full_name");

  if (staffError) throw staffError;
  const allStaff = staffData ?? [];

  const [rH, rM] = time.split(":").map(Number);
  const reqStart = rH * 60 + rM;
  const reqEnd   = reqStart + duration;

  let query = supabase
    .from("appointments")
    .select("staff_id, appointment_time, duration, status")
    .eq("appointment_date", date)
    .in("status", ["Pending", "Confirmed"]);

  if (excludeId) query = query.neq("id", excludeId);

  const { data: existing, error: aptError } = await query;
  if (aptError) throw aptError;

  const busyIds = new Set<string>();
  (existing ?? []).forEach((apt) => {
    if (!apt.staff_id) return;
    const [aH, aM] = (apt.appointment_time as string).split(":").map(Number);
    const aStart = aH * 60 + aM;
    const aEnd   = aStart + (apt.duration ?? 0);
    if (aStart < reqEnd && aEnd > reqStart) {
      busyIds.add(apt.staff_id);
    }
  });

  return allStaff.filter((s) => !busyIds.has(s.id));
}

/**
 * Cek apakah seluruh slot hari tertentu sudah penuh.
 * Dipakai untuk blokir tanggal di sistem booking customer.
 *
 * @param date      "YYYY-MM-DD"
 * @param duration  menit
 */
export async function isDayFullyBooked(
  date: string,
  duration: number
): Promise<boolean> {
  const { data: staffData } = await supabase
    .from("staff")
    .select("id")
    .eq("status", "active");

  const allStaff = staffData ?? [];
  if (allStaff.length === 0) return false;

  const { data: existing } = await supabase
    .from("appointments")
    .select("staff_id, appointment_time, duration, status")
    .eq("appointment_date", date)
    .in("status", ["Pending", "Confirmed"]);

  const busySlots: Record<string, Array<{ start: number; end: number }>> = {};
  (existing ?? []).forEach((apt) => {
    if (!apt.staff_id) return;
    const [h, m] = (apt.appointment_time as string).split(":").map(Number);
    const s = h * 60 + m;
    if (!busySlots[apt.staff_id]) busySlots[apt.staff_id] = [];
    busySlots[apt.staff_id].push({ start: s, end: s + (apt.duration ?? 0) });
  });

  const OPEN = 9 * 60, CLOSE = 21 * 60;
  for (let slot = OPEN; slot + duration <= CLOSE; slot += 30) {
    const slotEnd = slot + duration;
    const hasAvailableStaff = allStaff.some((staff) => {
      const staffBusy = busySlots[staff.id] ?? [];
      return !staffBusy.some((b) => b.start < slotEnd && b.end > slot);
    });
    if (hasAvailableStaff) return false;
  }

  return true;
}