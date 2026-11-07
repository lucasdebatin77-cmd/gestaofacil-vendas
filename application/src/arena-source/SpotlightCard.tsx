"use client";

import { useRef, type ReactNode } from "react";

export default function SpotlightCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
    el.classList.add("is-lit");
  };

  const onLeave = () => ref.current?.classList.remove("is-lit");

  return (
    <div
      ref={ref}
      data-cursor
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`spotlight ${className}`}
    >
      {children}
    </div>
  );
}
