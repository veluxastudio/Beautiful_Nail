"use client";

import { useEffect, useState, useMemo } from "react";
import { getAppointments } from "@/services/appointment.service";
import { getStaff } from "@/services/staff.service";

// ── types ─────────────────────────────────────────────────────────────────────
interface Apt {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  total_price: number;
  duration?: number;
  customer_id?: string;
  customers?: { full_name: string };
  services?: { name: string; category?: string };
  staff?: { full_name: string };
  staff_id?: string;
  rating?: number;
}

interface StaffRow {
  id: string;
  full_name: string;
  rating?: number;
  services_done?: number;
}

// ── helpers ───────────────────────────────────────────────────────────────────
function fmtRp(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function monthLabel(ym: string) {
  const [y, m] = ym.split("-");
  return new Date(Number(y), Number(m) - 1).toLocaleDateString("en-GB", {
    month: "short", year: "numeric",
  });
}

const PERIOD_OPTIONS = [
  { label: "This Month",    value: "this_month" },
  { label: "Last 3 Months", value: "last_3" },
  { label: "Last 6 Months", value: "last_6" },
  { label: "This Year",     value: "this_year" },
  { label: "All Time",      value: "all" },
];

function getDateRange(period: string): { from: string; to: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  if (period === "this_month") {
    return {
      from: `${y}-${pad(m + 1)}-01`,
      to: fmt(new Date(y, m + 1, 0)),
    };
  }
  if (period === "last_3") {
    return { from: fmt(new Date(y, m - 2, 1)), to: fmt(new Date(y, m + 1, 0)) };
  }
  if (period === "last_6") {
    return { from: fmt(new Date(y, m - 5, 1)), to: fmt(new Date(y, m + 1, 0)) };
  }
  if (period === "this_year") {
    return { from: `${y}-01-01`, to: `${y}-12-31` };
  }
  return { from: "2000-01-01", to: "2099-12-31" };
}

function periodDisplayLabel(period: string, from: string, to: string) {
  const label = PERIOD_OPTIONS.find((o) => o.value === period)?.label ?? period;
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  return `${label} (${fmt(from)} – ${fmt(to)})`;
}

// ── export PDF ────────────────────────────────────────────────────────────────
function handleExportPDF(
  period: string,
  from: string,
  to: string,
  totalRevenue: number,
  totalApts: number,
  avgPerVisit: number,
  repeatRate: number,
  totalCustomers: number,
  trendMonths: [string, { revenue: number; count: number }][],
  maxRevenue: number,
  svcRows: [string, { bookings: number; revenue: number }][],
  maxSvcRevenue: number,
  staffRanked: { full_name: string; services: number; rating: number; revenue: number }[],
  peakLabel: string,
  peakPct: number,
  popDayLabel: string,
  popDayPct: number,
) {
  const periodLabel = periodDisplayLabel(period, from, to);
  const now = new Date().toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const trendRows = trendMonths
    .map(([ym, v]) => {
      const pct = Math.round((v.revenue / maxRevenue) * 100);
      return `
        <tr>
          <td>${monthLabel(ym)}</td>
          <td>${v.count} appointments</td>
          <td style="color:#16a34a;font-weight:600">${fmtRp(v.revenue)}</td>
          <td>
            <div style="background:#f3f4f6;border-radius:4px;height:8px;width:100%">
              <div style="background:#ff2056;height:8px;border-radius:4px;width:${pct}%"></div>
            </div>
          </td>
        </tr>`;
    })
    .join("");

  const svcTableRows = svcRows
    .map(([name, v]) => {
      const pct = Math.round((v.revenue / maxSvcRevenue) * 100);
      return `
        <tr>
          <td>${name}</td>
          <td>${v.bookings}</td>
          <td style="color:#16a34a;font-weight:600">${fmtRp(v.revenue)}</td>
          <td>
            <div style="background:#f3f4f6;border-radius:4px;height:8px;width:100%">
              <div style="background:#ff2056;height:8px;border-radius:4px;width:${pct}%"></div>
            </div>
          </td>
        </tr>`;
    })
    .join("");

  const staffTableRows = staffRanked
    .map((s, i) => `
      <tr>
        <td style="text-align:center;font-weight:700;color:#ff2056">${i + 1}</td>
        <td style="font-weight:600">${s.full_name}</td>
        <td style="text-align:center">${s.services}</td>
        <td style="text-align:center">${s.rating.toFixed(1)} ★</td>
        <td style="color:#16a34a;font-weight:600;text-align:right">${fmtRp(s.revenue)}</td>
      </tr>`)
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Beautiful Nail Report – ${periodLabel}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #111827;
      background: #fff;
      padding: 40px;
      font-size: 13px;
    }
    /* ── header ── */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 20px;
      border-bottom: 2px solid #ff2056;
      margin-bottom: 28px;
    }
    .header-title { font-size: 26px; font-weight: 800; color: #111827; }
    .header-sub   { font-size: 13px; color: #6b7280; margin-top: 4px; }
    .header-meta  { text-align: right; font-size: 12px; color: #9ca3af; }
    .badge {
      display: inline-block;
      background: #fff0f4;
      color: #ff2056;
      border: 1px solid #ffcdd8;
      border-radius: 20px;
      padding: 4px 12px;
      font-size: 12px;
      font-weight: 600;
      margin-top: 6px;
    }
    /* ── stat cards ── */
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
      margin-bottom: 28px;
    }
    .stat-card {
      border: 1px solid #e5e7eb;
      border-radius: 14px;
      padding: 16px;
    }
    .stat-label { font-size: 11px; color: #6b7280; margin-bottom: 4px; text-transform: uppercase; letter-spacing: .5px; }
    .stat-value { font-size: 20px; font-weight: 800; color: #111827; }
    .stat-sub   { font-size: 11px; color: #16a34a; margin-top: 4px; }
    /* ── section ── */
    .section {
      border: 1px solid #e5e7eb;
      border-radius: 14px;
      margin-bottom: 20px;
      overflow: hidden;
    }
    .section-header {
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
      padding: 14px 18px;
      font-weight: 700;
      font-size: 14px;
    }
    .section-body { padding: 18px; }
    /* ── tables ── */
    table { width: 100%; border-collapse: collapse; }
    th {
      background: #f3f4f6;
      padding: 8px 10px;
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: .5px;
      color: #6b7280;
      font-weight: 600;
    }
    td { padding: 9px 10px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    /* ── bottom banners ── */
    .banner-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
      margin-top: 20px;
    }
    .banner {
      border-radius: 14px;
      padding: 18px;
      color: white;
    }
    .banner-blue   { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
    .banner-violet { background: linear-gradient(135deg, #8b5cf6, #6d28d9); }
    .banner-green  { background: linear-gradient(135deg, #10b981, #059669); }
    .banner-label  { font-size: 11px; opacity: .8; margin-bottom: 6px; }
    .banner-value  { font-size: 22px; font-weight: 800; }
    .banner-sub    { font-size: 11px; opacity: .75; margin-top: 4px; }
    /* ── footer ── */
    .footer {
      margin-top: 28px;
      padding-top: 14px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 11px;
      color: #9ca3af;
    }
    @media print {
      body { padding: 20px; }
      @page { margin: 10mm; size: A4; }
    }
  </style>
</head>
<body>

  <!-- HEADER -->
  <div class="header">
    <div>
      <div class="header-title">Beautiful Nail Reports &amp; Analytics</div>
      <div class="header-sub">Performance Report</div>
      <div class="badge">${PERIOD_OPTIONS.find(o => o.value === period)?.label ?? period}</div>
    </div>
    <div class="header-meta">
      <div>Generated: ${now}</div>
      <div style="margin-top:4px;color:#6b7280">Period: ${new Date(from).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})} – ${new Date(to).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</div>
    </div>
  </div>

  <!-- STAT CARDS -->
  <div class="stat-grid">
    <div class="stat-card">
      <div class="stat-label">Total Revenue</div>
      <div class="stat-value">${fmtRp(totalRevenue)}</div>
      <div class="stat-sub">From completed appointments</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Total Appointments</div>
      <div class="stat-value">${totalApts}</div>
      <div class="stat-sub">All statuses included</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Avg. Per Visit</div>
      <div class="stat-value">${fmtRp(avgPerVisit)}</div>
      <div class="stat-sub">Completed appointments only</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Repeat Customer Rate</div>
      <div class="stat-value">${repeatRate}%</div>
      <div class="stat-sub">From ${totalCustomers} unique customers</div>
    </div>
  </div>

  <!-- REVENUE TREND -->
  ${trendMonths.length > 0 ? `
  <div class="section">
    <div class="section-header">Revenue Trend</div>
    <div class="section-body">
      <table>
        <thead><tr>
          <th>Month</th>
          <th>Appointments</th>
          <th>Revenue</th>
          <th style="width:35%">Trend</th>
        </tr></thead>
        <tbody>${trendRows}</tbody>
      </table>
    </div>
  </div>` : ""}

  <!-- SERVICE + STAFF -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">

    <!-- Service Performance -->
    <div class="section" style="margin-bottom:0">
      <div class="section-header">Service Performance</div>
      <div class="section-body">
        ${svcRows.length > 0 ? `
        <table>
          <thead><tr>
            <th>Service</th>
            <th>Bookings</th>
            <th>Revenue</th>
            <th>Share</th>
          </tr></thead>
          <tbody>${svcTableRows}</tbody>
        </table>` : "<p style='color:#9ca3af;text-align:center;padding:24px 0'>No data for this period.</p>"}
      </div>
    </div>

    <!-- Staff Performance -->
    <div class="section" style="margin-bottom:0">
      <div class="section-header">Staff Performance</div>
      <div class="section-body">
        ${staffRanked.length > 0 ? `
        <table>
          <thead><tr>
            <th style="text-align:center">#</th>
            <th>Name</th>
            <th style="text-align:center">Services</th>
            <th style="text-align:center">Rating</th>
            <th style="text-align:right">Revenue</th>
          </tr></thead>
          <tbody>${staffTableRows}</tbody>
        </table>` : "<p style='color:#9ca3af;text-align:center;padding:24px 0'>No data for this period.</p>"}
      </div>
    </div>

  </div>

  <!-- BOTTOM BANNERS -->
  <div class="banner-grid">
    <div class="banner banner-blue">
      <div class="banner-label">Peak Hours</div>
      <div class="banner-value">${peakLabel}</div>
      <div class="banner-sub">${peakPct}% of appointments</div>
    </div>
    <div class="banner banner-violet">
      <div class="banner-label">Most Popular Day</div>
      <div class="banner-value">${popDayLabel}</div>
      <div class="banner-sub">${popDayPct}% of weekly bookings</div>
    </div>
    <div class="banner banner-green">
      <div class="banner-label">Repeat Customer Rate</div>
      <div class="banner-value">${repeatRate}%</div>
      <div class="banner-sub">Customers returning</div>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    Beautiful Nail Management System &bull; Report generated on ${now}
  </div>

</body>
</html>`;

  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
  }, 500);
}

// ── stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  icon, iconBg, value, label, sub, subColor = "text-green-500",
}: {
  icon: React.ReactNode; iconBg: string;
  value: string; label: string; sub: string; subColor?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-4
                    transition-all hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        <TrendIcon />
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        <p className="text-gray-500 text-sm mt-0.5">{label}</p>
        <p className={`text-xs mt-1 font-medium ${subColor}`}>{sub}</p>
      </div>
    </div>
  );
}

// ── progress bar row ──────────────────────────────────────────────────────────
function BarRow({
  label, bookings, revenue, pct, growth,
}: {
  label: string; bookings: number; revenue: number; pct: number; growth: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          {label}{" "}
          <span className="text-gray-400 font-normal">({bookings} bookings)</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="font-semibold text-green-600">{fmtRp(revenue)}</span>
          <span className="text-green-500 text-xs font-medium">{growth}</span>
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#ff2056] to-pink-400 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── staff rank row ────────────────────────────────────────────────────────────
function StaffRankRow({
  rank, name, services, rating, revenue,
}: {
  rank: number; name: string; services: number; rating: number; revenue: number;
}) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
      <div className="w-10 h-10 rounded-full bg-[#ff2056]/10 flex items-center justify-center
                      text-[#ff2056] font-bold text-sm shrink-0">
        {rank}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-sm">{name}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {services} services &bull; {rating.toFixed(1)} <StarInline />
        </p>
      </div>
      <p className="font-semibold text-green-600 text-sm">{fmtRp(revenue)}</p>
    </div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [appointments, setAppointments] = useState<Apt[]>([]);
  const [staffList, setStaffList] = useState<StaffRow[]>([]);
  const [period, setPeriod] = useState("this_month");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAppointments(), getStaff()])
      .then(([apts, staff]) => {
        setAppointments(apts || []);
        setStaffList(staff || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── filter by period ───────────────────────────────────────────────────────
  const { from, to } = useMemo(() => getDateRange(period), [period]);

  const filtered = useMemo(
    () =>
      appointments.filter((a) => {
        const d = a.appointment_date?.slice(0, 10) ?? "";
        return d >= from && d <= to;
      }),
    [appointments, from, to]
  );

  const completed = useMemo(
    () => filtered.filter((a) => a.status === "Completed"),
    [filtered]
  );

  // ── stat totals ──────────────────────────────────────────────────────────
  const totalRevenue   = completed.reduce((s, a) => s + Number(a.total_price ?? 0), 0);
  const totalApts      = filtered.length;
  const avgPerVisit    = completed.length ? Math.round(totalRevenue / completed.length) : 0;
  const totalCustomers = new Set(filtered.map((a) => a.customer_id).filter(Boolean)).size;

  const visitCount: Record<string, number> = {};
  filtered.forEach((a) => {
    if (a.customer_id) visitCount[a.customer_id] = (visitCount[a.customer_id] ?? 0) + 1;
  });
  const repeatCount = Object.values(visitCount).filter((v) => v > 1).length;
  const repeatRate  = totalCustomers ? Math.round((repeatCount / totalCustomers) * 100) : 0;

  // ── revenue trend (monthly) ───────────────────────────────────────────────
  const monthMap: Record<string, { revenue: number; count: number }> = {};
  completed.forEach((a) => {
    const ym = a.appointment_date?.slice(0, 7) ?? "";
    if (!ym) return;
    if (!monthMap[ym]) monthMap[ym] = { revenue: 0, count: 0 };
    monthMap[ym].revenue += Number(a.total_price ?? 0);
    monthMap[ym].count++;
  });
  const trendMonths = Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12);
  const maxRevenue = Math.max(...trendMonths.map(([, v]) => v.revenue), 1);

  // ── service performance ───────────────────────────────────────────────────
  const svcMap: Record<string, { bookings: number; revenue: number }> = {};
  filtered.forEach((a) => {
    const name = a.services?.name ?? "Unknown";
    if (!svcMap[name]) svcMap[name] = { bookings: 0, revenue: 0 };
    svcMap[name].bookings++;
    if (a.status === "Completed") svcMap[name].revenue += Number(a.total_price ?? 0);
  });
  const svcRows = Object.entries(svcMap)
    .sort(([, a], [, b]) => b.revenue - a.revenue)
    .slice(0, 5);
  const maxSvcRevenue = Math.max(...svcRows.map(([, v]) => v.revenue), 1);

  // ── staff performance ─────────────────────────────────────────────────────
  const staffRevMap: Record<string, { revenue: number; services: number }> = {};
  completed.forEach((a) => {
    if (!a.staff_id) return;
    if (!staffRevMap[a.staff_id]) staffRevMap[a.staff_id] = { revenue: 0, services: 0 };
    staffRevMap[a.staff_id].revenue += Number(a.total_price ?? 0);
    staffRevMap[a.staff_id].services++;
  });
  const staffRanked = staffList
    .map((s) => ({
      ...s,
      revenue:  staffRevMap[s.id]?.revenue  ?? 0,
      services: staffRevMap[s.id]?.services ?? s.services_done ?? 0,
      rating:   s.rating ?? 0,
    }))
    .filter((s) => s.revenue > 0 || s.services > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // ── peak hour ─────────────────────────────────────────────────────────────
  const hourBucket: Record<number, number> = {};
  filtered.forEach((a) => {
    const h = parseInt(a.appointment_time?.slice(0, 2) ?? "0");
    hourBucket[h] = (hourBucket[h] ?? 0) + 1;
  });
  const peakH = Object.entries(hourBucket).sort(([, a], [, b]) => b - a)[0];
  const peakLabel = peakH
    ? `${String(peakH[0]).padStart(2, "0")}:00 – ${String(Number(peakH[0]) + 3).padStart(2, "0")}:00`
    : "–";
  const peakPct = peakH && totalApts
    ? Math.round((Number(peakH[1]) / totalApts) * 100)
    : 0;

  // ── most popular day ──────────────────────────────────────────────────────
  const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const dayBucket: Record<number, number> = {};
  filtered.forEach((a) => {
    const d = new Date(a.appointment_date).getDay();
    dayBucket[d] = (dayBucket[d] ?? 0) + 1;
  });
  const popDay = Object.entries(dayBucket).sort(([, a], [, b]) => b - a)[0];
  const popDayLabel = popDay ? DAYS[Number(popDay[0])] : "–";
  const popDayPct   = popDay && totalApts
    ? Math.round((Number(popDay[1]) / totalApts) * 100)
    : 0;

  const currentPeriodLabel = periodDisplayLabel(period, from, to);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Loading reports…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-4xl font-bold">Reports &amp; Analytics</h1>
          <p className="text-gray-500 mt-1">Track your Nail's performance</p>
          {/* active period label */}
          <p className="text-xs text-[#ff2056] font-medium mt-1.5 bg-[#ff2056]/5 border border-[#ff2056]/20
                         inline-block px-3 py-1 rounded-full">
            {currentPeriodLabel}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* period selector */}
          <div className="relative">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-9
                         text-sm font-medium outline-none cursor-pointer hover:border-[#ff2056]/50
                         focus:border-[#ff2056]/50 focus:ring-2 focus:ring-[#ff2056]/20 transition-all"
            >
              {PERIOD_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronIcon />
          </div>

          {/* export button */}
          <button
            onClick={() =>
              handleExportPDF(
                period, from, to,
                totalRevenue, totalApts, avgPerVisit, repeatRate, totalCustomers,
                trendMonths, maxRevenue,
                svcRows, maxSvcRevenue,
                staffRanked,
                peakLabel, peakPct,
                popDayLabel, popDayPct,
              )
            }
            className="flex items-center gap-2 bg-[#ff2056] hover:bg-[#d9003f] text-white
                       rounded-xl px-4 py-2.5 text-sm font-medium transition-all shadow-sm"
          >
            <DownloadIcon /> Export PDF
          </button>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<DollarIcon />} iconBg="bg-green-50 text-green-500"
          value={fmtRp(totalRevenue)} label="Total Revenue"
          sub="From completed appointments"
        />
        <StatCard
          icon={<CalIcon />} iconBg="bg-blue-50 text-blue-500"
          value={String(totalApts)} label="Total Appointments"
          sub="All statuses included"
        />
        <StatCard
          icon={<ChartIcon />} iconBg="bg-purple-50 text-purple-500"
          value={fmtRp(avgPerVisit)} label="Average Per Visit"
          sub="Completed only"
        />
        <StatCard
          icon={<StarIcon />} iconBg="bg-pink-50 text-[#ff2056]"
          value={`${repeatRate}%`} label="Repeat Customer Rate"
          sub={`From ${totalCustomers} unique customers`}
          subColor="text-[#ff2056]"
        />
      </div>

      {/* REVENUE TREND */}
      {trendMonths.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-bold text-lg mb-5">Revenue Trend</h2>
          <div className="space-y-4">
            {trendMonths.map(([ym, v]) => (
              <div key={ym} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium w-24">{monthLabel(ym)}</span>
                  <span className="flex items-center gap-3">
                    <span className="font-semibold text-green-600">{fmtRp(v.revenue)}</span>
                    <span className="text-gray-400">({v.count} appointments)</span>
                  </span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#ff2056] to-pink-400 transition-all duration-700"
                    style={{ width: `${Math.round((v.revenue / maxRevenue) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SERVICE + STAFF PERFORMANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Performance */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="mb-5">
            <h2 className="font-bold text-lg">Service Performance</h2>
            <p className="text-gray-400 text-sm mt-0.5">Revenue by service category</p>
          </div>
          {svcRows.length > 0 ? (
            <div className="space-y-5">
              {svcRows.map(([name, v]) => (
                <BarRow
                  key={name}
                  label={name}
                  bookings={v.bookings}
                  revenue={v.revenue}
                  pct={Math.round((v.revenue / maxSvcRevenue) * 100)}
                  growth="+5%"
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-12 text-sm">No data for this period.</p>
          )}
        </div>

        {/* Staff Performance */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="mb-5">
            <h2 className="font-bold text-lg">Staff Performance</h2>
            <p className="text-gray-400 text-sm mt-0.5">Top performing team members</p>
          </div>
          {staffRanked.length > 0 ? (
            <div>
              {staffRanked.map((s, i) => (
                <StaffRankRow
                  key={s.id}
                  rank={i + 1}
                  name={s.full_name}
                  services={s.services}
                  rating={s.rating}
                  revenue={s.revenue}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-12 text-sm">No data for this period.</p>
          )}
        </div>
      </div>

      {/* BOTTOM BANNERS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6">
          <p className="text-blue-100 text-sm font-medium">Peak Hours</p>
          <p className="text-3xl font-bold mt-2">{peakLabel}</p>
          <p className="text-blue-100 text-sm mt-2">{peakPct}% of appointments</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 text-white p-6">
          <p className="text-purple-100 text-sm font-medium">Most Popular Day</p>
          <p className="text-3xl font-bold mt-2">{popDayLabel}</p>
          <p className="text-purple-100 text-sm mt-2">{popDayPct}% of weekly bookings</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white p-6">
          <p className="text-green-100 text-sm font-medium">Repeat Customer Rate</p>
          <p className="text-3xl font-bold mt-2">{repeatRate}%</p>
          <p className="text-green-100 text-sm mt-2">Customers returning</p>
        </div>
      </div>
    </div>
  );
}

// ── icons ─────────────────────────────────────────────────────────────────────
function DollarIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  );
}
function CalIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
    </svg>
  );
}
function StarIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
    </svg>
  );
}
function TrendIcon() {
  return (
    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
    </svg>
  );
}
function DownloadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
    </svg>
  );
}
function ChevronIcon() {
  return (
    <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
      fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
    </svg>
  );
}
function StarInline() {
  return (
    <svg className="w-3 h-3 inline text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
    </svg>
  );
}