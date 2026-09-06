"use client";

import { Check, Plus, X } from "lucide-react";
import { CATEGORY_COLORS, MAX_CATEGORY_NAME_LENGTH, TRANSACTION_TYPES } from "@/lib/types";
import type { useCategories } from "@/hooks/useCategories";
import ColorPicker from "@/components/ui/ColorPicker";
import ErrorText from "@/components/ui/ErrorText";
import Field from "@/components/ui/Field";
import SegmentedToggle from "@/components/ui/SegmentedToggle";

type Form = ReturnType<typeof useCategories>["form"];

export default function CategoryForm({ form }: { form: Form }) {
  const editing = form.editing;

  return (
    <form
      onSubmit={form.submit}
      className="card h-fit min-w-0 space-y-4 p-5 lg:sticky lg:top-6"
    >
      <h2 className="text-lg font-bold">
        {editing ? "Edit category" : "New category"}
      </h2>

      <Field
        label="Side"
        hint={
          editing && (
            <p className="mt-1 text-xs text-text-subtle">
              A category keeps the type it was created with.
            </p>
          )
        }
      >
        {/* Type. Locked once the category exists. */}
        <SegmentedToggle
          ariaLabel="Type"
          segments={TRANSACTION_TYPES}
          value={form.type}
          onChange={form.setType}
          disabled={Boolean(editing)}
        />
      </Field>

      <Field label="Name">
        <input
          className="input"
          placeholder="e.g. Health, Travel…"
          value={form.name}
          maxLength={MAX_CATEGORY_NAME_LENGTH}
          onChange={(e) => form.setName(e.target.value)}
        />
      </Field>

      <Field label="Colour">
        <ColorPicker
          colors={CATEGORY_COLORS}
          value={form.color}
          onChange={form.setColor}
        />
      </Field>

      {/* The name field and the form buttons. */}
      <div className="space-y-1">
        <ErrorText>{form.error}</ErrorText>
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
              onClick={form.cancel}
              className="btn-ghost"
              aria-label="Cancel edit"
            >
              <X className="h-4 w-4" /> Cancel
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
