import { addDays, subDays, format } from 'date-fns'

export interface Convention {
  id: number
  code: string
  libelle: string
  tauxCommission: number
  baseCalcul: 'HT' | 'TTC' | 'AUTRE'
  tauxTva: number
  dateDebut: string
  dateFin?: string
  description: string
  actif: boolean
}

export interface Projet {
  id: number
  code: string
  nom: string
  description: string
  budgetTotal: number
  budgetConsomme: number
  statut: 'ACTIF' | 'EN_COURS' | 'TERMINE' | 'SUSPENDU'
  actif: boolean
}

export interface Fournisseur {
  id: number
  code: string
  raisonSociale: string
  identifiantFiscal: string
  ice: string
  adresse: string
  ville: string
  telephone: string
  email: string
  contact: string
  nonResident: boolean
  actif: boolean
}

export interface AxeAnalytique {
  id: number
  code: string
  libelle: string
  type: 'INFRASTRUCTURE' | 'EQUIPEMENT' | 'SERVICE' | 'AUTRE'
  description: string
  actif: boolean
}

export interface CompteBancaire {
  id: number
  code: string
  rib: string
  banque: string
  agence: string
  typeCompte: 'GENERAL' | 'INVESTISSEMENT' | 'TRESORERIE' | 'PROJET'
  titulaire: string
  devise: 'MAD' | 'EUR' | 'USD'
  actif: boolean
}

export interface Depense {
  id: number
  numeroFacture: string
  dateFacture: string
  fournisseur: Fournisseur
  projet: Projet
  axeAnalytique: AxeAnalytique
  convention: Convention
  numeroMarche?: string

  // Montants
  montantHT: number
  tauxTVA: number
  montantTVA: number
  montantTTC: number

  // Commission
  commissionHT: number
  commissionTVA: number
  commissionTTC: number

  // Retenues
  retenueGarantie: number
  retenueISTiers: number
  retenueSource: number

  // Net à payer
  netAPayer: number

  // Paiement
  statut: 'BROUILLON' | 'A_VALIDER' | 'VALIDEE' | 'PAYEE' | 'ANNULEE'
  datePaiement?: string
  referencePaiement?: string
  compteBancaire?: CompteBancaire
}

// ===========================================
// CONVENTIONS
// ===========================================
export const mockConventions: Convention[] = [
  {
    id: 1,
    code: 'RRA-2024-001',
    libelle: 'Commission Suivi Travaux Infrastructure',
    tauxCommission: 2.5,
    baseCalcul: 'HT',
    tauxTva: 20,
    dateDebut: '2024-01-01',
    description: 'Commission pour suivi et coordination des travaux d\'infrastructure urbaine',
    actif: true,
  },
  {
    id: 2,
    code: 'RRA-2024-002',
    libelle: 'Commission Assistance Technique',
    tauxCommission: 5.0,
    baseCalcul: 'HT',
    tauxTva: 20,
    dateDebut: '2024-01-01',
    description: 'Assistance technique et expertise pour projets stratégiques',
    actif: true,
  },
  {
    id: 3,
    code: 'RRA-2024-003',
    libelle: 'Commission Maîtrise d\'Oeuvre',
    tauxCommission: 3.5,
    baseCalcul: 'HT',
    tauxTva: 20,
    dateDebut: '2024-01-01',
    description: 'Commission pour services de maîtrise d\'oeuvre complète',
    actif: true,
  },
  {
    id: 4,
    code: 'RRA-2024-004',
    libelle: 'Commission Fournitures Équipements',
    tauxCommission: 1.5,
    baseCalcul: 'TTC',
    tauxTva: 20,
    dateDebut: '2024-01-01',
    description: 'Commission sur acquisition d\'équipements et fournitures',
    actif: true,
  },
]

// ===========================================
// PROJETS
// ===========================================
export const mockProjets: Projet[] = [
  {
    id: 1,
    code: 'PRJ-2024-001',
    nom: 'Aménagement Corniche Bouregreg',
    description: 'Réaménagement complet de la corniche avec espaces verts et pistes cyclables',
    budgetTotal: 45000000,
    budgetConsomme: 32500000,
    statut: 'EN_COURS',
    actif: true,
  },
  {
    id: 2,
    code: 'PRJ-2024-002',
    nom: 'Tramway Rabat-Salé Phase 3',
    description: 'Extension du réseau de tramway vers les nouveaux quartiers',
    budgetTotal: 120000000,
    budgetConsomme: 78000000,
    statut: 'EN_COURS',
    actif: true,
  },
  {
    id: 3,
    code: 'PRJ-2024-003',
    nom: 'Parc d\'Activités Technopolis',
    description: 'Construction d\'un parc technologique moderne',
    budgetTotal: 85000000,
    budgetConsomme: 15000000,
    statut: 'ACTIF',
    actif: true,
  },
  {
    id: 4,
    code: 'PRJ-2024-004',
    nom: 'Rénovation Médina Historique',
    description: 'Restauration et valorisation du patrimoine de la médina',
    budgetTotal: 28000000,
    budgetConsomme: 22000000,
    statut: 'EN_COURS',
    actif: true,
  },
  {
    id: 5,
    code: 'PRJ-2023-015',
    nom: 'Centre Multimodal Hassan',
    description: 'Construction d\'un hub de transport multimodal',
    budgetTotal: 65000000,
    budgetConsomme: 65000000,
    statut: 'TERMINE',
    actif: true,
  },
]

// ===========================================
// FOURNISSEURS
// ===========================================
export const mockFournisseurs: Fournisseur[] = [
  {
    id: 1,
    code: 'FOUR-001',
    raisonSociale: 'SOPRIAM MAROC SARL',
    identifiantFiscal: '12345678',
    ice: '001234567890001',
    adresse: '25 Boulevard Mohammed V',
    ville: 'Rabat',
    telephone: '+212 5 37 70 12 34',
    email: 'contact@sopriam.ma',
    contact: 'Ahmed BENNANI',
    nonResident: false,
    actif: true,
  },
  {
    id: 2,
    code: 'FOUR-002',
    raisonSociale: 'TRAVAUX PUBLICS RABAT SA',
    identifiantFiscal: '23456789',
    ice: '001234567890002',
    adresse: '158 Avenue Hassan II',
    ville: 'Salé',
    telephone: '+212 5 37 80 23 45',
    email: 'info@tprabat.ma',
    contact: 'Fatima ALAOUI',
    nonResident: false,
    actif: true,
  },
  {
    id: 3,
    code: 'FOUR-003',
    raisonSociale: 'INGÉNIERIE URBAINE CONSULTING',
    identifiantFiscal: '34567890',
    ice: '001234567890003',
    adresse: '45 Rue Ibn Rochd',
    ville: 'Rabat',
    telephone: '+212 5 37 65 78 90',
    email: 'contact@iuc.ma',
    contact: 'Mohammed TAZI',
    nonResident: false,
    actif: true,
  },
  {
    id: 4,
    code: 'FOUR-004',
    raisonSociale: 'ÉLECTRICITÉ GÉNÉRALE MAROC',
    identifiantFiscal: '45678901',
    ice: '001234567890004',
    adresse: '78 Zone Industrielle Technopolis',
    ville: 'Rabat',
    telephone: '+212 5 37 75 34 56',
    email: 'egm@egmaroc.ma',
    contact: 'Youssef IDRISSI',
    nonResident: false,
    actif: true,
  },
  {
    id: 5,
    code: 'FOUR-005',
    raisonSociale: 'BTP PLUS CONSTRUCTION',
    identifiantFiscal: '56789012',
    ice: '001234567890005',
    adresse: '12 Rue Al Massira',
    ville: 'Témara',
    telephone: '+212 5 37 64 89 01',
    email: 'contact@btpplus.ma',
    contact: 'Karim FASSI',
    nonResident: false,
    actif: true,
  },
  {
    id: 6,
    code: 'FOUR-006',
    raisonSociale: 'AMÉNAGEMENT ESPACES VERTS',
    identifiantFiscal: '67890123',
    ice: '001234567890006',
    adresse: '89 Avenue Yacoub El Mansour',
    ville: 'Rabat',
    telephone: '+212 5 37 77 45 67',
    email: 'aev@espacesverts.ma',
    contact: 'Nadia LAHLOU',
    nonResident: false,
    actif: true,
  },
  {
    id: 7,
    code: 'FOUR-007',
    raisonSociale: 'ENTREPRISE FRANÇAISE BTP SARL',
    identifiantFiscal: '78901234',
    ice: '001234567890007',
    adresse: '15 Avenue de France, Paris',
    ville: 'Paris',
    telephone: '+33 1 42 86 52 00',
    email: 'contact@efbtp.fr',
    contact: 'Jean DUPONT',
    nonResident: true,
    actif: true,
  },
  {
    id: 8,
    code: 'FOUR-008',
    raisonSociale: 'MATÉRIAUX DE CONSTRUCTION RABAT',
    identifiantFiscal: '89012345',
    ice: '001234567890008',
    adresse: '234 Route de Casablanca',
    ville: 'Rabat',
    telephone: '+212 5 37 72 34 56',
    email: 'mcr@materiaux.ma',
    contact: 'Hassan BENJELLOUN',
    nonResident: false,
    actif: true,
  },
]

// ===========================================
// AXES ANALYTIQUES
// ===========================================
export const mockAxesAnalytiques: AxeAnalytique[] = [
  {
    id: 1,
    code: 'AXE-001',
    libelle: 'Infrastructure Transport',
    type: 'INFRASTRUCTURE',
    description: 'Projets liés au transport urbain',
    actif: true,
  },
  {
    id: 2,
    code: 'AXE-002',
    libelle: 'Aménagement Urbain',
    type: 'INFRASTRUCTURE',
    description: 'Projets d\'aménagement des espaces urbains',
    actif: true,
  },
  {
    id: 3,
    code: 'AXE-003',
    libelle: 'Équipements Publics',
    type: 'EQUIPEMENT',
    description: 'Acquisition d\'équipements pour services publics',
    actif: true,
  },
  {
    id: 4,
    code: 'AXE-004',
    libelle: 'Services Études',
    type: 'SERVICE',
    description: 'Prestations intellectuelles et études',
    actif: true,
  },
  {
    id: 5,
    code: 'AXE-005',
    libelle: 'Patrimoine Historique',
    type: 'AUTRE',
    description: 'Conservation et restauration du patrimoine',
    actif: true,
  },
]

// ===========================================
// COMPTES BANCAIRES
// ===========================================
export const mockComptesBancaires: CompteBancaire[] = [
  {
    id: 1,
    code: 'CPT-001',
    rib: '230787000012345678901234',
    banque: 'Attijariwafa Bank',
    agence: 'Agdal Rabat',
    typeCompte: 'GENERAL',
    titulaire: 'RABAT RÉGION AMÉNAGEMENT',
    devise: 'MAD',
    actif: true,
  },
  {
    id: 2,
    code: 'CPT-002',
    rib: '011780000098765432109876',
    banque: 'BMCE Bank',
    agence: 'Hassan Rabat',
    typeCompte: 'INVESTISSEMENT',
    titulaire: 'RABAT RÉGION AMÉNAGEMENT',
    devise: 'MAD',
    actif: true,
  },
  {
    id: 3,
    code: 'CPT-003',
    rib: '021540000011223344556677',
    banque: 'Banque Populaire',
    agence: 'Centre Ville Rabat',
    typeCompte: 'PROJET',
    titulaire: 'RABAT RÉGION AMÉNAGEMENT - PROJETS',
    devise: 'MAD',
    actif: true,
  },
]

// ===========================================
// GÉNÉRATEUR DE DÉPENSES
// ===========================================
function calculateDepense(
  montantHT: number,
  tauxTVA: number,
  convention: Convention,
  fournisseur: Fournisseur
): {
  montantTVA: number
  montantTTC: number
  commissionHT: number
  commissionTVA: number
  commissionTTC: number
  retenueGarantie: number
  retenueISTiers: number
  retenueSource: number
  netAPayer: number
} {
  // Calcul TVA dépense
  const montantTVA = montantHT * (tauxTVA / 100)
  const montantTTC = montantHT + montantTVA

  // Calcul commission
  const baseCommission = convention.baseCalcul === 'HT' ? montantHT : montantTTC
  const commissionHT = baseCommission * (convention.tauxCommission / 100)
  const commissionTVA = commissionHT * (convention.tauxTva / 100)
  const commissionTTC = commissionHT + commissionTVA

  // Retenue de garantie (10% du TTC)
  const retenueGarantie = montantTTC * 0.1

  // Retenue IS tiers (pour montants > 10,000 MAD) - simplifié à 1.5%
  const retenueISTiers = montantHT > 10000 ? montantHT * 0.015 : 0

  // Retenue à la source pour non-résidents (10% du HT)
  const retenueSource = fournisseur.nonResident ? montantHT * 0.1 : 0

  // Net à payer
  const netAPayer =
    montantTTC + commissionTTC - retenueGarantie - retenueISTiers - retenueSource

  return {
    montantTVA: Math.round(montantTVA * 100) / 100,
    montantTTC: Math.round(montantTTC * 100) / 100,
    commissionHT: Math.round(commissionHT * 100) / 100,
    commissionTVA: Math.round(commissionTVA * 100) / 100,
    commissionTTC: Math.round(commissionTTC * 100) / 100,
    retenueGarantie: Math.round(retenueGarantie * 100) / 100,
    retenueISTiers: Math.round(retenueISTiers * 100) / 100,
    retenueSource: Math.round(retenueSource * 100) / 100,
    netAPayer: Math.round(netAPayer * 100) / 100,
  }
}

export function generateMockDepenses(): Depense[] {
  const depenses: Depense[] = []
  const today = new Date()

  // Générer 60 dépenses réalistes sur les 6 derniers mois
  const montantsHT = [
    125000, 458000, 89000, 234000, 567000, 123000, 345000, 678000, 145000, 289000,
    423000, 156000, 234000, 567000, 890000, 123000, 456000, 234000, 345000, 567000,
    178000, 289000, 401000, 523000, 645000, 78000, 156000, 234000, 312000, 445000,
    567000, 689000, 123000, 245000, 367000, 489000, 512000, 634000, 756000, 89000,
    167000, 245000, 323000, 401000, 523000, 645000, 767000, 889000, 112000, 234000,
    356000, 478000, 512000, 634000, 756000, 878000, 123000, 245000, 367000, 489000,
  ]

  const statuts: Depense['statut'][] = ['PAYEE', 'PAYEE', 'PAYEE', 'VALIDEE', 'A_VALIDER', 'BROUILLON']

  for (let i = 0; i < 60; i++) {
    const daysAgo = Math.floor(Math.random() * 180) // 6 mois
    const dateFacture = format(subDays(today, daysAgo), 'yyyy-MM-dd')

    const fournisseur = mockFournisseurs[i % mockFournisseurs.length]
    const projet = mockProjets[i % mockProjets.length]
    const axe = mockAxesAnalytiques[i % mockAxesAnalytiques.length]
    const convention = mockConventions[i % mockConventions.length]
    const montantHT = montantsHT[i]
    const tauxTVA = 20

    const calculs = calculateDepense(montantHT, tauxTVA, convention, fournisseur)

    const statut = statuts[i % statuts.length]
    const isPaid = statut === 'PAYEE'

    depenses.push({
      id: i + 1,
      numeroFacture: `FACT-2024-${String(i + 1).padStart(4, '0')}`,
      dateFacture,
      fournisseur,
      projet,
      axeAnalytique: axe,
      convention,
      numeroMarche: i % 3 === 0 ? `MARCH-${2024}-${String(i + 1).padStart(3, '0')}` : undefined,

      montantHT,
      tauxTVA,
      ...calculs,

      statut,
      datePaiement: isPaid ? format(addDays(new Date(dateFacture), 30), 'yyyy-MM-dd') : undefined,
      referencePaiement: isPaid ? `VIR-${String(i + 1).padStart(6, '0')}` : undefined,
      compteBancaire: isPaid ? mockComptesBancaires[i % mockComptesBancaires.length] : undefined,
    })
  }

  return depenses.sort((a, b) => new Date(b.dateFacture).getTime() - new Date(a.dateFacture).getTime())
}

export const mockDepenses = generateMockDepenses()

// ===========================================
// STATISTICS HELPERS
// ===========================================
export function calculateStats(depenses: Depense[]) {
  const total = depenses.reduce((sum, d) => sum + d.montantTTC, 0)
  const totalCommissions = depenses.reduce((sum, d) => sum + d.commissionTTC, 0)
  const payees = depenses.filter(d => d.statut === 'PAYEE')
  const aValider = depenses.filter(d => d.statut === 'A_VALIDER')
  const validees = depenses.filter(d => d.statut === 'VALIDEE')

  return {
    totalDepenses: total,
    totalCommissions,
    nombreFactures: depenses.length,
    facturesPayees: payees.length,
    facturesAValider: aValider.length,
    facturesValidees: validees.length,
    montantAPayer: validees.reduce((sum, d) => sum + d.netAPayer, 0),
    tauxPaiement: (payees.length / depenses.length) * 100,
  }
}
