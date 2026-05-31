"use client";

import { useEffect, useState } from "react";
import { getAvailableStaff } from "@/services/staff.service";
import { supabase } from "@/lib/supabase/client";

interface Staff {
  id: string;
  full_name: string;
  role?: string;
  specialties?: string[];
  rating?: number;
  services_done?: number;
}

interface Props {
  appointment: any;
  onClose: () => void;
  onUpdated: () => void;
}

export default function ViewAppointmentModal({ appointment: apt, onClose, onUpdated }: Props) {
  const [availableStaff, setAvailableStaff] = useState<Staff[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>(apt.staff_id ?? "");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const customer = apt.customers;
  const service  = apt.services;
  const staff    = apt.staff;

  useEffect(() => {
    if (!apt.appointment_date || !apt.appointment_time || !apt.duration) {
      setLoading(false);
      return;
    }
    getAvailableStaff(
      apt.appointment_date,
      apt.appointment_time,
      apt.duration,
      apt.id
    )
      .then(setAvailableStaff)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [apt]);

  async function handleAssign() {
    if (!selectedStaffId) { setError("Please select a staff member."); return; }
    setSaving(true);
    setError("");
    const { error: err } = await supabase
      .from("appointments")
      .update({ staff_id: selectedStaffId })
      .eq("id", apt.id);
    setSaving(false);
    if (err) { setError(err.message); return; }
    onUpdated();
    onClose();
  }

  function formatDate(d: string) {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("en-GB", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
  }

  const isPending = apt.status === "Pending";

  return (
    /* backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-lg">Appointment Detail</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <XIcon />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">

          {/* customer info */}
          <section className="space-y-1">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Customer</p>
            <p className="font-semibold text-base">{customer?.full_name ?? "-"}</p>
            <p className="text-sm text-gray-500">{customer?.email}</p>
            <p className="text-sm text-gray-500">{customer?.phone}</p>
          </section>

          <hr className="border-gray-100" />

          {/* appointment info */}
          <section className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Date</p>
              <p className="font-medium">{formatDate(apt.appointment_date)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Time</p>
              <p className="font-medium">{apt.appointment_time} ({apt.duration} min)</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Service</p>
              <p className="font-medium">{service?.name ?? "-"}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Total</p>
              <p className="font-semibold text-pink-500">
                Rp {Number(apt.total_price ?? 0).toLocaleString("id-ID")}
              </p>
            </div>
          </section>

          {apt.note && (
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-3 text-sm text-yellow-800">
              <span className="font-medium">Note: </span>{apt.note}
            </div>
          )}

          <hr className="border-gray-100" />

          {/* staff section */}
          <section className="space-y-3">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Staff Assignment</p>

            {/* already assigned & not pending */}
            {!isPending && staff && (
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                <div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-sm shrink-0">
                  {staff.full_name?.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-sm">{staff.full_name}</p>
                  <p className="text-xs text-gray-400">{staff.role ?? "Staff"}</p>
                </div>
              </div>
            )}

            {/* pending → show picker */}
            {isPending && (
              <>
                {loading ? (
                  <div className="text-center py-6 text-gray-400 text-sm">
                    Checking staff availability…
                  </div>
                ) : availableStaff.length === 0 ? (
                  <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
                    ⚠️ No staff available at this time slot. Please reschedule the appointment.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {availableStaff.map((s) => (
                      <label
                        key={s.id}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all
                          ${selectedStaffId === s.id
                            ? "border-pink-400 bg-pink-50"
                            : "border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                      >
                        <input
                          type="radio"
                          name="staff"
                          value={s.id}
                          checked={selectedStaffId === s.id}
                          onChange={() => setSelectedStaffId(s.id)}
                          className="accent-pink-500"
                        />
                        <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center
                                        text-pink-600 font-bold text-sm shrink-0">
                          {s.full_name?.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{s.full_name}</p>
                          <p className="text-xs text-gray-400">{s.role ?? "Staff"}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-yellow-500 font-medium">★ {s.rating ?? "-"}</p>
                          <p className="text-xs text-gray-400">{s.services_done ?? 0} done</p>
                        </div>
                      </label>
                    ))}
                    <p className="text-xs text-gray-400 pt-1">
                      Only showing staff free at {apt.appointment_time} for {apt.duration} min
                    </p>
                  </div>
                )}

                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}
              </>
            )}
          </section>
        </div>

        {/* footer */}
        {isPending && availableStaff.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={saving || !selectedStaffId}
              className="px-5 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium
                         disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {saving ? "Saving…" : "Assign Staff"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function XIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
    </svg>
  );
}