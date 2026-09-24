import { Box } from '@mui/material'
import { Check } from 'lucide-react'
import { componentStyles } from '@/lib/designSystem'

export interface StatusStep {
  value: string
  label: string
  /** Use 'danger' for rejected/cancelled states */
  variant?: 'danger'
}

type StepState = 'done' | 'active' | 'future' | 'danger'

interface StatusCircuitProps {
  steps: StatusStep[]
  currentStatus?: string
}

const styles = componentStyles.formView

const STEP_STYLES: Record<StepState, { pill: object; marker: object }> = {
  done: { pill: styles.statusPipelineStepDone, marker: styles.statusStepMarkerDone },
  active: { pill: styles.statusPipelineStepActive, marker: styles.statusStepMarkerActive },
  future: { pill: styles.statusPipelineStep, marker: styles.statusStepMarkerFuture },
  danger: { pill: styles.statusPipelineStepDanger, marker: styles.statusStepMarkerDanger },
}

/**
 * StatusCircuit - Circuit de validation en pastilles numérotées.
 * Étape faite : ✓ vert · courante : bleu nuit cerclé de laiton · rejet/annulation : rouge « ! ».
 */
const StatusCircuit = ({ steps, currentStatus }: StatusCircuitProps) => {
  const currentIdx = steps.findIndex(s => s.value === currentStatus)

  const stateOf = (step: StatusStep, idx: number): StepState => {
    if (currentIdx < 0) return 'future'
    if (idx === currentIdx) return step.variant === 'danger' ? 'danger' : 'active'
    return idx < currentIdx ? 'done' : 'future'
  }

  return (
    <Box component="ol" aria-label="Circuit de validation" sx={{ ...styles.statusPipeline, m: 0, p: 0, listStyle: 'none' }}>
      {steps.map((step, index) => {
        const state = stateOf(step, index)
        return (
          <Box
            component="li"
            key={step.value}
            aria-current={state === 'active' || state === 'danger' ? 'step' : undefined}
            sx={{ ...STEP_STYLES[state].pill, display: 'flex', alignItems: 'center' }}
          >
            <Box component="span" aria-hidden="true" sx={{ ...styles.statusStepMarker, ...STEP_STYLES[state].marker }}>
              {state === 'done' ? <Check size={12} strokeWidth={3} /> : state === 'danger' ? '!' : index + 1}
            </Box>
            {step.label}
          </Box>
        )
      })}
    </Box>
  )
}

export default StatusCircuit
