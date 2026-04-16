# /erp-detail-page - Create ERP Detail Page (Micro-Components)

Create a detail page following the micro-frontend + micro-backend pattern.

## Input

The user provides: entity name, sections/tabs needed.

## Steps

### Backend - Micro-Endpoints

1. `GET /{id}/basic` - Basic info (lightweight DTO)
2. `GET /{id}/stats` - Aggregated statistics
3. `GET /{id}/[sub-resource]` - Related collections (lazy loaded)
4. `GET /{id}/[sub-resource]/count` - Fast counts

### Frontend - Micro-Components

5. **Orchestrator Page** in `pages/[entity]/[Entity]DetailPage.tsx`
   - Does NOT load data itself
   - Passes `entityId` to each micro-component
   - Uses StickyActionBar with workflow actions
   - Max 300 lines

6. **Micro-components** in `components/[entity]/detail/`:
   - `[Entity]InfoCard.tsx` - Basic info (GET /basic)
   - `[Entity]StatsCard.tsx` - KPIs/metrics (GET /stats)
   - `[Entity]Tab[Name].tsx` - Tab content (GET /sub-resource)
   - Each component loads its OWN data independently
   - Each < 300 lines

7. **Barrel export** in `components/[entity]/detail/index.ts`

## Pattern
```tsx
// Orchestrator - no data loading
function EntityDetailPage() {
  const { id } = useParams()
  return (
    <>
      <StickyActionBar title="..." showBack />
      <EntityInfoCard entityId={Number(id)} />
      <EntityStatsCard entityId={Number(id)} />
      <Tabs>
        <EntityLignesTab entityId={Number(id)} />
        <EntityHistoryTab entityId={Number(id)} />
      </Tabs>
    </>
  )
}

// Micro-component - loads its own data
function EntityStatsCard({ entityId }: { entityId: number }) {
  const [stats, setStats] = useState<EntityStats | null>(null)
  useEffect(() => {
    entityAPI.getStats(entityId).then(r => setStats(r.data.data))
  }, [entityId])
  return <Card sx={componentStyles.statCard}>...</Card>
}
```
