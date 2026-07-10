import { prisma } from "@/lib/prisma";
import { getUsuarioSessao } from "@/lib/sessao";
import { excluirGanho } from "@/lib/acoes";
import { hojeISO } from "@/lib/datas";
import { brl, num, dataCurta } from "@/lib/format";
import Header from "@/components/Header";
import NavBar from "@/components/NavBar";
import FormGanho from "@/components/FormGanho";
import ExcluirBotao from "@/components/ExcluirBotao";

export const metadata = { title: "Ganhos — Na Pista" };

export default async function PaginaGanhos() {
  const usuario = await getUsuarioSessao();

  const ganhos = await prisma.ganho.findMany({
    where: { usuarioId: usuario.id },
    orderBy: [{ data: "desc" }, { criadoEm: "desc" }],
    take: 20,
  });

  return (
    <>
      <Header nome={usuario.nome} />
      <main className="mx-auto max-w-md space-y-4 px-4 pb-28 pt-4">
        <h1 className="font-titulo text-xl font-semibold uppercase tracking-wider text-texto">
          Novo ganho
        </h1>
        <FormGanho hoje={hojeISO()} />

        <h2 className="pt-2 font-titulo text-xl font-semibold uppercase tracking-wider text-texto">
          Últimos lançamentos
        </h2>
        {ganhos.length === 0 ? (
          <p className="rounded-xl border border-borda bg-card p-4 text-sm text-texto-sec">
            Nenhum ganho lançado ainda.
          </p>
        ) : (
          <ul className="divide-y divide-borda overflow-hidden rounded-xl border border-borda bg-card">
            {ganhos.map((g) => (
              <li key={g.id} className="flex items-center gap-3 p-3">
                <span className="w-12 shrink-0 font-mono text-sm text-texto-sec">
                  {dataCurta(g.data)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-texto">
                    {g.app}
                    <span className="text-apagado">
                      {" · "}
                      {g.tipo === "dia" ? "fechamento do dia" : "corrida"}
                    </span>
                  </p>
                  {(g.km != null || g.horas != null) && (
                    <p className="font-mono text-xs text-texto-sec">
                      {g.km != null && `${num(g.km)} km`}
                      {g.km != null && g.horas != null && " · "}
                      {g.horas != null && `${num(g.horas)} h`}
                    </p>
                  )}
                </div>
                <span className="font-mono text-base font-medium text-ganho">
                  {brl(g.valor)}
                </span>
                <ExcluirBotao acao={excluirGanho.bind(null, g.id)} />
              </li>
            ))}
          </ul>
        )}
      </main>
      <NavBar />
    </>
  );
}
