"use client";

export default function Chip({ selecionado, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-11 rounded-lg border px-3.5 font-titulo text-sm font-semibold uppercase tracking-wide transition-colors ${
        selecionado
          ? "border-ambar bg-ambar/10 text-ambar"
          : "border-borda bg-superficie text-texto-sec"
      }`}
    >
      {children}
    </button>
  );
}
