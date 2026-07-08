"use client";

import { useTransition } from "react";

export default function ExcluirBotao({ acao }) {
  const [pendente, iniciarTransicao] = useTransition();

  return (
    <button
      type="button"
      disabled={pendente}
      onClick={() => {
        if (confirm("Excluir este lançamento?")) {
          iniciarTransicao(() => acao());
        }
      }}
      aria-label="Excluir lançamento"
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-apagado transition-colors hover:text-gasto disabled:opacity-40"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </svg>
    </button>
  );
}
