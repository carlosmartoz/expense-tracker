"use client";

import { useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { listItem, stagger } from "@/lib/motion";
import { useStore } from "@/lib/store";
import {
  categoryIcon,
  CATEGORY_COLORS,
  MAX_CATEGORY_NAME_LENGTH,
  type CategoryDef,
} from "@/lib/types";
import ConfirmDialog from "./ConfirmDialog";

export default function CategoriesView() {
  const { categories, addCategory, updateCategory, deleteCategory } = useStore();

  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(CATEGORY_COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingCat, setDeletingCat] = useState<CategoryDef | null>(null);
  const [error, setError] = useState<string | null>(null);

  const editing = editingId
    ? categories.find((c) => c.id === editingId) ?? null
    : null;

  // Only user-created categories are listed here; defaults aren't editable.
  const customCategories = categories.filter((c) => !c.isDefault);

  function resetForm() {
    setEditingId(null);
    setName("");
    setColor(CATEGORY_COLORS[0]);
    setError(null);
  }

  function startEdit(cat: CategoryDef) {
    setEditingId(cat.id);
    setName(cat.name);
    setColor(cat.color);
    setError(null);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Enter a category name.");
      return;
    }
    // Block duplicate names (case-insensitive), ignoring the one being edited.
    const clash = categories.some(
      (c) =>
        c.id !== editingId &&
        c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (clash) {
      setError("A category with that name already exists.");
      return;
    }
    if (editingId) {
      updateCategory(editingId, { name: trimmed, color });
    } else {
      addCategory({ name: trimmed, color });
    }
    resetForm();
  }

  function confirmRemove() {
    if (!deletingCat) return;
    if (editingId === deletingCat.id) resetForm();
    deleteCategory(deletingCat.id);
    setDeletingCat(null);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
        <p className="text-sm text-text-subtle">
          Create, edit and organize your spending categories.
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

        {/* User-created categories */}
        <div className="card min-w-0 p-5">
          <h2 className="mb-3 text-lg font-bold">
            Your categories{" "}
            <span className="text-sm font-normal text-text-subtle">
              ({customCategories.length})
            </span>
          </h2>
          {customCategories.length === 0 ? (
            <div className="grid place-items-center rounded-2xl border border-dashed border-dark--600 py-12 text-center text-sm text-text-subtle">
              You haven't created any categories yet.
              <br />
              Use the form to add your first one.
            </div>
          ) : (
            <motion.ul
              className="space-y-2"
              variants={stagger}
              initial="hidden"
              animate="show"
            >
              <AnimatePresence initial={false}>
              {customCategories.map((cat) => {
                const Icon = categoryIcon(cat.icon);
                const isEditing = editingId === cat.id;
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
                      onClick={() => setDeletingCat(cat)}
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
      </div>

      <ConfirmDialog
        open={deletingCat !== null}
        title="Delete category"
        message={
          deletingCat ? (
            <>
              Delete “<span className="text-text-primary">{deletingCat.name}</span>
              ”? Transactions using it will move to “Other”.
            </>
          ) : null
        }
        confirmLabel="Delete"
        onConfirm={confirmRemove}
        onCancel={() => setDeletingCat(null)}
      />
    </div>
  );
}
