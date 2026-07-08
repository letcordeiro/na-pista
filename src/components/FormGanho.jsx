"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { criarGanho } from "@/lib/acoes";
import { APPS, TIPOS_GANHO } from "@/lib/constantes";
import Chip from "@/components/Chip";

const CAMPO =
  "h-12 w-full rounded-lg border border-borda bg-superficie px-3 font-mono text-base text-texto outline-none focus:border-ambar";

export default function FormGanho({ hoje }) {
  const [estado, agir, pendente] = useActionState(criarGanho, null);
  const formRef = useRef(null);
  const [tipo, setTipo] = useState("corrida");
  const [app, setApp] = useState("Uber");

  useEffect(() => {
    if (estado?.ok) formRef.current?.reset();
  }, [estado]);

  return (
    <form
      ref={formRef}
      action={agir}
      className="space-y-4 rounded-xl border border-borda bg-card p-4"
    >
      <input type="hidden" name="tipo" value={tipo} />
      <input type="hidden" name="app" value={app} />

      <div className="grid grid-cols-2 gap-2">
        {TIPOS_GANHO.map((t) => (
          <Chip key={t.valor} selecionado={tipo === t.valor} onClick={() => setTipo(t.valor)}>
            {t.rotulo}
          </Chip>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {APPS.map((a) => (
          <Chip key={a} selecionado={app === a} onClick={() => setApp(a)}>
            {a}
          </Chip>
        ))}
      </div>

      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-wider text-texto-sec">
          Valor (R$)
        </span>
        <input
          name="valor"
          inputMode="decimal"
          placeholder="0,00"
          required
          className={`${CAMPO} h-14 text-2xl font-semibold text-ganho`}
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wider text-texto-sec">
            Km rodados
          </span>
          <input name="km" inputMode="decimal" placeholder="—" className={CAMPO} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wider text-texto-sec">
            Horas
          </span>
          <input name="horas" inputMode="decimal" placeholder="—" className={CAMPO} />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-wider text-texto-sec">
          Data
        </span>
        <input name="data" type="date" defaultValue={hoje} required className={CAMPO} />
      </label>

      {estado?.erro && <p className="text-sm text-gasto">{estado.erro}</p>}

      <button
        disabled={pendente}
        className="h-14 w-full rounded-xl bg-ambar font-titulo text-lg font-bold uppercase tracking-widest text-fundo transition-opacity disabled:opacity-60"
      >
        {pendente ? "Salvando…" : "Salvar ganho"}
      </button>
    </form>
  );
}
