/**
 * PreparationDashboard.
 * TODO (downstream Ralph): pre-trip checklist grouped by T-window with
 *   localStorage persistence (kailash_checklist_v3). Progress feeds JourneyState.progressPct.
 *   PRD reference: section 8 (Preparation Dashboard).
 */

export function PreparationDashboard() {
  return (
    <section
      data-section="preparation-dashboard"
      className="border-b border-border bg-bg px-6 py-8"
    >
      <div className="mx-auto max-w-5xl">
        <h2 className="font-sans text-2xl font-medium text-ink">Preparation</h2>
        <p className="mt-2 text-muted">
          TODO: T-21 / T-14 / T-7 / T-3 grouped checklist with localStorage persistence.
        </p>
      </div>
    </section>
  );
}
