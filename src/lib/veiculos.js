import { prisma } from "@/lib/prisma";

// Garante que o usuário tenha ao menos um veículo. Contas criadas depois da
// migração de veículos ainda não têm o "Meu carro" padrão — cria na 1ª vez.
export async function garantirVeiculoPadrao(usuarioId) {
  const qtd = await prisma.veiculo.count({ where: { usuarioId } });
  if (qtd === 0) {
    await prisma.veiculo.create({
      data: { usuarioId, nome: "Meu carro" },
    });
  }
}

export async function listarVeiculos(usuarioId) {
  await garantirVeiculoPadrao(usuarioId);
  return prisma.veiculo.findMany({
    where: { usuarioId },
    orderBy: { criadoEm: "asc" },
  });
}

// Sugere o veículo do último gasto lançado; se não houver, o primeiro veículo.
export async function sugerirVeiculo(usuarioId, veiculos) {
  const ultimo = await prisma.gasto.findFirst({
    where: { usuarioId },
    orderBy: [{ data: "desc" }, { criadoEm: "desc" }],
    select: { veiculoId: true },
  });
  if (ultimo && veiculos.some((v) => v.id === ultimo.veiculoId)) {
    return ultimo.veiculoId;
  }
  return veiculos[0]?.id ?? null;
}
