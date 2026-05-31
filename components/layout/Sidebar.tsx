"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Scissors,
  FileBarChart,
} from "lucide-react";

const menus = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Appointments",
    href: "/appointments",
    icon: CalendarDays,
  },
  {
    name: "Services",
    href: "/services",
    icon: Scissors,
  },
  {
    name: "Customers",
    href: "/customers",
    icon: Users,
  },
  {
    name: "Staff",
    href: "/staff",
    icon: Users,
  },
  {
    name: "Reports",
    href: "/reports",
    icon: FileBarChart,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-white h-screen sticky top-0 p-6 overflow-y-auto">
      <div className="mb-10">
        <h1 className="text-2xl font-bold">
          Beautiful Nails
        </h1>
      </div>

      <nav className="space-y-2">
        {menus.map((menu) => {
          const Icon = menu.icon;

          const isActive = pathname === menu.href;

          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all
              ${
                isActive
                  ? "bg-[#ff2056]/10 text-[#ff2056] font-medium"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <Icon size={20} />
              {menu.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}