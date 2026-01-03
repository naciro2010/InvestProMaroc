-- ========================================================================================================
-- V3__seed_test_conventions.sql
-- InvestPro Maroc - Seed Test Data for Conventions
-- ========================================================================================================

-- Insert test conventions
INSERT INTO conventions (
    code,
    numero,
    date_convention,
    type_convention,
    statut,
    libelle,
    objet,
    taux_commission,
    budget,
    base_calcul,
    taux_tva,
    date_debut,
    date_fin,
    description,
    actif
) VALUES
-- Convention 1: CADRE - VALIDEE
(
    'CONV-2024-001',
    'C/2024/001',
    '2024-01-15',
    'CADRE',
    'VALIDEE',
    'Convention Cadre - Développement Régional',
    'Convention pour le développement des infrastructures régionales',
    5.50,
    50000000.00,
    'DECAISSEMENTS_TTC',
    20.00,
    '2024-01-15',
    '2026-12-31',
    'Convention cadre pour le financement des projets de développement régional',
    true
),
-- Convention 2: NON_CADRE - EN_COURS
(
    'CONV-2024-002',
    'C/2024/002',
    '2024-03-10',
    'NON_CADRE',
    'EN_COURS',
    'Programme Éducatif 2024',
    'Financement des établissements scolaires',
    4.25,
    25000000.00,
    'DECAISSEMENTS_HT',
    20.00,
    '2024-04-01',
    '2025-03-31',
    'Convention pour l''amélioration des infrastructures éducatives',
    true
),
-- Convention 3: SPECIFIQUE - SOUMIS
(
    'CONV-2024-003',
    'C/2024/003',
    '2024-06-20',
    'SPECIFIQUE',
    'SOUMIS',
    'Innovation Technologique',
    'Support aux startups technologiques',
    6.00,
    15000000.00,
    'DECAISSEMENTS_TTC',
    20.00,
    '2024-07-01',
    '2025-06-30',
    'Programme spécifique pour l''innovation et la transformation digitale',
    true
),
-- Convention 4: CADRE - BROUILLON
(
    'CONV-2024-004',
    'C/2024/004',
    '2024-09-15',
    'CADRE',
    'BROUILLON',
    'Développement Agricole',
    'Modernisation du secteur agricole',
    5.00,
    35000000.00,
    'DECAISSEMENTS_TTC',
    20.00,
    '2024-10-01',
    '2027-09-30',
    'Convention pour la modernisation et le développement du secteur agricole',
    true
),
-- Convention 5: NON_CADRE - ACHEVE
(
    'CONV-2023-005',
    'C/2023/005',
    '2023-01-10',
    'NON_CADRE',
    'ACHEVE',
    'Infrastructure Urbaine 2023',
    'Rénovation des infrastructures urbaines',
    4.75,
    20000000.00,
    'DECAISSEMENTS_TTC',
    20.00,
    '2023-02-01',
    '2024-01-31',
    'Programme achevé de rénovation des infrastructures urbaines',
    true
)
ON CONFLICT (code) DO NOTHING;

-- Insert test partenaires for conventions
INSERT INTO partenaires (code, raison_sociale, type_partenaire, actif) VALUES
('PART-001', 'Ministère de l''Intérieur', 'INSTITUTION_PUBLIQUE', true),
('PART-002', 'Conseil Régional Casablanca-Settat', 'COLLECTIVITE_LOCALE', true),
('PART-003', 'Association Développement Durable', 'ASSOCIATION', true),
('PART-004', 'Entreprise BTP Moderne SARL', 'ENTREPRISE_PRIVEE', true)
ON CONFLICT (code) DO NOTHING;

-- Link partenaires to conventions (using INSERT SELECT to avoid hardcoded IDs)
INSERT INTO convention_partenaires (convention_id, partenaire_id, budget_alloue, pourcentage, est_maitre_oeuvre)
SELECT c.id, p.id, 25000000.00, 50.00, true
FROM conventions c, partenaires p
WHERE c.code = 'CONV-2024-001' AND p.code = 'PART-001'
ON CONFLICT (convention_id, partenaire_id) DO NOTHING;

INSERT INTO convention_partenaires (convention_id, partenaire_id, budget_alloue, pourcentage, est_maitre_oeuvre)
SELECT c.id, p.id, 25000000.00, 50.00, false
FROM conventions c, partenaires p
WHERE c.code = 'CONV-2024-001' AND p.code = 'PART-002'
ON CONFLICT (convention_id, partenaire_id) DO NOTHING;

INSERT INTO convention_partenaires (convention_id, partenaire_id, budget_alloue, pourcentage, est_maitre_oeuvre)
SELECT c.id, p.id, 25000000.00, 100.00, true
FROM conventions c, partenaires p
WHERE c.code = 'CONV-2024-002' AND p.code = 'PART-002'
ON CONFLICT (convention_id, partenaire_id) DO NOTHING;

INSERT INTO convention_partenaires (convention_id, partenaire_id, budget_alloue, pourcentage, est_maitre_oeuvre)
SELECT c.id, p.id, 15000000.00, 100.00, true
FROM conventions c, partenaires p
WHERE c.code = 'CONV-2024-003' AND p.code = 'PART-003'
ON CONFLICT (convention_id, partenaire_id) DO NOTHING;

INSERT INTO convention_partenaires (convention_id, partenaire_id, budget_alloue, pourcentage, est_maitre_oeuvre)
SELECT c.id, p.id, 35000000.00, 100.00, false
FROM conventions c, partenaires p
WHERE c.code = 'CONV-2024-004' AND p.code = 'PART-004'
ON CONFLICT (convention_id, partenaire_id) DO NOTHING;
