"use client";

import { useActionState } from "react";
import Link from "next/link";
import { entrar, cadastrar } from "@/lib/acoes";

const CAMPO =
  "h-13 w-full rounded-lg border border-borda bg-superficie px-3 text-base text-texto outline-none focus:border-ambar";

export function FormLogin() {
  const [estado, agir, pendente] = useActionState(entrar, null);

  return (
    <form action={agir} className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-wider text-texto-sec">
          E-mail
        </span>
        <input name="email" type="email" autoComplete="email" required className={CAMPO} />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-wider text-texto-sec">
          Senha
        </span>
        <input
          name="senha"
          type="password"
          autoComplete="current-password"
          required
          className={CAMPO}
        />
      </label>

      {estado?.erro && <p className="text-sm text-gasto">{estado.erro}</p>}

      <button
        disabled={pendente}
        className="h-14 w-full rounded-xl bg-ambar font-titulo text-lg font-bold uppercase tracking-widest text-fundo transition-opacity disabled:opacity-60"
      >
        {pendente ? "Entrando…" : "Entrar"}
      </button>

      <p className="text-center text-sm text-texto-sec">
        Primeira vez aqui?{" "}
        <Link href="/cadastro" className="font-semibold text-ambar">
          Criar conta
        </Link>
      </p>
    </form>
  );
}

export function FormCadastro() {
  const [estado, agir, pendente] = useActionState(cadastrar, null);

  return (
    <form action={agir} className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-wider text-texto-sec">
          Nome
        </span>
        <input name="nome" autoComplete="name" required className={CAMPO} />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-wider text-texto-sec">
          E-mail
        </span>
        <input name="email" type="email" autoComplete="email" required className={CAMPO} />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-wider text-texto-sec">
          Senha (mín. 6 caracteres)
        </span>
        <input
          name="senha"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
          className={CAMPO}
        />
      </label>

      {estado?.erro && <p className="text-sm text-gasto">{estado.erro}</p>}

      <button
        disabled={pendente}
        className="h-14 w-full rounded-xl bg-ambar font-titulo text-lg font-bold uppercase tracking-widest text-fundo transition-opacity disabled:opacity-60"
      >
        {pendente ? "Criando conta…" : "Criar conta"}
      </button>

      <p className="text-center text-sm text-texto-sec">
        Já tem conta?{" "}
        <Link href="/login" className="font-semibold text-ambar">
          Entrar
        </Link>
      </p>
    </form>
  );
}
