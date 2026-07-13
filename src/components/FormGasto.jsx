"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { criarGasto } from "@/lib/acoes";
import { CATEGORIAS_GASTO, COMBUSTIVEIS } from "@/lib/constantes";
import Chip from "@/components/Chip";
import Toast from "@/components/Toast";
import CurrencyInput from "@/components/CurrencyInput";

const CAMPO =
  "h-12 w-full rounded-lg border border-borda bg-superficie px-3 font-mono text-base text-texto outline-none focus:border-ambar";

export default function FormGasto({ hoje }) {
  const [estado, agir, pendente] = useActionState(criarGasto, null);
  const formRef = useRef(null);
  const [categoria, setCategoria] = useState("Combustível");
  const [combustivel, setCombustivel] = useState("Etanol");
  const [salvos, setSalvos] = useState(0);
  const ehCombustivel = categoria === "Combustível";

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
      className="space-y-4 rounded-xl border border-borda bg-card p-4"
    >
      <input type="hidden" name="categoria" value={categoria} />
      {ehCombustivel && <input type="hidden" name="combustivel" value={combustivel} />}

      <div className="flex flex-wrap gap-2">
        {CATEGORIAS_GASTO.map((c) => (
          <Chip key={c} selecionado={categoria === c} onClick={() => setCategoria(c)}>
            {c}
          </Chip>
        ))}
      </div>

      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-wider text-texto-sec">
          Valor (R$)
        </span>
        <CurrencyInput
          name="valor"
          required
          autoFocus
          resetSignal={salvos}
          className={`${CAMPO} h-14 text-2xl font-semibold text-gasto`}
        />
      </label>

      {ehCombustivel && (
        <div className="space-y-4 rounded-lg border border-borda bg-superficie/50 p-3">
          <div className="grid grid-cols-2 gap-2">
            {COMBUSTIVEIS.map((c) => (
              <Chip key={c} selecionado={combustivel === c} onClick={() => setCombustivel(c)}>
                {c}
              </Chip>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-wider text-texto-sec">
                Litros
              </span>
              <input name="litros" inputMode="decimal" placeholder="—" className={CAMPO} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-wider text-texto-sec">
                Odômetro (km)
              </span>
              <input name="odometro" inputMode="numeric" placeholder="—" className={CAMPO} />
            </label>
          </div>
          <p className="text-xs text-apagado">
            Litros + odômetro (tanque cheio) alimentam o cálculo de km/L.
          </p>
        </div>
      )}

      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-wider text-texto-sec">
          Descrição (opcional)
        </span>
        <input name="descricao" className={`${CAMPO} font-corpo`} />
      </label>

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
        {pendente ? "Salvando…" : "Salvar gasto"}
      </button>

      <Toast gatilho={salvos} mensagem="Gasto salvo" />
    </form>
  );
}
