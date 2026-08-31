"use client";

import { MotionConfig } from "motion/react";

/** `reducedMotion="user"` makes every animation respect the OS preference. */
export default function MotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
