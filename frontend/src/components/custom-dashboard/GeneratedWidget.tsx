/**
 * GeneratedWidget - Claude-like artifact card wrapping visualizations.
 *
 * Clean, minimal artifact card with:
 * - Compact header with title and controls
 * - Visualization type switcher
 * - CSV export
 * - Expandable interpretation panel
 */

import React, { useState } from 'react'
import {
  Box, Paper, Typography, IconButton, Tooltip, ToggleButtonGroup, ToggleButton,
  Alert, Collapse,
} from '@mui/material'
import {
  X, BarChart3, Table2, PieChart, TrendingUp, Download,
  ChevronUp, ChevronDown, Info, LayoutDashboard,
} from 'lucide-react'
import { colors, typography, borders } from '@/lib/designSystem'
import DynamicTable from './DynamicTable'
import DynamicChart from './DynamicChart'
import type { ParsedInstruction, VisualizationType } from './instructionParser'
import type { FetchedData } from './dataFetcher'

interface GeneratedWidgetProps {
  instruction: ParsedInstruction
  data: FetchedData
  onRemove: () => void
  originalText: string
}

const VISUALIZATION_OPTIONS: Array<{ value: VisualizationType; icon: React.ReactNode; label: string }> = [
  { value: 'table', icon: <Table2 className="w-4 h-4" />, label: 'Tableau' },
  { value: 'bar', icon: <BarChart3 className="w-4 h-4" />, label: 'Barres' },
  { value: 'pie', icon: <PieChart className="w-4 h-4" />, label: 'Camembert' },
  { value: 'line', icon: <TrendingUp className="w-4 h-4" />, label: 'Courbe' },
  { value: 'kpi', icon: <LayoutDashboard className="w-4 h-4" />, label: 'KPI' },
]

function exportToCSV(data: FetchedData, title: string): void {
  const headers = data.columns.map((c) => c.label).join(';')
  const rows = data.rows.map((row) =>
    data.columns.map((col) => {
      const val = row[col.key]
      return typeof val === 'number' ? val.toString().replace('.', ',') : `"${String(val ?? '')}"`
    }).join(';')
  )
  const csv = [headers, ...rows].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${title.replace(/[^a-zA-Z0-9àâéèêëïîôùûüç-]/g, '_')}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

const GeneratedWidget = ({ instruction, data, onRemove, originalText }: GeneratedWidgetProps) => {
  const [vizType, setVizType] = useState<VisualizationType>(instruction.visualization)
  const [collapsed, setCollapsed] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)

  const handleVizChange = (_: React.MouseEvent<HTMLElement>, newType: VisualizationType | null) => {
    if (newType) setVizType(newType)
  }

  const hasData = data.rows.length > 0

  return (
    <Paper sx={{
      border: `1px solid ${colors.neutral[200]}`,
      borderRadius: borders.radius.lg,
      overflow: 'hidden',
      mb: 2,
      backgroundColor: colors.surface,
      boxShadow: 'none',
      '&:hover': {
        borderColor: colors.neutral[300],
      },
      transition: 'border-color 0.15s ease',
    }}>
      {/* Header - Compact artifact-style */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: 1.25,
        borderBottom: collapsed ? 'none' : `1px solid ${colors.neutral[100]}`,
        backgroundColor: colors.neutral[25],
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
          {/* Artifact type icon */}
          <Box sx={{
            width: 28,
            height: 28,
            borderRadius: borders.radius.base,
            backgroundColor: colors.primary[50],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            {vizType === 'table'
              ? <Table2 className="w-3.5 h-3.5" style={{ color: colors.primary[600] }} />
              : vizType === 'pie'
                ? <PieChart className="w-3.5 h-3.5" style={{ color: colors.primary[600] }} />
                : vizType === 'line'
                  ? <TrendingUp className="w-3.5 h-3.5" style={{ color: colors.primary[600] }} />
                  : vizType === 'kpi'
                    ? <LayoutDashboard className="w-3.5 h-3.5" style={{ color: colors.primary[600] }} />
                    : <BarChart3 className="w-3.5 h-3.5" style={{ color: colors.primary[600] }} />
            }
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{
              fontSize: typography.sizes.sm,
              fontWeight: typography.weights.semibold,
              color: colors.textPrimary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              lineHeight: 1.3,
            }}>
              {instruction.title}
            </Typography>
            {hasData && (
              <Typography sx={{
                fontSize: typography.sizes['2xs'],
                color: colors.neutral[400],
                lineHeight: 1.2,
              }}>
                {data.totalCount} élément{data.totalCount > 1 ? 's' : ''}
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, flexShrink: 0 }}>
          {/* Visualization toggle */}
          <ToggleButtonGroup
            value={vizType}
            exclusive
            onChange={handleVizChange}
            size="small"
            sx={{
              '& .MuiToggleButton-root': {
                padding: '3px 5px',
                border: 'none',
                borderRadius: `${borders.radius.base} !important`,
                color: colors.neutral[400],
                '&.Mui-selected': {
                  backgroundColor: colors.primary[50],
                  color: colors.primary[700],
                },
                '&:hover': {
                  backgroundColor: colors.neutral[50],
                },
              },
            }}
          >
            {VISUALIZATION_OPTIONS.map((opt) => (
              <ToggleButton key={opt.value} value={opt.value}>
                <Tooltip title={opt.label}>{opt.icon as React.ReactElement}</Tooltip>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <Box sx={{ width: '1px', height: 20, backgroundColor: colors.neutral[200], mx: 0.5 }} />

          {/* Export CSV */}
          <Tooltip title="Exporter CSV">
            <IconButton size="small" onClick={() => exportToCSV(data, instruction.title)} sx={{ color: colors.neutral[400] }}>
              <Download className="w-3.5 h-3.5" />
            </IconButton>
          </Tooltip>

          {/* Explanation toggle */}
          <Tooltip title="Détails">
            <IconButton size="small" onClick={() => setShowExplanation(!showExplanation)} sx={{
              color: showExplanation ? colors.primary[600] : colors.neutral[400],
            }}>
              <Info className="w-3.5 h-3.5" />
            </IconButton>
          </Tooltip>

          {/* Collapse */}
          <IconButton size="small" onClick={() => setCollapsed(!collapsed)} sx={{ color: colors.neutral[400] }}>
            {collapsed
              ? <ChevronDown className="w-3.5 h-3.5" />
              : <ChevronUp className="w-3.5 h-3.5" />
            }
          </IconButton>

          {/* Remove */}
          <Tooltip title="Supprimer">
            <IconButton size="small" onClick={onRemove} sx={{
              color: colors.neutral[400],
              '&:hover': { color: colors.danger[600] },
            }}>
              <X className="w-3.5 h-3.5" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Warnings */}
      <Collapse in={!collapsed && instruction.warnings.length > 0}>
        <Box sx={{ px: 2, pt: 1 }}>
          {instruction.warnings.map((warning, idx) => (
            <Alert key={idx} severity="info" sx={{
              mb: 0.5,
              py: 0,
              fontSize: typography.sizes.xs,
              borderRadius: borders.radius.base,
              '& .MuiAlert-icon': { fontSize: 16 },
            }}>
              {warning}
            </Alert>
          ))}
        </Box>
      </Collapse>

      {/* Parsing explanation */}
      <Collapse in={!collapsed && showExplanation && instruction.explanation.steps.length > 0}>
        <Box sx={{
          px: 2,
          py: 1.5,
          backgroundColor: colors.neutral[25],
          borderBottom: `1px solid ${colors.neutral[100]}`,
          borderTop: `1px solid ${colors.neutral[100]}`,
        }}>
          <Typography sx={{
            fontSize: typography.sizes['2xs'],
            fontWeight: typography.weights.semibold,
            color: colors.neutral[400],
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            mb: 0.5,
          }}>
            Interprétation
          </Typography>
          <Typography sx={{
            fontSize: typography.sizes.xs,
            color: colors.neutral[500],
            fontStyle: 'italic',
            mb: 0.75,
          }}>
            &laquo; {originalText} &raquo;
          </Typography>
          {instruction.explanation.steps.map((step: string, idx: number) => (
            <Typography key={idx} sx={{
              fontSize: typography.sizes.xs,
              color: colors.textSecondary,
              lineHeight: 1.6,
            }}>
              {step}
            </Typography>
          ))}
        </Box>
      </Collapse>

      {/* Content */}
      <Collapse in={!collapsed}>
        <Box sx={{ p: 2.5 }}>
          {vizType === 'table' ? (
            <DynamicTable data={data} title="" />
          ) : (
            <DynamicChart data={data} type={vizType} title="" />
          )}
        </Box>
      </Collapse>
    </Paper>
  )
}

export default GeneratedWidget
