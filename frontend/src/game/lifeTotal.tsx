export default function LifeTotal({ label, value }: { label: string; value: number }) {
	return (
		<div className="rounded-xl bg-slate-50 px-4 py-3">
			<p className="text-xs font-medium text-slate-500">{label}</p>
			<output className="mt-1 block text-2xl font-semibold tabular-nums" aria-label={label}>{value}</output>
		</div>
	);
}
