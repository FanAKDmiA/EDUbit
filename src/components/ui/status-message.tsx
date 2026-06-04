export function StatusMessage({ error, success }: { error?: string; success?: string }) {
  if (!error && !success) return null;

  return (
    <p
      className={`rounded-md px-3 py-2 text-sm ${
        error ? "border border-coral/40 bg-coral/10 text-[#8f2c1e]" : "border border-mint/40 bg-mint/10 text-[#12604f]"
      }`}
    >
      {error || success}
    </p>
  );
}
