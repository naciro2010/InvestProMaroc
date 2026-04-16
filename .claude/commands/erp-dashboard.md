# /erp-dashboard - Add Dashboard KPIs/Charts

Add KPI cards and charts to the dashboard or a feature page.

## Input

The user provides: metrics/KPIs to display.

## Steps

1. **Backend** - Create stats endpoint:
   - `GET /api/[entity]/dashboard-stats`
   - Aggregated queries (SUM, COUNT, AVG)
   - Strongly typed DTO (NEVER `Any`)

2. **Frontend KPI Cards:**
   - Use `componentStyles.statCard`
   - Icon + value + label + trend
   - Responsive grid layout (4 columns desktop, 2 mobile)

3. **Charts** (using Recharts):
   - `BarChart` for comparisons
   - `LineChart` for trends
   - `PieChart` / `DonutChart` for distributions
   - Use design system colors
   - French labels and formatting

4. **Layout:**
   - KPI row at top
   - Charts in 2-column grid below
   - Each chart in its own micro-component (< 300 lines)
   - Independent data loading per component

## Template
```tsx
import { colors, componentStyles } from '@/lib/designSystem'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

function StatsCard({ icon, label, value, trend }: StatsCardProps) {
  return (
    <Card sx={componentStyles.statCard}>
      {icon}
      <Typography variant="h4">{value}</Typography>
      <Typography color="textSecondary">{label}</Typography>
      {trend && <Chip label={trend} color={trend > 0 ? 'success' : 'error'} />}
    </Card>
  )
}
```
