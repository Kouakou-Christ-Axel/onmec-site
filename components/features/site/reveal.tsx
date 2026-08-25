"use client";

import { useEffect, useRef, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

/** Fait apparaître son contenu en fondu/translation quand il entre dans le viewport. */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver !== "function") return;

    const rect = el.getBoundingClientRect();
    if (rect.top > window.innerHeight * 0.92) {
      el.style.opacity = "0";
      el.style.transform = "translateY(24px)";
    } else {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          el.style.transition = `opacity 760ms var(--ease-entrance) ${delay}ms, transform 760ms var(--ease-entrance) ${delay}ms`;
          el.style.opacity = "1";
          el.style.transform = "none";
          observer.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);

    const safety = setTimeout(() => {
      el.style.opacity = "1";
      el.style.transform = "none";
    }, 1200);

    return () => {
      observer.disconnect();
      clearTimeout(safety);
    };
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
