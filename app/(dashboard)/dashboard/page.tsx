"use client";

import { useEffect, useState } from "react";
import {
  getAppointments,
} from "@/services/appointment.service";
import { getStaff } from "@/services/staff.service";

// ── helpers ──────────────────────────────────────────────────────────────────
function todayStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, "0");
  const dd   = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function normalizeDate(d: string) {
  return d?.slice(0, 10) ?? "";
}

function fmtRp(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

// ── types ─────────────────────────────────────────────────────────────────────
interface Apt {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  duration: number;
  total_price: number;
  note?: string;
  customers?: { full_name: string; email: string; phone: string };
  services?: { name: string; category?: string };
  staff?: { full_name: string };
}

type Staff = {
  id?: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  specialties?: string[];
  status: string;
  services_done: number;
  rating: number;
};

// ── status badge ──────────────────────────────────────────────────────────────
const statusStyles: Record<string, string> = {
  Pending:      "bg-yellow-50 text-yellow-600 border border-yellow-200",
  Confirmed:    "bg-green-50  text-green-600  border border-green-200",
  Completed:    "bg-blue-50   text-blue-600   border border-blue-200",
  Cancelled:    "bg-red-50    text-red-500    border border-red-200",
  "In Progress":"bg-purple-50 text-purple-600 border border-purple-200",
  Upcoming:     "bg-orange-50 text-orange-500 border border-orange-200",
};

// ── icons ─────────────────────────────────────────────────────────────────────
function CalIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
    </svg>
  );
}
function DollarIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
    </svg>
  );
}
function CheckCircleIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  );
}
function ClockIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  );
}
function TrendUpIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
    </svg>
  );
}
function StarIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
    </svg>
  );
}

// ── stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  icon, iconBg, label, value, sub,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100
                    transition-all hover:shadow-md hover:-translate-y-0.5 flex flex-col gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        <p className="text-gray-500 text-sm mt-0.5">{label}</p>
        <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
          <TrendUpIcon />{sub}
        </p>
      </div>
    </div>
  );
}

// ── schedule row ──────────────────────────────────────────────────────────────
function ScheduleRow({ apt }: { apt: Apt }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b last:border-0">
      <div className="w-16 text-center shrink-0">
        <span className="bg-pink-100 text-pink-600 font-semibold text-sm
                         rounded-xl px-2 py-1.5 block">
          {apt.appointment_time?.slice(0, 5) ?? "-"}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">
          {apt.customers?.full_name ?? "-"}
        </p>
        <p className="text-gray-500 text-xs mt-0.5">
          {apt.services?.name ?? "-"}
        </p>
        <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1">
          Staff: {apt.staff?.full_name ?? "-"}
          <span className="mx-1">•</span>
          <ClockIcon /> {apt.duration} min
        </p>
      </div>
      <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0
                        ${statusStyles[apt.status] ?? "bg-gray-100 text-gray-500"}`}>
        {apt.status}
      </span>
    </div>
  );
}

// ── treatment stat row ────────────────────────────────────────────────────────
function TreatmentRow({
  name, bookings, revenue, pct,
}: {
  name: string; bookings: number; revenue: number; pct: number;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{name}</span>
        <span className="text-gray-500">{bookings} bookings</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-pink-500 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400">
        <span>{pct}% of total</span>
        <span className="text-green-600 font-medium">{fmtRp(revenue)}</span>
      </div>
    </div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [appointments, setAppointments] = useState<Apt[]>([]);
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAppointments().catch(() => []),
      getStaff().catch(() => []),
    ])
      .then(([aptData, staffData]) => {
        setAppointments(aptData || []);
        setStaffs(staffData || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const today = todayStr();

  // ── derived stats ──────────────────────────────────────────────────────────
  const todayApts      = appointments.filter((a) => normalizeDate(a.appointment_date) === today);
  const revenueToday   = todayApts
    .filter((a) => a.status === "Completed")
    .reduce((s, a) => s + Number(a.total_price ?? 0), 0);
  const totalCustomers = new Set(appointments.map((a) => a.customers?.full_name).filter(Boolean)).size;
  const completedToday = todayApts.filter((a) => a.status === "Completed").length;
  const inProgressToday = todayApts.filter((a) => a.status === "Confirmed").length;

  // ── customer satisfaction dari rating staff ────────────────────────────────
  const ratedStaffs = staffs.filter(
    (s) => s.rating != null && Number(s.rating) >= 1 && Number(s.rating) <= 5
  );
  const avgSatisfaction = ratedStaffs.length
    ? (ratedStaffs.reduce((sum, s) => sum + Number(s.rating), 0) / ratedStaffs.length).toFixed(1)
    : "0.0";
  const totalReviews = ratedStaffs.length;

  // ── treatment stats (this month) ──────────────────────────────────────────
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthApts = appointments.filter((a) => normalizeDate(a.appointment_date).startsWith(thisMonth));
  const treatmentMap: Record<string, { bookings: number; revenue: number }> = {};
  monthApts.forEach((a) => {
    const name = a.services?.name ?? "Unknown";
    if (!treatmentMap[name]) treatmentMap[name] = { bookings: 0, revenue: 0 };
    treatmentMap[name].bookings++;
    treatmentMap[name].revenue += Number(a.total_price ?? 0);
  });
  const totalMonthBookings = monthApts.length || 1;
  const treatments = Object.entries(treatmentMap)
    .sort((x, y) => y[1].bookings - x[1].bookings)
    .slice(0, 5)
    .map(([name, v]) => ({
      name,
      ...v,
      pct: Math.round((v.bookings / totalMonthBookings) * 100),
    }));

  // ── today's schedule sorted by time ───────────────────────────────────────
  const schedule = [...todayApts].sort((a, b) =>
    (a.appointment_time ?? "").localeCompare(b.appointment_time ?? "")
  );

  // ── peak hour ─────────────────────────────────────────────────────────────
  const hourBuckets: Record<number, number> = {};
  todayApts.forEach((a) => {
    const h = parseInt(a.appointment_time?.slice(0, 2) ?? "0");
    hourBuckets[h] = (hourBuckets[h] ?? 0) + 1;
  });
  const peakHour = Object.entries(hourBuckets).sort((a, b) => b[1] - a[1])[0];
  const peakLabel = peakHour
    ? `${peakHour[0].padStart(2, "0")}:00 – ${String(Number(peakHour[0]) + 3).padStart(2, "0")}:00`
    : "–";

  // ── avg duration ──────────────────────────────────────────────────────────
  const avgDuration = appointments.length
    ? Math.round(appointments.reduce((s, a) => s + (a.duration ?? 0), 0) / appointments.length)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's your salon overview today.</p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<CalIcon />}
          iconBg="bg-blue-50 text-blue-500"
          label="Today's Appointments"
          value={String(todayApts.length)}
          sub={`${inProgressToday} in progress`}
        />
        <StatCard
          icon={<DollarIcon />}
          iconBg="bg-green-50 text-green-500"
          label="Revenue Today"
          value={fmtRp(revenueToday)}
          sub="from completed"
        />
        <StatCard
          icon={<UsersIcon />}
          iconBg="bg-purple-50 text-purple-500"
          label="Total Customers"
          value={String(totalCustomers)}
          sub="all time"
        />
        <StatCard
          icon={<CheckCircleIcon />}
          iconBg="bg-pink-50 text-pink-500"
          label="Completed Today"
          value={String(completedToday)}
          sub={`${inProgressToday} in progress`}
        />
      </div>

      {/* SCHEDULE + TREATMENT STATS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Today's Schedule */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-lg">Today's Schedule</h2>
              <p className="text-gray-400 text-xs mt-0.5">
                {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
              </p>
            </div>
            <span className="text-xs bg-pink-50 text-pink-500 border border-pink-100 px-3 py-1 rounded-full font-medium">
              {todayApts.length} appointments
            </span>
          </div>
          <div className="max-h-80 overflow-y-auto pr-1">
            {schedule.length > 0 ? (
              schedule.map((apt) => <ScheduleRow key={apt.id} apt={apt} />)
            ) : (
              <p className="text-center text-gray-400 py-12 text-sm">No appointments today.</p>
            )}
          </div>
        </div>

        {/* Treatment Statistics */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div>
            <h2 className="font-bold text-lg">Treatment Statistics</h2>
            <p className="text-gray-400 text-xs mt-0.5">This month's performance</p>
          </div>
          {treatments.length > 0 ? (
            <div className="space-y-4">
              {treatments.map((t) => (
                <TreatmentRow key={t.name} {...t} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-8 text-sm">No data this month.</p>
          )}
        </div>
      </div>

      {/* BOTTOM BANNERS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Peak Hours */}
        <div className="rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white p-6">
          <p className="text-pink-100 text-sm font-medium">Peak Hours Today</p>
          <p className="text-3xl font-bold mt-2 flex items-center gap-2">
            {peakLabel}
            <svg className="w-6 h-6 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
          </p>
          <p className="text-pink-100 text-sm mt-2">{todayApts.length} appointments scheduled</p>
        </div>

        {/* Average Service Time */}
        <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white p-6">
          <p className="text-purple-100 text-sm font-medium">Average Service Time</p>
          <p className="text-3xl font-bold mt-2 flex items-center gap-2">
            {avgDuration} min
            <ClockIcon className="w-6 h-6 opacity-80" />
          </p>
          <p className="text-purple-100 text-sm mt-2">Across all treatments</p>
        </div>

        {/* Customer Satisfaction */}
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white p-6">
          <p className="text-green-100 text-sm font-medium">Customer Satisfaction</p>
          <p className="text-3xl font-bold mt-2 flex items-center gap-2">
            {avgSatisfaction}/5.0
            <StarIcon className="w-6 h-6 opacity-80" />
          </p>
          <p className="text-green-100 text-sm mt-2">
            Based on {totalReviews} staff rating{totalReviews !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </div>
  );
}