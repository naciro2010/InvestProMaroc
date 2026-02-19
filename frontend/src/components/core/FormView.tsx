import { ReactNode, useState } from 'react'
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  CircularProgress,
} from '@mui/material'
import { Check, X, Pencil } from 'lucide-react'
import { componentStyles, colors, typography, borders } from '@/lib/designSystem'

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

  const getStepStyle = (step: StatusStep) => {
    if (!currentStatus) return styles.statusPipelineStep
    const currentIdx = statusSteps?.findIndex(s => s.value === currentStatus) ?? -1
    const stepIdx = statusSteps?.findIndex(s => s.value === step.value) ?? -1

    if (stepIdx === currentIdx) return styles.statusPipelineStepActive
    if (stepIdx < currentIdx) return styles.statusPipelineStepDone
    return styles.statusPipelineStep
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
              {statusSteps.map((step) => (
                <Box key={step.value} sx={getStepStyle(step)}>
                  {step.label}
                </Box>
              ))}
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
  columns?: 1 | 2
}

/**
 * FieldGroup - A bordered group of fields inside the form.
 */
const FieldGroup = ({ title, children, columns = 2 }: FieldGroupProps) => {
  const styles = componentStyles.formView

  return (
    <Box sx={styles.group}>
      {title && <Box sx={styles.groupTitle}>{title}</Box>}
      <Box sx={{
        ...styles.groupBody,
        display: 'grid',
        gridTemplateColumns: columns === 2 ? { xs: '1fr', md: '1fr 1fr' } : '1fr',
        gap: 0,
      }}>
        {children}
      </Box>
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
}

/**
 * Field - A single field row with label and value.
 * Supports view mode (static text) and edit mode (inline input).
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
}: FieldProps) => {
  const styles = componentStyles.formView
  const displayValue = value || '-'

  return (
    <Box sx={{ ...styles.fieldRow, ...(fullWidth ? { gridColumn: '1 / -1' } : {}) }}>
      <Typography sx={styles.fieldLabel}>
        {label}
        {required && isEditing && (
          <Typography component="span" sx={{ color: colors.danger[500], ml: 0.5 }}>*</Typography>
        )}
      </Typography>

      {isEditing && editContent ? (
        <Box sx={{ flex: 1 }}>{editContent}</Box>
      ) : isLink && onLinkClick ? (
        <Typography sx={styles.fieldValueLink} onClick={onLinkClick}>{displayValue}</Typography>
      ) : isMoney ? (
        <Typography sx={styles.fieldValueMoney}>{displayValue}</Typography>
      ) : (
        <Typography sx={styles.fieldValue}>{displayValue}</Typography>
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
  onRowClick?: (rowIndex: number) => void
  emptyMessage?: string
  showAddLine?: boolean
  onAddLine?: () => void
  footerCells?: ReactNode[]
}

/**
 * InlineTable - Editable table embedded inside a form.
 * Supports inline adding and a footer row for totals.
 */
const InlineTable = ({
  headers,
  rows,
  onRowClick,
  emptyMessage = 'Aucun enregistrement',
  showAddLine = false,
  onAddLine,
  footerCells,
}: InlineTableProps) => {
  return (
    <Box sx={{ border: `1px solid ${colors.border}`, borderRadius: borders.radius.md, overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: colors.neutral[50] }}>
            {headers.map((header, i) => (
              <th
                key={i}
                style={{
                  padding: '8px 12px',
                  textAlign: header.align || 'left',
                  fontWeight: typography.weights.semibold as number,
                  fontSize: typography.sizes.xs,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: colors.textSecondary,
                  borderBottom: `2px solid ${colors.border}`,
                  width: header.width,
                }}
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={headers.length} style={{ padding: '24px 12px', textAlign: 'center', color: colors.textSecondary, fontSize: typography.sizes.sm }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((cells, rowIdx) => (
              <tr
                key={rowIdx}
                onClick={() => onRowClick?.(rowIdx)}
                style={{ cursor: onRowClick ? 'pointer' : 'default', borderBottom: `1px solid ${colors.divider}` }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.primary[25] }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                {cells.map((cell, cellIdx) => (
                  <td key={cellIdx} style={{ padding: '8px 12px', fontSize: typography.sizes.base, color: colors.textPrimary, textAlign: headers[cellIdx]?.align || 'left' }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}

          {showAddLine && (
            <tr
              onClick={onAddLine}
              style={{ cursor: 'pointer', backgroundColor: colors.neutral[25], borderTop: rows.length > 0 ? `1px solid ${colors.border}` : undefined }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.primary[25] }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.neutral[25] }}
            >
              <td colSpan={headers.length} style={{ padding: '8px 12px', fontSize: typography.sizes.sm, color: colors.primary[600], fontWeight: typography.weights.medium as number }}>
                + Ajouter une ligne
              </td>
            </tr>
          )}

          {footerCells && (
            <tr style={{ backgroundColor: colors.neutral[50], borderTop: `2px solid ${colors.border}` }}>
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
}

export { FormView, FieldGroup, Field, Notebook, InlineTable }
export type { StatusStep }
export default FormView
