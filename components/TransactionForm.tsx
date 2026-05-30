"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { EXPENSE_CATEGORIES, type Category, type TransactionType } from "@/lib/types";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function TransactionForm({ onDone }: { onDone?: () => void }) {
  const { addTransaction } = useStore();
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("Comida");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayISO());
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) {
      setError("Ingresá un monto válido mayor a 0.");
      return;
    }
    addTransaction({
      type,
      amount: value,
      category: type === "income" ? "Ingreso" : category,
      description: description.trim() || (type === "income" ? "Ingreso" : category),
      date,
    });
    setAmount("");
    setDescription("");
    setError(null);
    onDone?.();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* Type toggle */}
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
        {(["expense", "income"] as TransactionType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`rounded-lg py-2 text-sm font-semibold transition ${
              type === t
                ? t === "expense"
                  ? "bg-coral text-white shadow"
                  : "bg-mint text-white shadow"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t === "expense" ? "Gasto" : "Ingreso"}
          </button>
        ))}
      </div>

      <div>
        <label className="stat-label">Monto</label>
        <input
          inputMode="decimal"
          className="input mt-1"
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      {type === "expense" && (
        <div>
          <label className="stat-label">Categoría</label>
          <select
            className="input mt-1"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
          >
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="stat-label">Descripción</label>
        <input
          className="input mt-1"
          placeholder={type === "income" ? "Sueldo, freelance…" : "Ej: Delivery, Uber…"}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label className="stat-label">Fecha</label>
        <input
          type="date"
          className="input mt-1"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-coral">{error}</p>}

      <button type="submit" className="btn-primary w-full">
        Agregar {type === "expense" ? "gasto" : "ingreso"}
      </button>
    </form>
  );
}
