# React Hook Form Integration

Standardized form handling across the application using **react-hook-form** with **Zod** validation.

## Components

### FormTextField
Text input field with validation and error display.

```typescript
<FormTextField
  name="code"
  control={control}
  label="Code"
  placeholder="CONV-2026-001"
  required
  type="text"
/>
```

**Props:**
- `name` - Field path in form data
- `control` - react-hook-form Control object
- `label` - Field label
- `placeholder` - Placeholder text
- `type` - Input type (text, email, password, tel, url)
- `multiline` - Enable multi-line textarea
- `rows` - Number of rows for multiline
- `fullWidth` - Stretch to container width
- `required` - Mark as required
- `disabled` - Disable field
- `error` - Additional error message

### FormNumberField
Number input field with min/max constraints.

```typescript
<FormNumberField
  name="montant"
  control={control}
  label="Montant (MAD)"
  placeholder="1000000.00"
  min={0}
  max={99999999}
  step={0.01}
  required
/>
```

**Props:**
- All props from FormTextField except `type`
- `min` - Minimum value
- `max` - Maximum value
- `step` - Increment step

### FormDateField
Date input field with automatic date parsing.

```typescript
<FormDateField
  name="dateDebut"
  control={control}
  label="Date Début"
  type="date"
  required
/>
```

**Props:**
- All props from FormTextField except `type`
- `type` - Date type (date, datetime-local, month)

### FormSelectField
Select dropdown with options.

```typescript
<FormSelectField
  name="status"
  control={control}
  label="Status"
  options={[
    { label: 'Brouillon', value: 'BROUILLON' },
    { label: 'Validé', value: 'VALIDEE' },
  ]}
  required
/>
```

**Props:**
- All props from FormTextField except `type`
- `options` - Array of { label, value }
- `multiple` - Allow multiple selections
- `placeholder` - Placeholder option

### FormRadioGroup
Radio button group selection.

```typescript
<FormRadioGroup
  name="type"
  control={control}
  label="Type"
  options={[
    { label: 'Cadre', value: 'CADRE' },
    { label: 'Spécifique', value: 'SPECIFIQUE' },
  ]}
  row={true}
/>
```

**Props:**
- All props from FormSelectField
- `row` - Display inline instead of stacked

### FormCheckbox
Single checkbox field.

```typescript
<FormCheckbox
  name="acceptTerms"
  control={control}
  label="I accept the terms"
/>
```

### FormErrors
Display all form validation errors.

```typescript
{Object.keys(errors).length > 0 && (
  <FormErrors errors={errors} />
)}
```

### FormSection
Organize form fields into sections with title and icon.

```typescript
<FormSection
  title="Personal Information"
  subtitle="Basic details"
  icon={<PersonIcon />}
  columns={2}
>
  <FormTextField name="firstName" control={control} label="First Name" />
  <FormTextField name="lastName" control={control} label="Last Name" />
</FormSection>
```

**Props:**
- `title` - Section title
- `subtitle` - Optional subtitle
- `icon` - Optional React node icon
- `columns` - Grid columns (1, 2, or 3)

## useFormHelper Hook

Custom hook for simplified form setup with Zod validation.

```typescript
const { control, handleSubmit, watch, errors, isSubmitting } = useFormHelper(
  createConventionSchema,
  {
    code: '',
    designation: '',
    dateDebut: new Date(),
  },
  async (data) => {
    await conventionsAPI.create(data)
    navigate('/conventions')
  }
)

return (
  <form onSubmit={handleSubmit}>
    {/* form fields */}
  </form>
)
```

**Features:**
- Automatic Zod validation integration
- Error handling and display
- Submit state tracking
- Convenient error getter method

## Validation Schemas

Pre-built schemas in `/src/schemas/forms.ts`:

- `loginSchema` / `LoginFormData`
- `registerSchema` / `RegisterFormData`
- `createConventionSchema` / `CreateConventionFormData`
- `updateConventionSchema` / `UpdateConventionFormData`
- `createProjectSchema` / `CreateProjectFormData`
- `createMarcheSchema` / `CreateMarcheFormData`
- `createFournisseurSchema` / `CreateFournisseurFormData`
- `createDecompteSchema` / `CreateDecompteFormData`
- `changePasswordSchema` / `ChangePasswordFormData`
- `updateProfileSchema` / `UpdateProfileFormData`

## Example: Complete Form

```typescript
import { useNavigate } from 'react-router-dom'
import { Button, Box, Stack } from '@mui/material'
import { useFormHelper } from '@/hooks/useFormHelper'
import { createConventionSchema } from '@/schemas/forms'
import { FormTextField, FormNumberField, FormDateField, FormSelectField, FormErrors } from '@/components/form'
import { conventionsAPI } from '@/lib/api'

export function MyForm() {
  const navigate = useNavigate()

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useFormHelper(
    createConventionSchema,
    {
      code: '',
      designation: '',
      tauxCommission: 2.5,
      montant: 0,
      dateDebut: new Date(),
      type: 'CADRE',
      baseCalcul: 'HT',
    },
    async (data) => {
      await conventionsAPI.create(data)
      navigate('/conventions')
    }
  )

  return (
    <form onSubmit={handleSubmit}>
      {Object.keys(errors).length > 0 && <FormErrors errors={errors} />}

      <Stack spacing={2}>
        <FormTextField
          name="code"
          control={control}
          label="Code"
          required
        />
        <FormTextField
          name="designation"
          control={control}
          label="Designation"
          required
        />
        <FormNumberField
          name="montant"
          control={control}
          label="Montant"
          min={0}
          required
        />
        <FormDateField
          name="dateDebut"
          control={control}
          label="Date Début"
          required
        />
        <FormSelectField
          name="type"
          control={control}
          label="Type"
          options={[
            { label: 'Cadre', value: 'CADRE' },
            { label: 'Spécifique', value: 'SPECIFIQUE' },
          ]}
          required
        />
      </Stack>

      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          Annuler
        </Button>
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </Box>
    </form>
  )
}
```

## Type Safety

All form data is fully typed:

```typescript
// Type is automatically inferred from schema
type ConventionData = CreateConventionFormData

// IDE autocomplete and type checking throughout
const { control, watch } = useFormHelper(createConventionSchema, initialData, onSubmit)
const code = watch('code') // TypeScript knows this is string
const montant = watch('montant') // TypeScript knows this is number
```

## Best Practices

1. **Always use schemas** - Define validation in schemas, not in components
2. **Type your components** - Use `<T extends FieldValues>` for reusable components
3. **Handle errors** - Display FormErrors component or individual field errors
4. **Use watch carefully** - Only watch fields you need
5. **Uncontrolled approach** - Let react-hook-form manage form state
6. **Validate on blur** - Use `mode: 'onBlur'` for better UX
7. **Reset after submit** - Call `reset()` after successful submission if needed

## Migration Guide

### Before (Manual State)
```typescript
const [formData, setFormData] = useState({ code: '' })

const handleChange = (e) => {
  setFormData({ ...formData, code: e.target.value })
}

const handleSubmit = async (e) => {
  e.preventDefault()
  // Manual validation
  if (!formData.code) {
    setError('Code required')
    return
  }
  // Manual submit logic
}
```

### After (react-hook-form)
```typescript
const { control, handleSubmit } = useFormHelper(
  createConventionSchema,
  { code: '' },
  async (data) => {
    // Validation automatic, submit ready
  }
)
```

**Benefits:**
- ✅ Automatic validation
- ✅ Type-safe form data
- ✅ Less boilerplate
- ✅ Better performance
- ✅ Standard patterns across app
