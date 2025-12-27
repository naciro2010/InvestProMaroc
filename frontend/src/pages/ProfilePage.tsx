import { useState, useEffect } from 'react'
import { FaUser, FaEnvelope, FaLock, FaUserShield, FaEdit, FaSave } from 'react-icons/fa'
import AppLayout from '../components/layout/AppLayout'
import { Card, Button } from '../components/ui'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'

interface UserProfile {
  id: number
  username: string
  email: string
  nom?: string
  prenom?: string
  role: 'ADMIN' | 'MANAGER' | 'USER'
  createdAt: string
  lastLogin?: string
}

export default function ProfilePage() {
  const { user: authUser } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [passwordMode, setPasswordMode] = useState(false)

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/users/profile')
      const data = response.data
      setProfile(data)
      setFormData({
        nom: data.nom || '',
        prenom: data.prenom || '',
        email: data.email || '',
      })
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.put('/api/users/profile', formData)
      await fetchProfile()
      setEditMode(false)
      alert('Profil mis à jour avec succès')
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      alert('Erreur lors de la mise à jour du profil')
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas')
      return
    }

    try {
      await api.put('/api/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      setPasswordMode(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      alert('Mot de passe changé avec succès')
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error)
      alert('Erreur lors du changement de mot de passe')
    }
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      ADMIN: 'Administrateur',
      MANAGER: 'Gestionnaire',
      USER: 'Utilisateur',
    }
    return labels[role] || role
  }

  const getRoleBadgeClass = (role: string) => {
    const classes: Record<string, string> = {
      ADMIN: 'bg-soft-purple text-white',
      MANAGER: 'bg-soft-blue text-white',
      USER: 'bg-soft-green text-white',
    }
    return classes[role] || 'bg-neutral-300 text-neutral-700'
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-soft-blue"></div>
        </div>
      </AppLayout>
    )
  }

  if (!profile) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-neutral-500 text-lg">Profil non trouvé</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-rubik text-neutral-800">Mon Profil</h1>
            <p className="text-neutral-600 mt-1">Gérer vos informations personnelles</p>
          </div>
        </div>

        {/* Card Profil Principal */}
        <Card title="Informations Personnelles">
          <div className="p-6">
            {/* Avatar et Rôle */}
            <div className="flex items-center gap-6 mb-8 pb-6 border-b border-neutral-200">
              <div className="flex-shrink-0 h-24 w-24 bg-gradient-to-br from-soft-blue to-soft-purple rounded-full flex items-center justify-center shadow-soft-lg">
                <FaUser className="text-4xl text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-neutral-800">
                  {profile.prenom} {profile.nom}
                </h2>
                <p className="text-neutral-600 mt-1">@{profile.username}</p>
                <div className="mt-3">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeClass(
                      profile.role
                    )}`}
                  >
                    <FaUserShield className="mr-2" />
                    {getRoleLabel(profile.role)}
                  </span>
                </div>
              </div>
              {!editMode && (
                <Button
                  variant="secondary"
                  icon={<FaEdit />}
                  onClick={() => setEditMode(true)}
                >
                  Modifier
                </Button>
              )}
            </div>

            {/* Formulaire d'édition */}
            {editMode ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Prénom
                    </label>
                    <input
                      type="text"
                      value={formData.prenom}
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                      className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-soft-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-soft-blue"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-soft-blue"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false)
                      setFormData({
                        nom: profile.nom || '',
                        prenom: profile.prenom || '',
                        email: profile.email || '',
                      })
                    }}
                    className="px-6 py-2.5 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-6 py-2.5 bg-soft-blue text-white rounded-lg hover:bg-soft-indigo transition-colors"
                  >
                    <FaSave className="mr-2" />
                    Enregistrer
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <FaUser className="text-neutral-400" />
                    <span className="text-sm text-neutral-500">Nom complet</span>
                  </div>
                  <p className="text-lg text-neutral-800 font-medium">
                    {profile.prenom} {profile.nom}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <FaEnvelope className="text-neutral-400" />
                    <span className="text-sm text-neutral-500">Email</span>
                  </div>
                  <p className="text-lg text-neutral-800 font-medium">{profile.email}</p>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <FaUser className="text-neutral-400" />
                    <span className="text-sm text-neutral-500">Nom d'utilisateur</span>
                  </div>
                  <p className="text-lg text-neutral-800 font-medium">@{profile.username}</p>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <FaUserShield className="text-neutral-400" />
                    <span className="text-sm text-neutral-500">Rôle</span>
                  </div>
                  <p className="text-lg text-neutral-800 font-medium">
                    {getRoleLabel(profile.role)}
                  </p>
                </div>

                <div>
                  <span className="text-sm text-neutral-500">Membre depuis</span>
                  <p className="text-lg text-neutral-800 font-medium">
                    {new Date(profile.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                {profile.lastLogin && (
                  <div>
                    <span className="text-sm text-neutral-500">Dernière connexion</span>
                    <p className="text-lg text-neutral-800 font-medium">
                      {new Date(profile.lastLogin).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Card Sécurité */}
        <Card title="Sécurité">
          <div className="p-6">
            {!passwordMode ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 h-12 w-12 bg-soft-orange rounded-full flex items-center justify-center">
                    <FaLock className="text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-neutral-800">Mot de passe</p>
                    <p className="text-sm text-neutral-500">
                      Dernière modification: il y a 30 jours
                    </p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  icon={<FaLock />}
                  onClick={() => setPasswordMode(true)}
                >
                  Changer le mot de passe
                </Button>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Mot de passe actuel <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-soft-orange"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Nouveau mot de passe <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-soft-orange"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Confirmer le mot de passe <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-soft-orange"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setPasswordMode(false)
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                    }}
                    className="px-6 py-2.5 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-6 py-2.5 bg-soft-orange text-white rounded-lg hover:opacity-90 transition-colors"
                  >
                    <FaSave className="mr-2" />
                    Changer le mot de passe
                  </button>
                </div>
              </form>
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}
