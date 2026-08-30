import type { Variants } from "motion/react";

/**
 * Shared animation variants. Keep movements short (~150-300ms) and easings
 * soft. Every consumer runs under <MotionProvider>, which honours the reader's
 * prefers-reduced-motion setting.
 */

/** Soft ease-out behind every entrance here. */
const easeOut = [0.22, 1, 0.36, 1] as const;

/** Simple fade + slight rise. Good default for headers and standalone blocks. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: easeOut } },
};

/** Container that staggers the entrance of its children. */
export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

/** Tab / page content swap (use with AnimatePresence mode="wait"). */
export const viewTransition: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: easeOut } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15, ease: easeOut } },
};

/** Modal/dialog dimmed backdrop. */
export const backdrop: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

/** Modal/dialog panel: gentle scale + rise. */
export const modalPanel: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.25, ease: easeOut },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 8,
    transition: { duration: 0.15, ease: easeOut },
  },
};

/** List row that animates in on add and out on remove (use with `layout`). */
export const listItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: easeOut } },
  exit: { opacity: 0, x: -10, transition: { duration: 0.18, ease: easeOut } },
};
