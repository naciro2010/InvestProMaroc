import { useState } from 'react'
import { Box, Paper, Typography, Chip, Divider, Button } from '@mui/material'
import { ExpandMore, ExpandLess, Lock, LockOpen } from '@mui/icons-material'

interface Convention {
  id: number
  code: string
  numero: string
  libelle: string
  objet: string
  typeConvention: 'CADRE' | 'SPECIFIQUE'
  statut: string
  tauxCommission: number
  baseCalcul: string
  montant: number
  dateSignature: string
  dateDebut: string
  dateFin?: string
  tauxTva: number
}

interface ConventionInfoCardProps {
  convention: Convention
  canEdit: boolean
  getStatusColor: (statut: string) => 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
}

const ConventionInfoCard = ({ convention, canEdit, getStatusColor }: ConventionInfoCardProps) => {
  const [expandedDescription, setExpandedDescription] = useState(false)

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
        Informations Générales
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Box sx={{ display: 'grid', gap: 3 }}>
        {/* Type & Statut - More Prominent */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              Type de convention
            </Typography>
            <Chip
              label={convention.typeConvention}
              color={convention.typeConvention === 'CADRE' ? 'secondary' : 'info'}
              sx={{ fontWeight: 600, fontSize: '0.875rem', px: 1 }}
            />
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              Statut
            </Typography>
            <Chip
              label={convention.statut}
              color={getStatusColor(convention.statut)}
              icon={canEdit ? <LockOpen /> : <Lock />}
              sx={{ fontWeight: 600, fontSize: '0.875rem', px: 1 }}
            />
          </Box>
        </Box>

        <Divider />

        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Libellé de la convention
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            {convention.libelle}
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Objet de la convention
          </Typography>
          {(() => {
            const objetText = convention.objet || ''
            const isLongText = objetText.length > 300
            return (
              <>
                <Box
                  sx={{
                    '& p': { margin: '0.5em 0' },
                    '& ul, & ol': { marginLeft: '1.5em' },
                    '& strong': { fontWeight: 600 },
                    '& em': { fontStyle: 'italic' },
                    maxHeight: expandedDescription ? 'none' : '100px',
                    overflow: 'hidden',
                    position: 'relative',
                    '&::after': !expandedDescription && isLongText
                      ? {
                          content: '""',
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '40px',
                          background: 'linear-gradient(transparent, white)',
                        }
                      : {},
                  }}
                  dangerouslySetInnerHTML={{ __html: objetText }}
                />
                {isLongText && (
                  <Button
                    size="small"
                    onClick={() => setExpandedDescription(!expandedDescription)}
                    endIcon={expandedDescription ? <ExpandLess /> : <ExpandMore />}
                    sx={{ mt: 1 }}
                  >
                    {expandedDescription ? 'Voir moins' : 'Voir plus'}
                  </Button>
                )}
              </>
            )
          })()}
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Taux de la commission d'intervention
          </Typography>
          <Typography variant="body1" fontWeight={600} color="primary">
            {convention.tauxCommission}% {convention.baseCalcul === 'DECAISSEMENTS_HT' ? 'HT' : 'TTC'} sur les
            décaissements
          </Typography>
        </Box>
      </Box>
    </Paper>
  )
}

export default ConventionInfoCard
