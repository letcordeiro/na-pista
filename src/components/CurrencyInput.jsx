"use client";

import { useState } from "react";
import { brl } from "@/lib/format";

// Entrada monetária com máscara BRL, digitação da direita pra esquerda
// (montando a partir dos centavos). O que aparece é sempre formatado
// ("R$ 1.500,00"); o que vai pro form (input hidden `name`) é o número
// puro em reais ("1500.00"), no mesmo formato que o server action já lê.
//
// Para limpar após salvar, o pai remonta via `key` (ex.: key={salvos}).
//
// Props:
// - name: nome do campo hidden enviado no submit (padrão "valor")
// - defaultReais: valor inicial em reais (ex.: ao editar um lançamento)
// - required, className, placeholder, autoFocus: repassados ao input visível
export default function CurrencyInput({
  name = "valor",
  defaultReais = null,
  required = false,
  className = "",
  placeholder = "R$ 0,00",
  autoFocus = false,
}) {
  const inicial =
    defaultReais != null && Number.isFinite(defaultReais)
      ? Math.round(defaultReais * 100)
      : 0;
  const [centavos, setCentavos] = useState(inicial);

  function aoDigitar(e) {
    // Junta todos os dígitos do que está no campo e reinterpreta como
    // centavos. Digitar no fim "empurra" da direita pra esquerda; apagar
    // encurta. Máx. 11 dígitos => R$ 999.999.999,99.
    const digitos = e.target.value.replace(/\D/g, "").slice(0, 11);
    setCentavos(digitos ? parseInt(digitos, 10) : 0);
  }

  const exibicao = centavos === 0 ? "" : brl(centavos / 100);
  const valorPuro = centavos === 0 ? "" : (centavos / 100).toFixed(2);

  return (
    <>
      <input
        type="text"
        inputMode="numeric"
        value={exibicao}
        onChange={aoDigitar}
        placeholder={placeholder}
        required={required}
        autoFocus={autoFocus}
        className={className}
      />
      <input type="hidden" name={name} value={valorPuro} />
    </>
  );
}
