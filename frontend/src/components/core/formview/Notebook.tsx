import { ReactNode, useState } from 'react'
import { Box, Typography, Tabs, Tab } from '@mui/material'
import { componentStyles, colors, typography, borders } from '@/lib/designSystem'

interface NotebookProps {
  tabs: Array<{ label: string; count?: number; content: ReactNode }>
  tabActions?: ReactNode
}

/**
 * Notebook - Tabbed section inside the form view.
 */
const Notebook = ({ tabs, tabActions }: NotebookProps) => {
  const [activeTab, setActiveTab] = useState(0)
  const styles = componentStyles.formView

  return (
    <Box sx={styles.notebook}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Tabs
          value={activeTab}
          onChange={(_, val: number) => setActiveTab(val)}
          sx={styles.notebookTabs}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  {tab.label}
                  {tab.count !== undefined && (
                    <Typography
                      component="span"
                      sx={{
                        fontSize: typography.sizes['2xs'],
                        bgcolor: colors.neutral[200],
                        color: colors.neutral[600],
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
        <Box key={index} role="tabpanel" hidden={activeTab !== index}>
          {activeTab === index && <Box sx={{ py: 2 }}>{tab.content}</Box>}
        </Box>
      ))}
    </Box>
  )
}

export default Notebook
