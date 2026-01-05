import api from './api';

export interface Projet {
  id?: number;
  code: string;
  nom: string;
  description?: string;
  conventionId?: number;
  conventionNumero?: string;
  conventionLibelle?: string;
  budgetTotal: number;
  dateDebut?: string;
  dateFinPrevue?: string;
  dateFinReelle?: string;
  dureeMois?: number;
  chefProjetId?: number;
  chefProjetNom?: string;
  statut: string;
  pourcentageAvancement: number;
  localisation?: string;
  objectifs?: string;
  remarques?: string;
  estEnRetard: boolean;
  estActif: boolean;
  actif: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjetSimple {
  id?: number;
  code: string;
  nom: string;
  statut: string;
  budgetTotal: number;
  dateDebut?: string;
  dateFinPrevue?: string;
  pourcentageAvancement: number;
  actif: boolean;
}

export const projetsAPI = {
  // CRUD
  getAll: () => api.get<Projet[]>('/projets'),
  getById: (id: number) => api.get<Projet>(`/projets/${id}`),
  getByCode: (code: string) => api.get<Projet>(`/projets/code/${code}`),
  getByStatut: (statut: string) => api.get<Projet[]>(`/projets/statut/${statut}`),
  getActifs: () => api.get<ProjetSimple[]>('/projets/actifs'),
  getEnRetard: () => api.get<Projet[]>('/projets/en-retard'),
  getByConvention: (conventionId: number) => api.get<ProjetSimple[]>(`/projets/convention/${conventionId}`),
  getByChefProjet: (chefProjetId: number) => api.get<ProjetSimple[]>(`/projets/chef-projet/${chefProjetId}`),
  getByPeriode: (debut: string, fin: string) =>
    api.get<Projet[]>(`/projets/periode?debut=${debut}&fin=${fin}`),
  search: (query: string) => api.get<ProjetSimple[]>(`/projets/search?q=${query}`),
  create: (projet: Partial<Projet>) => api.post<Projet>('/projets', projet),
  update: (id: number, projet: Partial<Projet>) => api.put<Projet>(`/projets/${id}`, projet),
  delete: (id: number) => api.delete(`/projets/${id}`),

  // Workflow
  demarrer: (id: number) => api.post<Projet>(`/projets/${id}/demarrer`),
  suspendre: (id: number, motif?: string) =>
    api.post<Projet>(`/projets/${id}/suspendre${motif ? `?motif=${encodeURIComponent(motif)}` : ''}`),
  reprendre: (id: number) => api.post<Projet>(`/projets/${id}/reprendre`),
  terminer: (id: number) => api.post<Projet>(`/projets/${id}/terminer`),
  annuler: (id: number, motif?: string) =>
    api.post<Projet>(`/projets/${id}/annuler${motif ? `?motif=${encodeURIComponent(motif)}` : ''}`),
  mettreAJourAvancement: (id: number, pourcentage: number) =>
    api.put<Projet>(`/projets/${id}/avancement?pourcentage=${pourcentage}`),

  // Statistiques
  getStatistiques: () => api.get<Record<string, number>>('/projets/statistiques'),
};
