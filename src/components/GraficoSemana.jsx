"use client";

import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { C } from "@/lib/tokens";
import { brl } from "@/lib/format";

function TooltipCustom({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-borda bg-superficie px-3 py-2 text-xs">
      <p className="mb-1 font-titulo font-semibold uppercase tracking-wider text-texto-sec">
        {label}
      </p>
      {payload.map((p) => (
        <p key={p.dataKey} className="font-mono" style={{ color: p.fill }}>
          {p.dataKey === "ganhos" ? "Ganhos" : "Gastos"}: {brl(p.value)}
        </p>
      ))}
    </div>
  );
}

export default function GraficoSemana({ dados }) {
  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dados} margin={{ top: 8, right: 0, left: 0, bottom: 0 }} barGap={2}>
          <XAxis
            dataKey="rotulo"
            axisLine={false}
            tickLine={false}
            tick={{ fill: C.textoSec, fontSize: 11, fontFamily: "var(--font-mono)" }}
          />
          <Tooltip content={<TooltipCustom />} cursor={{ fill: C.superficie }} />
          <Bar dataKey="ganhos" fill={C.ganho} radius={[4, 4, 0, 0]} />
          <Bar dataKey="gastos" fill={C.gasto} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
