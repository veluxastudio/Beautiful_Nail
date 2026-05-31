"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Scissors,
  FileBarChart,
  LogOut,
} from "lucide-react";

const menus = [
  { name: "Dashboard",    href: "/dashboard",    icon: LayoutDashboard },
  { name: "Appointments", href: "/appointments", icon: CalendarDays },
  { name: "Services",     href: "/services",     icon: Scissors },
  { name: "Customers",    href: "/customers",    icon: Users },
  { name: "Staff",        href: "/staff",        icon: Users },
  { name: "Reports",      href: "/reports",      icon: FileBarChart },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  return (
    <aside className="w-64 border-r border-gray-200 bg-white h-screen sticky top-0 p-6
                      flex flex-col overflow-y-auto">
      {/* LOGO */}
      <div className="mb-10 flex items-center gap-3">
        <Image
          src="/logo/logonails.png"
          alt="Beauty Salon Logo"
          width={40}
          height={40}
          className="rounded-xl object-contain"
        />
        <div>
          <p className="text-base font-bold leading-tight">Beauty Salon</p>
          <p className="text-xs text-gray-400">Admin Panel</p>
        </div>
      </div>

      {/* NAV */}
      <nav className="space-y-2 flex-1">
        {menus.map((menu) => {
          const Icon     = menu.icon;
          const isActive = pathname === menu.href;
          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all
                ${isActive
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

      {/* LOGOUT */}
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-gray-500
                     hover:bg-red-50 hover:text-red-500 transition-all"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}