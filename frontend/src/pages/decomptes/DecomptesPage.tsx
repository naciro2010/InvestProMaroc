import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaPlus, FaEdit, FaEye, FaFileExcel, FaSearch, FaCheck } from 'react-icons/fa'
import { Card, Button, StatusBadge } from '../../components/ui'
import AppLayout from '../../components/layout/AppLayout'
import api from '../../lib/api'

export default function DecomptesPage() {
  const [decomptes, setDecomptes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDecomptes()
  }, [])

  const fetchDecomptes = async () => {
    try {
      setLoading(true)
      const response = await api.get('/decomptes')
      setDecomptes(response.data)
    } catch (error) {
      console.error('Erreur chargement décomptes:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Card title="Gestion des Décomptes">
          <div className="text-center py-12">
            <p className="text-gray-500">Page Décomptes - En développement</p>
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}
