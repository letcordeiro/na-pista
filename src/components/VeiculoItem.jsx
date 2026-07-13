"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { editarVeiculo, excluirVeiculo } from "@/lib/acoes";
import { num } from "@/lib/format";

const CAMPO =
  "h-11 w-full rounded-lg border border-borda bg-superficie px-3 text-base text-texto outline-none focus:border-ambar";

export default function VeiculoItem({ veiculo, qtdGastos }) {
  const [editando, setEditando] = useState(false);
  const [estado, agir, pendente] = useActionState(editarVeiculo, null);
  const [excluindo, iniciarExclusao] = useTransition();
  const [erroExcluir, setErroExcluir] = useState(null);

  useEffect(() => {
    if (estado?.ok) setEditando(false);
  }, [estado]);

  function excluir() {
    setErroExcluir(null);
    if (!confirm(`Excluir o veículo "${veiculo.nome}"?`)) return;
    iniciarExclusao(async () => {
      const r = await excluirVeiculo(veiculo.id);
      if (r?.erro) setErroExcluir(r.erro);
    });
  }

  if (editando) {
    return (
      <form
        action={agir}
        className="space-y-3 rounded-xl border border-ambar bg-card p-4"
      >
        <input type="hidden" name="id" value={veiculo.id} />
        <input name="nome" defaultValue={veiculo.nome} required className={CAMPO} />
        <div className="grid grid-cols-2 gap-3">
          <input name="modelo" defaultValue={veiculo.modelo ?? ""} placeholder="Modelo" className={CAMPO} />
          <input name="placa" defaultValue={veiculo.placa ?? ""} placeholder="Placa" className={`${CAMPO} font-mono uppercase`} />
        </div>
        <input
          name="consumoMedio"
          defaultValue={veiculo.consumoMedio ?? ""}
          inputMode="decimal"
          placeholder="Consumo km/L"
          className={`${CAMPO} font-mono`}
        />
        {estado?.erro && <p className="text-sm text-gasto">{estado.erro}</p>}
        <div className="flex gap-2">
          <button
            disabled={pendente}
            className="h-11 flex-1 rounded-lg bg-ambar font-titulo text-sm font-bold uppercase tracking-wider text-fundo disabled:opacity-60"
          >
            {pendente ? "Salvando…" : "Salvar"}
          </button>
          <button
            type="button"
            onClick={() => setEditando(false)}
            className="h-11 flex-1 rounded-lg border border-borda font-titulo text-sm font-semibold uppercase tracking-wider text-texto-sec"
          >
            Cancelar
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="rounded-xl border border-borda bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-titulo text-lg font-semibold uppercase tracking-wider text-texto">
            {veiculo.nome}
          </p>
          <p className="mt-0.5 text-xs text-texto-sec">
            {[
              veiculo.modelo,
              veiculo.placa,
              veiculo.consumoMedio != null
                ? `${num(veiculo.consumoMedio)} km/L`
                : null,
            ]
              .filter(Boolean)
              .join(" · ") || "Sem detalhes"}
          </p>
          <p className="mt-1 font-mono text-xs text-apagado">
            {qtdGastos} lançamento{qtdGastos === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={() => setEditando(true)}
            aria-label="Editar veículo"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-texto-sec hover:text-ambar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={excluir}
            disabled={excluindo}
            aria-label="Excluir veículo"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-apagado hover:text-gasto disabled:opacity-40"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>
      {erroExcluir && <p className="mt-2 text-sm text-gasto">{erroExcluir}</p>}
    </div>
  );
}
