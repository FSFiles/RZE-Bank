export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-16 rounded-xl bg-white/[0.04]" />
      <div className="h-56 rounded-xl bg-white/[0.04]" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-white/[0.04]" />
        ))}
      </div>
      <div className="h-64 rounded-xl bg-white/[0.04]" />
    </div>
  );
}
