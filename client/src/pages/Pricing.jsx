function Pricing() {
  const tiers = [
    ["Free", "Basic QR generation", ["Static/Dynamic QR types", "PNG/JPG/SVG downloads"]],
    ["Pro", "History + Dynamic QR", ["Saved history", "Edit destination", "Analytics"]],
    ["Business", "API + team", ["Public API usage", "Higher limits", "Priority support"]]
  ];

  // aggregate all features into the highlighted Free card
  const allFeatures = Array.from(new Set(tiers.flatMap(([, , bullets]) => bullets)));

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold">Pricing</h1>
     

      {/* Highlighted free card with all features */}
      <div className="mt-8">
        <div className="p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">Free — All Features</div>
              <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">Everything included from Free / Pro / Business.</div>
            </div>
            <div className="text-sm text-green-600 font-medium">Currently active</div>
          </div>

          <ul className="mt-6 grid gap-2 sm:grid-cols-2 text-sm text-zinc-700 dark:text-zinc-200">
            {allFeatures.map((f) => (
              <li key={f} className="list-disc ml-5">{f}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Inactive/blurred tier cards shown below for context */}
      <div className="grid md:grid-cols-3 gap-4 mt-8">
        {tiers.map(([name, tagline, bullets]) => (
          <div
            key={name}
            className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 relative"
          >
            <div className="absolute inset-0 rounded-2xl bg-white/0 dark:bg-zinc-950/0 pointer-events-none" />
            <div className="filter blur-sm opacity-60 select-none pointer-events-none">
              <div className="text-xl font-semibold">{name}</div>
              <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{tagline}</div>
              <ul className="mt-4 text-sm list-disc pl-5 text-zinc-700 dark:text-zinc-200">
                {bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>

            <div className="mt-4 text-xs text-zinc-500">This plan is shown for reference.</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Pricing;

