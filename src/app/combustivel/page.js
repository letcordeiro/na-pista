import { prisma } from "@/lib/prisma";
import { getUsuarioSessao } from "@/lib/sessao";
import {
  calcularKmPorLitro,
  ultimoPrecoLitro,
  custoPorKmCombustivel,
  combustivelCompensando,
} from "@/lib/metrics";
import Link from "next/link";
import { COMBUSTIVEIS } from "@/lib/constantes";
import { listarVeiculos } from "@/lib/veiculos";
import { dateParaISO } from "@/lib/datas";
import { brl, num, dataCurta } from "@/lib/format";
import Header from "@/components/Header";
import NavBar from "@/components/NavBar";

export const metadata = { title: "Combustível — Na Pista" };

export default async function PaginaCombustivel({ searchParams }) {
  const usuario = await getUsuarioSessao();

  const veiculos = await listarVeiculos(usuario.id);
  const params = await searchParams;
  const selecionado = veiculos.some((v) => v.id === params?.veiculo)
    ? params.veiculo
    : veiculos[0]?.id ?? null;

  // km/L é por odômetro: cada carro tem sua própria sequência, nunca misturar
  const registros = await prisma.gasto.findMany({
    where: {
      usuarioId: usuario.id,
      categoria: "Combustível",
      veiculoId: selecionado ?? undefined,
    },
    orderBy: [{ data: "desc" }, { criadoEm: "desc" }],
  });

  const abastecimentos = registros.map((g) => ({
    valor: Number(g.valor),
    litros: g.litros == null ? null : Number(g.litros),
    odometro: g.odometro,
    combustivel: g.combustivel,
    dataISO: dateParaISO(g.data),
    criadoEmISO: g.criadoEm.toISOString(),
  }));

  const kmPorLitro = calcularKmPorLitro(abastecimentos);
  const precos = ultimoPrecoLitro(abastecimentos);
  const custos = custoPorKmCombustivel(kmPorLitro, precos);
  const compensando = combustivelCompensando(custos);

  const medidos = abastecimentos.filter(
    (a) => a.odometro != null && a.litros > 0
  ).length;

  return (
    <>
      <Header nome={usuario.nome} />
      <main className="mx-auto max-w-md space-y-4 px-4 pb-28 pt-4">
        <h1 className="font-titulo text-xl font-semibold uppercase tracking-wider text-texto">
          Etanol × Gasolina
        </h1>

        {veiculos.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {veiculos.map((v) => (
              <Link
                key={v.id}
                href={`/combustivel?veiculo=${v.id}`}
                className={`h-10 rounded-lg border px-3 font-titulo text-sm font-semibold uppercase tracking-wide leading-[2.5rem] ${
                  selecionado === v.id
                    ? "border-ambar bg-ambar/10 text-ambar"
                    : "border-borda bg-superficie text-texto-sec"
                }`}
              >
                {v.nome}
              </Link>
            ))}
          </div>
        )}

        {medidos < 2 && (
          <p className="rounded-xl border border-borda bg-card p-4 text-sm text-texto-sec">
            Para medir o km/L real, lance os abastecimentos (tanque cheio) na
            aba Gastos informando <strong className="text-texto">litros</strong>{" "}
            e <strong className="text-texto">odômetro</strong>. A partir do
            segundo abastecimento o comparativo aparece aqui.
          </p>
        )}

        <section className="grid grid-cols-2 gap-3">
          {COMBUSTIVEIS.map((comb) => {
            const ehMelhor = compensando === comb;
            return (
              <div
                key={comb}
                className={`rounded-xl border bg-card p-4 ${
                  ehMelhor ? "border-ambar" : "border-borda"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <p className="font-titulo text-lg font-semibold uppercase tracking-wider text-texto">
                    {comb}
                  </p>
                  {ehMelhor && (
                    <span className="rounded bg-ambar/15 px-1.5 py-0.5 font-titulo text-[10px] font-bold uppercase tracking-wider text-ambar">
                      Compensando
                    </span>
                  )}
                </div>
                <dl className="mt-3 space-y-2.5">
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-texto-sec">km/L medido</dt>
                    <dd className="font-mono text-2xl text-texto">
                      {kmPorLitro[comb] != null ? num(kmPorLitro[comb]) : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-texto-sec">Último preço/L</dt>
                    <dd className="font-mono text-base text-texto">
                      {precos[comb] != null ? brl(precos[comb]) : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-texto-sec">R$/km</dt>
                    <dd
                      className={`font-mono text-base ${
                        ehMelhor ? "text-ambar" : "text-texto"
                      }`}
                    >
                      {custos[comb] != null ? brl(custos[comb]) : "—"}
                    </dd>
                  </div>
                </dl>
              </div>
            );
          })}
        </section>

        <h2 className="pt-2 font-titulo text-xl font-semibold uppercase tracking-wider text-texto">
          Abastecimentos
        </h2>
        {registros.length === 0 ? (
          <p className="rounded-xl border border-borda bg-card p-4 text-sm text-texto-sec">
            Nenhum abastecimento lançado ainda.
          </p>
        ) : (
          <ul className="divide-y divide-borda overflow-hidden rounded-xl border border-borda bg-card">
            {registros.slice(0, 20).map((g) => (
              <li key={g.id} className="flex items-center gap-3 p-3">
                <span className="w-12 shrink-0 font-mono text-sm text-texto-sec">
                  {dataCurta(g.data)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-texto">{g.combustivel ?? "Combustível"}</p>
                  <p className="font-mono text-xs text-texto-sec">
                    {g.litros != null && `${num(Number(g.litros), 2)} L`}
                    {g.litros != null &&
                      Number(g.litros) > 0 &&
                      ` · ${brl(Number(g.valor) / Number(g.litros))}/L`}
                    {g.odometro != null &&
                      ` · ${g.odometro.toLocaleString("pt-BR")} km`}
                  </p>
                </div>
                <span className="font-mono text-base font-medium text-gasto">
                  {brl(Number(g.valor))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </main>
      <NavBar />
    </>
  );
}
