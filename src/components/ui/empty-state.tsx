export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-md border border-dashed border-ink/20 bg-white/60 p-6">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-ink/65">{body}</p>
    </div>
  );
}
