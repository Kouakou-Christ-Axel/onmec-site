"use client";

export function MaintenanceRetryButton() {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="inline-flex h-11 items-center rounded-sm bg-white px-6 text-base font-semibold text-fill-ink transition-colors hover:bg-n-100"
    >
      Réessayer maintenant
    </button>
  );
}
