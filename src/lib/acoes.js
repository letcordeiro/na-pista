"use server";

import { revalidatePath } from "next/cache";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/auth";
import { getUsuarioSessao } from "@/lib/sessao";
import { isoParaDate } from "@/lib/datas";
import {
  APPS,
  TIPOS_GANHO,
  CATEGORIAS_GASTO,
  COMBUSTIVEIS,
} from "@/lib/constantes";

// "35,50" -> 35.5 · retorna null se vazio/inválido
function lerNumero(formData, campo) {
  const bruto = String(formData.get(campo) ?? "").trim();
  if (!bruto) return null;
  const n = parseFloat(bruto.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function lerData(formData) {
  const iso = String(formData.get("data") ?? "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : null;
}

// ---------- Conta ----------

export async function cadastrar(prevState, formData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const senha = String(formData.get("senha") ?? "");

  if (!nome) return { erro: "Informe seu nome." };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { erro: "E-mail inválido." };
  if (senha.length < 6) return { erro: "A senha precisa de pelo menos 6 caracteres." };

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) return { erro: "Já existe uma conta com esse e-mail." };

  const senhaHash = await bcrypt.hash(senha, 10);
  await prisma.usuario.create({ data: { nome, email, senhaHash } });

  try {
    await signIn("credentials", { email, senha, redirectTo: "/" });
  } catch (erro) {
    if (erro instanceof AuthError) {
      return { erro: "Conta criada, mas o login falhou. Entre pela tela de login." };
    }
    throw erro; // redirect do Next
  }
}

export async function entrar(prevState, formData) {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const senha = String(formData.get("senha") ?? "");

  try {
    await signIn("credentials", { email, senha, redirectTo: "/" });
  } catch (erro) {
    if (erro instanceof AuthError) {
      return { erro: "E-mail ou senha incorretos." };
    }
    throw erro; // redirect do Next
  }
}

export async function sair() {
  await signOut({ redirectTo: "/login" });
}

// ---------- Ganhos ----------

export async function criarGanho(prevState, formData) {
  const usuario = await getUsuarioSessao();

  const tipo = String(formData.get("tipo") ?? "");
  const app = String(formData.get("app") ?? "");
  const valor = lerNumero(formData, "valor");
  const km = lerNumero(formData, "km");
  const horas = lerNumero(formData, "horas");
  const dataISO = lerData(formData);

  if (!TIPOS_GANHO.some((t) => t.valor === tipo)) return { erro: "Escolha o tipo." };
  if (!APPS.includes(app)) return { erro: "Escolha o app." };
  if (!valor || valor <= 0) return { erro: "Informe o valor." };
  if (!dataISO) return { erro: "Informe a data." };
  if (km !== null && km < 0) return { erro: "Km inválido." };
  if (horas !== null && (horas < 0 || horas > 24)) return { erro: "Horas inválidas." };

  await prisma.ganho.create({
    data: {
      usuarioId: usuario.id,
      data: isoParaDate(dataISO),
      tipo,
      app,
      valor,
      km,
      horas,
    },
  });

  revalidatePath("/");
  revalidatePath("/ganhos");
  return { ok: true };
}

export async function excluirGanho(id) {
  const usuario = await getUsuarioSessao();
  await prisma.ganho.deleteMany({
    where: { id: String(id), usuarioId: usuario.id },
  });
  revalidatePath("/");
  revalidatePath("/ganhos");
}

// ---------- Gastos ----------

export async function criarGasto(prevState, formData) {
  const usuario = await getUsuarioSessao();

  const categoria = String(formData.get("categoria") ?? "");
  const valor = lerNumero(formData, "valor");
  const dataISO = lerData(formData);
  const descricao = String(formData.get("descricao") ?? "").trim() || null;
  const veiculoId = String(formData.get("veiculoId") ?? "");

  if (!CATEGORIAS_GASTO.includes(categoria)) return { erro: "Escolha a categoria." };
  if (!valor || valor <= 0) return { erro: "Informe o valor." };
  if (!dataISO) return { erro: "Informe a data." };

  const veiculo = await prisma.veiculo.findFirst({
    where: { id: veiculoId, usuarioId: usuario.id },
    select: { id: true },
  });
  if (!veiculo) return { erro: "Escolha o veículo." };

  let combustivel = null;
  let litros = null;
  let odometro = null;

  if (categoria === "Combustível") {
    combustivel = String(formData.get("combustivel") ?? "");
    if (!COMBUSTIVEIS.includes(combustivel)) {
      return { erro: "Escolha o combustível (Etanol ou Gasolina)." };
    }
    litros = lerNumero(formData, "litros");
    const odoNum = lerNumero(formData, "odometro");
    odometro = odoNum !== null ? Math.round(odoNum) : null;
    if (litros !== null && litros <= 0) return { erro: "Litros inválidos." };
    if (odometro !== null && odometro <= 0) return { erro: "Odômetro inválido." };
  }

  await prisma.gasto.create({
    data: {
      usuarioId: usuario.id,
      veiculoId,
      data: isoParaDate(dataISO),
      categoria,
      valor,
      descricao,
      combustivel,
      litros,
      odometro,
    },
  });

  revalidatePath("/");
  revalidatePath("/gastos");
  revalidatePath("/combustivel");
  return { ok: true };
}

export async function excluirGasto(id) {
  const usuario = await getUsuarioSessao();
  await prisma.gasto.deleteMany({
    where: { id: String(id), usuarioId: usuario.id },
  });
  revalidatePath("/");
  revalidatePath("/gastos");
  revalidatePath("/combustivel");
}

// ---------- Veículos ----------

function lerDadosVeiculo(formData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const modelo = String(formData.get("modelo") ?? "").trim() || null;
  const placa = String(formData.get("placa") ?? "").trim().toUpperCase() || null;
  const consumoMedio = lerNumero(formData, "consumoMedio");
  return { nome, modelo, placa, consumoMedio };
}

export async function criarVeiculo(prevState, formData) {
  const usuario = await getUsuarioSessao();
  const { nome, modelo, placa, consumoMedio } = lerDadosVeiculo(formData);

  if (!nome) return { erro: "Dê um nome ao veículo." };
  if (consumoMedio !== null && consumoMedio <= 0) {
    return { erro: "Consumo médio inválido." };
  }

  await prisma.veiculo.create({
    data: { usuarioId: usuario.id, nome, modelo, placa, consumoMedio },
  });

  revalidatePath("/veiculos");
  revalidatePath("/gastos");
  return { ok: true };
}

export async function editarVeiculo(prevState, formData) {
  const usuario = await getUsuarioSessao();
  const id = String(formData.get("id") ?? "");
  const { nome, modelo, placa, consumoMedio } = lerDadosVeiculo(formData);

  if (!nome) return { erro: "Dê um nome ao veículo." };
  if (consumoMedio !== null && consumoMedio <= 0) {
    return { erro: "Consumo médio inválido." };
  }

  const res = await prisma.veiculo.updateMany({
    where: { id, usuarioId: usuario.id },
    data: { nome, modelo, placa, consumoMedio },
  });
  if (res.count === 0) return { erro: "Veículo não encontrado." };

  revalidatePath("/veiculos");
  revalidatePath("/gastos");
  return { ok: true };
}

export async function excluirVeiculo(id) {
  const usuario = await getUsuarioSessao();
  const veiculoId = String(id);

  const [total, comGastos] = await Promise.all([
    prisma.veiculo.count({ where: { usuarioId: usuario.id } }),
    prisma.gasto.count({ where: { usuarioId: usuario.id, veiculoId } }),
  ]);

  if (total <= 1) {
    return { erro: "Você precisa ter pelo menos um veículo." };
  }
  if (comGastos > 0) {
    return {
      erro: `Este veículo tem ${comGastos} lançamento(s). Remova ou realoque os gastos antes de excluí-lo.`,
    };
  }

  await prisma.veiculo.deleteMany({
    where: { id: veiculoId, usuarioId: usuario.id },
  });

  revalidatePath("/veiculos");
  revalidatePath("/gastos");
  return { ok: true };
}
