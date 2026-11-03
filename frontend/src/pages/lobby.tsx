import LobbyList from '@/lobby/list';
import LobbyCreate from '@/lobby/create';

const LobbyPage = () => {
	return (
		<div className="relative isolate flex min-h-svh flex-col bg-emerald-950 font-sans text-slate-900 [&_:is(a,button,input):focus-visible]:outline-2 [&_:is(a,button,input):focus-visible]:outline-offset-4 [&_:is(a,button,input):focus-visible]:outline-emerald-600">
			<div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
				<div className="absolute inset-0 scale-110 bg-[url('/images/background.webp')] bg-cover bg-center bg-no-repeat" />
			</div>
			<div className="pointer-events-none fixed inset-0 -z-10 bg-black/40" aria-hidden="true" />
			<main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
				<section className="rounded-2xl bg-white p-5 sm:p-8" aria-labelledby="lobbies-title">
					<div className="mb-6 flex flex-wrap items-center justify-between gap-4">
						<div>
							<h1 className="text-2xl font-semibold tracking-tight" id="lobbies-title">Lobbies</h1>
							<p className="mt-1 text-sm text-slate-600">Join a game or create your own.</p>
						</div>
						<LobbyCreate />
					</div>
					<LobbyList />
				</section>
			</main>
		</div>
	);
};

export default LobbyPage;
