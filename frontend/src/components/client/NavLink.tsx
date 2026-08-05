"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isActive = pathname === href;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (!isPending) {
      startTransition(() => {
        router.push(href);
      });
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 text-base font-medium transition-colors select-none ${
        isActive
          ? "text-accent font-semibold"
          : "text-text-muted hover:text-text-primary"
      } ${isPending ? "opacity-50" : "opacity-100"}`}
    >
      {children}
      {isPending && (
        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" aria-hidden="true" />
      )}
    </a>
  );
}
