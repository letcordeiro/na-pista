export default function CartaoAuth({ children }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
      <div className="mb-8 text-center">
        <p className="font-titulo text-4xl font-bold uppercase tracking-[0.08em]">
          NaPista<span className="text-ambar">.</span>
        </p>
        <p className="mt-1 text-xs uppercase tracking-[0.3em] text-texto-sec">
          painel do motorista
        </p>
      </div>
      <div className="rounded-xl border border-borda bg-card p-5">{children}</div>
    </main>
  );
}
