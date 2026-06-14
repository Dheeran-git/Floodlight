import { useOptimization } from '@/hooks'

/** Button that runs the resource optimizer and shows an assignment summary. */
export function OptimizeButton() {
  const mutation = useOptimization()
  const count = Array.isArray(mutation.data?.assignments)
    ? mutation.data.assignments.length
    : null

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="w-full rounded border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-sm font-medium text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-50"
      >
        {mutation.isPending ? 'Optimizing…' : 'Run optimization'}
      </button>
      {mutation.isError && (
        <p className="text-xs text-red-300">
          {(mutation.error as Error).message || 'Optimization failed.'}
        </p>
      )}
      {mutation.isSuccess && (
        <p className="text-xs text-cyan-300">
          {count !== null
            ? `Optimization complete: ${count} assignments.`
            : 'Optimization complete.'}
        </p>
      )}
    </div>
  )
}
