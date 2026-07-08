// Cálculos puros — sem React, sem Prisma. Todos os itens chegam com
// números JS simples (Decimal já convertido) e datas como "YYYY-MM-DD".

function soma(valores) {
  return valores.reduce((total, v) => total + (Number(v) || 0), 0);
}

// Resumo de um período: líquido = bruto − gastos;
// R$/km = líquido ÷ km lançados; R$/hora = líquido ÷ horas lançadas
export function calcularResumo(ganhos, gastos) {
  const bruto = soma(ganhos.map((g) => g.valor));
  const totalGastos = soma(gastos.map((g) => g.valor));
  const km = soma(ganhos.map((g) => g.km));
  const horas = soma(ganhos.map((g) => g.horas));
  const liquido = bruto - totalGastos;
  return {
    bruto,
    totalGastos,
    liquido,
    km,
    horas,
    rsPorKm: km > 0 ? liquido / km : null,
    rsPorHora: horas > 0 ? liquido / horas : null,
  };
}

// Série diária para gráfico: um ponto por dia com ganhos e gastos do dia
export function serieDiaria(ganhos, gastos, diasISO) {
  return diasISO.map((dia) => ({
    dia,
    ganhos: soma(ganhos.filter((g) => g.dataISO === dia).map((g) => g.valor)),
    gastos: soma(gastos.filter((g) => g.dataISO === dia).map((g) => g.valor)),
  }));
}

// km/L pelo método tanque cheio: ordena abastecimentos por odômetro;
// em cada par consecutivo, km do trecho = odo atual − odo anterior,
// litros = do abastecimento ATUAL, combustível consumido = do ANTERIOR.
// Agrega por combustível: km/L = Σkm ÷ Σlitros.
export function calcularKmPorLitro(abastecimentos) {
  const validos = abastecimentos
    .filter((a) => a.odometro != null && Number(a.litros) > 0)
    .sort((a, b) => a.odometro - b.odometro);

  const acumulado = {};
  for (let i = 1; i < validos.length; i++) {
    const anterior = validos[i - 1];
    const atual = validos[i];
    const kmTrecho = atual.odometro - anterior.odometro;
    if (kmTrecho <= 0 || !anterior.combustivel) continue;
    const comb = anterior.combustivel;
    acumulado[comb] = acumulado[comb] || { km: 0, litros: 0 };
    acumulado[comb].km += kmTrecho;
    acumulado[comb].litros += Number(atual.litros);
  }

  const resultado = {};
  for (const [comb, { km, litros }] of Object.entries(acumulado)) {
    if (litros > 0) resultado[comb] = km / litros;
  }
  return resultado;
}

// Último preço por litro de cada combustível (abastecimento mais recente)
export function ultimoPrecoLitro(abastecimentos) {
  const ordenados = [...abastecimentos]
    .filter((a) => a.combustivel && Number(a.litros) > 0 && Number(a.valor) > 0)
    .sort((a, b) =>
      a.dataISO === b.dataISO
        ? (b.criadoEmISO || "").localeCompare(a.criadoEmISO || "")
        : b.dataISO.localeCompare(a.dataISO)
    );

  const precos = {};
  for (const a of ordenados) {
    if (precos[a.combustivel] == null) {
      precos[a.combustivel] = Number(a.valor) / Number(a.litros);
    }
  }
  return precos;
}

// R$/km de cada combustível = último preço/L ÷ km/L medido
export function custoPorKmCombustivel(kmPorLitro, precosLitro) {
  const custos = {};
  for (const [comb, kml] of Object.entries(kmPorLitro)) {
    if (kml > 0 && precosLitro[comb] != null) {
      custos[comb] = precosLitro[comb] / kml;
    }
  }
  return custos;
}

// "Compensando" = combustível com o MENOR R$/km medido
export function combustivelCompensando(custosPorKm) {
  const entradas = Object.entries(custosPorKm);
  if (entradas.length === 0) return null;
  entradas.sort((a, b) => a[1] - b[1]);
  return entradas[0][0];
}
