"use client";

import { useEffect, useState } from "react";
import StaffCard from "@/components/staff/StaffCard";
import { createStaff, getStaff, updateStaff } from "@/services/staff.service";

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

export default function StaffPage() {
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [search, setSearch] = useState("");
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state for add/edit
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formRole, setFormRole] = useState("Nail Technician");
  const [formStatus, setFormStatus] = useState("active");
  const [formSpecialties, setFormSpecialties] = useState("");

  async function loadStaff() {
    const data = await getStaff();
    setStaffs(data || []);
  }

  useEffect(() => {
    const fetchData = async () => {
      await loadStaff();
    };
    void fetchData();
  }, []);

  async function handleAddStaff() {
    if (!formName || !formEmail || !formPhone) {
      alert("Please fill in all required fields");
      return;
    }
    setSaving(true);
    try {
      const specialtiesArray = formSpecialties
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await createStaff({
        full_name: formName,
        email: formEmail,
        phone: formPhone,
        role: formRole,
        status: formStatus,
        specialties: specialtiesArray,
      });

      await loadStaff();
      setShowAddStaff(false);
      resetForm();
    } catch (err) {
      console.error("Failed to add staff", err);
      alert("Failed to add staff. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleEditStaff() {
    if (!editingStaff?.id || !formName || !formEmail || !formPhone) {
      alert("Please fill in all required fields");
      return;
    }
    setSaving(true);
    try {
      const specialtiesArray = formSpecialties
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await updateStaff(editingStaff.id, {
        full_name: formName,
        email: formEmail,
        phone: formPhone,
        role: formRole,
        status: formStatus,
        specialties: specialtiesArray,
      });

      await loadStaff();
      setEditingStaff(null);
      resetForm();
    } catch (err) {
      console.error("Failed to update staff", err);
      alert("Failed to update staff. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormRole("Nail Technician");
    setFormStatus("active");
    setFormSpecialties("");
  }

  function openEditModal(staff: Staff) {
    setEditingStaff(staff);
    setFormName(staff.full_name);
    setFormEmail(staff.email);
    setFormPhone(staff.phone);
    setFormRole(staff.role);
    setFormStatus(staff.status);
    setFormSpecialties((staff.specialties || []).join(", "));
  }

  const filteredStaffs = staffs.filter((s) => {
    const q = search.toLowerCase();
    return (
      !q ||
      s.full_name?.toLowerCase().includes(q) ||
      s.role?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold">Staff Management</h1>
          <p className="text-gray-500 mt-2">Manage your Beautiful Nails team members</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddStaff((prev) => !prev)}
            className="bg-[#ff2056] hover:bg-[#d9003f] text-white rounded-xl px-5 py-3 font-medium transition-all flex items-center gap-2"
          >
            + Add Staff Member
          </button>
          {showAddStaff && (
            <button
              onClick={() => {
                setShowAddStaff(false);
                resetForm();
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl px-5 py-3 font-medium transition-all"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {showAddStaff && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-gray-600">
              Full Name *
              <input
                type="text"
                placeholder="Enter staff name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-[#ff2056]/30 focus:border-[#ff2056]/50"
              />
            </label>
            <label className="space-y-2 text-sm text-gray-600">
              Email *
              <input
                type="email"
                placeholder="Enter email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-[#ff2056]/30 focus:border-[#ff2056]/50"
              />
            </label>
            <label className="space-y-2 text-sm text-gray-600">
              Phone *
              <input
                type="tel"
                placeholder="Enter phone"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-[#ff2056]/30 focus:border-[#ff2056]/50"
              />
            </label>
            <label className="space-y-2 text-sm text-gray-600">
              Role
              <select
                value={formRole}
                onChange={(e) => setFormRole(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-[#ff2056]/30 focus:border-[#ff2056]/50"
              >
                <option value="Nail Technician">Nail Technician</option>
                <option value="Hair Stylist">Hair Stylist</option>
                <option value="Eyelash Specialist">Eyelash Specialist</option>
                <option value="Waxing Specialist">Waxing Specialist</option>
              </select>
            </label>
            <label className="space-y-2 text-sm text-gray-600">
              Status
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-[#ff2056]/30 focus:border-[#ff2056]/50"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <label className="space-y-2 text-sm text-gray-600">
              Specialties (comma-separated)
              <input
                type="text"
                placeholder="e.g., Manicure, Nail Art"
                value={formSpecialties}
                onChange={(e) => setFormSpecialties(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-[#ff2056]/30 focus:border-[#ff2056]/50"
              />
            </label>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleAddStaff}
              disabled={saving}
              className="bg-[#ff2056] hover:bg-[#d9003f] disabled:opacity-50 text-white rounded-xl px-5 py-3 font-medium transition-all"
            >
              {saving ? "Saving..." : "Save Staff Member"}
            </button>
          </div>
        </div>
      )}

      {editingStaff && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Edit Staff Member</h2>
            <div className="space-y-4">
              <label className="space-y-2 text-sm text-gray-600">
                Full Name
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-[#ff2056]/30 focus:border-[#ff2056]/50"
                />
              </label>
              <label className="space-y-2 text-sm text-gray-600">
                Email
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-[#ff2056]/30 focus:border-[#ff2056]/50"
                />
              </label>
              <label className="space-y-2 text-sm text-gray-600">
                Phone
                <input
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-[#ff2056]/30 focus:border-[#ff2056]/50"
                />
              </label>
              <label className="space-y-2 text-sm text-gray-600">
                Role
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-[#ff2056]/30 focus:border-[#ff2056]/50"
                >
                  <option value="Nail Technician">Nail Technician</option>
                  <option value="Hair Stylist">Hair Stylist</option>
                  <option value="Eyelash Specialist">Eyelash Specialist</option>
                  <option value="Waxing Specialist">Waxing Specialist</option>
                </select>
              </label>
              <label className="space-y-2 text-sm text-gray-600">
                Status
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-[#ff2056]/30 focus:border-[#ff2056]/50"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
              <label className="space-y-2 text-sm text-gray-600">
                Specialties (comma-separated)
                <input
                  type="text"
                  value={formSpecialties}
                  onChange={(e) => setFormSpecialties(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-[#ff2056]/30 focus:border-[#ff2056]/50"
                />
              </label>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleEditStaff}
                  disabled={saving}
                  className="flex-1 bg-[#ff2056] hover:bg-[#d9003f] disabled:opacity-50 text-white rounded-xl px-4 py-2.5 font-medium transition-all"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => {
                    setEditingStaff(null);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl px-4 py-2.5 font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
          placeholder="Search by name, role, or email..."
          className="flex-1 bg-transparent outline-none text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* GRID */}
      <div className="grid grid-cols-3 gap-5">
        {filteredStaffs.map((staff) => (
          <StaffCard
            key={staff.id}
            staff={staff}
            onRefresh={loadStaff}
            onEdit={() => openEditModal(staff)}
          />
        ))}
      </div>
    </div>
  );
}