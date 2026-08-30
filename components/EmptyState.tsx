"use client";

import { ArrowRight, Wallet } from "lucide-react";
import { motion } from "motion/react";
import { fadeUp } from "@/lib/motion";

/**
 * What you see on a browser that has never held any data. It asks for the
 * first transaction rather than apologising for an empty chart.
 */
export default function EmptyState({
  onAddFirst,
}: {
  onAddFirst: () => void;
}) {
  return (
    <motion.div
      className="card flex flex-col items-center gap-5 p-12 text-center"
      variants={fadeUp}
      initial="hidden"
      animate="show"
    >
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-500/10 text-brand-400">
        <Wallet className="h-7 w-7" />
      </span>

      <div className="space-y-2">
        <h2 className="text-xl font-bold tracking-tight text-text-primary">
          Nothing here yet
        </h2>
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-text-secondary">
          Add what you earned and what you spent, and this page fills in with
          your balance, your categories and how the month compares to the last
          one.
        </p>
      </div>

      <button onClick={onAddFirst} className="btn-primary">
        Add your first transaction <ArrowRight className="h-4 w-4" />
      </button>

      <p className="text-xs text-text-subtle">
        Already have a backup? Use <span className="text-text-secondary">Import</span>{" "}
        in the sidebar.
      </p>
    </motion.div>
  );
}
