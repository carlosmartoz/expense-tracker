"use client";

import { createElement } from "react";
import { categoryIcon } from "@/lib/types";

// A category's icon, in the category's colour.
export default function CategoryIcon({
  icon,
  color,
  className = "h-6 w-6",
}: {
  icon?: string;
  color?: string;
  className?: string;
}) {
  return (
    <span className="shrink-0" style={{ color }}>
      {createElement(categoryIcon(icon), { className })}
    </span>
  );
}
