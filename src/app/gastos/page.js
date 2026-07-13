import { prisma } from "@/lib/prisma";
import { getUsuarioSessao } from "@/lib/sessao";
import { listarVeiculos, sugerirVeiculo } from "@/lib/veiculos";
import { hojeISO, dateParaISO } from "@/lib/datas";
import { dataCurta } from "@/lib/format";
import Header from "@/components/Header";
import NavBar from "@/components/NavBar";
import FormGasto from "@/components/FormGasto";
import GastoItem from "@/components/GastoItem";

export const metadata = { title: "Gastos — Na Pista" };

export default async function PaginaGastos() {
  const usuario = await getUsuarioSessao();

  const veiculos = await listarVeiculos(usuario.id);
  const [gastos, veiculoSugerido] = await Promise.all([
    prisma.gasto.findMany({
      where: { usuarioId: usuario.id },
      orderBy: [{ data: "desc" }, { criadoEm: "desc" }],
      take: 20,
      include: { veiculo: { select: { nome: true } } },
    }),
    sugerirVeiculo(usuario.id, veiculos),
  ]);
  const varios = veiculos.length > 1;
  const opcoesVeiculo = veiculos.map((v) => ({ id: v.id, nome: v.nome }));

  // Serializa cada gasto num objeto simples (Decimal -> número, Date -> ISO)
  // que o GastoItem/FormGasto usam tanto pra exibir quanto pra editar.
  const itens = gastos.map((g) => ({
    id: g.id,
    categoria: g.categoria,
    valor: Number(g.valor),
    descricao: g.descricao,
    combustivel: g.combustivel,
    litros: g.litros == null ? null : Number(g.litros),
    odometro: g.odometro,
    veiculoId: g.veiculoId,
    veiculoNome: g.veiculo.nome,
    dataISO: dateParaISO(g.data),
    dataCurta: dataCurta(g.data),
  }));

  return (
    <>
      <Header nome={usuario.nome} />
      <main className="mx-auto max-w-md space-y-4 px-4 pb-28 pt-4">
        <h1 className="font-titulo text-xl font-semibold uppercase tracking-wider text-texto">
          Novo gasto
        </h1>
        <FormGasto
          hoje={hojeISO()}
          veiculos={opcoesVeiculo}
          veiculoSugerido={veiculoSugerido}
        />

        <h2 className="pt-2 font-titulo text-xl font-semibold uppercase tracking-wider text-texto">
          Últimos lançamentos
        </h2>
        {itens.length === 0 ? (
          <p className="rounded-xl border border-borda bg-card p-4 text-sm text-texto-sec">
            Nenhum gasto lançado ainda.
          </p>
        ) : (
          <div className="space-y-2">
            {itens.map((g) => (
              <GastoItem
                key={g.id}
                gasto={g}
                veiculos={opcoesVeiculo}
                mostrarVeiculo={varios}
              />
            ))}
          </div>
        )}
      </main>
      <NavBar />
    </>
  );
}
