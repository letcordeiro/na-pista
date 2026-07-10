"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function IconeResumo(props) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 20a8 8 0 1 1 8-8" />
      <path d="M12 12l4-4" />
      <path d="M20 16h.01" />
    </svg>
  );
}

function IconeGanhos(props) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function IconeGastos(props) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M8 8h8" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
    </svg>
  );
}

function IconeCombustivel(props) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="3" y1="22" x2="15" y2="22" />
      <path d="M4 9h10" />
      <path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18" />
      <path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2 2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5" />
    </svg>
  );
}

const ITENS = [
  { href: "/", rotulo: "Resumo", Icone: IconeResumo },
  { href: "/ganhos", rotulo: "Ganhos", Icone: IconeGanhos },
  { href: "/gastos", rotulo: "Gastos", Icone: IconeGastos },
  { href: "/combustivel", rotulo: "Combustível", Icone: IconeCombustivel },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-borda bg-card pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto grid h-20 max-w-md grid-cols-4">
        {ITENS.map(({ href, rotulo, Icone }) => {
          const ativo = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-1.5 ${
                ativo ? "text-ambar" : "text-texto-sec"
              }`}
            >
              <Icone width={26} height={26} />
              <span className="font-titulo text-xs font-semibold uppercase tracking-wider">
                {rotulo}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
