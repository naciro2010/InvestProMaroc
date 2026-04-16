# /erp-form - Create ERP Form Page

Create a create/edit form page following InvestPro patterns.

## Input

The user provides: entity name, fields, and validation rules.

## Steps

1. **Form Page** in `pages/[entity]/[Entity]FormPage.tsx`
   - StickyActionBar with title, back button, submit
   - FormLayout > FormPageSection > FormGroup > FormField
   - Use core form components (FormTextField, FormNumberField, etc.)
   - Handle both create and edit modes via URL params

2. **Validation** - Client-side with required fields
3. **API call** - POST for create, PUT for edit
4. **Navigation** - Redirect to detail/list after success
5. **Toast notification** on success/error

## Template
```tsx
import { StickyActionBar, FormLayout, FormPageSection, FormGroup, FormField } from '@/components/core'

function EntityFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateEntityRequest>({ ... })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isEdit) await entityAPI.update(Number(id), formData)
      else await entityAPI.create(formData)
      navigate('/entities')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit}>
      <StickyActionBar
        title={isEdit ? 'Modifier' : 'Nouveau'}
        showBack backUrl="/entities"
        isSubmitting={loading}
        submitType="submit"
      />
      <FormLayout>
        <FormPageSection title="Informations" divider={false}>
          <FormGroup columns={2}>
            <FormField>
              <TextField label="Code" value={formData.code}
                onChange={e => setFormData({...formData, code: e.target.value})}
                required />
            </FormField>
          </FormGroup>
        </FormPageSection>
      </FormLayout>
    </form>
  )
}
```
