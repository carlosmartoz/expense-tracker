"use client";

import { useMemo, useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { listItem, stagger } from "@/lib/motion";
import { useStore } from "@/lib/store";
import {
  categoryIcon,
  CATEGORY_COLORS,
  MAX_CATEGORY_NAME_LENGTH,
  type Category,
  type TransactionType,
} from "@/lib/types";
import ConfirmDialog from "./ConfirmDialog";
import Select, { type SelectOption } from "./Select";

const SIDES: { type: TransactionType; label: string; accent: string }[] = [
  { type: "expense", label: "Expenses", accent: "text-coral" },
  { type: "income", label: "Income", accent: "text-mint" },
];

export default function CategoriesView() {
  const { categories, transactions, addCategory, updateCategory, deleteCategory } =
    useStore();

  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(CATEGORY_COLORS[0]);
  const [type, setType] = useState<TransactionType>("expense");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [moveTo, setMoveTo] = useState("");
  const [error, setError] = useState<string | null>(null);

  const editing = editingId
    ? categories.find((c) => c.id === editingId) ?? null
    : null;

  const grouped = useMemo(
    () =>
      SIDES.map((side) => ({
        ...side,
        items: categories.filter((c) => c.type === side.type),
      })),
    [categories]
  );

  /** How many transactions point at each category, for the delete dialog. */
  const usage = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of transactions) {
      counts[t.categoryId] = (counts[t.categoryId] ?? 0) + 1;
    }
    return counts;
  }, [transactions]);

  // Where a deleted category's transactions can go: the same side, minus itself.
  const moveOptions: SelectOption[] = deleting
    ? categories
        .filter((c) => c.type === deleting.type && c.id !== deleting.id)
        .map((c) => ({
          value: c.id,
          label: c.name,
          icon: categoryIcon(c.icon),
          iconColor: c.color,
        }))
    : [];

  function resetForm() {
    setEditingId(null);
    setName("");
    setColor(CATEGORY_COLORS[0]);
    setType("expense");
    setError(null);
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setName(cat.name);
    setColor(cat.color);
    setType(cat.type);
    setError(null);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Enter a category name.");
      return;
    }
    // Names only have to be unique within their own side of the book.
    const clash = categories.some(
      (c) =>
        c.id !== editingId &&
        c.type === type &&
        c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (clash) {
      setError(`There's already a ${type} category with that name.`);
      return;
    }
    if (editingId) {
      updateCategory(editingId, { name: trimmed, color });
    } else {
      addCategory({ name: trimmed, color, type });
    }
    resetForm();
  }

  function askRemove(cat: Category) {
    const fallback = categories.find(
      (c) => c.type === cat.type && c.id !== cat.id
    );
    if (!fallback) {
      setError(
        `“${cat.name}” is your only ${cat.type} category — create another one first.`
      );
      return;
    }
    setError(null);
    setMoveTo(fallback.id);
    setDeleting(cat);
  }

  function confirmRemove() {
    if (!deleting || !moveTo) return;
    if (editingId === deleting.id) resetForm();
    deleteCategory(deleting.id, moveTo);
    setDeleting(null);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
        <p className="text-sm text-text-subtle">
          One list for both sides of the book. Rename, recolour or remove any of
          them.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        {/* Create / edit panel */}
        <form
          onSubmit={submit}
          className="card h-fit min-w-0 space-y-4 p-5 lg:sticky lg:top-6"
        >
          <h2 className="text-lg font-bold">
            {editing ? "Edit category" : "New category"}
          </h2>

          <div>
            <label className="stat-label">Side</label>
            <div className="mt-1 grid grid-cols-2 gap-2 rounded-xl bg-dark--700 p-1">
              {SIDES.map((s) => (
                <button
                  key={s.type}
                  type="button"
                  onClick={() => setType(s.type)}
                  // A category can't switch sides after it exists: its
                  // transactions would land on the wrong half of the balance.
                  disabled={Boolean(editing)}
                  className={`cursor-pointer rounded-lg py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                    type === s.type
                      ? s.type === "expense"
                        ? "bg-coral text-white shadow"
                        : "bg-mint text-white shadow"
                      : "text-text-secondary hover:text-slate-200"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            {editing && (
              <p className="mt-1 text-xs text-text-subtle">
                A category keeps the side it was created on.
              </p>
            )}
          </div>

          <div>
            <label className="stat-label">Name</label>
            <input
              className="input mt-1"
              placeholder="e.g. Health, Travel…"
              value={name}
              maxLength={MAX_CATEGORY_NAME_LENGTH}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="stat-label">Color</label>
            <div className="mt-2 flex flex-wrap gap-2.5">
              {CATEGORY_COLORS.map((c) => {
                const selected = c === color;
                return (
                  <motion.button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    aria-label={`Select color ${c}`}
                    aria-pressed={selected}
                    style={{ backgroundColor: c }}
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.92 }}
                    className={`grid h-8 w-8 cursor-pointer place-items-center rounded-full transition ${
                      selected
                        ? "ring-2 ring-white ring-offset-2 ring-offset-dark--800"
                        : ""
                    }`}
                  >
                    {selected && <Check className="h-4 w-4 text-white" />}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {error && <p className="text-sm text-coral">{error}</p>}

          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1">
              {editing ? (
                <>
                  <Check className="h-4 w-4" /> Save changes
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Add category
                </>
              )}
            </button>
            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="btn-ghost"
                aria-label="Cancel edit"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
            )}
          </div>
        </form>

        {/* The list, grouped by side */}
        <div className="min-w-0 space-y-4">
          {grouped.map((group) => (
            <div key={group.type} className="card min-w-0 p-5">
              <h2 className="mb-3 flex items-baseline gap-2 text-lg font-bold">
                <span className={group.accent}>{group.label}</span>
                <span className="text-sm font-normal text-text-subtle">
                  {group.items.length}
                </span>
              </h2>

              {group.items.length === 0 ? (
                <div className="grid place-items-center rounded-2xl border border-dashed border-dark--600 py-10 text-center text-sm text-text-subtle">
                  No {group.label.toLowerCase()} categories yet.
                </div>
              ) : (
                <motion.ul
                  className="space-y-2"
                  variants={stagger}
                  initial="hidden"
                  animate="show"
                >
                  <AnimatePresence initial={false}>
                    {group.items.map((cat) => {
                      const Icon = categoryIcon(cat.icon);
                      const isEditing = editingId === cat.id;
                      const used = usage[cat.id] ?? 0;
                      return (
                        <motion.li
                          key={cat.id}
                          layout
                          variants={listItem}
                          exit="exit"
                          className={`flex items-center gap-3 rounded-xl border p-3 transition ${
                            isEditing
                              ? "border-brand-500/60 bg-brand-500/5"
                              : "border-dark--600 bg-dark--700/40"
                          }`}
                        >
                          <span className="shrink-0" style={{ color: cat.color }}>
                            <Icon className="h-6 w-6" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-text-primary">
                              {cat.name}
                            </p>
                            <p className="text-xs text-text-subtle">
                              {used === 0
                                ? "Unused"
                                : `${used} transaction${used === 1 ? "" : "s"}`}
                            </p>
                          </div>
                          <button
                            onClick={() => startEdit(cat)}
                            className="shrink-0 cursor-pointer rounded-lg p-2 text-text-secondary transition hover:bg-dark--600 hover:text-text-primary"
                            aria-label={`Edit ${cat.name}`}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => askRemove(cat)}
                            className="shrink-0 cursor-pointer rounded-lg p-2 text-text-secondary transition hover:bg-coral/10 hover:text-coral"
                            aria-label={`Delete ${cat.name}`}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </motion.ul>
              )}
            </div>
          ))}
        </div>
      </div>

      <ConfirmDialog
        open={deleting !== null}
        title={deleting ? `Delete “${deleting.name}”` : "Delete category"}
        message={
          deleting ? (
            <div className="space-y-3">
              <p>
                {(usage[deleting.id] ?? 0) === 0
                  ? "Nothing is using it, so nothing moves."
                  : `Its ${usage[deleting.id]} transaction${
                      usage[deleting.id] === 1 ? "" : "s"
                    } will move to:`}
              </p>
              {(usage[deleting.id] ?? 0) > 0 && (
                <Select
                  ariaLabel="Move transactions to"
                  value={moveTo}
                  options={moveOptions}
                  onChange={setMoveTo}
                />
              )}
            </div>
          ) : null
        }
        confirmLabel="Delete"
        onConfirm={confirmRemove}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
