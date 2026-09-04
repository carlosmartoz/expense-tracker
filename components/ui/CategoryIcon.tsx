"use client";

import { createElement } from "react";
import { categoryIcon } from "@/lib/types";

/** A category's mark. Colour reaches the icon and nothing around it. */
export default function CategoryIcon({
  icon,
  color,
  className = "h-6 w-6",
}: {
  icon?: string;
  color?: string;
  className?: string;
}) {
  // Looked up from a static map, so the identity is stable across renders.
  return (
    <span className="shrink-0" style={{ color }}>
      {createElement(categoryIcon(icon), { className })}
    </span>
  );
}
