"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";

const subscribe = () => () => {};

/**
 * Renders its children at the end of <body>.
 *
 * Overlays have to escape the page's stacking contexts. Both the sidebar and
 * the new-transaction card are `position: sticky`, and a sticky element always
 * starts a stacking context of its own — so a `fixed` dialog rendered inside
 * one of them is confined to it, and later siblings paint over the top however
 * high its z-index goes. Rendering into <body> puts every overlay back on the
 * same footing.
 */
export default function Portal({ children }: { children: ReactNode }) {
  // False while rendering on the server, true once running in the browser.
  // Avoids setState-in-an-effect and keeps the two renders in agreement.
  const isClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
  if (!isClient) return null;
  return createPortal(children, document.body);
}
