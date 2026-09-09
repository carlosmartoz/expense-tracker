import type { LucideIcon } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  // Optional leading icon shown in the trigger and list.
  icon?: LucideIcon;
  // Optional color for the leading icon (any CSS color, e.g. a var() token).
  iconColor?: string;
}
