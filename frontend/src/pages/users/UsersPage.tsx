import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Chip,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stack,
  Avatar,
} from '@mui/material'
import { Plus, RefreshCw, Edit2, Trash2, Shield, User } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { ControlPanel, StatusBadge } from '@/components/core'
import ConfirmDialog from '@/components/core/ConfirmDialog'
import { useToast } from '@/contexts/ToastContext'
import api from '@/lib/api'
import { colors, typography, componentStyles } from '@/lib/designSystem'

interface UserItem {
  id: number
  username: string
  email: string
  nom?: string
  prenom?: string
  role: 'ADMIN' | 'MANAGER' | 'USER'
  actif: boolean
  createdAt: string
}

const styles = componentStyles.listPage
const listStyles = componentStyles.listView

type RoleFilter = 'ALL' | 'ADMIN' | 'MANAGER' | 'USER'

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrateur',
  MANAGER: 'Gestionnaire',
  USER: 'Utilisateur',
}

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  ADMIN: { bg: colors.purple[50], text: colors.purple[700] },
  MANAGER: { bg: colors.info[50], text: colors.info[700] },
  USER: { bg: colors.success[50], text: colors.success[700] },
}

interface UserFormData {
  username: string
  email: string
  nom: string
  prenom: string
  password: string
  role: 'ADMIN' | 'MANAGER' | 'USER'
}

export default function UsersPage() {
  const { showToast } = useToast()
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<UserItem | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null }>({ open: false, id: null })
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    nom: '',
    prenom: '',
    password: '',
    role: 'USER',
  })

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.get('/users')
      setUsers(response.data)
    } catch {
      showToast('Erreur lors du chargement des utilisateurs', 'error')
    } finally {
      setLoading(false)
    }
  }

  const stats = useMemo(() => ({
    total: users.length,
    ADMIN: users.filter(u => u.role === 'ADMIN').length,
    MANAGER: users.filter(u => u.role === 'MANAGER').length,
    USER: users.filter(u => u.role === 'USER').length,
  }), [users])

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        if (!(
          u.username.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.nom?.toLowerCase() ?? '').includes(q) ||
          (u.prenom?.toLowerCase() ?? '').includes(q)
        )) return false
      }
      if (roleFilter !== 'ALL' && u.role !== roleFilter) return false
      return true
    })
  }, [users, searchTerm, roleFilter])

  const paginatedUsers = useMemo(() => {
    const start = page * rowsPerPage
    return filteredUsers.slice(start, start + rowsPerPage)
  }, [filteredUsers, page, rowsPerPage])

  const handleOpenDialog = (user: UserItem | null = null) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        username: user.username,
        email: user.email,
        nom: user.nom || '',
        prenom: user.prenom || '',
        password: '',
        role: user.role,
      })
    } else {
      setEditingUser(null)
      setFormData({ username: '', email: '', nom: '', prenom: '', password: '', role: 'USER' })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingUser(null)
  }

  const handleSubmit = async () => {
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, formData)
        showToast('Utilisateur modifie avec succes', 'success')
      } else {
        await api.post('/users', formData)
        showToast('Utilisateur cree avec succes', 'success')
      }
      handleCloseDialog()
      fetchUsers()
    } catch {
      showToast('Erreur lors de la sauvegarde', 'error')
    }
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return
    try {
      await api.delete(`/users/${deleteConfirm.id}`)
      showToast('Utilisateur supprime', 'success')
      fetchUsers()
    } catch {
      showToast('Erreur lors de la suppression', 'error')
    } finally {
      setDeleteConfirm({ open: false, id: null })
    }
  }

  const getAvatarColor = (role: string): string => {
    switch (role) {
      case 'ADMIN': return colors.purple[600]
      case 'MANAGER': return colors.info[600]
      default: return colors.success[600]
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <Box sx={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={40} />
        </Box>
      </AppLayout>
    )
  }

  const pStart = filteredUsers.length > 0 ? page * rowsPerPage + 1 : 0
  const pEnd = Math.min((page + 1) * rowsPerPage, filteredUsers.length)

  return (
    <AppLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: colors.background }}>
        <ControlPanel
          breadcrumbs={[{ label: 'Utilisateurs' }]}
          actions={
            <>
              <Button
                variant="contained"
                size="small"
                startIcon={<Plus size={16} />}
                onClick={() => handleOpenDialog()}
                sx={{ ...componentStyles.buttonPrimary, fontSize: typography.sizes.sm, py: 0.75 }}
              >
                Nouveau
              </Button>
              <IconButton size="small" onClick={fetchUsers} sx={{ color: colors.textSecondary }}>
                <RefreshCw size={16} />
              </IconButton>
            </>
          }
          searchValue={searchTerm}
          onSearchChange={(v) => { setSearchTerm(v); setPage(0) }}
          searchPlaceholder="Rechercher par nom, email, username..."
          paginationInfo={filteredUsers.length > 0 ? { currentStart: pStart, currentEnd: pEnd, total: filteredUsers.length } : undefined}
          onPreviousPage={() => setPage(p => Math.max(0, p - 1))}
          onNextPage={() => setPage(p => p + 1)}
        >
          {(['ALL', 'ADMIN', 'MANAGER', 'USER'] as const).map((role) => {
            const count = role === 'ALL' ? users.length : (stats[role] || 0)
            const isActive = roleFilter === role
            return (
              <Chip
                key={role}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{role === 'ALL' ? 'Tous' : ROLE_LABELS[role]}</span>
                    <Box component="span" sx={isActive ? styles.countBadge : styles.countBadgeInactive}>{count}</Box>
                  </Box>
                }
                onClick={() => { setRoleFilter(role); setPage(0) }}
                sx={isActive ? styles.filterPillActive : styles.filterPill}
              />
            )
          })}
        </ControlPanel>

        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Box sx={listStyles.container}>
            <TableContainer>
              <Table size="small" sx={listStyles.table}>
                <TableHead>
                  <TableRow sx={listStyles.headerRow}>
                    <TableCell>Utilisateur</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell align="center">Statut</TableCell>
                    <TableCell>Date creation</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                        <Typography sx={{ color: colors.textSecondary }}>
                          Aucun utilisateur trouve
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedUsers.map((user) => (
                      <TableRow key={user.id} sx={listStyles.dataRow}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: getAvatarColor(user.role), fontSize: typography.sizes.xs }}>
                              {user.role === 'ADMIN' ? <Shield size={14} /> : <User size={14} />}
                            </Avatar>
                            <Box>
                              <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.textPrimary }}>
                                {user.prenom} {user.nom}
                              </Typography>
                              <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                                @{user.username}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: colors.textSecondary, fontSize: typography.sizes.sm }}>
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <Box sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                            px: 1.5,
                            py: 0.5,
                            borderRadius: '4px',
                            bgcolor: ROLE_COLORS[user.role]?.bg || colors.neutral[100],
                            color: ROLE_COLORS[user.role]?.text || colors.textSecondary,
                            fontSize: typography.sizes.xs,
                            fontWeight: typography.weights.semibold,
                          }}>
                            {ROLE_LABELS[user.role] || user.role}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <StatusBadge status={user.actif ? 'ACTIF' : 'INACTIF'} size="small" />
                        </TableCell>
                        <TableCell sx={{ color: colors.textSecondary, fontSize: typography.sizes.sm }}>
                          {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                            <IconButton size="small" onClick={() => handleOpenDialog(user)} sx={{ color: colors.neutral[500] }}>
                              <Edit2 size={14} />
                            </IconButton>
                            <IconButton size="small" onClick={() => setDeleteConfirm({ open: true, id: user.id })} sx={{ color: colors.danger[500] }}>
                              <Trash2 size={14} />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={filteredUsers.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0) }}
              rowsPerPageOptions={[10, 25, 50]}
              labelRowsPerPage="Lignes par page"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
            />
          </Box>
        </Box>
      </Box>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth PaperProps={{ sx: componentStyles.dialog.paper }}>
        <DialogTitle sx={componentStyles.dialog.title}>
          {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField fullWidth label="Prenom" value={formData.prenom} onChange={(e) => setFormData({ ...formData, prenom: e.target.value })} size="small" />
              <TextField fullWidth label="Nom" value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} size="small" />
            </Stack>
            <TextField fullWidth required label="Username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} size="small" />
            <TextField fullWidth required label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} size="small" />
            {!editingUser && (
              <TextField fullWidth required label="Mot de passe" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} size="small" />
            )}
            <TextField fullWidth required select label="Role" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as UserFormData['role'] })} size="small">
              <MenuItem value="USER">Utilisateur</MenuItem>
              <MenuItem value="MANAGER">Gestionnaire</MenuItem>
              <MenuItem value="ADMIN">Administrateur</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseDialog} sx={componentStyles.buttonSecondary}>Annuler</Button>
          <Button onClick={handleSubmit} sx={componentStyles.buttonPrimary}>
            {editingUser ? 'Modifier' : 'Creer'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirm.open}
        title="Supprimer l'utilisateur"
        message="Cette action est irreversible. Voulez-vous continuer ?"
        variant="danger"
        confirmLabel="Supprimer"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ open: false, id: null })}
      />
    </AppLayout>
  )
}
