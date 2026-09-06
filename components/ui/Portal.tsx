"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";

const subscribe = () => () => {};

// Renders children at the end of <body>.
export default function Portal({ children }: { children: ReactNode }) {
  // False on the server, true in the browser.
  const isClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
  if (!isClient) return null;
  return createPortal(children, document.body);
}
