"use client";

import { useEffect, useState } from "react";
import AppointmentCard from "@/components/appointments/AppointmentCard";
import {
  getAppointments,
  updateAppointmentStatus,
} from "@/services/appointment.service";
import { getServices } from "@/services/service.service";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterTreatment, setFilterTreatment] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [services, setServices] = useState<any[]>([]);

  async function loadData() {
    try {
      const [aptData, svcData] = await Promise.all([
        getAppointments(),
        getServices(),
      ]);
      setAppointments(aptData || []);
      setServices(svcData || []);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => { loadData(); }, []);

  async function handleConfirm(id: string) {
    await updateAppointmentStatus(id, "Confirmed");
    await loadData();
  }
  async function handleReject(id: string) {
    await updateAppointmentStatus(id, "Cancelled");
    await loadData();
  }
  async function handleComplete(id: string) {
    await updateAppointmentStatus(id, "Completed");
    await loadData();
  }

  const serviceNames = [...new Set(services.map((s) => s.name).filter(Boolean))];

  const filtered = appointments.filter((apt) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      apt.customers?.full_name?.toLowerCase().includes(q) ||
      apt.customers?.email?.toLowerCase().includes(q) ||
      apt.services?.name?.toLowerCase().includes(q);
    const matchTreatment = !filterTreatment || apt.services?.name === filterTreatment;
    const matchStatus    = !filterStatus    || apt.status === filterStatus;
    return matchSearch && matchTreatment && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold">Appointments</h1>
          <p className="text-gray-500 mt-2">Manage all Customer Appointments</p>
        </div>
      </div>

      {/* SEARCH + FILTER */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 bg-gray-100 rounded-xl px-4 py-3 min-w-[200px]">
          <SearchIcon />
          <input
            placeholder="Search by customer, treatment, or email..."
            className="bg-transparent outline-none flex-1 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="bg-gray-100 rounded-xl px-4 py-3 outline-none text-sm"
          value={filterTreatment}
          onChange={(e) => setFilterTreatment(e.target.value)}
        >
          <option value="">All Services</option>
          {serviceNames.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <select
          className="bg-gray-100 rounded-xl px-4 py-3 outline-none text-sm"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* LIST */}
      <div className="space-y-4">
        {filtered.map((apt) => (
          <AppointmentCard
            key={apt.id}
            appointment={apt}
            onConfirm={()  => handleConfirm(apt.id)}
            onReject={()   => handleReject(apt.id)}
            onComplete={() => handleComplete(apt.id)}
            onUpdated={loadData} // ← reload setelah assign staff
          />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            No appointments found.
          </div>
        )}
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
    </svg>
  );
}