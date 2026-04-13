import { Box, Typography, Button } from '@mui/material'
import { Home, ArrowLeft, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { colors } from '@/lib/designSystem'

const NotFoundPage = () => {
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        p: 4,
        bgcolor: colors.primary[25],
      }}
    >
      <Box
        sx={{
          width: 96,
          height: 96,
          borderRadius: '50%',
          bgcolor: colors.primary[50],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1,
        }}
      >
        <Search size={44} color={colors.primary[400]} />
      </Box>

      <Typography
        variant="h1"
        sx={{
          fontSize: '5rem',
          fontWeight: 800,
          color: colors.primary[200],
          lineHeight: 1,
        }}
      >
        404
      </Typography>

      <Typography variant="h5" sx={{ fontWeight: 600, color: colors.primary[800] }}>
        Page introuvable
      </Typography>

      <Typography
        variant="body1"
        sx={{ color: colors.primary[500], textAlign: 'center', maxWidth: 420 }}
      >
        La page que vous recherchez n'existe pas ou a été déplacée.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowLeft size={16} />}
          onClick={() => navigate(-1)}
          sx={{ borderColor: colors.primary[200], color: colors.primary[600] }}
        >
          Retour
        </Button>
        <Button
          variant="contained"
          startIcon={<Home size={16} />}
          onClick={() => navigate('/dashboard')}
          sx={{ bgcolor: colors.primary[600], '&:hover': { bgcolor: colors.primary[700] } }}
        >
          Tableau de bord
        </Button>
      </Box>
    </Box>
  )
}

export default NotFoundPage
