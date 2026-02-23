"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, Map, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/itinerary", label: "Itinerary", icon: CalendarDays },
  { href: "/map", label: "Kaart", icon: Map },
  { href: "/places", label: "Plekken", icon: MapPin },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-zinc-900 text-white flex flex-col shrink-0">
      <Link href="/" className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
            <Map className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-base leading-tight">ReisDagboek</h1>
            <p className="text-xs text-zinc-500">Travel Journal</p>
          </div>
        </div>
      </Link>

      <Separator className="bg-white/10" />

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-white/10" />

      <div className="p-4">
        <div className="flex items-center gap-2 text-xs text-zinc-600">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>ReisDagboek v0.1</span>
        </div>
      </div>
    </aside>
  );
}
