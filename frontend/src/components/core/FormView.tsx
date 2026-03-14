import { ReactNode, useState, useCallback } from 'react'
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Tooltip,
} from '@mui/material'
import { Check, X, Pencil, ChevronDown, ChevronRight, HelpCircle, Link2, GripVertical } from 'lucide-react'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { componentStyles, colors, typography, borders, transitions } from '@/lib/designSystem'

// ==================== TYPES ====================

interface FormViewProps {
  isEditing: boolean
  onToggleEdit?: () => void
  onSave?: () => void | Promise<void>
  onCancel?: () => void
  isSaving?: boolean
  statusSteps?: StatusStep[]
  currentStatus?: string
  statusBarActions?: ReactNode
  children: ReactNode
}

interface StatusStep {
  value: string
  label: string
  /** Use 'danger' for rejected/cancelled states */
  variant?: 'danger'
}

/**
 * FormView - Main form container with status bar and edit/view toggle.
 * Provides a status pipeline bar at the top, Edit/Save/Discard buttons,
 * and toggles between view mode (static fields) and edit mode (inputs).
 */
const FormView = ({
  isEditing,
  onToggleEdit,
  onSave,
  onCancel,
  isSaving = false,
  statusSteps,
  currentStatus,
  statusBarActions,
  children,
}: FormViewProps) => {
  const styles = componentStyles.formView

  const getStepInfo = (step: StatusStep): { style: Record<string, unknown>; state: 'done' | 'active' | 'future' | 'danger' } => {
    if (!currentStatus) return { style: styles.statusPipelineStep, state: 'future' }
    const currentIdx = statusSteps?.findIndex(s => s.value === currentStatus) ?? -1
    const stepIdx = statusSteps?.findIndex(s => s.value === step.value) ?? -1

    if (stepIdx === currentIdx) {
      if (step.variant === 'danger') return { style: styles.statusPipelineStepDanger, state: 'danger' }
      return { style: styles.statusPipelineStepActive, state: 'active' }
    }
    if (stepIdx < currentIdx) return { style: styles.statusPipelineStepDone, state: 'done' }
    return { style: styles.statusPipelineStep, state: 'future' }
  }

  return (
    <Box sx={styles.container}>
      {(statusSteps || statusBarActions || onToggleEdit) && (
        <Box sx={styles.statusBar}>
          <Box sx={styles.statusBarButtons}>
            {!isEditing && onToggleEdit && (
              <Button
                size="small"
                startIcon={<Pencil size={14} />}
                onClick={onToggleEdit}
                sx={{ ...componentStyles.buttonSecondary, fontSize: typography.sizes.sm, py: 0.5, px: 1.5 }}
              >
                Modifier
              </Button>
            )}
            {isEditing && (
              <>
                <Button
                  size="small"
                  startIcon={isSaving ? <CircularProgress size={14} /> : <Check size={14} />}
                  onClick={onSave}
                  disabled={isSaving}
                  sx={{ ...componentStyles.buttonPrimary, fontSize: typography.sizes.sm, py: 0.5, px: 1.5 }}
                >
                  Enregistrer
                </Button>
                <Button
                  size="small"
                  startIcon={<X size={14} />}
                  onClick={onCancel}
                  disabled={isSaving}
                  sx={{ ...componentStyles.buttonGhost, fontSize: typography.sizes.sm, py: 0.5, px: 1.5 }}
                >
                  Annuler
                </Button>
              </>
            )}
            {statusBarActions}
          </Box>

          {statusSteps && (
            <Box sx={styles.statusPipeline}>
              {statusSteps.map((step) => {
                const { style, state } = getStepInfo(step)
                return (
                  <Box key={step.value} sx={{ ...style, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {state === 'done' && <Check size={12} />}
                    {step.label}
                  </Box>
                )
              })}
            </Box>
          )}
        </Box>
      )}

      <Box sx={styles.sheet}>
        {children}
      </Box>
    </Box>
  )
}

// ==================== SUB-COMPONENTS ====================

interface FieldGroupProps {
  title?: string
  children: ReactNode
  /** Number of columns for the field grid (default: 2) */
  columns?: 1 | 2 | 3 | 4
  /** Enable collapse/expand toggle on the group header */
  collapsible?: boolean
  /** Start collapsed (only used when collapsible=true) */
  defaultCollapsed?: boolean
  /** localStorage key for persisting collapse state */
  storageKey?: string
}

const COLUMN_TEMPLATES: Record<number, Record<string, string>> = {
  1: { xs: '1fr' },
  2: { xs: '1fr', md: '1fr 1fr' },
  3: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
  4: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
}

/**
 * FieldGroup - A bordered group of fields inside the form.
 * Supports 1-4 column layouts and optional collapsibility.
 */
const FieldGroup = ({ title, children, columns = 2, collapsible = false, defaultCollapsed = false, storageKey }: FieldGroupProps) => {
  const styles = componentStyles.formView

  const getInitialCollapsed = (): boolean => {
    if (!collapsible) return false
    if (storageKey) {
      try {
        const stored = localStorage.getItem(`fieldgroup-${storageKey}`)
        if (stored !== null) return stored === 'true'
      } catch { /* ignore */ }
    }
    return defaultCollapsed
  }

  const [collapsed, setCollapsed] = useState(getInitialCollapsed)

  const toggleCollapse = () => {
    if (!collapsible) return
    const next = !collapsed
    setCollapsed(next)
    if (storageKey) {
      try { localStorage.setItem(`fieldgroup-${storageKey}`, String(next)) } catch { /* ignore */ }
    }
  }

  return (
    <Box sx={styles.group}>
      {title && (
        <Box
          sx={{
            ...styles.groupTitle,
            ...(collapsible ? {
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              userSelect: 'none',
              '&:hover': { bgcolor: colors.neutral[100] },
            } : {}),
          }}
          onClick={collapsible ? toggleCollapse : undefined}
        >
          {collapsible && (
            <Box sx={{ display: 'flex', alignItems: 'center', color: colors.textSecondary }}>
              {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            </Box>
          )}
          {title}
        </Box>
      )}
      {!collapsed && (
        <Box sx={{
          ...styles.groupBody,
          display: 'grid',
          gridTemplateColumns: COLUMN_TEMPLATES[columns] || COLUMN_TEMPLATES[2],
          gap: 0,
        }}>
          {children}
        </Box>
      )}
    </Box>
  )
}

interface FieldProps {
  label: string
  value?: ReactNode
  isEditing?: boolean
  editContent?: ReactNode
  isLink?: boolean
  onLinkClick?: () => void
  isMoney?: boolean
  fullWidth?: boolean
  required?: boolean
  /** Tooltip help text shown as info icon next to the label */
  help?: string
  /** Provenance indicator for inherited values (e.g., from parent convention) */
  provenance?: {
    source: string
    isInherited: boolean
  }
}

/**
 * Field - A single field row with label and value.
 * Supports view mode (static text) and edit mode (inline input).
 * Optional help tooltip and provenance indicator for data traceability.
 */
const Field = ({
  label,
  value,
  isEditing = false,
  editContent,
  isLink = false,
  onLinkClick,
  isMoney = false,
  fullWidth = false,
  required = false,
  help,
  provenance,
}: FieldProps) => {
  const styles = componentStyles.formView
  const displayValue = value || '-'

  return (
    <Box sx={{ ...styles.fieldRow, ...(fullWidth ? { gridColumn: '1 / -1' } : {}) }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography sx={styles.fieldLabel}>
          {label}
          {required && isEditing && (
            <Typography component="span" sx={{ color: colors.danger[500], ml: 0.5 }}>*</Typography>
          )}
        </Typography>
        {help && (
          <Tooltip
            title={help}
            placement="top"
            arrow
            slotProps={{
              tooltip: {
                sx: {
                  bgcolor: colors.neutral[800],
                  fontSize: typography.sizes.xs,
                  maxWidth: 280,
                  lineHeight: 1.5,
                  p: 1,
                },
              },
            }}
          >
            <Box sx={{ display: 'inline-flex', cursor: 'help', color: colors.neutral[400], '&:hover': { color: colors.primary[500] } }}>
              <HelpCircle size={13} />
            </Box>
          </Tooltip>
        )}
        {provenance && (
          <Tooltip
            title={provenance.isInherited ? `Herite de : ${provenance.source}` : `Surcharge locale (parent: ${provenance.source})`}
            placement="top"
            arrow
          >
            <Box sx={{
              display: 'inline-flex',
              cursor: 'help',
              color: provenance.isInherited ? colors.purple[400] : colors.warning[500],
            }}>
              <Link2 size={13} />
            </Box>
          </Tooltip>
        )}
      </Box>

      {isEditing && editContent ? (
        <Box sx={{ flex: 1 }}>{editContent}</Box>
      ) : isLink && onLinkClick ? (
        <Typography sx={styles.fieldValueLink} onClick={onLinkClick}>{displayValue}</Typography>
      ) : isMoney ? (
        <Typography sx={styles.fieldValueMoney}>{displayValue}</Typography>
      ) : (
        <Typography sx={{
          ...styles.fieldValue,
          ...(provenance?.isInherited ? { color: colors.purple[600], fontStyle: 'italic' } : {}),
        }}>{displayValue}</Typography>
      )}
    </Box>
  )
}

interface NotebookProps {
  tabs: Array<{ label: string; count?: number; content: ReactNode }>
  tabActions?: ReactNode
}

/**
 * Notebook - Tabbed section inside the form view.
 */
const Notebook = ({ tabs, tabActions }: NotebookProps) => {
  const [activeTab, setActiveTab] = useState(0)
  const styles = componentStyles.formView

  return (
    <Box sx={styles.notebook}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Tabs
          value={activeTab}
          onChange={(_, val: number) => setActiveTab(val)}
          sx={styles.notebookTabs}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  {tab.label}
                  {tab.count !== undefined && (
                    <Typography
                      component="span"
                      sx={{
                        fontSize: typography.sizes['2xs'],
                        bgcolor: colors.neutral[200],
                        color: colors.neutral[600],
                        borderRadius: borders.radius.full,
                        px: 0.75,
                        minWidth: 18,
                        height: 18,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: typography.weights.semibold,
                      }}
                    >
                      {tab.count}
                    </Typography>
                  )}
                </Box>
              }
            />
          ))}
        </Tabs>
        {tabActions && <Box sx={{ ml: 'auto', pl: 2 }}>{tabActions}</Box>}
      </Box>

      {tabs.map((tab, index) => (
        <Box key={index} role="tabpanel" hidden={activeTab !== index}>
          {activeTab === index && <Box sx={{ py: 2 }}>{tab.content}</Box>}
        </Box>
      ))}
    </Box>
  )
}

interface InlineTableProps {
  headers: Array<{ label: string; width?: string | number; align?: 'left' | 'right' | 'center' }>
  rows: ReactNode[][]
  rowIds?: string[]
  onRowClick?: (rowIndex: number) => void
  emptyMessage?: string
  showAddLine?: boolean
  onAddLine?: () => void
  footerCells?: ReactNode[]
  /** Enable drag-and-drop row reordering */
  sortable?: boolean
  onReorder?: (fromIndex: number, toIndex: number) => void
}

// Sortable row sub-component
const SortableInlineRow = ({ id, cells, headers, onClick, sortable }: {
  id: string; cells: ReactNode[]; headers: InlineTableProps['headers']; onClick?: () => void; sortable: boolean
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  return (
    <tr
      ref={setNodeRef}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        borderBottom: `1px solid ${colors.divider}`,
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        backgroundColor: isDragging ? colors.primary[25] : 'transparent',
      }}
      onMouseEnter={(e) => { if (!isDragging) e.currentTarget.style.backgroundColor = colors.primary[25] }}
      onMouseLeave={(e) => { if (!isDragging) e.currentTarget.style.backgroundColor = 'transparent' }}
    >
      {sortable && (
        <td style={{ padding: '8px 4px 8px 8px', width: 28 }}>
          <Box {...attributes} {...listeners} sx={{ cursor: 'grab', color: colors.neutral[300], display: 'flex', '&:hover': { color: colors.neutral[500] } }}>
            <GripVertical size={14} />
          </Box>
        </td>
      )}
      {cells.map((cell, cellIdx) => (
        <td key={cellIdx} style={{ padding: '8px 12px', fontSize: typography.sizes.base, color: colors.textPrimary, textAlign: headers[cellIdx]?.align || 'left' }}>
          {cell}
        </td>
      ))}
    </tr>
  )
}

/**
 * InlineTable - Editable table embedded inside a form.
 * Supports inline adding, footer row for totals, and optional DnD row reordering.
 */
const InlineTable = ({
  headers,
  rows,
  rowIds,
  onRowClick,
  emptyMessage = 'Aucun enregistrement',
  showAddLine = false,
  onAddLine,
  footerCells,
  sortable = false,
  onReorder,
}: InlineTableProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  )

  const ids = rowIds || rows.map((_, i) => String(i))

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = ids.indexOf(String(active.id))
    const newIndex = ids.indexOf(String(over.id))
    if (oldIndex !== -1 && newIndex !== -1 && onReorder) {
      onReorder(oldIndex, newIndex)
    }
  }, [ids, onReorder])

  const totalCols = headers.length + (sortable ? 1 : 0)

  const tableContent = (
    <Box sx={{ border: `1px solid ${colors.border}`, borderRadius: borders.radius.md, overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: colors.neutral[50] }}>
            {sortable && <th style={{ width: 28, borderBottom: `2px solid ${colors.border}` }} />}
            {headers.map((header, i) => (
              <th key={i} style={{
                padding: '8px 12px', textAlign: header.align || 'left',
                fontWeight: typography.weights.semibold as number, fontSize: typography.sizes.xs,
                textTransform: 'uppercase', letterSpacing: '0.04em', color: colors.textSecondary,
                borderBottom: `2px solid ${colors.border}`, width: header.width,
              }}>
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={totalCols} style={{ padding: '24px 12px', textAlign: 'center', color: colors.textSecondary, fontSize: typography.sizes.sm }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((cells, rowIdx) => (
              <SortableInlineRow
                key={ids[rowIdx]}
                id={ids[rowIdx]}
                cells={cells}
                headers={headers}
                onClick={onRowClick ? () => onRowClick(rowIdx) : undefined}
                sortable={sortable}
              />
            ))
          )}

          {showAddLine && (
            <tr onClick={onAddLine}
              style={{ cursor: 'pointer', backgroundColor: colors.neutral[25], borderTop: rows.length > 0 ? `1px solid ${colors.border}` : undefined }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.primary[25] }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.neutral[25] }}
            >
              <td colSpan={totalCols} style={{ padding: '8px 12px', fontSize: typography.sizes.sm, color: colors.primary[600], fontWeight: typography.weights.medium as number }}>
                + Ajouter une ligne
              </td>
            </tr>
          )}

          {footerCells && (
            <tr style={{ backgroundColor: colors.neutral[50], borderTop: `2px solid ${colors.border}` }}>
              {sortable && <td />}
              {footerCells.map((cell, i) => (
                <td key={i} style={{ padding: '8px 12px', fontWeight: typography.weights.semibold as number, fontSize: typography.sizes.sm, color: colors.textPrimary, textAlign: headers[i]?.align || 'left' }}>
                  {cell}
                </td>
              ))}
            </tr>
          )}
        </tbody>
      </table>
    </Box>
  )

  if (!sortable || rows.length === 0) return tableContent

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {tableContent}
      </SortableContext>
    </DndContext>
  )
}

export { FormView, FieldGroup, Field, Notebook, InlineTable }
export type { StatusStep }
export default FormView
