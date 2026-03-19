import type { ReactNode, CSSProperties } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function Card({ children, className = "", style }: CardProps) {
  return (
    <div
      className={`rounded-2xl shadow-sm p-4 ${className}`}
      style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", ...style }}
    >
      {children}
    </div>
  );
}
