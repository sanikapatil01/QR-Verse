function Home() {

  return (
    <div className="max-w-6xl mx-auto px-4 py-14">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            QRVerse – Smart QR Code Generator Platform
          </h1>
          <p className="mt-4 text-zinc-600 dark:text-zinc-300">
            Generate modern QR codes (URL, Text, WiFi, Email, Phone, WhatsApp, UPI), customize colors & size,
            download in multiple formats, and keep a history + analytics in your dashboard.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="/generate"
              className="px-5 py-3 rounded bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-medium"
            >
              Generate QR
            </a>
            <a
              href="/dashboard"
              className="px-5 py-3 rounded border border-zinc-200 dark:border-zinc-800 font-medium"
            >
              Open Dashboard
            </a>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
            {[
              ["Dynamic QR", "Edit destination later"],
              ["History", "Saved QRs with timestamps"],
              ["Analytics", "Most used type + scans"],
              ["Public API", "POST /api/qr/public/generate"]
            ].map(([title, desc]) => (
              <div
                key={title}
                className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
              >
                <div className="font-semibold">{title}</div>
                <div className="text-zinc-600 dark:text-zinc-300 mt-1">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="text-sm text-zinc-600 dark:text-zinc-300">
            Tip: login to save history + enable Dynamic QR.
          </div>
          <div className="mt-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="font-semibold">Try it now</div>
            <div className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">
              Go to the generator page to build your first QR.
            </div>
            <a
              href="/generate"
              className="inline-block mt-4 px-4 py-2 rounded bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-sm"
            >
              Open Generator
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
