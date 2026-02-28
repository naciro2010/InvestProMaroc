import { ReactNode } from 'react'
import {
  FaFileContract,
  FaMoneyCheckAlt,
  FaClipboardCheck,
  FaClock,
  FaChartLine,
  FaChartPie,
  FaMapMarkerAlt,
  FaFileInvoiceDollar,
  FaShieldAlt,
  FaGlobe,
  FaBuilding,
  FaUniversity,
  FaLandmark,
} from 'react-icons/fa'
import { LandingHero, LandingFeatures, LandingStats, LandingCTA } from '../components/landing'

interface StatItem {
  value: string
  label: string
  icon: ReactNode
}

interface Feature {
  icon: ReactNode
  title: string
  description: string
  benefits: string[]
}

interface WorkflowItem {
  step: string
  title: string
  desc: string
  icon: ReactNode
}

interface Capability {
  title: string
  detail: string
}

interface UseCase {
  icon: ReactNode
  sector: string
  description: string
  examples: string[]
}

interface DeploymentPlan {
  name: string
  description: string
  features: string[]
  cta: string
  highlighted: boolean
}

interface Testimonial {
  quote: string
  author: string
  role: string
  organization: string
  avatar: string
}

interface FAQ {
  question: string
  answer: string
}

const LandingPage = () => {
  // Stats
  const stats: StatItem[] = [
    { value: '10,000+', label: "Conventions g\u00e9r\u00e9es", icon: <FaFileContract /> },
    { value: '250M MAD', label: 'Budget suivi', icon: <FaMoneyCheckAlt /> },
    { value: '70%', label: 'Gain de temps', icon: <FaClock /> },
    { value: '99.9%', label: "Disponibilit\u00e9", icon: <FaShieldAlt /> },
  ]

  // Features
  const features: Feature[] = [
    {
      icon: <FaFileContract className="text-3xl" />,
      title: 'Conventions & Avenants',
      description: "G\u00e9rez vos conventions CADRE et SPECIFIQUES avec workflow complet (BROUILLON \u2192 SOUMIS \u2192 VALIDEE \u2192 EN_EXECUTION \u2192 ACHEVE). Sous-conventions hi\u00e9rarchiques avec h\u00e9ritage de param\u00e8tres.",
      benefits: [
        "Workflow avec validation multi-niveaux",
        "Historique complet des avenants (JSONB)",
        "H\u00e9ritage param\u00e9trable des taux et bases",
        'Calcul automatique des commissions',
      ],
    },
    {
      icon: <FaMapMarkerAlt className="text-3xl" />,
      title: "March\u00e9s G\u00e9olocalis\u00e9s",
      description: "Suivi d\u00e9taill\u00e9 ligne par ligne avec g\u00e9olocalisation OpenStreetMap. Avenants avec impact montants et d\u00e9lais. Alertes automatiques sur seuils.",
      benefits: [
        'Carte interactive avec Leaflet',
        'Suivi ligne par ligne avec imputations',
        'Avenants avec tracking complet',
        "Zones g\u00e9ographiques configurables",
      ],
    },
    {
      icon: <FaFileInvoiceDollar className="text-3xl" />,
      title: "D\u00e9comptes & Paiements",
      description: "De la situation de travaux au paiement fournisseur. Calcul automatique des retenues (garantie, RAS, p\u00e9nalit\u00e9s). Contr\u00f4le budg\u00e9taire en temps r\u00e9el.",
      benefits: [
        "Workflow D\u00e9compte \u2192 OP \u2192 Paiement",
        'Calcul automatique des retenues',
        "Rapprochement bancaire int\u00e9gr\u00e9",
        'Export comptable (PDF, Excel)',
      ],
    },
    {
      icon: <FaChartPie className="text-3xl" />,
      title: 'Analyse Multidimensionnelle',
      description: "Plan analytique dynamique avec dimensions illimit\u00e9es (Budget, Projet, Secteur, D\u00e9partement, Phase...). Graphiques interactifs. Exports Excel instantan\u00e9s.",
      benefits: [
        'Dimensions configurables (JSONB)',
        'Graphiques Recharts interactifs',
        "Filtres dynamiques multicrit\u00e8res",
        'Exports Excel/PDF avec ExcelJS',
      ],
    },
  ]

  // Workflow
  const workflow: WorkflowItem[] = [
    { step: '1', title: 'Convention', desc: "Cr\u00e9ation et validation", icon: <FaFileContract /> },
    { step: '2', title: 'Projet', desc: "Planification budg\u00e9taire", icon: <FaChartLine /> },
    { step: '3', title: "March\u00e9", desc: "Appels d'offres et attribution", icon: <FaClipboardCheck /> },
    { step: '4', title: "D\u00e9compte", desc: 'Situation de travaux', icon: <FaFileInvoiceDollar /> },
    { step: '5', title: 'Paiement', desc: "R\u00e8glement fournisseur", icon: <FaMoneyCheckAlt /> },
  ]

  const capabilities: Capability[] = [
    {
      title: 'Vue unifi\u00e9e des op\u00e9rations',
      detail: 'Un seul espace pour les directions financi\u00e8res, techniques et de contr\u00f4le.',
    },
    {
      title: 'Automatisation du circuit administratif',
      detail: 'Validation, notifications, journaux d\'audit et relances intelligentes.',
    },
    {
      title: 'Pilotage orient\u00e9 performance',
      detail: 'KPI instantan\u00e9s, consolidation multi-projets et tableaux ex\u00e9cutifs.',
    },
  ]

  // Use cases
  const useCases: UseCase[] = [
    {
      icon: <FaUniversity />,
      sector: "Collectivit\u00e9s Locales",
      description: "R\u00e9gions, Provinces, Communes",
      examples: ["Conventions d'investissement", "March\u00e9s de voirie", 'Equipements publics'],
    },
    {
      icon: <FaBuilding />,
      sector: 'Etablissements Publics',
      description: 'ONEE, ADM, ONDA, Ports',
      examples: ["Grands projets d'infrastructure", "Maintenance r\u00e9seau", 'Investissements techniques'],
    },
    {
      icon: <FaLandmark />,
      sector: "Minist\u00e8res & Agences",
      description: 'Administration centrale',
      examples: ['Programmes sectoriels', "Projets interminist\u00e9riels", "Coop\u00e9ration internationale"],
    },
    {
      icon: <FaGlobe />,
      sector: 'Organismes Internationaux',
      description: 'ONG, Bailleurs de fonds',
      examples: ["Programmes de d\u00e9veloppement", 'Subventions projets', 'Monitoring financier'],
    },
  ]

  // Deployment options (sans prix)
  const deploymentPlans: DeploymentPlan[] = [
    {
      name: 'D\u00e9couverte guid\u00e9e',
      description: "Id\u00e9al pour valider rapidement l'ad\u00e9quation avec vos processus internes",
      features: [
        'Environnement de d\u00e9monstration pr\u00eat \u00e0 l\'emploi',
        'Parcours m\u00e9tier comment\u00e9 (convention \u2192 paiement)',
        'Accompagnement initial des \u00e9quipes m\u00e9tier',
        'Jeu de donn\u00e9es public pr\u00e9charg\u00e9',
      ],
      cta: 'Planifier une d\u00e9mo',
      highlighted: false,
    },
    {
      name: 'D\u00e9ploiement op\u00e9rationnel',
      description: 'Con\u00e7u pour les organisations qui souhaitent industrialiser leur pilotage',
      features: [
        'Workflow complet conventions, march\u00e9s, d\u00e9comptes et paiements',
        'Portail r\u00f4les & permissions align\u00e9 aux structures publiques',
        'Tableaux de bord analytiques et exports avanc\u00e9s',
        'Formation fonctionnelle et support de d\u00e9marrage',
      ],
      cta: "D\u00e9marrer le cadrage",
      highlighted: true,
    },
    {
      name: 'Transformation \u00e0 grande \u00e9chelle',
      description: 'Pour les minist\u00e8res, grandes agences et programmes multi-entit\u00e9s',
      features: [
        'Interfa\u00e7age SI existant (ERP, tr\u00e9sorerie, GED, SSO)',
        'Gouvernance multi-instances et reporting consolid\u00e9',
        'Runbook de conduite du changement et transfert de comp\u00e9tences',
        'Accompagnement continu des \u00e9quipes projet',
      ],
      cta: 'Construire la feuille de route',
      highlighted: false,
    },
  ]

  // Testimonials
  const testimonials: Testimonial[] = [
    {
      quote: "InvestPro a transform\u00e9 notre gestion financi\u00e8re. Nous avons r\u00e9duit de 70% le temps de traitement des d\u00e9comptes.",
      author: 'Mohamed ALAMI',
      role: 'Directeur Financier',
      organization: "R\u00e9gion Casablanca-Settat",
      avatar: '\uD83C\uDFDB\uFE0F',
    },
    {
      quote: "La g\u00e9olocalisation des march\u00e9s et le suivi ligne par ligne nous donnent une visibilit\u00e9 totale sur nos investissements.",
      author: 'Fatima BENALI',
      role: "Responsable March\u00e9s",
      organization: "Agence pour l'Am\u00e9nagement",
      avatar: '\uD83C\uDFD7\uFE0F',
    },
    {
      quote: "L'analyse multidimensionnelle nous permet de piloter notre budget avec une pr\u00e9cision in\u00e9gal\u00e9e.",
      author: 'Ahmed TAZI',
      role: "Contr\u00f4leur de Gestion",
      organization: 'Etablissement Public',
      avatar: '\uD83D\uDCCA',
    },
  ]

  // FAQ
  const faqs: FAQ[] = [
    {
      question: "Quelle est la diff\u00e9rence entre convention CADRE et SPECIFIQUE ?",
      answer: "Les conventions CADRE d\u00e9finissent les r\u00e8gles g\u00e9n\u00e9rales de calcul de commissions et peuvent avoir des sous-conventions SPECIFIQUES qui h\u00e9ritent ou surchargent les param\u00e8tres (taux, base de calcul, TVA).",
    },
    {
      question: 'Comment fonctionne le plan analytique dynamique ?',
      answer: "Contrairement aux syst\u00e8mes rigides, notre plan analytique utilise PostgreSQL JSONB pour supporter un nombre illimit\u00e9 de dimensions configurables (Budget, Projet, Secteur, D\u00e9partement, Phase, etc.).",
    },
    {
      question: "Les donn\u00e9es sont-elles s\u00e9curis\u00e9es ?",
      answer: "Absolument. Authentification JWT avec refresh tokens, chiffrement SSL/TLS, audit trail complet (createdBy, createdAt, updatedAt), et soft deletes pour tra\u00e7abilit\u00e9.",
    },
    {
      question: "Puis-je exporter mes donn\u00e9es ?",
      answer: "Oui, exports Excel (ExcelJS) et PDF disponibles sur toutes les pages. Les exports incluent les donn\u00e9es tabulaires et les graphiques.",
    },
    {
      question: 'Quelle est la stack technique ?',
      answer: "Backend Kotlin + Spring Boot 3.4.1 + PostgreSQL 16. Frontend React 18 + TypeScript + Vite + MUI. Architecture micro-frontend + micro-services REST.",
    },
    {
      question: 'Proposez-vous une formation ?',
      answer: "Oui, formation initiale incluse dans les plans Professional et Enterprise. Documentation compl\u00e8te et vid\u00e9os tutoriels disponibles.",
    },
  ]

  return (
    <div className="min-h-screen bg-slate-950">
      <LandingHero stats={stats} />
      <LandingFeatures features={features} workflow={workflow} useCases={useCases} capabilities={capabilities} />
      <LandingStats deploymentPlans={deploymentPlans} testimonials={testimonials} faqs={faqs} />
      <LandingCTA />
    </div>
  )
}

export default LandingPage
