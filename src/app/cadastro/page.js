import { redirect } from "next/navigation";
import { auth } from "@/auth";
import CartaoAuth from "@/components/CartaoAuth";
import { FormCadastro } from "@/components/FormAuth";

export const metadata = { title: "Criar conta — Na Pista" };

export default async function PaginaCadastro() {
  const sessao = await auth();
  if (sessao?.user?.id) redirect("/");

  return (
    <CartaoAuth>
      <FormCadastro />
    </CartaoAuth>
  );
}
