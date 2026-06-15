import { useSimulation } from '@/hooks'

/** Button that injects the scripted heavy-rain flood scenario. */
export function SimulationButton() {
  const mutation = useSimulation()

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="w-full rounded border border-sky-500/40 bg-sky-500/10 px-3 py-2 text-sm font-medium text-sky-300 hover:bg-sky-500/20 disabled:opacity-50"
      >
        {mutation.isPending ? 'Injecting…' : 'Run Heavy-Rain Simulation'}
      </button>
      {mutation.isError && (
        <p className="text-xs text-red-300">
          {(mutation.error as Error).message || 'Simulation failed.'}
        </p>
      )}
      {mutation.isSuccess && (
        <p className="text-xs text-sky-300">
          Injected {mutation.data.reports_created} report
          {mutation.data.reports_created === 1 ? '' : 's'} from the{' '}
          {mutation.data.scenario} scenario.
        </p>
      )}
    </div>
  )
}
