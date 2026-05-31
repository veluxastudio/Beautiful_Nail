"use client";

import { useEffect, useState } from "react";
import ServiceCard from "@/components/services/ServiceCard";
import { createService, getServices } from "@/services/service.service";

type Service = {
  id?: string;
  name: string;
  description: string;
  category: string;
  price: number;
  duration: number;
  status: string;
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [activeService, setActiveService] = useState("All");
  const [showAddService, setShowAddService] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("150000");
  const [newServiceDuration, setNewServiceDuration] = useState("60");
  const [saving, setSaving] = useState(false);

  async function loadServices() {
    const data = await getServices();
    setServices(data || []);
  }

  useEffect(() => {
    const fetchData = async () => {
      await loadServices();
    };
    void fetchData();
  }, []);

  async function handleAddService() {
    setSaving(true);
    try {
      await createService({
        name: newServiceName,
        description: `${newServiceName} treatment`,
        category: "Nail",
        price: Number(newServicePrice),
        duration: Number(newServiceDuration),
        status: "Active",
      });
      await loadServices();
      setShowAddService(false);
    } catch (err) {
      console.error("Failed to add service", err);
      alert("Failed to add service. Please check the values and try again.");
    } finally {
      setSaving(false);
    }
  }

  const filteredServices =
    activeService === "All"
      ? services
      : services.filter((s) => s.name === activeService);

  const serviceNames = [
    "All",
    ...Array.from(new Set(services.map((s) => s.name))).sort(),
  ];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold">Services</h1>
          <p className="text-gray-500 mt-2">
            Available services: Manicure, Pedicure, Nail Art, Nail Gels, Extension
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddService((prev) => !prev)}
            className="bg-[#ff2056] hover:bg-[#d9003f] text-white rounded-xl px-5 py-3 font-medium transition-all flex items-center gap-2"
          >
            + Add Nail Service
          </button>
          {showAddService && (
            <button
              onClick={() => setShowAddService(false)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl px-5 py-3 font-medium transition-all"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {showAddService && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-2 text-sm text-gray-600">
              Service Name
              <input
                type="text"
                placeholder="Enter new service name"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-[#ff2056]/30 focus:border-[#ff2056]/50"
              />
            </label>
            <label className="space-y-2 text-sm text-gray-600">
              Price
              <input
                type="number"
                min={0}
                value={newServicePrice}
                onChange={(e) => setNewServicePrice(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-[#ff2056]/30 focus:border-[#ff2056]/50"
              />
            </label>
            <label className="space-y-2 text-sm text-gray-600">
              Duration (minutes)
              <input
                type="number"
                min={0}
                value={newServiceDuration}
                onChange={(e) => setNewServiceDuration(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-[#ff2056]/30 focus:border-[#ff2056]/50"
              />
            </label>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleAddService}
              disabled={saving}
              className="bg-[#ff2056] hover:bg-[#d9003f] disabled:opacity-50 text-white rounded-xl px-5 py-3 font-medium transition-all"
            >
              {saving ? "Saving..." : "Save Service"}
            </button>
            <span className="text-sm text-gray-500">
              Service will be created as Nail category and Active status.
            </span>
          </div>
        </div>
      )}

      {/* CATEGORY FILTER */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex gap-3 flex-wrap">
        {serviceNames.map((type) => (
          <button
            key={type}
            onClick={() => setActiveService(type)}
            className={`px-5 py-2 rounded-full font-medium text-sm transition-all border ${
              activeService === type
                ? "bg-[#ff2056] text-white border-[#ff2056]"
                : "bg-gray-100 hover:bg-gray-200 border-transparent"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* GRID */}
      <div className="grid grid-cols-3 gap-5">
        {filteredServices.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onRefresh={loadServices}
          />
        ))}
      </div>
    </div>
  );
}