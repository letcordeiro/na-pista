import { prisma } from "@/lib/prisma";
import { getUsuarioSessao } from "@/lib/sessao";
import { listarVeiculos } from "@/lib/veiculos";
import Header from "@/components/Header";
import NavBar from "@/components/NavBar";
import FormVeiculo from "@/components/FormVeiculo";
import VeiculoItem from "@/components/VeiculoItem";

export const metadata = { title: "Veículos — Na Pista" };

export default async function PaginaVeiculos() {
  const usuario = await getUsuarioSessao();

  const veiculos = await listarVeiculos(usuario.id);
  const contagem = await prisma.gasto.groupBy({
    by: ["veiculoId"],
    where: { usuarioId: usuario.id },
    _count: { _all: true },
  });
  const qtdPorVeiculo = Object.fromEntries(
    contagem.map((c) => [c.veiculoId, c._count._all])
  );

  return (
    <>
      <Header nome={usuario.nome} />
      <main className="mx-auto max-w-md space-y-4 px-4 pb-28 pt-4">
        <h1 className="font-titulo text-xl font-semibold uppercase tracking-wider text-texto">
          Meus veículos
        </h1>
        <FormVeiculo />

        <h2 className="pt-2 font-titulo text-xl font-semibold uppercase tracking-wider text-texto">
          Cadastrados
        </h2>
        <div className="space-y-3">
          {veiculos.map((v) => (
            <VeiculoItem
              key={v.id}
              veiculo={{
                id: v.id,
                nome: v.nome,
                modelo: v.modelo,
                placa: v.placa,
                consumoMedio: v.consumoMedio == null ? null : Number(v.consumoMedio),
              }}
              qtdGastos={qtdPorVeiculo[v.id] ?? 0}
            />
          ))}
        </div>
      </main>
      <NavBar />
    </>
  );
}
