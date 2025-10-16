'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader } from '@/components/ui/card2';

interface PortfolioChartProps {
  data: {
    date: string;
    value: number;
  }[];
  title?: string;
  height?: number;
}

export function PortfolioChart({ data, title = 'Rendimiento del Portafolio', height = 300 }: PortfolioChartProps) {
  // Formatear datos para el gráfico
  const chartData = data.map(item => ({
    name: new Date(item.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
    valor: item.value
  }));

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="name" 
              stroke="rgba(255,255,255,0.5)"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.5)"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{
                background: '#1e293b',
                border: '1px solid rgba(0, 212, 255, 0.3)',
                borderRadius: '8px',
                color: '#fff'
              }}
              labelStyle={{ color: '#00d4ff' }}
              formatter={(value: any) => [`$${value.toLocaleString()}`, 'Valor']}
            />
            <Legend 
              wrapperStyle={{ color: '#fff' }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="valor"
              stroke="#00d4ff"
              strokeWidth={3}
              dot={{ fill: '#00d4ff', r: 4 }}
              activeDot={{ r: 6 }}
              name="Valor del Portafolio"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}