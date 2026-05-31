import { deleteStaff } from "@/services/staff.service";

interface Props {
  staff: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    role: string;
    specialties?: string[];
    status: string;
    services_done: number;
    rating: number;
  };
  onRefresh: () => void;
  onEdit?: () => void;
}

function getInitials(name: string) {
  return name
    ?.split(" ")
    .slice(0, 2)
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();
}

export default function StaffCard({ staff, onRefresh, onEdit }: Props) {
  async function handleDelete() {
    if (!confirm(`Hapus staff "${staff.full_name}"?`)) return;
    await deleteStaff(staff.id);
    onRefresh();
  }

  const specialties: string[] = Array.isArray(staff.specialties)
    ? staff.specialties
    : [];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col transition-all hover:shadow-lg hover:border-gray-300 hover:-translate-y-0.5">
      {/* TOP */}
      <div className="p-5 flex flex-col gap-4">
        {/* AVATAR + NAME + STATUS */}
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-[#ff2056]/10 flex items-center justify-center font-semibold text-[#ff2056] text-sm shrink-0 mt-0.5">
            {getInitials(staff.full_name)}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-base">{staff.full_name}</p>
            <p className="text-sm text-gray-500 mt-0.5">{staff.role}</p>
          </div>
          <span
            className={`text-xs font-medium px-3 py-1 rounded-full shrink-0 ${
              staff.status === "active"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {staff.status}
          </span>
        </div>

        {/* CONTACT */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MailIcon />
            {staff.email}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <PhoneIcon />
            {staff.phone}
          </div>
        </div>

        {/* SPECIALTIES */}
        {specialties.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-400">Specialties:</p>
            <div className="flex flex-wrap gap-2">
              {specialties.map((spec, i) => (
                <span
                  key={i}
                  className="border border-gray-200 rounded-lg px-3 py-1 text-xs text-gray-700"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* STATS */}
      <div className="border-t border-gray-200 px-5 py-4 flex gap-6">
        <div>
          <p className="text-2xl font-bold">{staff.services_done ?? 0}</p>
          <p className="text-xs text-gray-400 mt-0.5">Services Done</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-amber-500 flex items-center gap-1">
            {Number(staff.rating ?? 0).toFixed(1)}
            <StarIcon />
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Rating</p>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="border-t border-gray-200 px-5 py-3 flex gap-2">
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
        >
          <EditIcon />
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="w-10 h-10 flex items-center justify-center border border-red-100 rounded-xl text-red-500 hover:bg-red-50 transition-all"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

function MailIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg className="w-4 h-4 fill-amber-500" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z" />
    </svg>
  );
}
function EditIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}