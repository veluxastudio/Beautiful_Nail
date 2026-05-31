interface Props {
  customer: {
    id?: string;
    full_name?: string;
    member_type?: string;
    email?: string;
    phone?: string;
    last_visit?: string;
    favorite_service?: string;
    total_visits?: number;
    total_spent?: number;
  };
}

function getInitials(name?: string) {
  if (!name) return "-";

  return name
    .split(" ")
    .slice(0, 2)
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function CustomerCard({ customer }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col transition-all hover:shadow-lg hover:border-gray-300 hover:-translate-y-0.5">
      {/* TOP */}
      <div className="p-5 flex flex-col gap-4">
        {/* AVATAR + NAME */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#ff2056]/10 flex items-center justify-center font-semibold text-[#ff2056] text-sm shrink-0">
            {getInitials(customer.full_name)}
          </div>
          <div>
            <p className="font-semibold text-base">{customer.full_name}</p>
            <span
              className={`text-xs font-semibold px-3 py-0.5 rounded-full inline-block mt-1 ${
                customer.member_type === "VIP"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-sky-100 text-sky-700"
              }`}
            >
              {customer.member_type}
            </span>
          </div>
        </div>

        {/* INFO */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MailIcon />
            {customer.email}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <PhoneIcon />
            {customer.phone}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <CalendarIcon />
            Last: {formatDate(customer.last_visit)}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <StarIcon />
            {customer.favorite_service || "-"}
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="border-t border-gray-200 px-5 py-4 flex flex-col gap-4 sm:flex-row">
        <div>
          <p className="text-2xl font-bold">{customer.total_visits ?? 0}</p>
          <p className="text-xs text-gray-400 mt-0.5">Total Visits</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-[#ff2056]">
            Rp {Number(customer.total_spent ?? 0).toLocaleString("id-ID")}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Total Spent</p>
        </div>
      </div>

      {/* FOOTER */}
      <div className="border-t border-gray-200 px-5 py-3">
        <button className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all">
          <EyeIcon />
          View Details
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
function CalendarIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}