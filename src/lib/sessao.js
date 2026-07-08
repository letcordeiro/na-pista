import { redirect } from "next/navigation";
import { auth } from "@/auth";

// Helper único de sessão — TODO handler/página/action lê o usuário daqui,
// nunca do client. Toda query filtra por este id.
export async function getUsuarioSessao() {
  const sessao = await auth();
  if (!sessao?.user?.id) redirect("/login");
  return {
    id: sessao.user.id,
    nome: sessao.user.name,
    email: sessao.user.email,
  };
}
