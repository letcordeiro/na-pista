/**
 * Seed de DEMONSTRAÇÃO — movimento fictício para o painel não aparecer zerado.
 *
 * A conta de teste nasce vazia, e um painel de motorista com "R$ 0,00" e
 * "Sem lançamentos nos últimos 7 dias" não demonstra nada. Este script gera
 * 30 dias de ganhos, abastecimentos e despesas com valores plausíveis.
 *
 *     node scripts/seed-demo.mjs                  popula
 *     node scripts/seed-demo.mjs --limpar         remove só o que ele criou
 *
 * TRAVA: recusa rodar se a DATABASE_URL não for local.
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync, existsSync } from "node:fs";

if (existsSync(".env")) {
  for (const l of readFileSync(".env", "utf8").split("\n")) {
    const m = l.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) process.env[m[1]] ??= m[2].trim().replace(/^["']|["']$/g, "");
  }
}

const url = process.env.DATABASE_URL ?? "";
if (!/@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(url)) {
  console.error(
    "Recusado: DATABASE_URL não aponta para um banco local.\n" +
      "Este seed cria dados fictícios e nunca deve rodar em produção."
  );
  process.exit(1);
}

const EMAIL = "teste@napista.dev";
/** Descrição-marca: é o que a limpeza procura para não apagar nada além. */
const MARCA = "[demo]";

const prisma = new PrismaClient();
const dia = (n) => {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
};
const entre = (a, b) => a + Math.random() * (b - a);

async function principal() {
  const usuario = await prisma.usuario.findUnique({ where: { email: EMAIL } });
  if (!usuario) {
    console.error(`Usuário ${EMAIL} não existe. Crie a conta antes.`);
    process.exit(1);
  }

  // limpeza: ganhos do período e gastos marcados
  await prisma.gasto.deleteMany({
    where: { usuarioId: usuario.id, descricao: { startsWith: MARCA } },
  });
  await prisma.ganho.deleteMany({
    where: { usuarioId: usuario.id, data: { gte: dia(45) } },
  });

  if (process.argv.includes("--limpar")) {
    console.log("Dados de demonstração removidos.");
    return;
  }

  let veiculo = await prisma.veiculo.findFirst({ where: { usuarioId: usuario.id } });
  if (!veiculo) {
    veiculo = await prisma.veiculo.create({
      data: {
        usuarioId: usuario.id,
        nome: "Meu carro",
        modelo: "Onix 1.0",
        placa: "DQS4F18",
        consumoMedio: 11.5,
      },
    });
  }

  const APPS = ["Uber", "99", "inDrive", "Particular"];
  const ganhos = [];
  for (let d = 29; d >= 0; d--) {
    const data = dia(d);
    // domingo o motorista costuma folgar — deixa buraco no gráfico, como na vida
    if (data.getDay() === 0 && d % 2 === 0) continue;
    const quantos = Math.random() < 0.3 ? 1 : 2;
    for (let i = 0; i < quantos; i++) {
      ganhos.push({
        usuarioId: usuario.id,
        data,
        tipo: "dia",
        app: APPS[Math.floor(Math.random() * APPS.length)],
        valor: entre(70, 240).toFixed(2),
        km: entre(45, 180).toFixed(1),
        horas: entre(3, 8).toFixed(1),
      });
    }
  }
  await prisma.ganho.createMany({ data: ganhos });

  const gastos = [];
  for (let d = 28; d >= 0; d -= 4) {
    const litros = entre(22, 38);
    gastos.push({
      usuarioId: usuario.id,
      veiculoId: veiculo.id,
      data: dia(d),
      categoria: "Combustível",
      valor: (litros * entre(5.6, 6.3)).toFixed(2),
      combustivel: Math.random() < 0.4 ? "Etanol" : "Gasolina",
      litros: litros.toFixed(2),
      odometro: 84_000 + (28 - d) * 230,
      descricao: `${MARCA} abastecimento`,
    });
  }
  for (const [d, cat, valor] of [
    [22, "Manutenção", "320.00"],
    [14, "Lavagem", "60.00"],
    [9, "Pedágio", "28.40"],
    [3, "Alimentação", "45.00"],
  ]) {
    gastos.push({
      usuarioId: usuario.id,
      veiculoId: veiculo.id,
      data: dia(d),
      categoria: cat,
      valor,
      descricao: `${MARCA} ${cat.toLowerCase()}`,
    });
  }
  await prisma.gasto.createMany({ data: gastos });

  console.log(`${ganhos.length} ganho(s) e ${gastos.length} gasto(s) em 30 dias.`);
}

principal()
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
