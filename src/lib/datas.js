const TZ = "America/Sao_Paulo";

// "YYYY-MM-DD" de hoje no fuso de Brasília
export function hojeISO() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
}

// Colunas @db.Date são armazenadas como meia-noite UTC
export function isoParaDate(iso) {
  return new Date(`${iso}T00:00:00.000Z`);
}

export function dateParaISO(date) {
  return new Date(date).toISOString().slice(0, 10);
}

export function addDias(iso, n) {
  const d = isoParaDate(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return dateParaISO(d);
}

export function inicioDoMes(iso) {
  return `${iso.slice(0, 8)}01`;
}
