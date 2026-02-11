import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

// Fix for default marker icon
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)['_getIconUrl']
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Interface compatible avec MarcheListDTO du backend (champs plats)
interface Marche {
  id: number
  numeroMarche: string
  objet: string
  adresse: string | null
  latitude: number | null
  longitude: number | null
  zoneGeographique: string | null
  montantTtc: number
  statut: string
  // Champ plat au lieu d'objet imbriqué
  fournisseurNom?: string
}

interface MarchesMapViewProps {
  marches: Marche[]
}

const MarchesMapView = ({ marches }: MarchesMapViewProps) => {
  // Filter marches with valid coordinates
  const geolocatedMarches = marches.filter(
    (m) => m.latitude && m.longitude && !isNaN(m.latitude) && !isNaN(m.longitude)
  )

  // Default center: Morocco (Rabat)
  const defaultCenter: [number, number] = [33.9716, -6.8498]

  // Calculate map center based on all markers
  const getMapCenter = (): [number, number] => {
    if (geolocatedMarches.length === 0) return defaultCenter

    const avgLat =
      geolocatedMarches.reduce((sum, m) => sum + (m.latitude || 0), 0) / geolocatedMarches.length
    const avgLng =
      geolocatedMarches.reduce((sum, m) => sum + (m.longitude || 0), 0) / geolocatedMarches.length

    return [avgLat, avgLng]
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      notation: 'compact',
      compactDisplay: 'short',
    }).format(amount)
  }

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'VALIDE':
        return 'bg-green-100 text-green-800'
      case 'EN_COURS':
        return 'bg-blue-100 text-blue-800'
      case 'TERMINE':
        return 'bg-gray-100 text-gray-800'
      case 'SUSPENDU':
        return 'bg-yellow-100 text-yellow-800'
      case 'ANNULE':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case 'VALIDE':
        return 'Validé'
      case 'EN_COURS':
        return 'En cours'
      case 'TERMINE':
        return 'Terminé'
      case 'SUSPENDU':
        return 'Suspendu'
      case 'ANNULE':
        return 'Annulé'
      case 'EN_ATTENTE':
        return 'En attente'
      default:
        return statut
    }
  }

  if (geolocatedMarches.length === 0) {
    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
        <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun marché géolocalisé</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Aucun marché n'a de coordonnées géographiques. Ajoutez des localisations aux marchés pour
          les voir apparaître sur la carte.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-blue-900 mb-1">
            {geolocatedMarches.length} marché{geolocatedMarches.length > 1 ? 's' : ''}{' '}
            géolocalisé{geolocatedMarches.length > 1 ? 's' : ''}
          </h4>
          <p className="text-sm text-blue-700">
            Cliquez sur les marqueurs pour voir les détails des marchés.
          </p>
        </div>
      </div>

      <div className="border border-gray-300 rounded-lg overflow-hidden shadow-md">
        <MapContainer
          center={getMapCenter()}
          zoom={geolocatedMarches.length === 1 ? 13 : 7}
          style={{ height: '600px', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {geolocatedMarches.map((marche) => (
            <Marker
              key={marche.id}
              position={[marche.latitude!, marche.longitude!]}
            >
              <Popup maxWidth={300}>
                <div className="p-2">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-gray-900 text-sm">
                      {marche.numeroMarche}
                    </h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(
                        marche.statut
                      )}`}
                    >
                      {getStatusLabel(marche.statut)}
                    </span>
                  </div>

                  {marche.objet && (
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {marche.objet}
                    </p>
                  )}

                  <div className="space-y-1 text-xs text-gray-700 mb-3">
                    {marche.fournisseurNom && (
                      <p>
                        <span className="font-medium">Fournisseur:</span>{' '}
                        {marche.fournisseurNom}
                      </p>
                    )}
                    <p>
                      <span className="font-medium">Montant:</span>{' '}
                      <span className="font-semibold text-primary-600">
                        {formatCurrency(marche.montantTtc)}
                      </span>
                    </p>
                    {marche.adresse && (
                      <p>
                        <span className="font-medium">📍</span> {marche.adresse}
                      </p>
                    )}
                    {marche.zoneGeographique && (
                      <p>
                        <span className="font-medium">Zone:</span> {marche.zoneGeographique}
                      </p>
                    )}
                  </div>

                  <Link
                    to={`/marches/${marche.id}`}
                    className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Voir détails
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}

export default MarchesMapView
