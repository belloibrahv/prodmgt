"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "#tour", label: "Product tour" },
  { href: "#features", label: "Features" },
  { href: "#workflow", label: "How it works" },
  { href: "#faq", label: "FAQ" },
];

export default function MarketingNav() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 12));
  // Pages opened at an anchor start scrolled without firing a change event.
  useEffect(() => setScrolled(window.scrollY > 12), []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6">
      <div
        className={cn(
          "mx-auto max-w-6xl rounded-[22px] border transition-all duration-300",
          scrolled || open
            ? "border-tva-border/70 bg-white/85 shadow-md backdrop-blur-xl"
            : "border-transparent bg-transparent",
        )}
      >
        <div className="flex h-14 items-center justify-between pl-4 pr-2.5 sm:pl-5">
          <Link href="/" aria-label="TechVaults Project Manager home" className="flex-shrink-0">
            <Image src="/TechVaults-Logo-b2.png" alt="TechVaults" width={132} height={42} className="h-9 w-auto" priority />
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-full px-3.5 py-2 text-[14px] font-medium text-tva-ink-m transition-colors hover:bg-tva-red-xlt hover:text-tva-red"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <Link
              href="/login"
              className="hidden rounded-full px-4 py-2 text-[14px] font-semibold text-tva-ink transition-colors hover:text-tva-red sm:block"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="group flex items-center gap-1.5 rounded-full bg-tva-red px-4 py-2 text-[14px] font-semibold text-white transition-all duration-150 hover:scale-[1.03] hover:bg-tva-red-dk focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-tva-red"
            >
              Get started
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              className="flex h-10 w-10 items-center justify-center rounded-full text-tva-ink hover:bg-tva-red-xlt md:hidden"
            >
              {open ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <motion.nav
              aria-label="Mobile"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden md:hidden"
            >
              <div className="flex flex-col gap-1 border-t border-tva-border/50 p-3">
                {[...links, { href: "/login", label: "Sign in" }].map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="rounded-12 px-3 py-3 text-[15px] font-medium text-tva-ink hover:bg-tva-red-xlt"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
