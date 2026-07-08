import { redirect } from "next/navigation";
import { auth } from "@/auth";
import CartaoAuth from "@/components/CartaoAuth";
import { FormLogin } from "@/components/FormAuth";

export const metadata = { title: "Entrar — Na Pista" };

export default async function PaginaLogin() {
  const sessao = await auth();
  if (sessao?.user?.id) redirect("/");

  return (
    <CartaoAuth>
      <FormLogin />
    </CartaoAuth>
  );
}
