-- ========================================================================================================
-- V7__seed_rich_test_data.sql
-- InvestPro Maroc - Données fictives enrichies pour tester toute l'application
-- ========================================================================================================

-- =========================================
-- CONVENTIONS ADDITIONNELLES (10 de plus)
-- =========================================

INSERT INTO conventions (
    code, numero, date_convention, type_convention, statut,
    libelle, objet, taux_commission, budget, base_calcul, taux_tva,
    date_debut, date_fin, description, actif
) VALUES
-- Convention 6: CADRE - EN_COURS
(
    'CONV-2024-006', 'C/2024/006', '2024-02-20', 'CADRE', 'EN_COURS',
    'Programme Santé Publique 2024-2026',
    'Amélioration des infrastructures de santé',
    4.50, 45000000.00, 'DECAISSEMENTS_TTC', 20.00,
    '2024-03-01', '2026-02-28',
    'Programme d''amélioration des centres de santé ruraux',
    true
),
-- Convention 7: NON_CADRE - VALIDEE
(
    'CONV-2024-007', 'C/2024/007', '2024-04-05', 'NON_CADRE', 'VALIDEE',
    'Routes Rurales Province Khénifra',
    'Construction et réhabilitation routes rurales',
    5.00, 28000000.00, 'DECAISSEMENTS_TTC', 20.00,
    '2024-05-01', '2025-12-31',
    'Programme de désenclavement des zones rurales',
    true
),
-- Convention 8: SPECIFIQUE - EN_COURS
(
    'CONV-2024-008', 'C/2024/008', '2024-05-10', 'SPECIFIQUE', 'EN_COURS',
    'Digitalisation Administration Publique',
    'Transformation digitale des services publics',
    6.50, 18000000.00, 'DECAISSEMENTS_HT', 20.00,
    '2024-06-01', '2025-05-31',
    'Programme de modernisation et digitalisation',
    true
),
-- Convention 9: CADRE - VALIDEE
(
    'CONV-2024-009', 'C/2024/009', '2024-06-15', 'CADRE', 'VALIDEE',
    'Énergies Renouvelables 2024-2027',
    'Développement des énergies propres',
    5.75, 60000000.00, 'DECAISSEMENTS_TTC', 20.00,
    '2024-07-01', '2027-06-30',
    'Programme de transition énergétique',
    true
),
-- Convention 10: NON_CADRE - SOUMIS
(
    'CONV-2024-010', 'C/2024/010', '2024-07-20', 'NON_CADRE', 'SOUMIS',
    'Formation Professionnelle Jeunes',
    'Programme de formation et insertion',
    4.00, 12000000.00, 'DECAISSEMENTS_TTC', 20.00,
    '2024-09-01', '2025-08-31',
    'Formation professionnelle pour 5000 jeunes',
    true
),
-- Convention 11: CADRE - EN_COURS
(
    'CONV-2024-011', 'C/2024/011', '2024-08-10', 'CADRE', 'EN_COURS',
    'Assainissement Urbain 2024-2026',
    'Extension réseaux d''assainissement',
    5.25, 38000000.00, 'DECAISSEMENTS_TTC', 20.00,
    '2024-09-01', '2026-08-31',
    'Programme d''assainissement des villes moyennes',
    true
),
-- Convention 12: SPECIFIQUE - VALIDEE
(
    'CONV-2024-012', 'C/2024/012', '2024-09-05', 'SPECIFIQUE', 'VALIDEE',
    'Tourisme Durable Régions Sud',
    'Développement touristique durable',
    6.00, 22000000.00, 'DECAISSEMENTS_TTC', 20.00,
    '2024-10-01', '2026-09-30',
    'Valorisation du patrimoine touristique',
    true
),
-- Convention 13: NON_CADRE - EN_COURS
(
    'CONV-2024-013', 'C/2024/013', '2024-10-15', 'NON_CADRE', 'EN_COURS',
    'Eau Potable Zones Rurales',
    'Alimentation en eau potable',
    4.75, 32000000.00, 'DECAISSEMENTS_TTC', 20.00,
    '2024-11-01', '2026-10-31',
    'Programme d''accès à l''eau potable',
    true
),
-- Convention 14: CADRE - BROUILLON
(
    'CONV-2024-014', 'C/2024/014', '2024-11-20', 'CADRE', 'BROUILLON',
    'Industrie 4.0 et Innovation',
    'Modernisation du secteur industriel',
    5.50, 42000000.00, 'DECAISSEMENTS_TTC', 20.00,
    '2025-01-01', '2027-12-31',
    'Programme de transformation industrielle',
    true
),
-- Convention 15: SPECIFIQUE - VALIDEE
(
    'CONV-2024-015', 'C/2024/015', '2024-12-01', 'SPECIFIQUE', 'VALIDEE',
    'Culture et Patrimoine',
    'Restauration du patrimoine culturel',
    5.00, 16000000.00, 'DECAISSEMENTS_TTC', 20.00,
    '2025-01-15', '2026-12-31',
    'Programme de valorisation du patrimoine',
    true
)
ON CONFLICT (code) DO NOTHING;

-- =========================================
-- PARTENAIRES ADDITIONNELS
-- =========================================

INSERT INTO partenaires (code, raison_sociale, type_partenaire, actif) VALUES
('PART-005', 'Agence Urbaine Rabat', 'ETABLISSEMENT_PUBLIC', true),
('PART-006', 'Office National de l''Eau', 'ETABLISSEMENT_PUBLIC', true),
('PART-007', 'Conseil Provincial Khénifra', 'COLLECTIVITE_LOCALE', true),
('PART-008', 'Fondation Mohammed VI', 'FONDATION', true),
('PART-009', 'Société Générale Travaux SARL', 'ENTREPRISE_PRIVEE', true),
('PART-010', 'Conseil Régional Souss-Massa', 'COLLECTIVITE_LOCALE', true)
ON CONFLICT (code) DO NOTHING;

-- =========================================
-- CONVENTION_PARTENAIRES pour nouvelles conventions
-- =========================================

-- Convention 6 (Santé)
INSERT INTO convention_partenaires (convention_id, partenaire_id, budget_alloue, pourcentage, est_maitre_oeuvre)
SELECT c.id, p.id, 30000000.00, 66.67, true
FROM conventions c, partenaires p
WHERE c.code = 'CONV-2024-006' AND p.code = 'PART-002'
ON CONFLICT (convention_id, partenaire_id) DO NOTHING;

INSERT INTO convention_partenaires (convention_id, partenaire_id, budget_alloue, pourcentage, est_maitre_oeuvre)
SELECT c.id, p.id, 15000000.00, 33.33, false
FROM conventions c, partenaires p
WHERE c.code = 'CONV-2024-006' AND p.code = 'PART-003'
ON CONFLICT (convention_id, partenaire_id) DO NOTHING;

-- Convention 7 (Routes)
INSERT INTO convention_partenaires (convention_id, partenaire_id, budget_alloue, pourcentage, est_maitre_oeuvre)
SELECT c.id, p.id, 28000000.00, 100.00, true
FROM conventions c, partenaires p
WHERE c.code = 'CONV-2024-007' AND p.code = 'PART-007'
ON CONFLICT (convention_id, partenaire_id) DO NOTHING;

-- Convention 8 (Digital)
INSERT INTO convention_partenaires (convention_id, partenaire_id, budget_alloue, pourcentage, est_maitre_oeuvre)
SELECT c.id, p.id, 18000000.00, 100.00, true
FROM conventions c, partenaires p
WHERE c.code = 'CONV-2024-008' AND p.code = 'PART-001'
ON CONFLICT (convention_id, partenaire_id) DO NOTHING;

-- Convention 9 (Énergies)
INSERT INTO convention_partenaires (convention_id, partenaire_id, budget_alloue, pourcentage, est_maitre_oeuvre)
SELECT c.id, p.id, 40000000.00, 66.67, true
FROM conventions c, partenaires p
WHERE c.code = 'CONV-2024-009' AND p.code = 'PART-005'
ON CONFLICT (convention_id, partenaire_id) DO NOTHING;

INSERT INTO convention_partenaires (convention_id, partenaire_id, budget_alloue, pourcentage, est_maitre_oeuvre)
SELECT c.id, p.id, 20000000.00, 33.33, false
FROM conventions c, partenaires p
WHERE c.code = 'CONV-2024-009' AND p.code = 'PART-004'
ON CONFLICT (convention_id, partenaire_id) DO NOTHING;

-- Convention 10 (Formation)
INSERT INTO convention_partenaires (convention_id, partenaire_id, budget_alloue, pourcentage, est_maitre_oeuvre)
SELECT c.id, p.id, 12000000.00, 100.00, true
FROM conventions c, partenaires p
WHERE c.code = 'CONV-2024-010' AND p.code = 'PART-008'
ON CONFLICT (convention_id, partenaire_id) DO NOTHING;

-- Convention 11 (Assainissement)
INSERT INTO convention_partenaires (convention_id, partenaire_id, budget_alloue, pourcentage, est_maitre_oeuvre)
SELECT c.id, p.id, 38000000.00, 100.00, true
FROM conventions c, partenaires p
WHERE c.code = 'CONV-2024-011' AND p.code = 'PART-006'
ON CONFLICT (convention_id, partenaire_id) DO NOTHING;

-- Convention 12 (Tourisme)
INSERT INTO convention_partenaires (convention_id, partenaire_id, budget_alloue, pourcentage, est_maitre_oeuvre)
SELECT c.id, p.id, 22000000.00, 100.00, true
FROM conventions c, partenaires p
WHERE c.code = 'CONV-2024-012' AND p.code = 'PART-010'
ON CONFLICT (convention_id, partenaire_id) DO NOTHING;

-- Convention 13 (Eau)
INSERT INTO convention_partenaires (convention_id, partenaire_id, budget_alloue, pourcentage, est_maitre_oeuvre)
SELECT c.id, p.id, 32000000.00, 100.00, true
FROM conventions c, partenaires p
WHERE c.code = 'CONV-2024-013' AND p.code = 'PART-006'
ON CONFLICT (convention_id, partenaire_id) DO NOTHING;

-- Convention 14 (Industrie)
INSERT INTO convention_partenaires (convention_id, partenaire_id, budget_alloue, pourcentage, est_maitre_oeuvre)
SELECT c.id, p.id, 25000000.00, 59.52, true
FROM conventions c, partenaires p
WHERE c.code = 'CONV-2024-014' AND p.code = 'PART-001'
ON CONFLICT (convention_id, partenaire_id) DO NOTHING;

INSERT INTO convention_partenaires (convention_id, partenaire_id, budget_alloue, pourcentage, est_maitre_oeuvre)
SELECT c.id, p.id, 17000000.00, 40.48, false
FROM conventions c, partenaires p
WHERE c.code = 'CONV-2024-014' AND p.code = 'PART-009'
ON CONFLICT (convention_id, partenaire_id) DO NOTHING;

-- Convention 15 (Culture)
INSERT INTO convention_partenaires (convention_id, partenaire_id, budget_alloue, pourcentage, est_maitre_oeuvre)
SELECT c.id, p.id, 16000000.00, 100.00, true
FROM conventions c, partenaires p
WHERE c.code = 'CONV-2024-015' AND p.code = 'PART-002'
ON CONFLICT (convention_id, partenaire_id) DO NOTHING;
