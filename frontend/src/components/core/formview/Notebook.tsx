import { ReactNode, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Box, Typography, Tabs, Tab } from '@mui/material'
import { componentStyles, colors, typography, borders } from '@/lib/designSystem'

interface NotebookTab {
  label: string
  count?: number
  content: ReactNode
  /** Identifiant stable pour la synchronisation URL (deep-linking). */
  id?: string
}

interface NotebookProps {
  tabs: NotebookTab[]
  tabActions?: ReactNode
  /**
   * Si fourni, l'onglet actif est synchronisé avec ce paramètre d'URL
   * (ex: "tab" -> ?tab=marches). Rend les onglets partageables/bookmarkables
   * et préservés au rafraîchissement. Nécessite un `id` par onglet.
   */
  syncParam?: string
  /** Rend l'en-tête d'onglets collant (sticky) lors du défilement. */
  sticky?: boolean
  /** Décalage `top` du sticky (number/px ou objet responsive MUI). */
  stickyTop?: number | string | Record<string, number | string>
  /** Notifié à chaque changement d'onglet (utile pour le chargement paresseux). */
  onTabChange?: (index: number, id?: string) => void
}

/**
 * Notebook - Section à onglets de la vue formulaire.
 *
 * Ne monte que le contenu de l'onglet actif (chargement paresseux par onglet).
 * Supporte le deep-linking par URL et un en-tête collant, de façon optionnelle
 * et rétro-compatible.
 */
const Notebook = ({ tabs, tabActions, syncParam, sticky, stickyTop = 0, onTabChange }: NotebookProps) => {
  const styles = componentStyles.formView
  const [searchParams, setSearchParams] = useSearchParams()
  const [internalTab, setInternalTab] = useState(0)

  const urlIndex = syncParam ? tabs.findIndex((t) => t.id && t.id === searchParams.get(syncParam)) : -1
  const activeTab = syncParam ? (urlIndex >= 0 ? urlIndex : 0) : internalTab

  const handleChange = (val: number) => {
    if (syncParam) {
      const next = new URLSearchParams(searchParams)
      const id = tabs[val]?.id
      if (id) next.set(syncParam, id)
      else next.delete(syncParam)
      setSearchParams(next, { replace: true })
    } else {
      setInternalTab(val)
    }
    onTabChange?.(val, tabs[val]?.id)
  }

  const tabId = (tab: NotebookTab, index: number) => `notebook-tab-${tab.id ?? index}`
  const panelId = (tab: NotebookTab, index: number) => `notebook-panel-${tab.id ?? index}`

  return (
    <Box sx={styles.notebook}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          ...(sticky
            ? {
                position: 'sticky',
                top: stickyTop,
                zIndex: 5,
                bgcolor: colors.surface,
                borderBottom: `1px solid ${colors.border}`,
              }
            : {}),
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, val: number) => handleChange(val)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={styles.notebookTabs}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              id={tabId(tab, index)}
              aria-controls={panelId(tab, index)}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  {tab.label}
                  {tab.count !== undefined && (
                    <Typography
                      component="span"
                      sx={{
                        fontSize: typography.sizes['2xs'],
                        bgcolor: activeTab === index ? colors.primary[100] : colors.neutral[200],
                        color: activeTab === index ? colors.primary[700] : colors.neutral[600],
                        borderRadius: borders.radius.full,
                        px: 0.75,
                        minWidth: 18,
                        height: 18,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: typography.weights.semibold,
                      }}
                    >
                      {tab.count}
                    </Typography>
                  )}
                </Box>
              }
            />
          ))}
        </Tabs>
        {tabActions && <Box sx={{ ml: 'auto', pl: 2 }}>{tabActions}</Box>}
      </Box>

      {tabs.map((tab, index) => (
        <Box
          key={index}
          role="tabpanel"
          hidden={activeTab !== index}
          id={panelId(tab, index)}
          aria-labelledby={tabId(tab, index)}
        >
          {activeTab === index && <Box sx={{ py: 2 }}>{tab.content}</Box>}
        </Box>
      ))}
    </Box>
  )
}

export default Notebook
