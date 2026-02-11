import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Search, X } from 'lucide-react'

// Fix for default marker icon
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)['_getIconUrl']
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface LocationPickerProps {
  latitude?: number
  longitude?: number
  adresse?: string
  onLocationChange: (location: {
    latitude: number
    longitude: number
    adresse: string
  }) => void
}

// Component to handle map clicks
function LocationMarker({ position, onPositionChange }: {
  position: [number, number]
  onPositionChange: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng)
    },
  })

  return <Marker position={position} />
}

// Component to recenter map when position changes
function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])
  return null
}

const LocationPicker = ({
  latitude,
  longitude,
  adresse,
  onLocationChange,
}: LocationPickerProps) => {
  // Default center: Rabat, Morocco
  const defaultCenter: [number, number] = [33.9716, -6.8498]
  const [position, setPosition] = useState<[number, number]>(
    latitude && longitude ? [latitude, longitude] : defaultCenter
  )
  const [searchQuery, setSearchQuery] = useState(adresse || '')
  const [isSearching, setIsSearching] = useState(false)
  const [showMap, setShowMap] = useState(false)

  useEffect(() => {
    if (latitude && longitude) {
      setPosition([latitude, longitude])
    }
  }, [latitude, longitude])

  const handlePositionChange = async (lat: number, lng: number) => {
    setPosition([lat, lng])

    // Reverse geocode to get address
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      )
      const data = await response.json()
      const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`

      setSearchQuery(address)
      onLocationChange({
        latitude: lat,
        longitude: lng,
        adresse: address,
      })
    } catch (error) {
      console.error('Geocoding error:', error)
      onLocationChange({
        latitude: lat,
        longitude: lng,
        adresse: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      })
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery + ', Morocco'
        )}&limit=1`
      )
      const data = await response.json()

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat)
        const lng = parseFloat(data[0].lon)
        setPosition([lat, lng])
        onLocationChange({
          latitude: lat,
          longitude: lng,
          adresse: data[0].display_name,
        })
        setShowMap(true)
      } else {
        alert('Adresse introuvable. Veuillez réessayer.')
      }
    } catch (error) {
      console.error('Search error:', error)
      alert('Erreur lors de la recherche. Veuillez réessayer.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleClear = () => {
    setSearchQuery('')
    setPosition(defaultCenter)
    setShowMap(false)
    onLocationChange({
      latitude: defaultCenter[0],
      longitude: defaultCenter[1],
      adresse: '',
    })
  }

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Rechercher une adresse (ex: Casablanca, Avenue Mohammed V)"
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={isSearching}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Search className="w-5 h-5" />
          {isSearching ? 'Recherche...' : 'Chercher'}
        </button>
        {!showMap && (
          <button
            type="button"
            onClick={() => setShowMap(true)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
          >
            <MapPin className="w-5 h-5" />
            Carte
          </button>
        )}
      </div>

      {/* Coordinates Display */}
      {(latitude || position[0] !== defaultCenter[0]) && (
        <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
          📍 Coordonnées: {position[0].toFixed(6)}, {position[1].toFixed(6)}
        </div>
      )}

      {/* Map */}
      {showMap && (
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-3 py-2 border-b border-gray-300 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Cliquez sur la carte pour placer le marqueur
            </span>
            <button
              type="button"
              onClick={() => setShowMap(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <MapContainer
            center={position}
            zoom={13}
            style={{ height: '400px', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker
              position={position}
              onPositionChange={handlePositionChange}
            />
            <RecenterMap center={position} />
          </MapContainer>
        </div>
      )}

      {/* Helper Text */}
      <p className="text-xs text-gray-500">
        💡 Vous pouvez rechercher une adresse ou cliquer directement sur la carte pour définir la localisation.
      </p>
    </div>
  )
}

export default LocationPicker
