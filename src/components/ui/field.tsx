import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-ink">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="min-h-10 rounded-md border border-ink/15 bg-white px-3 text-sm outline-none ring-mint/40 focus:ring-2"
      {...props}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className="min-h-24 rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none ring-mint/40 focus:ring-2"
      {...props}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className="min-h-10 rounded-md border border-ink/15 bg-white px-3 text-sm outline-none ring-mint/40 focus:ring-2"
      {...props}
    />
  );
}
