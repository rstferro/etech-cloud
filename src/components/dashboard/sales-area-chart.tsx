"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function SalesAreaChart({
  data,
}: {
  data: { label: string; total: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -6, bottom: 0 }}>
        <defs>
          <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8c5aff" stopOpacity={0.55} />
            <stop offset="100%" stopColor="#8c5aff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#241b38" vertical={false} />
        <XAxis
          dataKey="label"
          stroke="#6f6590"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          minTickGap={16}
        />
        <YAxis
          stroke="#6f6590"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          width={46}
          tickFormatter={(v: number) =>
            v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
          }
        />
        <Tooltip
          contentStyle={{
            background: "#14101e",
            border: "1px solid #34264f",
            borderRadius: 8,
          }}
          labelStyle={{ color: "#968ab3" }}
          itemStyle={{ color: "#e9e6f2" }}
          formatter={(value) => [brl.format(Number(value)), "Vendas"]}
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke="#a78bff"
          strokeWidth={2}
          fill="url(#salesFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
