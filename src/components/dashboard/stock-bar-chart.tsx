"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Datum = { name: string; stock: number; minStock: number; low: boolean };

export function StockBarChart({ data }: { data: Datum[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted">
        Nenhum produto cadastrado ainda.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
        <CartesianGrid stroke="#241b38" vertical={false} />
        <XAxis
          dataKey="name"
          stroke="#6f6590"
          fontSize={10}
          tickLine={false}
          axisLine={false}
          interval={0}
          height={48}
          tickFormatter={(v: string) => (v.length > 12 ? v.slice(0, 11) + "…" : v)}
        />
        <YAxis
          stroke="#6f6590"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          width={32}
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ fill: "#ffffff10" }}
          contentStyle={{
            background: "#14101e",
            border: "1px solid #34264f",
            borderRadius: 8,
          }}
          labelStyle={{ color: "#968ab3" }}
          itemStyle={{ color: "#e9e6f2" }}
          formatter={(value, _name, item) => [
            `${value} un.${(item?.payload as Datum | undefined)?.low ? " ⚠ abaixo do mínimo" : ""}`,
            "Estoque",
          ]}
        />
        <Bar dataKey="stock" radius={[4, 4, 0, 0]} maxBarSize={56}>
          {data.map((d) => (
            <Cell key={d.name} fill={d.low ? "#f59e0b" : "#8c5aff"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
