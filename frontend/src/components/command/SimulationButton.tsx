import { useSimulation } from '@/hooks'

/** Button that injects the scripted heavy-rain flood scenario in broadsheet style. */
export function SimulationButton() {
  const mutation = useSimulation()

  return (
    <div className="space-y-2 select-none">
      <button
        type="button"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="w-full rounded-[3px] border border-ink bg-paper px-3 py-2 text-[13px] font-semibold text-ink hover:bg-accent-tint disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
      >
        {mutation.isPending ? 'Injecting…' : 'Run Heavy-Rain Simulation'}
      </button>
      {mutation.isError && (
        <p className="text-xs text-sev-critical font-mono">
          {(mutation.error as Error).message || 'Simulation failed.'}
        </p>
      )}
      {mutation.isSuccess && (
        <p className="text-xs text-sev-stable font-mono uppercase tracking-wide">
          Injected {mutation.data.reports_created} report
          {mutation.data.reports_created === 1 ? '' : 's'} from the{' '}
          {mutation.data.scenario} scenario.
        </p>
      )}
    </div>
  )
}
