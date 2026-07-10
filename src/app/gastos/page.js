import { prisma } from "@/lib/prisma";
import { getUsuarioSessao } from "@/lib/sessao";
import { excluirGasto } from "@/lib/acoes";
import { hojeISO } from "@/lib/datas";
import { brl, num, dataCurta } from "@/lib/format";
import Header from "@/components/Header";
import NavBar from "@/components/NavBar";
import FormGasto from "@/components/FormGasto";
import ExcluirBotao from "@/components/ExcluirBotao";

export const metadata = { title: "Gastos — Na Pista" };

export default async function PaginaGastos() {
  const usuario = await getUsuarioSessao();

  const gastos = await prisma.gasto.findMany({
    where: { usuarioId: usuario.id },
    orderBy: [{ data: "desc" }, { criadoEm: "desc" }],
    take: 20,
  });

  return (
    <>
      <Header nome={usuario.nome} />
      <main className="mx-auto max-w-md space-y-4 px-4 pb-28 pt-4">
        <h1 className="font-titulo text-xl font-semibold uppercase tracking-wider text-texto">
          Novo gasto
        </h1>
        <FormGasto hoje={hojeISO()} />

        <h2 className="pt-2 font-titulo text-xl font-semibold uppercase tracking-wider text-texto">
          Últimos lançamentos
        </h2>
        {gastos.length === 0 ? (
          <p className="rounded-xl border border-borda bg-card p-4 text-sm text-texto-sec">
            Nenhum gasto lançado ainda.
          </p>
        ) : (
          <ul className="divide-y divide-borda overflow-hidden rounded-xl border border-borda bg-card">
            {gastos.map((g) => (
              <li key={g.id} className="flex items-center gap-3 p-3">
                <span className="w-12 shrink-0 font-mono text-sm text-texto-sec">
                  {dataCurta(g.data)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-texto">
                    {g.categoria}
                    {g.combustivel && (
                      <span className="text-apagado">{` · ${g.combustivel}`}</span>
                    )}
                  </p>
                  {g.litros != null ? (
                    <p className="font-mono text-xs text-texto-sec">
                      {num(g.litros, 2)} L
                      {g.odometro != null && ` · ${g.odometro.toLocaleString("pt-BR")} km`}
                    </p>
                  ) : (
                    g.descricao && (
                      <p className="truncate text-xs text-texto-sec">{g.descricao}</p>
                    )
                  )}
                </div>
                <span className="font-mono text-base font-medium text-gasto">
                  {brl(g.valor)}
                </span>
                <ExcluirBotao acao={excluirGasto.bind(null, g.id)} />
              </li>
            ))}
          </ul>
        )}
      </main>
      <NavBar />
    </>
  );
}
