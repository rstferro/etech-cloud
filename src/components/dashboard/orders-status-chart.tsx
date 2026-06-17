"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

type Datum = { status: string; label: string; color: string; count: number };

export function OrdersStatusChart({ data }: { data: Datum[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  const slices = data.filter((d) => d.count > 0);

  if (total === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted">
        Nenhuma OS cadastrada ainda.
      </div>
    );
  }

  return (
    <div className="flex h-full items-center gap-4">
      <div className="h-full min-w-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="count"
              nameKey="label"
              innerRadius={52}
              outerRadius={84}
              paddingAngle={2}
              stroke="none"
            >
              {slices.map((d) => (
                <Cell key={d.status} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#14101e",
                border: "1px solid #34264f",
                borderRadius: 8,
              }}
              itemStyle={{ color: "#e9e6f2" }}
              formatter={(value, name) => [`${value} OS`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="flex shrink-0 flex-col gap-2 text-xs">
        {data.map((d) => (
          <li key={d.status} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: d.color }}
            />
            <span className="text-muted">{d.label}</span>
            <span className="font-medium text-foreground">{d.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
