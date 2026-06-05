"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
};

type AppNavProps = {
  items: NavItem[];
  hasPendingAccessRequests: boolean;
};

function isActivePath(pathname: string, href: string) {
  if (href === "/admin" || href === "/teacher" || href === "/student") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNav({ items, hasPendingAccessRequests }: AppNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-2">
      {items.map((item) => {
        const active = isActivePath(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold transition ${
              active ? "bg-ink text-white shadow-sm" : "text-ink/75 hover:bg-ink/5 hover:text-ink"
            }`}
          >
            {item.label}
            {item.href === "/admin/access-requests" && hasPendingAccessRequests ? (
              <span
                aria-label="Hay solicitudes pendientes"
                className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-black leading-none ${
                  active ? "bg-red-500 text-white" : "bg-red-600 text-white"
                }`}
              >
                !
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
