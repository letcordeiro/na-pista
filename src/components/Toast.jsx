"use client";

import { useEffect, useState } from "react";

// Confirmação passageira no rodapé (acima da NavBar). `gatilho` deve mudar
// de valor a cada evento a confirmar (ex.: um contador de sucessos).
export default function Toast({ gatilho, mensagem }) {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    if (!gatilho) return;
    setVisivel(true);
    const t = setTimeout(() => setVisivel(false), 2200);
    return () => clearTimeout(t);
  }, [gatilho]);

  if (!visivel) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-30 flex justify-center px-4">
      <div className="flex items-center gap-2 rounded-full border border-ganho/40 bg-superficie px-4 py-2.5 shadow-lg">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3ECF8E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span className="font-titulo text-sm font-semibold uppercase tracking-wide text-texto">
          {mensagem}
        </span>
      </div>
    </div>
  );
}
