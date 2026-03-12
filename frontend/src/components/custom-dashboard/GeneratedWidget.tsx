/**
 * GeneratedWidget - Wraps a generated visualization with controls and metadata.
 */

import React, { useState } from 'react'
import {
  Box, Paper, Typography, IconButton, Tooltip, ToggleButtonGroup, ToggleButton,
  Chip, Alert,
} from '@mui/material'
import {
  X, BarChart3, Table2, PieChart, TrendingUp, Download,
  ChevronUp, ChevronDown, GripVertical, Info,
} from 'lucide-react'
import { colors, typography, borders, componentStyles } from '@/lib/designSystem'
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

  return (
    <Paper sx={{
      ...componentStyles.card,
      overflow: 'hidden',
      mb: 2,
    }}>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2.5,
        py: 1.5,
        borderBottom: collapsed ? 'none' : `1px solid ${colors.border}`,
        backgroundColor: colors.neutral[25],
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
          <GripVertical className="w-4 h-4" style={{ color: colors.neutral[300], flexShrink: 0, cursor: 'grab' }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{
              fontSize: typography.sizes.sm,
              fontWeight: typography.weights.semibold,
              color: colors.textPrimary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {instruction.title}
            </Typography>
            <Typography sx={{
              fontSize: typography.sizes.xs,
              color: colors.textSecondary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {originalText}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
          {/* Confidence badge */}
          <Chip
            label={`${Math.round(instruction.confidence * 100)}%`}
            size="small"
            sx={{
              height: 22,
              fontSize: typography.sizes['2xs'],
              fontWeight: typography.weights.semibold,
              backgroundColor: instruction.confidence >= 0.7 ? colors.success[50] : colors.warning[50],
              color: instruction.confidence >= 0.7 ? colors.success[700] : colors.warning[700],
              border: `1px solid ${instruction.confidence >= 0.7 ? colors.success[200] : colors.warning[200]}`,
            }}
          />

          {/* Visualization toggle */}
          <ToggleButtonGroup
            value={vizType}
            exclusive
            onChange={handleVizChange}
            size="small"
            sx={{
              '& .MuiToggleButton-root': {
                padding: '4px 6px',
                border: `1px solid ${colors.neutral[200]}`,
                '&.Mui-selected': {
                  backgroundColor: colors.primary[50],
                  color: colors.primary[700],
                  borderColor: colors.primary[300],
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

          {/* Export CSV */}
          <Tooltip title="Exporter en CSV">
            <IconButton size="small" onClick={() => exportToCSV(data, instruction.title)}>
              <Download className="w-4 h-4" style={{ color: colors.textSecondary }} />
            </IconButton>
          </Tooltip>

          {/* Explanation toggle */}
          <Tooltip title="Comment l'instruction a été interprétée">
            <IconButton size="small" onClick={() => setShowExplanation(!showExplanation)}>
              <Info className="w-4 h-4" style={{ color: showExplanation ? colors.primary[600] : colors.textSecondary }} />
            </IconButton>
          </Tooltip>

          {/* Collapse */}
          <IconButton size="small" onClick={() => setCollapsed(!collapsed)}>
            {collapsed
              ? <ChevronDown className="w-4 h-4" style={{ color: colors.textSecondary }} />
              : <ChevronUp className="w-4 h-4" style={{ color: colors.textSecondary }} />
            }
          </IconButton>

          {/* Remove */}
          <Tooltip title="Supprimer">
            <IconButton size="small" onClick={onRemove}>
              <X className="w-4 h-4" style={{ color: colors.danger[500] }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Warnings */}
      {!collapsed && instruction.warnings.length > 0 && (
        <Box sx={{ px: 2.5, pt: 1 }}>
          {instruction.warnings.map((warning, idx) => (
            <Alert key={idx} severity="info" sx={{
              mb: 0.5,
              py: 0,
              fontSize: typography.sizes.xs,
              borderRadius: borders.radius.base,
            }}>
              {warning}
            </Alert>
          ))}
        </Box>
      )}

      {/* Parsing explanation */}
      {!collapsed && showExplanation && instruction.explanation.steps.length > 0 && (
        <Box sx={{
          px: 2.5,
          py: 1.5,
          backgroundColor: colors.primary[25],
          borderBottom: `1px solid ${colors.primary[100]}`,
        }}>
          <Typography sx={{
            fontSize: typography.sizes['2xs'],
            fontWeight: typography.weights.semibold,
            color: colors.primary[700],
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            mb: 0.75,
          }}>
            Interprétation
          </Typography>
          {instruction.explanation.steps.map((step: string, idx: number) => (
            <Typography key={idx} sx={{
              fontSize: typography.sizes.xs,
              color: colors.textSecondary,
              lineHeight: 1.6,
            }}>
              • {step}
            </Typography>
          ))}
        </Box>
      )}

      {/* Content */}
      {!collapsed && (
        <Box sx={{ p: 2.5 }}>
          {vizType === 'table' ? (
            <DynamicTable data={data} title="" />
          ) : (
            <DynamicChart data={data} type={vizType} title="" />
          )}
        </Box>
      )}
    </Paper>
  )
}

export default GeneratedWidget
