import { useState, useRef, type ChangeEvent } from 'react'
import {
  Button, Menu, MenuItem, ListItemIcon, ListItemText,
  Divider, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, CircularProgress,
} from '@mui/material'
import {
  MoreVert, ContentCopy, Print, FileDownload,
  Archive, Unarchive, Share, Link,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/contexts/ToastContext'
import { conventionsAPI } from '@/lib/api'
import { colors, typography } from '@/lib/designSystem'
import type { CreateConventionDTO } from '@/types/api'

// ──── Types ────

interface ConventionActionsMenuProps {
  convention: {
    id: number; code: string; numero: string; libelle: string; objet: string
    typeConvention: 'CADRE' | 'SPECIFIQUE'; statut: string
    tauxCommission: number; baseCalcul: string; budget: number
    dateDebut: string; dateFin?: string; tauxTva: number; tauxTvaLignes: number
    commissionMode?: string
  }
  onReload: () => void
}

// ──── Main Component ────

const ConventionActionsMenu = ({ convention, onReload }: ConventionActionsMenuProps) => {
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()
  const anchorRef = useRef<HTMLButtonElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false)
  const [duplicateCode, setDuplicateCode] = useState('')
  const [duplicateNumero, setDuplicateNumero] = useState('')
  const [loading, setLoading] = useState(false)

  // ── Print ──
  const handlePrint = () => {
    setMenuOpen(false)
    window.print()
  }

  // ── Export CSV ──
  const handleExportCSV = () => {
    setMenuOpen(false)
    const headers = ['Champ', 'Valeur']
    const rows = [
      ['Code', convention.code],
      ['Numero', convention.numero],
      ['Libelle', convention.libelle],
      ['Type', convention.typeConvention],
      ['Statut', convention.statut],
      ['Budget (MAD)', String(convention.budget)],
      ['Taux Commission (%)', String(convention.tauxCommission)],
      ['Base de Calcul', convention.baseCalcul],
      ['TVA (%)', String(convention.tauxTva)],
      ['Date Debut', convention.dateDebut],
      ['Date Fin', convention.dateFin || 'Non definie'],
    ]
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `convention-${convention.code}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showSuccess('Convention exportee en CSV')
  }

  // ── Copy Link ──
  const handleCopyLink = () => {
    setMenuOpen(false)
    const url = `${window.location.origin}/conventions/${convention.id}`
    navigator.clipboard.writeText(url).then(() => showSuccess('Lien copie dans le presse-papiers'))
  }

  // ── Share ──
  const handleShare = async () => {
    setMenuOpen(false)
    const shareData = {
      title: `Convention ${convention.code}`,
      text: `${convention.libelle} - Budget: ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(convention.budget)}`,
      url: `${window.location.origin}/conventions/${convention.id}`,
    }
    if (navigator.share) {
      try { await navigator.share(shareData) } catch { /* user cancelled */ }
    } else {
      handleCopyLink()
    }
  }

  // ── Duplicate ──
  const openDuplicateDialog = () => {
    setMenuOpen(false)
    setDuplicateCode(`${convention.code}-COPIE`)
    setDuplicateNumero(`${convention.numero}-COPIE`)
    setDuplicateDialogOpen(true)
  }

  const handleDuplicate = async () => {
    if (!duplicateCode.trim() || !duplicateNumero.trim()) return
    setLoading(true)
    try {
      const payload: CreateConventionDTO = {
        code: duplicateCode.trim(),
        numero: duplicateNumero.trim(),
        libelle: `${convention.libelle} (Copie)`,
        objet: convention.objet || '',
        typeConvention: convention.typeConvention,
        tauxCommission: convention.tauxCommission,
        budget: convention.budget,
        baseCalcul: convention.baseCalcul,
        tauxTva: convention.tauxTva,
        tauxTvaLignes: convention.tauxTvaLignes,
        dateDebut: convention.dateDebut,
        dateFin: convention.dateFin || null,
      }
      const res = await conventionsAPI.create(payload)
      const newId = res.data?.data?.id || res.data?.id
      showSuccess('Convention dupliquee avec succes')
      setDuplicateDialogOpen(false)
      if (newId) navigate(`/conventions/${newId}`)
    } catch {
      showError('Erreur lors de la duplication')
    } finally {
      setLoading(false)
    }
  }

  // ── Archive/Unarchive ──
  const handleArchive = async () => {
    setMenuOpen(false)
    try {
      if (convention.statut === 'ANNULE') {
        await conventionsAPI.remettreEnBrouillon(convention.id)
        showSuccess('Convention desarchivee')
      } else {
        await conventionsAPI.annuler(convention.id, 'Archive par l\'utilisateur')
        showSuccess('Convention archivee')
      }
      onReload()
    } catch {
      showError('Erreur lors de l\'operation')
    }
  }

  const isArchived = convention.statut === 'ANNULE'
  const canArchive = convention.statut !== 'ACHEVE'

  return (
    <>
      <Button
        ref={anchorRef}
        size="small"
        variant="outlined"
        onClick={() => setMenuOpen(true)}
        sx={{
          minWidth: 32, px: 0.75, py: 0.5,
          borderColor: colors.neutral[300],
          color: colors.textSecondary,
          '&:hover': { borderColor: colors.neutral[400], bgcolor: colors.neutral[50] },
        }}
      >
        <MoreVert sx={{ fontSize: 18 }} />
      </Button>

      <Menu
        anchorEl={anchorRef.current}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 200, boxShadow: '0 4px 20px rgba(0,0,0,0.12)' } } }}
      >
        <MenuItem onClick={handlePrint} sx={{ fontSize: typography.sizes.sm }}>
          <ListItemIcon><Print sx={{ fontSize: 18 }} /></ListItemIcon>
          <ListItemText>Imprimer</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleExportCSV} sx={{ fontSize: typography.sizes.sm }}>
          <ListItemIcon><FileDownload sx={{ fontSize: 18 }} /></ListItemIcon>
          <ListItemText>Exporter CSV</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={openDuplicateDialog} sx={{ fontSize: typography.sizes.sm }}>
          <ListItemIcon><ContentCopy sx={{ fontSize: 18 }} /></ListItemIcon>
          <ListItemText>Dupliquer</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleCopyLink} sx={{ fontSize: typography.sizes.sm }}>
          <ListItemIcon><Link sx={{ fontSize: 18 }} /></ListItemIcon>
          <ListItemText>Copier le lien</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleShare} sx={{ fontSize: typography.sizes.sm }}>
          <ListItemIcon><Share sx={{ fontSize: 18 }} /></ListItemIcon>
          <ListItemText>Partager</ListItemText>
        </MenuItem>
        {canArchive && (
          <>
            <Divider />
            <MenuItem onClick={handleArchive} sx={{ fontSize: typography.sizes.sm, color: isArchived ? colors.success[600] : colors.danger[600] }}>
              <ListItemIcon>{isArchived ? <Unarchive sx={{ fontSize: 18, color: colors.success[600] }} /> : <Archive sx={{ fontSize: 18, color: colors.danger[600] }} />}</ListItemIcon>
              <ListItemText>{isArchived ? 'Desarchiver' : 'Archiver'}</ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Duplicate Dialog */}
      <Dialog open={duplicateDialogOpen} onClose={() => setDuplicateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Dupliquer la convention</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField label="Code" fullWidth value={duplicateCode}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setDuplicateCode(e.target.value)} size="small" required />
          <TextField label="Numero" fullWidth value={duplicateNumero}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setDuplicateNumero(e.target.value)} size="small" required />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDuplicateDialogOpen(false)} disabled={loading}>Annuler</Button>
          <Button variant="contained" onClick={handleDuplicate}
            disabled={loading || !duplicateCode.trim() || !duplicateNumero.trim()}
            startIcon={loading ? <CircularProgress size={16} /> : <ContentCopy />}
            sx={{ bgcolor: colors.primary[600], '&:hover': { bgcolor: colors.primary[700] } }}>
            Dupliquer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ConventionActionsMenu
