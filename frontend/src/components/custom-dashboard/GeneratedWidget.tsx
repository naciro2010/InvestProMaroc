/**
 * GeneratedWidget - Premium artifact card wrapping visualizations.
 *
 * Features:
 * - Compact header with title and controls
 * - Visualization type switcher
 * - CSV and PNG export
 * - Fullscreen mode
 * - Expandable interpretation panel
 * - Active filter display
 */

import React, { useState, useRef, useCallback } from 'react'
import {
  Box, Paper, Typography, IconButton, Tooltip, ToggleButtonGroup, ToggleButton,
  Alert, Collapse, Modal, Fade, Chip,
} from '@mui/material'
import {
  X, BarChart3, Table2, PieChart, TrendingUp, Download,
  ChevronUp, ChevronDown, Info, LayoutDashboard,
  Maximize2, Minimize2, Image, Filter,
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

const STATUS_LABELS: Record<string, string> = {
  VALIDEE: 'Validée',
  BROUILLON: 'Brouillon',
  SOUMIS: 'Soumis',
  REJETE: 'Rejeté',
  ACHEVE: 'Achevé',
  EN_EXECUTION: 'En exécution',
  CADRE: 'Cadre',
  SPECIFIQUE: 'Spécifique',
}

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

async function exportToPNG(containerRef: React.RefObject<HTMLDivElement | null>, title: string): Promise<void> {
  const container = containerRef.current
  if (!container) return

  try {
    // Dynamic import of html2canvas
    const html2canvasModule = await import('html2canvas')
    const html2canvas = html2canvasModule.default
    const canvas = await html2canvas(container, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false,
    })
    const url = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = url
    link.download = `${title.replace(/[^a-zA-Z0-9àâéèêëïîôùûüç-]/g, '_')}.png`
    link.click()
  } catch {
    // html2canvas not available, fall back to simpler approach
    const svgs = container.querySelectorAll('svg')
    if (svgs.length > 0) {
      const svg = svgs[0]
      const svgData = new XMLSerializer().serializeToString(svg)
      const blob = new Blob([svgData], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${title.replace(/[^a-zA-Z0-9àâéèêëïîôùûüç-]/g, '_')}.svg`
      link.click()
      URL.revokeObjectURL(url)
    }
  }
}

const VIZ_ICON_MAP: Record<VisualizationType, React.ReactNode> = {
  table: <Table2 className="w-3.5 h-3.5" style={{ color: colors.primary[600] }} />,
  pie: <PieChart className="w-3.5 h-3.5" style={{ color: colors.primary[600] }} />,
  line: <TrendingUp className="w-3.5 h-3.5" style={{ color: colors.primary[600] }} />,
  kpi: <LayoutDashboard className="w-3.5 h-3.5" style={{ color: colors.primary[600] }} />,
  bar: <BarChart3 className="w-3.5 h-3.5" style={{ color: colors.primary[600] }} />,
}

const GeneratedWidget = ({ instruction, data, onRemove, originalText }: GeneratedWidgetProps) => {
  const [vizType, setVizType] = useState<VisualizationType>(instruction.visualization)
  const [collapsed, setCollapsed] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const chartRef = useRef<HTMLDivElement | null>(null)

  const handleVizChange = (_: React.MouseEvent<HTMLElement>, newType: VisualizationType | null) => {
    if (newType) setVizType(newType)
  }

  const handlePNGExport = useCallback(() => {
    exportToPNG(chartRef, instruction.title)
  }, [instruction.title])

  const hasData = data.rows.length > 0
  const hasFilters = instruction.filters && instruction.filters.length > 0

  const renderContent = (fullscreen: boolean = false) => (
    <Paper sx={{
      border: `1px solid ${colors.neutral[200]}`,
      borderRadius: fullscreen ? '16px' : borders.radius.lg,
      overflow: 'hidden',
      mb: fullscreen ? 0 : 2,
      backgroundColor: colors.surface,
      boxShadow: fullscreen ? '0 25px 60px rgba(0,0,0,0.15)' : 'none',
      height: fullscreen ? '90vh' : 'auto',
      display: fullscreen ? 'flex' : 'block',
      flexDirection: 'column',
      '&:hover': fullscreen ? {} : {
        borderColor: colors.neutral[300],
      },
      transition: 'border-color 0.15s ease',
    }}>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: fullscreen ? 3 : 2,
        py: fullscreen ? 1.5 : 1.25,
        borderBottom: collapsed && !fullscreen ? 'none' : `1px solid ${colors.neutral[100]}`,
        backgroundColor: colors.neutral[25],
        flexShrink: 0,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
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
            {VIZ_ICON_MAP[vizType]}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{
              fontSize: fullscreen ? typography.sizes.base : typography.sizes.sm,
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{
                  fontSize: typography.sizes['2xs'],
                  color: colors.neutral[400],
                  lineHeight: 1.2,
                }}>
                  {data.totalCount} élément{data.totalCount > 1 ? 's' : ''}
                </Typography>
                {hasFilters && (
                  <Box sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.25,
                    px: 0.5,
                    py: 0.125,
                    borderRadius: '4px',
                    backgroundColor: colors.info[50],
                    color: colors.info[600],
                  }}>
                    <Filter className="w-2.5 h-2.5" />
                    <Typography sx={{ fontSize: '9px', fontWeight: typography.weights.semibold }}>
                      Filtré
                    </Typography>
                  </Box>
                )}
              </Box>
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

          {/* Export PNG */}
          {vizType !== 'table' && (
            <Tooltip title="Exporter Image">
              <IconButton size="small" onClick={handlePNGExport} sx={{ color: colors.neutral[400] }}>
                <Image className="w-3.5 h-3.5" />
              </IconButton>
            </Tooltip>
          )}

          {/* Fullscreen toggle */}
          <Tooltip title={isFullscreen ? 'Réduire' : 'Plein écran'}>
            <IconButton size="small" onClick={() => setIsFullscreen(!isFullscreen)} sx={{ color: colors.neutral[400] }}>
              {isFullscreen
                ? <Minimize2 className="w-3.5 h-3.5" />
                : <Maximize2 className="w-3.5 h-3.5" />
              }
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

          {/* Collapse (not in fullscreen) */}
          {!fullscreen && (
            <IconButton size="small" onClick={() => setCollapsed(!collapsed)} sx={{ color: colors.neutral[400] }}>
              {collapsed
                ? <ChevronDown className="w-3.5 h-3.5" />
                : <ChevronUp className="w-3.5 h-3.5" />
              }
            </IconButton>
          )}

          {/* Remove */}
          <Tooltip title={fullscreen ? 'Fermer' : 'Supprimer'}>
            <IconButton size="small" onClick={fullscreen ? () => setIsFullscreen(false) : onRemove} sx={{
              color: colors.neutral[400],
              '&:hover': { color: colors.danger[600] },
            }}>
              <X className="w-3.5 h-3.5" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Active filters */}
      {hasFilters && (
        <Collapse in={!collapsed || fullscreen}>
          <Box sx={{
            px: fullscreen ? 3 : 2,
            py: 0.75,
            borderBottom: `1px solid ${colors.neutral[100]}`,
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            flexWrap: 'wrap',
          }}>
            <Filter className="w-3 h-3" style={{ color: colors.neutral[400], flexShrink: 0 }} />
            {instruction.filters.flatMap((f) =>
              f.values.map((v) => (
                <Chip
                  key={`${f.field}-${v}`}
                  label={STATUS_LABELS[v] || v}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: '11px',
                    fontWeight: typography.weights.medium,
                    backgroundColor: colors.info[50],
                    color: colors.info[700],
                    border: `1px solid ${colors.info[200]}`,
                    '& .MuiChip-label': { px: 1 },
                  }}
                />
              ))
            )}
          </Box>
        </Collapse>
      )}

      {/* Warnings */}
      <Collapse in={(!collapsed || fullscreen) && instruction.warnings.length > 0}>
        <Box sx={{ px: fullscreen ? 3 : 2, pt: 1 }}>
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
      <Collapse in={(!collapsed || fullscreen) && showExplanation && instruction.explanation.steps.length > 0}>
        <Box sx={{
          px: fullscreen ? 3 : 2,
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
      <Collapse in={!collapsed || fullscreen}>
        <Box ref={chartRef} sx={{
          p: fullscreen ? 4 : 2.5,
          flex: fullscreen ? 1 : undefined,
          overflow: fullscreen ? 'auto' : undefined,
        }}>
          {vizType === 'table' ? (
            <DynamicTable data={data} title="" />
          ) : (
            <DynamicChart data={data} type={vizType} title="" />
          )}
        </Box>
      </Collapse>
    </Paper>
  )

  return (
    <>
      {renderContent(false)}

      {/* Fullscreen Modal */}
      <Modal
        open={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        closeAfterTransition
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', px: 3, py: 3 }}
      >
        <Fade in={isFullscreen}>
          <Box sx={{ width: '100%', maxWidth: 1400, maxHeight: '95vh', outline: 'none' }}>
            {renderContent(true)}
          </Box>
        </Fade>
      </Modal>
    </>
  )
}

export default GeneratedWidget
