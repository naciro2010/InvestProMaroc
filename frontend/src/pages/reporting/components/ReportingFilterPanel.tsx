import {
  Button, Card, CardContent, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography,
} from '@mui/material'
import { BarChart as BarChartIcon, TableChart as TableIcon } from '@mui/icons-material'

interface Dimension {
  id: number
  code: string
  nom: string
  active: boolean
}

interface ReportingFilterPanelProps {
  dimensions: Dimension[]
  selectedType: string
  onTypeChange: (type: string) => void
  viewMode: 'simple' | 'croise'
  onViewModeChange: (mode: 'simple' | 'croise') => void
  selectedDim1: string
  onDim1Change: (dim: string) => void
  selectedDim2: string
  onDim2Change: (dim: string) => void
  dateDebut: string
  onDateDebutChange: (date: string) => void
  dateFin: string
  onDateFinChange: (date: string) => void
  loading: boolean
  onAnalyze: () => void
}

const ReportingFilterPanel = ({
  dimensions, selectedType, onTypeChange, viewMode, onViewModeChange,
  selectedDim1, onDim1Change, selectedDim2, onDim2Change,
  dateDebut, onDateDebutChange, dateFin, onDateFinChange, loading, onAnalyze,
}: ReportingFilterPanelProps) => (
  <Card sx={{ mb: 3 }}>
    <CardContent>
      <Stack spacing={2}>
        <Typography variant="h6">Configuration de l'Analyse</Typography>

        <Stack direction="row" spacing={2}>
          <FormControl fullWidth>
            <InputLabel>Type de Données</InputLabel>
            <Select value={selectedType} onChange={(e) => onTypeChange(e.target.value)} label="Type de Données">
              <MenuItem value="BUDGET">Budget</MenuItem>
              <MenuItem value="DECOMPTE">Décompte</MenuItem>
              <MenuItem value="PAIEMENT">Paiement</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Mode d'Analyse</InputLabel>
            <Select value={viewMode} onChange={(e) => onViewModeChange(e.target.value as 'simple' | 'croise')} label="Mode d'Analyse">
              <MenuItem value="simple">Simple (1 dimension)</MenuItem>
              <MenuItem value="croise">Croisé (2 dimensions)</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <Stack direction="row" spacing={2}>
          <FormControl fullWidth>
            <InputLabel>Dimension 1</InputLabel>
            <Select value={selectedDim1} onChange={(e) => onDim1Change(e.target.value)} label="Dimension 1">
              {dimensions.map((dim) => (
                <MenuItem key={dim.code} value={dim.code}>{dim.nom} ({dim.code})</MenuItem>
              ))}
            </Select>
          </FormControl>
          {viewMode === 'croise' && (
            <FormControl fullWidth>
              <InputLabel>Dimension 2</InputLabel>
              <Select value={selectedDim2} onChange={(e) => onDim2Change(e.target.value)} label="Dimension 2">
                {dimensions.filter((d) => d.code !== selectedDim1).map((dim) => (
                  <MenuItem key={dim.code} value={dim.code}>{dim.nom} ({dim.code})</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Stack>

        <Stack direction="row" spacing={2}>
          <TextField label="Date Début" type="date" value={dateDebut} onChange={(e) => onDateDebutChange(e.target.value)}
            InputLabelProps={{ shrink: true }} fullWidth helperText="Optionnel - Filtre par période" />
          <TextField label="Date Fin" type="date" value={dateFin} onChange={(e) => onDateFinChange(e.target.value)}
            InputLabelProps={{ shrink: true }} fullWidth helperText="Optionnel - Filtre par période" />
        </Stack>

        <Button variant="contained" onClick={onAnalyze} disabled={loading || !selectedDim1}
          startIcon={viewMode === 'simple' ? <BarChartIcon /> : <TableIcon />}>
          {loading ? 'Analyse en cours...' : 'Analyser'}
        </Button>
      </Stack>
    </CardContent>
  </Card>
)

export default ReportingFilterPanel
