import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getUsuarioSessao } from "@/lib/sessao";
import { calcularResumo, serieDiaria } from "@/lib/metrics";
import { hojeISO, addDias, inicioDoMes, isoParaDate, dateParaISO } from "@/lib/datas";
import { brl, num, dataCurta } from "@/lib/format";
import Header from "@/components/Header";
import NavBar from "@/components/NavBar";
import GraficoSemana from "@/components/GraficoSemana";

const PERIODOS = [
  { chave: "hoje", rotulo: "Hoje" },
  { chave: "semana", rotulo: "7 dias" },
  { chave: "mes", rotulo: "Mês" },
];

function intervaloDoPeriodo(periodo, hoje) {
  if (periodo === "semana") return { de: addDias(hoje, -6), ate: hoje };
  if (periodo === "mes") return { de: inicioDoMes(hoje), ate: hoje };
  return { de: hoje, ate: hoje };
}

export default async function PaginaResumo({ searchParams }) {
  const usuario = await getUsuarioSessao();
  const params = await searchParams;
  const periodo = PERIODOS.some((p) => p.chave === params?.periodo)
    ? params.periodo
    : "hoje";

  const hoje = hojeISO();
  const { de, ate } = intervaloDoPeriodo(periodo, hoje);
  const inicioGrafico = addDias(hoje, -6);
  const inicioBusca = de < inicioGrafico ? de : inicioGrafico;

  const filtro = {
    usuarioId: usuario.id,
    data: { gte: isoParaDate(inicioBusca), lte: isoParaDate(hoje) },
  };
  const [ganhosBrutos, gastosBrutos, totalGanhos, totalGastos] = await Promise.all([
    prisma.ganho.findMany({ where: filtro }),
    prisma.gasto.findMany({ where: filtro }),
    prisma.ganho.count({ where: { usuarioId: usuario.id } }),
    prisma.gasto.count({ where: { usuarioId: usuario.id } }),
  ]);
  const primeiroAcesso = totalGanhos === 0 && totalGastos === 0;

  const ganhos = ganhosBrutos.map((g) => ({
    valor: Number(g.valor),
    km: g.km == null ? null : Number(g.km),
    horas: g.horas == null ? null : Number(g.horas),
    dataISO: dateParaISO(g.data),
  }));
  const gastos = gastosBrutos.map((g) => ({
    valor: Number(g.valor),
    dataISO: dateParaISO(g.data),
  }));

  const noPeriodo = (item) => item.dataISO >= de && item.dataISO <= ate;
  const resumo = calcularResumo(ganhos.filter(noPeriodo), gastos.filter(noPeriodo));

  const dias7 = Array.from({ length: 7 }, (_, i) => addDias(hoje, i - 6));
  const grafico = serieDiaria(
    ganhos.filter((g) => g.dataISO >= inicioGrafico),
    gastos.filter((g) => g.dataISO >= inicioGrafico),
    dias7
  ).map((p) => ({ ...p, rotulo: dataCurta(isoParaDate(p.dia)) }));
  const temDadosGrafico = grafico.some((d) => d.ganhos > 0 || d.gastos > 0);

  if (primeiroAcesso) {
    return (
      <>
        <Header nome={usuario.nome} />
        <main className="mx-auto flex max-w-md flex-col px-4 pb-24 pt-16 text-center">
          <p className="font-titulo text-2xl font-semibold uppercase tracking-wider text-texto">
            Bem-vindo, {usuario.nome.split(" ")[0]}
          </p>
          <p className="mt-2 text-sm text-texto-sec">
            Comece lançando seu primeiro ganho do dia. Depois é só registrar os
            gastos e abastecimentos — o resto o painel calcula pra você.
          </p>
          <Link
            href="/ganhos"
            className="mt-8 flex h-14 items-center justify-center rounded-xl bg-ambar font-titulo text-lg font-bold uppercase tracking-widest text-fundo"
          >
            Lançar primeiro ganho
          </Link>
          <Link
            href="/gastos"
            className="mt-3 flex h-12 items-center justify-center rounded-xl border border-borda font-titulo text-sm font-semibold uppercase tracking-wider text-texto-sec"
          >
            Lançar um gasto
          </Link>
        </main>
        <NavBar />
      </>
    );
  }

  return (
    <>
      <Header nome={usuario.nome} />
      <main className="mx-auto max-w-md space-y-4 px-4 pb-24 pt-4">
        <div className="grid grid-cols-3 gap-1 rounded-xl border border-borda bg-card p-1">
          {PERIODOS.map((p) => (
            <Link
              key={p.chave}
              href={`/?periodo=${p.chave}`}
              className={`flex h-10 items-center justify-center rounded-lg font-titulo text-sm font-semibold uppercase tracking-wider ${
                periodo === p.chave
                  ? "bg-superficie text-ambar"
                  : "text-texto-sec"
              }`}
            >
              {p.rotulo}
            </Link>
          ))}
        </div>

        <section className="rounded-xl border border-borda bg-card p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-texto-sec">
            Líquido do período
          </p>
          <p
            className={`mt-1 font-mono text-4xl font-semibold ${
              resumo.liquido >= 0 ? "text-ganho" : "text-gasto"
            }`}
          >
            {brl(resumo.liquido)}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-borda pt-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-texto-sec">Bruto</p>
              <p className="font-mono text-lg text-texto">{brl(resumo.bruto)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-texto-sec">Gastos</p>
              <p className="font-mono text-lg text-gasto">{brl(resumo.totalGastos)}</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          {[
            { rotulo: "R$ / km", valor: resumo.rsPorKm === null ? "—" : brl(resumo.rsPorKm) },
            { rotulo: "R$ / hora", valor: resumo.rsPorHora === null ? "—" : brl(resumo.rsPorHora) },
            { rotulo: "Km rodados", valor: resumo.km > 0 ? num(resumo.km) : "—" },
            { rotulo: "Horas", valor: resumo.horas > 0 ? num(resumo.horas) : "—" },
          ].map((m) => (
            <div key={m.rotulo} className="rounded-xl border border-borda bg-card p-3">
              <p className="text-xs uppercase tracking-wider text-texto-sec">{m.rotulo}</p>
              <p className="mt-0.5 font-mono text-xl text-texto">{m.valor}</p>
            </div>
          ))}
        </section>

        <section className="rounded-xl border border-borda bg-card p-4">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-texto-sec">
            Últimos 7 dias
          </p>
          {temDadosGrafico ? (
            <GraficoSemana dados={grafico} />
          ) : (
            <div className="flex h-44 items-center justify-center text-center text-sm text-apagado">
              Sem lançamentos nos últimos 7 dias.
            </div>
          )}
        </section>
      </main>
      <NavBar />
    </>
  );
}
