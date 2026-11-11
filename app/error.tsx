"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    void fetch("/api/error", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: error.message, path: window.location.pathname }),
    });
  }, [error]);

  return (
    <div className="wrap prose" style={{ padding: "2rem 0" }}>
      <p className="kicker">Error</p>
      <h1>The sheet did not load.</h1>
      <p>The failure was written to the error log.</p>
      <button className="button" type="button" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
