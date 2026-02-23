"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/itinerary", label: "Itinerary", icon: "📅" },
  { href: "/map", label: "Kaart", icon: "🗺️" },
  { href: "/places", label: "Plekken", icon: "📍" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-travel-dark text-white flex flex-col shrink-0">
      {/* Logo */}
      <Link href="/" className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✈️</span>
          <div>
            <h1 className="font-bold text-lg leading-tight">ReisDagboek</h1>
            <p className="text-xs text-gray-400">Travel Journal</p>
          </div>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-travel-primary text-white"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span>ReisDagboek v0.1</span>
        </div>
      </div>
    </aside>
  );
}
