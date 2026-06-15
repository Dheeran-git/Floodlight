import { useOptimization } from '@/hooks'

/** Button that runs the resource optimizer and shows an assignment summary in broadsheet styling. */
export function OptimizeButton() {
  const mutation = useOptimization()
  const count = Array.isArray(mutation.data?.deployment_plan)
    ? mutation.data.deployment_plan.length
    : null

  return (
    <div className="space-y-2 select-none">
      <button
        type="button"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="w-full rounded-[3px] border border-ink bg-paper px-3 py-2 text-[13px] font-semibold text-ink hover:bg-accent-tint disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
      >
        {mutation.isPending ? 'Optimizing…' : 'Run Optimization'}
      </button>
      {mutation.isError && (
        <p className="text-xs text-sev-critical font-mono">
          {(mutation.error as Error).message || 'Optimization failed.'}
        </p>
      )}
      {mutation.isSuccess && (
        <p className="text-xs text-sev-stable font-mono uppercase tracking-wide">
          {count !== null
            ? `Optimization complete: ${count} assignments.`
            : 'Optimization complete.'}
        </p>
      )}
    </div>
  )
}
