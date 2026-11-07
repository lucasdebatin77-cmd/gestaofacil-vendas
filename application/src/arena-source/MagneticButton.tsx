"use client";

import { useRef, type ReactNode } from "react";

export default function MagneticButton({
  href,
  onClick,
  children,
  className = "",
  strength = 0.3,
}: {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (
      !el ||
      e.pointerType !== "mouse" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  };

  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "translate(0, 0)";
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={() =>
        onClick
          ? onClick()
          : href &&
            document
              .querySelector(href)
              ?.scrollIntoView({
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                  .matches
                  ? "auto"
                  : "smooth",
              })
      }
      data-cursor
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`magnetic ${className}`}
    >
      {children}
    </button>
  );
}
