"use client";

import { useState } from "react";
import ViewAppointmentModal from "@/components/appointments/ViewAppointmentModal";

interface Props {
  appointment: any;
  onConfirm:  () => void;
  onReject:   () => void;
  onComplete: () => void;
  onUpdated?: () => void; // dipanggil setelah assign staff
}

function formatDate(d: string) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short",
  });
}

const statusStyles: Record<string, string> = {
  Pending:   "bg-yellow-50 text-yellow-600 border border-yellow-200",
  Confirmed: "bg-green-50  text-green-600  border border-green-200",
  Completed: "bg-blue-50   text-blue-600   border border-blue-200",
  Cancelled: "bg-red-50    text-red-500    border border-red-200",
};

export default function AppointmentCard({
  appointment: apt, onConfirm, onReject, onComplete, onUpdated,
}: Props) {
  const [showModal, setShowModal] = useState(false);

  const customer = apt.customers;
  const service  = apt.services;
  const staff    = apt.staff;

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-gray-300">

        {/* ROW 1 — nama + status */}
        <div className="flex justify-between items-start">
          <div>
            <p className="font-semibold text-lg">{customer?.full_name ?? "-"}</p>
            <p className="text-sm text-gray-500 mt-0.5">{customer?.email}</p>
            <p className="text-sm text-gray-500">{customer?.phone}</p>
          </div>
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusStyles[apt.status] ?? "bg-gray-100 text-gray-500"}`}>
            {apt.status}
          </span>
        </div>

        {/* ROW 2 — tanggal / waktu / staff / harga */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 border-t border-b border-gray-100 py-4">
          <span className="flex items-center gap-1.5">
            <CalIcon />
            {formatDate(apt.appointment_date)}
          </span>
          <span className="flex items-center gap-1.5">
            <ClockIcon />
            {apt.appointment_time} ({apt.duration} min)
          </span>
          <span className="flex items-center gap-1.5">
            <UserIcon />
            {staff?.full_name
              ? `Staff: ${staff.full_name}`
              : <span className="text-gray-400 italic">Staff: not assigned</span>
            }
          </span>
          <span className="ml-auto font-semibold text-pink-500 text-sm">
            Rp {Number(apt.total_price ?? 0).toLocaleString("id-ID")}
          </span>
        </div>

        {/* ROW 3 — treatment */}
        <div className="bg-gray-50 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-400 mb-1">Treatment</p>
          <p className="font-semibold text-sm">{service?.name ?? "-"}</p>
          {apt.note && (
            <p className="text-sm text-gray-500 mt-1">Note: {apt.note}</p>
          )}
        </div>

        {/* ROW 4 — tombol aksi */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-all"
          >
            <EyeIcon /> View
          </button>

          {apt.status === "Pending" && (
            <>
              <button
                onClick={onConfirm}
                className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white rounded-xl px-5 py-2.5 text-sm font-medium transition-all"
              >
                <CheckIcon /> Confirm
              </button>
              <button
                onClick={onReject}
                className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white rounded-xl px-5 py-2.5 text-sm font-medium transition-all"
              >
                <XIcon /> Reject
              </button>
            </>
          )}

          {apt.status === "Confirmed" && (
            <button
              onClick={onComplete}
              className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-5 py-2.5 text-sm font-medium transition-all"
            >
              <CheckIcon /> Mark Complete
            </button>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <ViewAppointmentModal
          appointment={apt}
          onClose={() => setShowModal(false)}
          onUpdated={() => {
            setShowModal(false);
            onUpdated?.();
          }}
        />
      )}
    </>
  );
}

// ── icons ─────────────────────────────────────────────────────────────────────
function CalIcon() {
  return <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>;
}
function ClockIcon() {
  return <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
}
function UserIcon() {
  return <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>;
}
function EyeIcon() {
  return <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>;
}
function CheckIcon() {
  return <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>;
}
function XIcon() {
  return <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>;
}