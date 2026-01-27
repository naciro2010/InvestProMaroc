import { useNavigate } from 'react-router-dom'
import { AxiosError } from 'axios'
import { useFormHelper } from '../../hooks/useFormHelper'
import { createConventionSchema, type CreateConventionFormData } from '../../schemas/forms'
import {
  FormTextField,
  FormNumberField,
  FormDateField,
  FormSelectField,
  FormErrors,
} from '../../components/form'
import { conventionsAPI } from '../../lib/api'
import AppLayout from '../../components/layout/AppLayout'
import RichTextEditor from '../../components/ui/RichTextEditor'
import {
  PageHeader,
  StickyActionBar,
  FormLayout,
  FormPageSection,
  FormGroup,
  FormField,
} from '../../components/core'

const SimpleConventionForm = () => {
  const navigate = useNavigate()

  const {
    control,
    handleSubmit: handleFormSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useFormHelper(
    createConventionSchema,
    {
      code: '',
      designation: '',
      objet: '',
      type: 'CADRE',
      tauxCommission: 2.5,
      montant: 0,
      dateDebut: new Date(),
      dateFin: undefined,
      description: '',
      baseCalcul: 'HT',
      tauxTva: 20,
    },
    async (data: CreateConventionFormData) => {
      try {
        await conventionsAPI.create(data)
        navigate('/conventions')
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          throw new Error(error.response?.data?.message || 'Erreur lors de la création')
        }
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Erreur inconnue lors de la création')
      }
    }
  )

  const objetValue = watch('objet')

  const handleObjetChange = (content: string) => {
    setValue('objet', content)
  }

  return (
    <AppLayout>
      <PageHeader
        title="Nouvelle Convention"
        subtitle="Créez une nouvelle convention avec les détails complets"
        breadcrumbs={[
          { label: 'Accueil', path: '/dashboard' },
          { label: 'Conventions', path: '/conventions' },
          { label: 'Nouvelle Convention' },
        ]}
      />

      {Object.keys(errors).length > 0 && <FormErrors errors={errors} />}

      <form onSubmit={handleFormSubmit}>
        <StickyActionBar
          title="Nouvelle Convention"
          showBack
          backUrl="/conventions"
          isSubmitting={isSubmitting}
          submitType="submit"
        />

        <FormLayout>
          {/* Section 1: Informations Générales */}
          <FormPageSection
            title="Informations Générales"
            description="Code et désignation de la convention"
            divider={false}
          >
            <FormGroup>
              <FormField>
                <FormTextField
                  name="code"
                  control={control}
                  label="Code"
                  placeholder="CONV-2026-001"
                  required
                />
              </FormField>
              <FormField>
                <FormTextField
                  name="designation"
                  control={control}
                  label="Désignation"
                  placeholder="Convention de financement..."
                  required
                />
              </FormField>
            </FormGroup>
          </FormPageSection>

          {/* Section 2: Description */}
          <FormPageSection
            title="Objet de la Convention"
            description="Description détaillée avec options de formatage"
          >
            <FormGroup columns={1}>
              <FormField fullWidth>
                <RichTextEditor
                  label="Objet"
                  value={objetValue || ''}
                  onChange={handleObjetChange}
                  placeholder="Description détaillée de la convention..."
                  minHeight="250px"
                />
              </FormField>
            </FormGroup>
          </FormPageSection>

          {/* Section 3: Type et Budget */}
          <FormPageSection
            title="Type et Budget"
            description="Paramètres financiers de la convention"
          >
            <FormGroup>
              <FormField>
                <FormSelectField
                  name="type"
                  control={control}
                  label="Type"
                  options={[
                    { label: 'Convention Cadre', value: 'CADRE' },
                    { label: 'Convention Simple', value: 'NON_CADRE' },
                  ]}
                  required
                />
              </FormField>
              <FormField>
                <FormNumberField
                  name="montant"
                  control={control}
                  label="Montant (MAD)"
                  placeholder="1000000.00"
                  min={0}
                  required
                />
              </FormField>
            </FormGroup>
          </FormPageSection>

          {/* Section 4: Dates */}
          <FormPageSection
            title="Dates"
            description="Période de validité de la convention"
          >
            <FormGroup>
              <FormField>
                <FormDateField
                  name="dateDebut"
                  control={control}
                  label="Date Début"
                  required
                />
              </FormField>
              <FormField>
                <FormDateField
                  name="dateFin"
                  control={control}
                  label="Date Fin (optionnel)"
                />
              </FormField>
            </FormGroup>
          </FormPageSection>

          {/* Section 5: Commission */}
          <FormPageSection
            title="Configuration Commission"
            description="Taux de commission et base de calcul"
          >
            <FormGroup>
              <FormField>
                <FormNumberField
                  name="tauxCommission"
                  control={control}
                  label="Taux Commission (%)"
                  min={0}
                  max={100}
                  step={0.01}
                  required
                />
              </FormField>
              <FormField>
                <FormSelectField
                  name="baseCalcul"
                  control={control}
                  label="Base de Calcul"
                  options={[
                    { label: 'HT', value: 'HT' },
                    { label: 'TTC', value: 'TTC' },
                  ]}
                  required
                />
              </FormField>
            </FormGroup>
            <FormGroup columns={1}>
              <FormField>
                <FormNumberField
                  name="tauxTva"
                  control={control}
                  label="Taux TVA (%)"
                  min={0}
                  max={100}
                  step={0.01}
                />
              </FormField>
            </FormGroup>
          </FormPageSection>
        </FormLayout>
      </form>
    </AppLayout>
  )
}

export default SimpleConventionForm
