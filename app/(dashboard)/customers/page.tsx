"use client";

import { useEffect, useState } from "react";
import CustomerCard from "@/components/customers/CustomerCard";
import { getCustomers } from "@/services/customer.service";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadCustomers() {
    try {
      setLoading(true);
      setError(null);
      const data = await getCustomers();
      console.log("[Customers] loaded:", data);
      setCustomers(data || []);
    } catch (err: any) {
      console.error("[Customers] error:", err);
      setError(err?.message ?? "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      !q ||
      c.full_name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold">Customers</h1>
          <p className="text-gray-500 mt-2">Manage your Beautiful Nails customer database</p>
        </div>
        {/* <button className="bg-[#ff2056] hover:bg-[#d9003f] text-white rounded-xl px-5 py-3 font-medium transition-all flex items-center gap-2">
          + Add Customer
        </button> */}
      </div>

      {/* SEARCH */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-3">
        <svg
          className="w-4 h-4 text-gray-400 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
          />
        </svg>
        <input
          placeholder="Search by name, email, or phone..."
          className="flex-1 bg-transparent outline-none text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* STATES */}
      {loading && (
        <div className="text-center py-16 text-gray-400">Loading customers...</div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">
          Error: {error}
        </div>
      )}

      {!loading && !error && filteredCustomers.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          No confirmed customers found.
        </div>
      )}

      {/* GRID */}
      {!loading && !error && (
        <div className="grid grid-cols-3 gap-5">
          {filteredCustomers.map((customer) => (
            <CustomerCard key={customer.id} customer={customer} />
          ))}
        </div>
      )}
    </div>
  );
}
