/** Small floating infographic legend for the crisis map panel. */
export function MapLegend() {
  return (
    <div className="pointer-events-none absolute bottom-4 left-4 z-10 bg-card border border-rule rounded-[3px] p-3 w-[186px] select-none text-left shadow-elev-pop">
      <div className="font-mono text-[10px] font-semibold tracking-wider text-ink-3 pb-2 border-b border-rule-soft mb-2">
        LEGEND · BENGALURU SE
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2.5 font-mono text-[11px] text-ink-2">
          <span className="w-3.5 h-2.5 bg-flood-4 rounded-[1px] shrink-0" />
          <span>Deep / inundated</span>
        </div>
        <div className="flex items-center gap-2.5 font-mono text-[11px] text-ink-2">
          <span className="w-3.5 h-2.5 bg-flood-2 rounded-[1px] shrink-0" />
          <span>Shallow / rising</span>
        </div>
        <div className="flex items-center gap-2.5 font-mono text-[11px] text-ink-2">
          <span className="w-4 border-t-2 border-route shrink-0" />
          <span>Rescue route</span>
        </div>
        <div className="flex items-center gap-2.5 font-mono text-[11px] text-ink-2">
          <span className="w-4 border-t-2 border-dashed border-blocked shrink-0" />
          <span>Blocked road</span>
        </div>
      </div>
      <div className="flex gap-4 font-mono text-[11px] text-ink-2 mt-2.5 pt-2 border-t border-rule-soft">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-marker-team" />
          Team
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-marker-shelter" />
          Shelter
        </span>
      </div>
    </div>
  )
}
