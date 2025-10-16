'use client';

import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface MiniChartProps {
  data: number[];
  color?: string;
  height?: number;
}

export function MiniChart({ data, color = '#00d4ff', height = 40 }: MiniChartProps) {
  // Convertir array de números a formato del gráfico
  const chartData = data.map((value, index) => ({
    value,
    index
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}