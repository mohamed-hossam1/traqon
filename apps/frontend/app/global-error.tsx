"use client";

import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <head>
        <title>Something went wrong</title>
      </head>
      <body className="m-0 min-h-[100dvh] flex items-center justify-center font-sans bg-background text-foreground">
        <main className="w-full max-w-[480px] p-8 text-center">
          <h1 className="text-2xl font-semibold m-0">
            Something went wrong
          </h1>
          <p className="mt-3 text-muted-foreground text-[0.95rem] leading-relaxed">
            An unexpected error interrupted this page. Please try again: if
            it keeps happening, contact support.
          </p>
          {error?.digest ? (
            <p className="mt-4 font-mono text-xs text-neutral-500">
              Reference: {error.digest}
            </p>
          ) : null}
          <button
            type="button"
            onClick={reset}
            className="mt-6 px-5 py-2.5 border border-primary bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:opacity-90 transition-opacity cursor-pointer inline-flex items-center justify-center"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
