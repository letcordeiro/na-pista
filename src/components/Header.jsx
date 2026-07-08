import { sair } from "@/lib/acoes";

export default function Header({ nome }) {
  return (
    <header className="sticky top-0 z-20 border-b border-borda bg-fundo/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <div>
          <p className="font-titulo text-2xl font-bold uppercase leading-none tracking-[0.08em]">
            NaPista<span className="text-ambar">.</span>
          </p>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.3em] text-texto-sec">
            painel do motorista
          </p>
        </div>
        <form action={sair}>
          <button
            title={nome}
            className="flex h-10 items-center gap-1.5 px-2 text-xs uppercase tracking-wider text-apagado transition-colors hover:text-texto-sec"
          >
            sair
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </form>
      </div>
    </header>
  );
}
