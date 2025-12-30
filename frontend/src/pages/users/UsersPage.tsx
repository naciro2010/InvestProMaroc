import { useState, useEffect } from 'react'
import { FaPlus, FaSearch, FaEdit, FaTrash, FaUserShield, FaUser } from 'react-icons/fa'
import AppLayout from '../../components/layout/AppLayout'
import { Card, Button } from '../../components/ui'
import api from '../../lib/api'

interface User {
  id: number
  username: string
  email: string
  nom?: string
  prenom?: string
  role: 'ADMIN' | 'MANAGER' | 'USER'
  actif: boolean
  createdAt: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('ALL')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    nom: '',
    prenom: '',
    password: '',
    role: 'USER' as 'ADMIN' | 'MANAGER' | 'USER',
  })

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    managers: 0,
    users: 0,
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/users')
      const data = response.data
      setUsers(data)

      // Calculate stats
      setStats({
        total: data.length,
        admins: data.filter((u: User) => u.role === 'ADMIN').length,
        managers: data.filter((u: User) => u.role === 'MANAGER').length,
        users: data.filter((u: User) => u.role === 'USER').length,
      })
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.nom && user.nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.prenom && user.prenom.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter

    return matchesSearch && matchesRole
  })

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

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        username: user.username,
        email: user.email,
        nom: user.nom || '',
        prenom: user.prenom || '',
        password: '',
        role: user.role,
      })
    } else {
      setEditingUser(null)
      setFormData({
        username: '',
        email: '',
        nom: '',
        prenom: '',
        password: '',
        role: 'USER',
      })
    }
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingUser) {
        await api.put(`/api/users/${editingUser.id}`, formData)
      } else {
        await api.post('/api/users', formData)
      }
      fetchUsers()
      setShowModal(false)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la sauvegarde de l\'utilisateur')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return

    try {
      await api.delete(`/api/users/${id}`)
      fetchUsers()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression de l\'utilisateur')
    }
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

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-rubik text-neutral-800">
              Gestion des Utilisateurs
            </h1>
            <p className="text-neutral-600 mt-1">Gérer les comptes et les permissions</p>
          </div>
          <Button
            variant="success"
            icon={<FaPlus />}
            onClick={() => handleOpenModal()}
          >
            Nouvel Utilisateur
          </Button>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card title="Total Utilisateurs">
            <div className="text-3xl font-bold font-rubik text-neutral-800">{stats.total}</div>
          </Card>

          <Card title="Administrateurs">
            <div className="text-3xl font-bold font-rubik text-soft-purple">
              {stats.admins}
            </div>
          </Card>

          <Card title="Gestionnaires">
            <div className="text-3xl font-bold font-rubik text-soft-blue">{stats.managers}</div>
          </Card>

          <Card title="Utilisateurs">
            <div className="text-3xl font-bold font-rubik text-soft-green">{stats.users}</div>
          </Card>
        </div>

        {/* Filtres et recherche */}
        <Card title="Recherche et Filtres">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, email ou username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-soft-blue focus:border-transparent transition-all"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2.5 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-soft-blue focus:border-transparent transition-all"
            >
              <option value="ALL">Tous les rôles</option>
              <option value="ADMIN">Administrateurs</option>
              <option value="MANAGER">Gestionnaires</option>
              <option value="USER">Utilisateurs</option>
            </select>
          </div>
        </Card>

        {/* Table des utilisateurs */}
        <Card title="Liste des Utilisateurs">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Date création
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-soft-blue rounded-full flex items-center justify-center">
                          <FaUser className="text-white" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-neutral-900">
                            {user.prenom} {user.nom}
                          </div>
                          <div className="text-sm text-neutral-500">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClass(
                          user.role
                        )}`}
                      >
                        {user.role === 'ADMIN' && <FaUserShield className="mr-1" />}
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.actif
                            ? 'bg-soft-green text-white'
                            : 'bg-neutral-200 text-neutral-700'
                        }`}
                      >
                        {user.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(user)}
                          className="text-soft-blue hover:text-soft-indigo transition-colors"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-danger hover:text-red-700 transition-colors"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-neutral-500 text-lg">Aucun utilisateur trouvé</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-soft-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200">
              <h2 className="text-2xl font-bold text-neutral-800">
                {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                  Username <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-soft-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Email <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-soft-blue"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Mot de passe <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-soft-blue"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Rôle <span className="text-danger">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as 'ADMIN' | 'MANAGER' | 'USER',
                    })
                  }
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-soft-blue"
                >
                  <option value="USER">Utilisateur</option>
                  <option value="MANAGER">Gestionnaire</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-soft-blue text-white rounded-lg hover:bg-soft-indigo transition-colors"
                >
                  {editingUser ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
