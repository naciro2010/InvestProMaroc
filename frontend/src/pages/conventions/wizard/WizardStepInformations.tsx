import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Divider,
  Alert,
  Chip,
  InputAdornment,
  Tooltip,
  IconButton,
} from '@mui/material'
import {
  CheckCircle,
  Error as ErrorIcon,
  AutoAwesome as SmartIcon,
  ContentCopy as CopyIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material'
import DecimalInput from '@/components/ui/DecimalInput'
import RichTextEditor from '@/components/common/RichTextEditor'
import { getPlainTextLength, stripHtml } from '@/utils/textUtils'
import { colors, typography, componentStyles, borders } from '@/lib/designSystem'
import type { ConventionSettings } from '@/lib/settings/conventionSettings'
import type {
  ConventionWizardFormData,
  ConventionTypeOptionDisplay,
  HandleChangeFunction,
  SetFormDataFunction,
} from './types'

interface WizardStepInformationsProps {
  formData: ConventionWizardFormData
  setFormData: SetFormDataFunction
  handleChange: HandleChangeFunction
  settings: ConventionSettings
  autoDateFin: boolean
  onDureeMoisChange: (value: number) => void
  typeOptionsWithCurrent: ConventionTypeOptionDisplay[]
}

// Duration presets (Odoo-style quick pick)
const DURATION_PRESETS = [
  { label: '6 mois', value: 6 },
  { label: '1 an', value: 12 },
  { label: '2 ans', value: 24 },
  { label: '3 ans', value: 36 },
  { label: '5 ans', value: 60 },
]

// Type descriptions for smart context
const TYPE_DESCRIPTIONS: Record<string, { description: string; color: string; bgColor: string }> = {
  CADRE: {
    description: 'Convention cadre — Permet de creer des sous-conventions apres validation. Ideale pour les programmes multi-projets.',
    color: colors.primary[600],
    bgColor: colors.primary[25],
  },
  NON_CADRE: {
    description: 'Convention directe — Convention simple sans sous-conventions. Pour les projets uniques et autonomes.',
    color: colors.info[600],
    bgColor: colors.info[25],
  },
  SPECIFIQUE: {
    description: 'Convention specifique — Liee a une convention cadre parente. Herite les parametres du cadre.',
    color: colors.purple[600],
    bgColor: colors.purple[25],
  },
  AVENANT: {
    description: 'Avenant — Modification d\'une convention existante.',
    color: colors.warning[600],
    bgColor: colors.warning[25],
  },
}

// Field validation status
interface FieldStatus {
  valid: boolean
  message?: string
}

const getCodeStatus = (code: string, pattern: string): FieldStatus => {
  if (!code) return { valid: false, message: 'Obligatoire' }
  if (pattern) {
    const regex = new RegExp(`^${pattern}$`)
    if (!regex.test(code)) return { valid: false, message: 'Format invalide' }
  }
  return { valid: true, message: 'Valide' }
}

const getLibelleStatus = (richText: string): FieldStatus => {
  const len = getPlainTextLength(richText)
  if (len === 0) return { valid: false, message: 'Obligatoire' }
  if (len > 200) return { valid: false, message: `${len}/200 — Trop long` }
  return { valid: true, message: `${len}/200` }
}

const getObjetStatus = (richText: string): FieldStatus => {
  const len = getPlainTextLength(richText)
  if (len === 0) return { valid: false, message: 'Obligatoire' }
  return { valid: true, message: `${len} caracteres` }
}

const FieldStatusIcon = ({ status }: { status: FieldStatus }) => (
  <Tooltip title={status.message || ''}>
    {status.valid ? (
      <CheckCircle sx={{ fontSize: 16, color: colors.success[500] }} />
    ) : (
      <ErrorIcon sx={{ fontSize: 16, color: status.message === 'Obligatoire' ? colors.neutral[300] : colors.danger[500] }} />
    )}
  </Tooltip>
)

const WizardStepInformations = ({
  formData,
  setFormData,
  handleChange,
  settings,
  autoDateFin,
  onDureeMoisChange,
  typeOptionsWithCurrent,
}: WizardStepInformationsProps) => {
  const [codeCopied, setCodeCopied] = useState(false)
  const typeInfo = TYPE_DESCRIPTIONS[formData.type]
  const codeStatus = getCodeStatus(formData.code, settings.codeMaskPattern)
  const libelleStatus = getLibelleStatus(formData.libelleRich)
  const objetStatus = getObjetStatus(formData.objetRich)

  // Auto-generate numero from code
  useEffect(() => {
    if (formData.code && !formData.numeroConvention) {
      const year = new Date().getFullYear()
      const suggested = `${formData.code}/${year}`
      setFormData((prev) => ({
        ...prev,
        numeroConvention: prev.numeroConvention || suggested,
      }))
    }
  }, [formData.code, formData.numeroConvention, setFormData])

  const handleCopyCode = () => {
    navigator.clipboard.writeText(formData.code)
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      {/* Section: Identification */}
      <Box
        sx={{
          bgcolor: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: borders.radius.lg,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            bgcolor: colors.neutral[25],
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: typography.weights.semibold,
              color: colors.textPrimary,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            Identification
          </Typography>
          {formData.code && (
            <Chip
              label={formData.code}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: typography.weights.bold }}
            />
          )}
        </Box>
        <Box sx={{ p: 2.5 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              label="Code"
              value={formData.code}
              onChange={handleChange('code')}
              placeholder={settings.codeMaskPlaceholder}
              inputProps={{ pattern: settings.codeMaskPattern }}
              helperText={settings.codeMaskPlaceholder ? `Format : ${settings.codeMaskPlaceholder}` : undefined}
              size="small"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <FieldStatusIcon status={codeStatus} />
                      {formData.code && (
                        <Tooltip title={codeCopied ? 'Copie !' : 'Copier'}>
                          <IconButton size="small" onClick={handleCopyCode}>
                            <CopyIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Numero de convention"
              value={formData.numeroConvention}
              onChange={handleChange('numeroConvention')}
              placeholder={settings.numeroMaskPlaceholder}
              inputProps={{ pattern: settings.numeroMaskPattern }}
              helperText={
                formData.numeroConvention
                  ? undefined
                  : 'Auto-genere a partir du code'
              }
              size="small"
              InputProps={{
                startAdornment: formData.numeroConvention ? (
                  <InputAdornment position="start">
                    <SmartIcon sx={{ fontSize: 16, color: colors.primary[400] }} />
                  </InputAdornment>
                ) : undefined,
              }}
            />
            <TextField
              fullWidth
              select
              label="Type"
              value={formData.type}
              onChange={handleChange('type')}
              size="small"
              required
            >
              {typeOptionsWithCurrent.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor:
                          TYPE_DESCRIPTIONS[option.value]?.color || colors.neutral[400],
                      }}
                    />
                    {option.label}
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Type context alert (Odoo-style smart hint) */}
          {typeInfo && (
            <Box
              sx={{
                mt: 2,
                p: 1.5,
                borderRadius: borders.radius.md,
                bgcolor: typeInfo.bgColor,
                border: `1px solid ${typeInfo.color}25`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1,
              }}
            >
              <SmartIcon sx={{ fontSize: 18, color: typeInfo.color, mt: 0.25 }} />
              <Typography
                sx={{
                  fontSize: typography.sizes.xs,
                  color: typeInfo.color,
                  lineHeight: 1.5,
                }}
              >
                {typeInfo.description}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Section: Description */}
      <Box
        sx={{
          bgcolor: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: borders.radius.lg,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            bgcolor: colors.neutral[25],
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: typography.weights.semibold,
              color: colors.textPrimary,
            }}
          >
            Description
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <FieldStatusIcon status={libelleStatus} />
              <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                Libelle
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <FieldStatusIcon status={objetStatus} />
              <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                Objet
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ p: 2.5 }}>
          {/* Libelle */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: typography.weights.semibold,
                  color: colors.textPrimary,
                  fontSize: typography.sizes.sm,
                }}
              >
                Libelle de la convention *
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: getPlainTextLength(formData.libelleRich) > 200
                    ? colors.danger[500]
                    : colors.textSecondary,
                  fontWeight: typography.weights.medium,
                }}
              >
                {getPlainTextLength(formData.libelleRich)} / 200
              </Typography>
            </Box>
            <RichTextEditor
              value={formData.libelleRich}
              onChange={(value) => {
                const plain = stripHtml(value).substring(0, 200)
                setFormData((prev) => ({
                  ...prev,
                  libelleRich: value,
                  libelle: plain,
                }))
              }}
              placeholder="Ex: Convention cadre pour l'amenagement de la zone industrielle..."
              minHeight={100}
            />
          </Box>

          {/* Objet (Rich Text) */}
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: typography.weights.semibold,
                color: colors.textPrimary,
                fontSize: typography.sizes.sm,
                mb: 1,
              }}
            >
              Objet de la convention *
            </Typography>
            <RichTextEditor
              value={formData.objetRich}
              onChange={(value) => {
                setFormData((prev) => ({
                  ...prev,
                  objetRich: value,
                  objet: stripHtml(value).substring(0, 500),
                }))
              }}
              placeholder="Decrivez l'objet de la convention en detail : perimetre, objectifs, livrables attendus..."
              minHeight={180}
            />
          </Box>
        </Box>
      </Box>

      {/* Section: Dates & Duration */}
      <Box
        sx={{
          bgcolor: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: borders.radius.lg,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            bgcolor: colors.neutral[25],
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <CalendarIcon sx={{ fontSize: 18, color: colors.textSecondary }} />
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: typography.weights.semibold,
              color: colors.textPrimary,
            }}
          >
            Periode et duree
          </Typography>
        </Box>
        <Box sx={{ p: 2.5 }}>
          {/* Duration presets - Odoo-style quick picks */}
          <Box sx={{ mb: 2.5 }}>
            <Typography
              sx={{
                fontSize: typography.sizes.xs,
                color: colors.textSecondary,
                fontWeight: typography.weights.medium,
                mb: 1,
              }}
            >
              Duree rapide
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {DURATION_PRESETS.map((preset) => {
                const isActive = formData.dureeMois === preset.value
                return (
                  <Chip
                    key={preset.value}
                    label={preset.label}
                    size="small"
                    onClick={() => onDureeMoisChange(preset.value)}
                    sx={{
                      bgcolor: isActive ? colors.primary[600] : 'transparent',
                      color: isActive ? colors.surface : colors.textPrimary,
                      border: `1px solid ${isActive ? colors.primary[600] : colors.border}`,
                      fontWeight: isActive
                        ? typography.weights.semibold
                        : typography.weights.normal,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        bgcolor: isActive ? colors.primary[700] : colors.primary[25],
                        borderColor: colors.primary[300],
                      },
                    }}
                  />
                )
              })}
            </Box>
          </Box>

          <Divider sx={{ mb: 2.5 }} />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr 1fr' },
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              label="Date de signature"
              type="date"
              value={formData.dateSignature}
              onChange={handleChange('dateSignature')}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            <TextField
              fullWidth
              label="Date de debut"
              type="date"
              value={formData.dateDebut}
              onChange={handleChange('dateDebut')}
              InputLabelProps={{ shrink: true }}
              size="small"
              required
            />
            <TextField
              fullWidth
              label="Date de fin"
              type="date"
              value={formData.dateFin}
              onChange={handleChange('dateFin')}
              InputLabelProps={{ shrink: true }}
              size="small"
              helperText={
                autoDateFin ? 'Calculee automatiquement' : undefined
              }
            />
            <DecimalInput
              fullWidth
              label="Duree (mois)"
              value={Number(formData.dureeMois) || 0}
              onChange={onDureeMoisChange}
              decimalPlaces={0}
              min={0}
              size="small"
            />
          </Box>

          {/* Duration smart info */}
          {formData.dureeMois > 0 && formData.dateDebut && formData.dateFin && (
            <Alert
              severity="info"
              icon={<SmartIcon sx={{ fontSize: 18 }} />}
              sx={{
                mt: 2,
                fontSize: typography.sizes.xs,
                '& .MuiAlert-message': { fontSize: typography.sizes.xs },
              }}
            >
              Du{' '}
              <strong>
                {new Date(formData.dateDebut).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </strong>{' '}
              au{' '}
              <strong>
                {new Date(formData.dateFin).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </strong>{' '}
              — {formData.dureeMois} mois
            </Alert>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default WizardStepInformations
