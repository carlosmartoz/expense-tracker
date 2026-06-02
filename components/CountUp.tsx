"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { easeOut } from "@/lib/motion";

// useLayoutEffect on the client, useEffect on the server (avoids the SSR warning).
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Animates a number from 0 up to `value` once, when `play` is true. The markup
 * always renders the final value first (deterministic SSR / hydration), then a
 * layout effect rewinds to 0 and counts up before the first paint — so there is
 * no flash. Honours prefers-reduced-motion (shows the final value immediately).
 */
export default function CountUp({
  value,
  format,
  play = true,
  duration = 1.2,
}: {
  value: number;
  format: (n: number) => string;
  play?: boolean;
  duration?: number;
}) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => format(v));
  // Only the very first run of this instance should rewind to 0 and animate.
  const playedRef = useRef(false);

  useIsoLayoutEffect(() => {
    if (!play || reduce || playedRef.current) {
      mv.set(value);
      return;
    }
    playedRef.current = true;
    mv.set(0);
    const controls = animate(mv, value, { duration, ease: easeOut });
    return () => controls.stop();
  }, [value, play, reduce, duration, mv]);

  return <motion.span>{text}</motion.span>;
}
