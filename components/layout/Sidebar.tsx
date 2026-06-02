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

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white border-r border-gray-200 p-4 flex flex-col overflow-y-auto transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"} md:fixed md:translate-x-0 md:h-screen md:flex`}>
      <div className="mb-6 flex items-center justify-between gap-3 md:justify-start">
        <div className="flex items-center gap-3">
          <Image
            src="/logo/logonails.png"
            alt="Nyonya Kukuy Salon Logo"
            width={40}
            height={40}
            className="rounded-xl object-contain"
          />
          <div>
            <p className="text-[18px] font-bold leading-tight">Nyonya Kuku</p>
            <p className="text-[12px] text-gray-400">Admin Panel</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onClose?.()}
          className="md:hidden rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
        >
          ✕
        </button>
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