"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import {
  CATEGORY_COLORS,
  DEFAULT_CATEGORIES,
  isDefaultCategory,
  SIDES,
  type Category,
  type TransactionType,
} from "@/lib/types";

export interface CategoryGroup {
  type: TransactionType;
  label: string;
  items: Category[];
}

/** The categories screen: the list, the create/edit form, and removal. */
export function useCategories() {
  const {
    categories,
    transactions,
    addCategory,
    updateCategory,
    deleteCategory,
    addMissingDefaults,
  } = useStore();

  const [name, setNameRaw] = useState("");
  const [color, setColorRaw] = useState<string>(CATEGORY_COLORS[0].value);
  const [type, setTypeRaw] = useState<TransactionType>("expense");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [moveTo, setMoveTo] = useState("");
  const [error, setError] = useState<string | null>(null);

  const editing = editingId
    ? (categories.find((c) => c.id === editingId) ?? null)
    : null;

  const groups = useMemo<CategoryGroup[]>(
    () =>
      SIDES.map((side) => ({
        type: side.value,
        label: side.label,
        items: categories.filter((c) => c.type === side.value),
      })),
    [categories]
  );

  /** Defaults only seed a fresh browser, so an older ledger can be short a few. */
  const missingDefaults = DEFAULT_CATEGORIES.filter(
    (d) => !categories.some((c) => c.id === d.id)
  ).length;

  /** How many transactions point at each category. */
  const usage = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of transactions) {
      counts[t.categoryId] = (counts[t.categoryId] ?? 0) + 1;
    }
    return counts;
  }, [transactions]);

  /** Where a deleted category's transactions can go: same side, minus itself. */
  const moveOptions = deleting
    ? categories.filter((c) => c.type === deleting.type && c.id !== deleting.id)
    : [];

  /** An edit makes the last attempt's message stale. */
  function clearError() {
    if (error) setError(null);
  }

  function withClear<T>(set: (v: T) => void) {
    return (v: T) => {
      clearError();
      set(v);
    };
  }

  function resetForm() {
    setEditingId(null);
    setNameRaw("");
    setColorRaw(CATEGORY_COLORS[0].value);
    setTypeRaw("expense");
    setError(null);
  }

  function startEdit(cat: Category) {
    if (isDefaultCategory(cat.id)) return;
    setEditingId(cat.id);
    setNameRaw(cat.name);
    setColorRaw(cat.color);
    setTypeRaw(cat.type);
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
      setError("That name is already taken.");
      return;
    }
    if (editingId) updateCategory(editingId, { name: trimmed, color });
    else addCategory({ name: trimmed, color, type });
    resetForm();
  }

  function askRemove(cat: Category) {
    if (isDefaultCategory(cat.id)) return;
    const fallback = categories.find(
      (c) => c.type === cat.type && c.id !== cat.id
    );
    if (!fallback) {
      setError(`This is your only ${cat.type} category.`);
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

  return {
    groups,
    usage,
    missingDefaults,
    addMissingDefaults,
    form: {
      name,
      color,
      type,
      error,
      editing,
      setName: withClear(setNameRaw),
      setColor: withClear(setColorRaw),
      setType: withClear(setTypeRaw),
      submit,
      cancel: resetForm,
    },
    startEdit,
    askRemove,
    removal: {
      target: deleting,
      moveTo,
      moveOptions,
      setMoveTo,
      confirm: confirmRemove,
      cancel: () => setDeleting(null),
    },
  };
}
