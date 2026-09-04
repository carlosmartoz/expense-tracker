"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";

const subscribe = () => () => {};

/** Renders children at the end of <body>. */
// The sidebar and the form card are sticky, so each is its own stacking
// context: an overlay rendered inside one can't paint above the other.
export default function Portal({ children }: { children: ReactNode }) {
  // False on the server, true in the browser, without setState in an effect.
  const isClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
  if (!isClient) return null;
  return createPortal(children, document.body);
}
