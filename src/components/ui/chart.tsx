
import * as React from "react"
import { BarChart as RechartsBarChart, Bar, XAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts"

interface BarChartProps {
  data: any[]
  children?: React.ReactNode
}

export function BarChart({ data, children }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#8c9aae"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1A1F2C',
            borderColor: '#2a2e39',
            borderRadius: '8px',
          }}
        />
        <ReferenceLine y={0} stroke="#2a2e39" />
        {children}
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}

interface BarStackProps {
  keys: string[]
  colors: string[]
  labels?: string[]
}

export function BarStack({ keys, colors, labels }: BarStackProps) {
  return (
    <React.Fragment>
      {keys.map((key, index) => (
        <Bar
          key={key}
          dataKey={key}
          fill={colors[index % colors.length]}
          name={labels?.[index] || key}
          stackId="stack"
        />
      ))}
    </React.Fragment>
  )
}
