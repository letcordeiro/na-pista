"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { criarVeiculo } from "@/lib/acoes";
import Toast from "@/components/Toast";

const CAMPO =
  "h-12 w-full rounded-lg border border-borda bg-superficie px-3 text-base text-texto outline-none focus:border-ambar";

export default function FormVeiculo() {
  const [estado, agir, pendente] = useActionState(criarVeiculo, null);
  const formRef = useRef(null);
  const [salvos, setSalvos] = useState(0);

  useEffect(() => {
    if (estado?.ok) {
      formRef.current?.reset();
      setSalvos((n) => n + 1);
    }
  }, [estado]);

  return (
    <form
      ref={formRef}
      action={agir}
      className="space-y-3 rounded-xl border border-borda bg-card p-4"
    >
      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-wider text-texto-sec">
          Nome / apelido
        </span>
        <input name="nome" placeholder="Ex.: Onix prata" required className={CAMPO} />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wider text-texto-sec">
            Modelo (opcional)
          </span>
          <input name="modelo" className={CAMPO} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wider text-texto-sec">
            Placa (opcional)
          </span>
          <input name="placa" className={`${CAMPO} font-mono uppercase`} />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-wider text-texto-sec">
          Consumo médio km/L (opcional)
        </span>
        <input
          name="consumoMedio"
          inputMode="decimal"
          placeholder="—"
          className={`${CAMPO} font-mono`}
        />
      </label>

      {estado?.erro && <p className="text-sm text-gasto">{estado.erro}</p>}

      <button
        disabled={pendente}
        className="h-12 w-full rounded-xl bg-ambar font-titulo text-base font-bold uppercase tracking-widest text-fundo transition-opacity disabled:opacity-60"
      >
        {pendente ? "Salvando…" : "Adicionar veículo"}
      </button>

      <Toast gatilho={salvos} mensagem="Veículo salvo" />
    </form>
  );
}
