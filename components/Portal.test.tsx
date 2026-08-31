// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import ConfirmDialog from "./ConfirmDialog";

/**
 * Reproduces the layout the app actually has: the dialog is mounted from
 * inside the sidebar, which is `position: sticky` and therefore a stacking
 * context of its own. Before the portal, a `fixed` overlay rendered in there
 * was confined to that subtree and later siblings painted over it, however
 * high its z-index. These tests fail if the portal is ever removed.
 */

let root: Root | null = null;
let host: HTMLElement | null = null;

function mountInStickySidebar(ui: React.ReactElement) {
  const page = document.createElement("div");
  const sidebar = document.createElement("aside");
  sidebar.style.position = "sticky";
  const main = document.createElement("main");
  page.append(sidebar, main);
  document.body.append(page);

  host = sidebar;
  root = createRoot(sidebar);
  act(() => root!.render(ui));
  return { sidebar, main };
}

afterEach(() => {
  act(() => root?.unmount());
  root = null;
  host = null;
  document.body.innerHTML = "";
});

describe("an open dialog", () => {
  it("lands in <body>, not inside the sticky sidebar that rendered it", () => {
    const { sidebar } = mountInStickySidebar(
      <ConfirmDialog
        open
        title="Clear all transactions"
        confirmLabel="Clear all"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );

    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(sidebar.contains(dialog)).toBe(false);
    expect(dialog!.closest("aside")).toBeNull();
    expect(dialog!.parentElement).toBe(document.body);
  });

  it("carries its content across", () => {
    mountInStickySidebar(
      <ConfirmDialog
        open
        title="Clear all transactions"
        message="This permanently removes every transaction."
        confirmLabel="Clear all"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    const text = document.body.textContent ?? "";
    expect(text).toContain("Clear all transactions");
    expect(text).toContain("This permanently removes every transaction.");
  });
});

describe("a closed dialog", () => {
  it("puts nothing on the page at all", () => {
    mountInStickySidebar(
      <ConfirmDialog
        open={false}
        title="Clear all transactions"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(host!.textContent).toBe("");
  });
});
