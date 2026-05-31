"use client";

import { useState } from "react";
import { deleteService, updateService } from "@/services/service.service";

interface Props {
  service: any;
  onRefresh: () => void;
}

const CATEGORIES = ["Nail", "Hair", "Eyelash", "Waxing", "Facial", "Other"];

const categoryStyles: Record<string, string> = {
  Nail:    "bg-pink-50   text-pink-600   border border-pink-200",
  Hair:    "bg-purple-50 text-purple-600 border border-purple-200",
  Eyelash: "bg-blue-50   text-blue-600   border border-blue-200",
  Waxing:  "bg-orange-50 text-orange-600 border border-orange-200",
  Facial:  "bg-rose-50   text-rose-600   border border-rose-200",
  Other:   "bg-gray-100  text-gray-600   border border-gray-200",
};

export default function ServiceCard({ service, onRefresh }: Props) {
  const [showEdit, setShowEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // form state
  const [formName, setFormName] = useState(service.name ?? "");
  const [formDesc, setFormDesc] = useState(service.description ?? "");
  const [formCategory, setFormCategory] = useState(service.category ?? "Nail");
  const [formPrice, setFormPrice] = useState(String(service.price ?? ""));
  const [formDuration, setFormDuration] = useState(String(service.duration ?? ""));
  const [formStatus, setFormStatus] = useState(service.status ?? "Active");

  async function handleDelete() {
    if (!confirm(`Delete service "${service.name}"?`)) return;
    setDeleting(true);
    try {
      await deleteService(service.id);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete service.");
    } finally {
      setDeleting(false);
    }
  }

  async function handleSave() {
    if (!formName || !formPrice || !formDuration) {
      alert("Please fill in all required fields.");
      return;
    }
    setSaving(true);
    try {
      await updateService(service.id, {
        name: formName,
        description: formDesc,
        category: formCategory,
        price: Number(formPrice),
        duration: Number(formDuration),
        status: formStatus,
      });
      onRefresh();
      setShowEdit(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update service.");
    } finally {
      setSaving(false);
    }
  }

  function handleCancelEdit() {
    setFormName(service.name ?? "");
    setFormDesc(service.description ?? "");
    setFormCategory(service.category ?? "Nail");
    setFormPrice(String(service.price ?? ""));
    setFormDuration(String(service.duration ?? ""));
    setFormStatus(service.status ?? "Active");
    setShowEdit(false);
  }

  const isActive = service.status === "Active";
  const categoryStyle = categoryStyles[service.category] ?? categoryStyles.Other;

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-3 transition-all hover:shadow-lg hover:border-gray-300 hover:-translate-y-0.5">
        {/* TOP */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="w-11 h-11 rounded-xl bg-[#ff2056]/10 flex items-center justify-center">
            <ScissorsIcon />
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {/* Category badge */}
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${categoryStyle}`}>
              {service.category}
            </span>
            {/* Status badge */}
            <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
              isActive
                ? "bg-green-50 text-green-600 border border-green-200"
                : "bg-red-50 text-red-500 border border-red-200"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-red-400"}`} />
              {service.status}
            </span>
          </div>
        </div>

        {/* INFO */}
        <div>
          <h3 className="font-semibold text-base">{service.name}</h3>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">
            {service.description}
          </p>
        </div>

        {/* PRICE & DURATION */}
        <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 flex items-center gap-1.5">
              <PriceTagIcon /> Price
            </span>
            <span className="font-semibold text-[#ff2056]">
              Rp {Number(service.price).toLocaleString("id-ID")}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 flex items-center gap-1.5">
              <ClockIcon /> Duration
            </span>
            <span className="font-semibold">{service.duration} min</span>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col gap-2 pt-1 sm:flex-row">
          <button
            onClick={() => setShowEdit(true)}
            className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <EditIcon /> Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-10 h-10 flex items-center justify-center border border-red-100 rounded-xl text-red-500 hover:bg-red-50 disabled:opacity-50 transition-all"
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      {/* EDIT MODAL */}
      {showEdit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) handleCancelEdit(); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-lg">Edit Service</h2>
              <button
                onClick={handleCancelEdit}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <XIcon />
              </button>
            </div>

            {/* body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <label className="block space-y-1.5 text-sm text-gray-600">
                Service Name *
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#ff2056]/30 focus:border-[#ff2056]/50 mt-1"
                />
              </label>

              <label className="block space-y-1.5 text-sm text-gray-600">
                Description
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#ff2056]/30 focus:border-[#ff2056]/50 mt-1 resize-none"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm text-gray-600">
                  Category
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#ff2056]/30 focus:border-[#ff2056]/50 mt-1"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm text-gray-600">
                  Status
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#ff2056]/30 focus:border-[#ff2056]/50 mt-1"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </label>

                <label className="block text-sm text-gray-600">
                  Price (Rp) *
                  <input
                    type="number"
                    min={0}
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#ff2056]/30 focus:border-[#ff2056]/50 mt-1"
                  />
                </label>

                <label className="block text-sm text-gray-600">
                  Duration (min) *
                  <input
                    type="number"
                    min={0}
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#ff2056]/30 focus:border-[#ff2056]/50 mt-1"
                  />
                </label>
              </div>
            </div>

            {/* footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
              <button
                onClick={handleCancelEdit}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-[#ff2056] hover:bg-[#d9003f] text-white text-sm font-medium disabled:opacity-50 transition-all"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── icons ─────────────────────────────────────────────────────────────────────
function ScissorsIcon() {
  return (
    <svg className="w-5 h-5 text-[#ff2056]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M6 9a3 3 0 100-6 3 3 0 000 6zm0 0l12 6m-12 0a3 3 0 100 6 3 3 0 000-6zm0 0l12-6"/>
    </svg>
  );
}
function PriceTagIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  );
}
function EditIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
    </svg>
  );
}
function XIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
    </svg>
  );
}