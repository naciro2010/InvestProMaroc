import { useState, useEffect } from 'react'
import { Box, Button, Paper, Typography, Stack, TextField, CircularProgress, Container } from '@mui/material'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import AppLayout from '../../components/layout/AppLayout'
import PageHeader from '../../components/common/PageHeader'
import SelectWithQuickCreate from '../../components/ui/SelectWithQuickCreate'
import { categoriesDepensesAPI, partenairesAPI } from '../../lib/api'
import { useToast } from '../../contexts/ToastContext'
import type { CategorieDepenseListDTO, PartenaireListDTO } from '../../types/api'
import { Lightbulb } from '@mui/icons-material'

// Form schema
const demoFormSchema = z.object({
  categorieDepenseId: z.number({ required_error: 'Catégorie requise' }),
  partenaireId: z.number({ required_error: 'Partenaire requis' }),
  description: z.string().optional(),
})

type DemoFormData = z.infer<typeof demoFormSchema>

const SelectWithQuickCreateDemo = () => {
  const { showToast } = useToast()
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [partenairesLoading, setPartenairesLoading] = useState(true)
  const [categories, setCategories] = useState<CategorieDepenseListDTO[]>([])
  const [partenaires, setPartenaires] = useState<PartenaireListDTO[]>([])

  // Quick create modal states
  const [categorieModalOpen, setCategorieModalOpen] = useState(false)
  const [partenaireModalOpen, setPartenaireModalOpen] = useState(false)

  // Quick create form data
  const [newCategorie, setNewCategorie] = useState({ code: '', libelle: '' })
  const [newPartenaire, setNewPartenaire] = useState({ code: '', raisonSociale: '' })
  const [saving, setSaving] = useState(false)

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DemoFormData>({
    resolver: zodResolver(demoFormSchema),
    defaultValues: {
      description: '',
    },
  })

  // Load categories
  const loadCategories = async () => {
    try {
      setCategoriesLoading(true)
      const response = await categoriesDepensesAPI.getList()
      setCategories(response.data.data || response.data || [])
    } catch (error) {
      showToast('Erreur lors du chargement des catégories', 'error')
    } finally {
      setCategoriesLoading(false)
    }
  }

  // Load partenaires
  const loadPartenaires = async () => {
    try {
      setPartenairesLoading(true)
      const response = await partenairesAPI.getList()
      setPartenaires(response.data.data || response.data || [])
    } catch (error) {
      showToast('Erreur lors du chargement des partenaires', 'error')
    } finally {
      setPartenairesLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
    loadPartenaires()
  }, [])

  // Handle create categorie
  const handleCreateCategorie = async () => {
    try {
      setSaving(true)
      const response = await categoriesDepensesAPI.create(newCategorie)
      const created = response.data.data || response.data
      showToast('Catégorie créée avec succès', 'success')
      setCategorieModalOpen(false)
      setNewCategorie({ code: '', libelle: '' })
      await loadCategories()
      setValue('categorieDepenseId', created.id)
    } catch (error) {
      showToast('Erreur lors de la création', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Handle create partenaire
  const handleCreatePartenaire = async () => {
    try {
      setSaving(true)
      const response = await partenairesAPI.create(newPartenaire)
      const created = response.data.data || response.data
      showToast('Partenaire créé avec succès', 'success')
      setPartenaireModalOpen(false)
      setNewPartenaire({ code: '', raisonSociale: '' })
      await loadPartenaires()
      setValue('partenaireId', created.id)
    } catch (error) {
      showToast('Erreur lors de la création', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Handle form submit
  const onSubmit = (data: DemoFormData) => {
    showToast(
      `Formulaire validé: Catégorie=${data.categorieDepenseId}, Partenaire=${data.partenaireId}`,
      'success'
    )
    console.log('Form data:', data)
  }

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <PageHeader
          title="Démonstration SelectWithQuickCreate"
          subtitle="Exemple d'utilisation du composant SelectWithQuickCreate avec les référentiels"
          icon={<Lightbulb />}
        />

        {/* Info Box */}
        <Paper
          sx={{
            p: 3,
            mb: 4,
            background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
            border: '1px solid #0ea5e9',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#0369a1' }}>
            💡 Comment utiliser ce composant
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Le composant <code>SelectWithQuickCreate</code> permet de:
          </Typography>
          <ul style={{ marginTop: 8, paddingLeft: 20 }}>
            <li>
              <Typography variant="body2">
                ✅ Sélectionner une valeur existante depuis une liste déroulante
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                ✅ Créer rapidement une nouvelle valeur sans quitter le formulaire
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                ✅ Rechercher et filtrer les options facilement
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                ✅ Recharger automatiquement la liste après création
              </Typography>
            </li>
          </ul>
          <Typography variant="body2" sx={{ mt: 2, fontWeight: 600 }}>
            👇 Essayez de sélectionner ou créer une catégorie et un partenaire ci-dessous
          </Typography>
        </Paper>

        {/* Demo Form */}
        <Paper sx={{ p: 4 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={4}>
              {/* SelectWithQuickCreate for CategorieDepense */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  1️⃣ Catégorie de Dépense
                </Typography>
                <SelectWithQuickCreate
                  name="categorieDepenseId"
                  control={control}
                  label="Catégorie de Dépense"
                  options={categories.map((cat) => ({
                    id: cat.id,
                    label: `${cat.code} - ${cat.libelle}`,
                  }))}
                  loading={categoriesLoading}
                  createModalOpen={categorieModalOpen}
                  onOpenCreateModal={() => setCategorieModalOpen(true)}
                  onCloseCreateModal={() => {
                    setCategorieModalOpen(false)
                    setNewCategorie({ code: '', libelle: '' })
                  }}
                  createModalTitle="Nouvelle Catégorie de Dépense"
                  createModalContent={
                    <Stack spacing={2} sx={{ p: 2 }}>
                      <TextField
                        label="Code"
                        value={newCategorie.code}
                        onChange={(e) =>
                          setNewCategorie({ ...newCategorie, code: e.target.value.toUpperCase() })
                        }
                        placeholder="TRAV"
                        required
                        fullWidth
                      />
                      <TextField
                        label="Libellé"
                        value={newCategorie.libelle}
                        onChange={(e) =>
                          setNewCategorie({ ...newCategorie, libelle: e.target.value })
                        }
                        placeholder="Travaux"
                        required
                        fullWidth
                      />
                    </Stack>
                  }
                  onCreateSubmit={handleCreateCategorie}
                  createDisabled={!newCategorie.code || !newCategorie.libelle}
                  createLoading={saving}
                  error={!!errors.categorieDepenseId}
                  helperText={errors.categorieDepenseId?.message}
                />
              </Box>

              {/* SelectWithQuickCreate for Partenaire */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  2️⃣ Partenaire
                </Typography>
                <SelectWithQuickCreate
                  name="partenaireId"
                  control={control}
                  label="Partenaire"
                  options={partenaires.map((p) => ({
                    id: p.id,
                    label: `${p.code} - ${p.raisonSociale}`,
                  }))}
                  loading={partenairesLoading}
                  createModalOpen={partenaireModalOpen}
                  onOpenCreateModal={() => setPartenaireModalOpen(true)}
                  onCloseCreateModal={() => {
                    setPartenaireModalOpen(false)
                    setNewPartenaire({ code: '', raisonSociale: '' })
                  }}
                  createModalTitle="Nouveau Partenaire"
                  createModalContent={
                    <Stack spacing={2} sx={{ p: 2 }}>
                      <TextField
                        label="Code"
                        value={newPartenaire.code}
                        onChange={(e) =>
                          setNewPartenaire({ ...newPartenaire, code: e.target.value.toUpperCase() })
                        }
                        placeholder="AFD"
                        required
                        fullWidth
                      />
                      <TextField
                        label="Raison Sociale"
                        value={newPartenaire.raisonSociale}
                        onChange={(e) =>
                          setNewPartenaire({ ...newPartenaire, raisonSociale: e.target.value })
                        }
                        placeholder="Agence Française de Développement"
                        required
                        fullWidth
                      />
                    </Stack>
                  }
                  onCreateSubmit={handleCreatePartenaire}
                  createDisabled={!newPartenaire.code || !newPartenaire.raisonSociale}
                  createLoading={saving}
                  error={!!errors.partenaireId}
                  helperText={errors.partenaireId?.message}
                />
              </Box>

              {/* Additional field */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  3️⃣ Description (optionnel)
                </Typography>
                <TextField
                  label="Description"
                  multiline
                  rows={3}
                  fullWidth
                  placeholder="Ajoutez une description..."
                />
              </Box>

              {/* Submit Button */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  sx={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)',
                  }}
                >
                  {isSubmitting && <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />}
                  Valider le formulaire
                </Button>
              </Box>
            </Stack>
          </form>
        </Paper>

        {/* Code Example */}
        <Paper sx={{ p: 4, mt: 4, backgroundColor: '#1e293b' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#f8fafc' }}>
            📝 Exemple de Code
          </Typography>
          <Box
            component="pre"
            sx={{
              backgroundColor: '#0f172a',
              color: '#e2e8f0',
              p: 3,
              borderRadius: 2,
              overflow: 'auto',
              fontSize: '0.875rem',
              fontFamily: 'monospace',
            }}
          >
            {`<SelectWithQuickCreate
  name="categorieDepenseId"
  control={control}
  label="Catégorie de Dépense"
  options={categories.map(cat => ({
    id: cat.id,
    label: \`\${cat.code} - \${cat.libelle}\`
  }))}
  loading={loading}
  createModalOpen={modalOpen}
  onOpenCreateModal={() => setModalOpen(true)}
  onCloseCreateModal={() => setModalOpen(false)}
  createModalTitle="Nouvelle Catégorie"
  createModalContent={
    <TextField label="Code" />
    <TextField label="Libellé" />
  }
  onCreateSubmit={handleCreate}
  createDisabled={!formValid}
  error={!!errors.categorieDepenseId}
  helperText={errors.categorieDepenseId?.message}
/>`}
          </Box>
        </Paper>
      </Container>
    </AppLayout>
  )
}

export default SelectWithQuickCreateDemo
