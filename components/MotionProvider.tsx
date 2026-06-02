"use client";

import { MotionConfig } from "motion/react";

/**
 * App-wide motion settings. `reducedMotion="user"` makes every motion component
 * respect the OS-level prefers-reduced-motion preference automatically.
 */
export default function MotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
