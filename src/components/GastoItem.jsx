"use client";

import { useState } from "react";
import { excluirGasto } from "@/lib/acoes";
import { brl, num } from "@/lib/format";
import FormGasto from "@/components/FormGasto";
import ExcluirBotao from "@/components/ExcluirBotao";

export default function GastoItem({ gasto, veiculos = [], mostrarVeiculo = false }) {
  const [editando, setEditando] = useState(false);

  if (editando) {
    return (
      <FormGasto
        gasto={gasto}
        veiculos={veiculos}
        aoConcluir={() => setEditando(false)}
      />
    );
  }

  const detalhe =
    gasto.litros != null
      ? `${num(gasto.litros, 2)} L${
          gasto.odometro != null ? ` · ${gasto.odometro.toLocaleString("pt-BR")} km` : ""
        }`
      : gasto.descricao;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-borda bg-card p-3">
      <span className="w-12 shrink-0 font-mono text-sm text-texto-sec">
        {gasto.dataCurta}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-texto">
          {gasto.categoria}
          {gasto.combustivel && (
            <span className="text-apagado">{` · ${gasto.combustivel}`}</span>
          )}
          {mostrarVeiculo && (
            <span className="text-apagado">{` · ${gasto.veiculoNome}`}</span>
          )}
        </p>
        {detalhe && (
          <p className="truncate font-mono text-xs text-texto-sec">{detalhe}</p>
        )}
      </div>
      <span className="font-mono text-base font-medium text-gasto">
        {brl(gasto.valor)}
      </span>
      <button
        type="button"
        onClick={() => setEditando(true)}
        aria-label="Editar gasto"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-texto-sec transition-colors hover:text-ambar"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      </button>
      <ExcluirBotao acao={excluirGasto.bind(null, gasto.id)} />
    </div>
  );
}
