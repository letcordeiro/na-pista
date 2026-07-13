"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { criarGasto, editarGasto } from "@/lib/acoes";
import { CATEGORIAS_GASTO, COMBUSTIVEIS } from "@/lib/constantes";
import Chip from "@/components/Chip";
import Toast from "@/components/Toast";
import CurrencyInput from "@/components/CurrencyInput";

const CAMPO =
  "h-12 w-full rounded-lg border border-borda bg-superficie px-3 font-mono text-base text-texto outline-none focus:border-ambar";

// `gasto` presente => modo edição. `aoConcluir` é chamado após salvar (para
// o editor inline se fechar). Sem `gasto`, é o formulário de novo gasto.
export default function FormGasto({
  hoje,
  veiculos = [],
  veiculoSugerido = null,
  gasto = null,
  aoConcluir = null,
}) {
  const edicao = gasto != null;
  const [estado, agir, pendente] = useActionState(
    edicao ? editarGasto : criarGasto,
    null
  );
  const formRef = useRef(null);
  const [categoria, setCategoria] = useState(gasto?.categoria ?? "Combustível");
  const [combustivel, setCombustivel] = useState(gasto?.combustivel ?? "Etanol");
  const [veiculoId, setVeiculoId] = useState(
    gasto?.veiculoId ?? veiculoSugerido ?? veiculos[0]?.id ?? ""
  );
  const [salvos, setSalvos] = useState(0);
  const ehCombustivel = categoria === "Combustível";

  useEffect(() => {
    if (!estado?.ok) return;
    if (edicao) {
      aoConcluir?.();
    } else {
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
      {edicao && <input type="hidden" name="id" value={gasto.id} />}
      <input type="hidden" name="categoria" value={categoria} />
      {ehCombustivel && <input type="hidden" name="combustivel" value={combustivel} />}
      <input type="hidden" name="veiculoId" value={veiculoId} />

      {veiculos.length > 1 && (
        <div>
          <span className="mb-1 block text-xs uppercase tracking-wider text-texto-sec">
            Veículo
          </span>
          <div className="flex flex-wrap gap-2">
            {veiculos.map((v) => (
              <Chip
                key={v.id}
                selecionado={veiculoId === v.id}
                onClick={() => setVeiculoId(v.id)}
              >
                {v.nome}
              </Chip>
            ))}
          </div>
        </div>
      )}

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
          key={salvos}
          name="valor"
          required
          autoFocus={!edicao}
          defaultReais={gasto?.valor ?? null}
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
              <input
                name="litros"
                inputMode="decimal"
                placeholder="—"
                defaultValue={gasto?.litros ?? ""}
                className={CAMPO}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-wider text-texto-sec">
                Odômetro (km)
              </span>
              <input
                name="odometro"
                inputMode="numeric"
                placeholder="—"
                defaultValue={gasto?.odometro ?? ""}
                className={CAMPO}
              />
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
        <input
          name="descricao"
          defaultValue={gasto?.descricao ?? ""}
          className={`${CAMPO} font-corpo`}
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-wider text-texto-sec">
          Data
        </span>
        <input
          name="data"
          type="date"
          defaultValue={gasto?.dataISO ?? hoje}
          required
          className={CAMPO}
        />
      </label>

      {estado?.erro && <p className="text-sm text-gasto">{estado.erro}</p>}

      <div className="flex gap-2">
        <button
          disabled={pendente}
          className="h-14 flex-1 rounded-xl bg-ambar font-titulo text-lg font-bold uppercase tracking-widest text-fundo transition-opacity disabled:opacity-60"
        >
          {pendente ? "Salvando…" : edicao ? "Salvar alterações" : "Salvar gasto"}
        </button>
        {edicao && (
          <button
            type="button"
            onClick={() => aoConcluir?.()}
            className="h-14 rounded-xl border border-borda px-4 font-titulo text-sm font-semibold uppercase tracking-wider text-texto-sec"
          >
            Cancelar
          </button>
        )}
      </div>

      {!edicao && <Toast gatilho={salvos} mensagem="Gasto salvo" />}
    </form>
  );
}
