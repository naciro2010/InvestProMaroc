-- ========================================================================================================
-- V8__seed_budgets_marches_decomptes_paiements.sql
-- InvestPro Maroc - Données de test: Budgets, Marchés, Décomptes, Ordres de Paiement et Paiements
-- ========================================================================================================

-- =========================================
-- FOURNISSEURS
-- =========================================

INSERT INTO fournisseurs (code, raison_sociale, identifiant_fiscal, ice, ville, telephone, email, actif) VALUES
('FOUR-001', 'Entreprise Générale de Construction SARL', '12345678', '000123456789012', 'Casablanca', '0522-123456', 'contact@egc.ma', true),
('FOUR-002', 'Bureau d''Études Techniques BET', '23456789', '000234567890123', 'Rabat', '0537-234567', 'info@bet.ma', true),
('FOUR-003', 'Société Travaux Publics STP', '34567890', '000345678901234', 'Marrakech', '0524-345678', 'stp@travaux.ma', true),
('FOUR-004', 'Cabinet Conseil & Audit CCA', '45678901', '000456789012345', 'Fès', '0535-456789', 'cabinet@cca.ma', true),
('FOUR-005', 'Entreprise Infrastructure Moderne EIM', '56789012', '000567890123456', 'Tanger', '0539-567890', 'contact@eim.ma', true),
('FOUR-006', 'Société Aménagement Urbain SAU', '67890123', '000678901234567', 'Agadir', '0528-678901', 'sau@amenagement.ma', true)
ON CONFLICT (code) DO NOTHING;

-- =========================================
-- BUDGETS (versions simplifiées)
-- =========================================

-- Budget pour Convention 1 (VALIDEE)
INSERT INTO budgets (
    convention_id, version, date_budget, statut,
    plafond_convention, total_budget, actif
)
SELECT
    c.id, 'V1', '2024-02-01', 'VALIDE',
    50000000.00, 50000000.00, true
FROM conventions c WHERE c.code = 'CONV-2024-001'
ON CONFLICT DO NOTHING;

-- Budget pour Convention 2 (EN_COURS)
INSERT INTO budgets (
    convention_id, version, date_budget, statut,
    plafond_convention, total_budget, actif
)
SELECT
    c.id, 'V1', '2024-04-15', 'VALIDE',
    25000000.00, 25000000.00, true
FROM conventions c WHERE c.code = 'CONV-2024-002'
ON CONFLICT DO NOTHING;

-- Budget pour Convention 6 (EN_COURS)
INSERT INTO budgets (
    convention_id, version, date_budget, statut,
    plafond_convention, total_budget, actif
)
SELECT
    c.id, 'V1', '2024-03-15', 'VALIDE',
    45000000.00, 45000000.00, true
FROM conventions c WHERE c.code = 'CONV-2024-006'
ON CONFLICT DO NOTHING;

-- Budget pour Convention 7 (VALIDEE)
INSERT INTO budgets (
    convention_id, version, date_budget, statut,
    plafond_convention, total_budget, actif
)
SELECT
    c.id, 'V1', '2024-05-10', 'VALIDE',
    28000000.00, 28000000.00, true
FROM conventions c WHERE c.code = 'CONV-2024-007'
ON CONFLICT DO NOTHING;

-- Budget pour Convention 8 (EN_COURS)
INSERT INTO budgets (
    convention_id, version, date_budget, statut,
    plafond_convention, total_budget, actif
)
SELECT
    c.id, 'V1', '2024-06-20', 'VALIDE',
    18000000.00, 18000000.00, true
FROM conventions c WHERE c.code = 'CONV-2024-008'
ON CONFLICT DO NOTHING;

-- =========================================
-- MARCHÉS (liés aux conventions)
-- =========================================

-- Marché 1 pour Convention 1
INSERT INTO marches (
    numero_marche, date_marche, fournisseur_id, convention_id,
    objet, montant_ht, taux_tva, montant_tva, montant_ttc,
    statut, date_debut, date_fin_prevue, delai_execution_mois, actif
)
SELECT
    'MAR-2024-001', '2024-02-15',
    f.id, c.id,
    'Construction infrastructure routière - Phase 1',
    30000000.00, 20.00, 6000000.00, 36000000.00,
    'EN_COURS', '2024-03-01', '2025-02-28', 12, true
FROM fournisseurs f, conventions c
WHERE f.code = 'FOUR-001' AND c.code = 'CONV-2024-001'
ON CONFLICT DO NOTHING;

-- Marché 2 pour Convention 1
INSERT INTO marches (
    numero_marche, date_marche, fournisseur_id, convention_id,
    objet, montant_ht, taux_tva, montant_tva, montant_ttc,
    statut, date_debut, date_fin_prevue, delai_execution_mois, actif
)
SELECT
    'MAR-2024-002', '2024-02-20',
    f.id, c.id,
    'Études techniques et supervision - Phase 1',
    8000000.00, 20.00, 1600000.00, 9600000.00,
    'EN_COURS', '2024-03-01', '2025-02-28', 12, true
FROM fournisseurs f, conventions c
WHERE f.code = 'FOUR-002' AND c.code = 'CONV-2024-001'
ON CONFLICT DO NOTHING;

-- Marché 3 pour Convention 2
INSERT INTO marches (
    numero_marche, date_marche, fournisseur_id, convention_id,
    objet, montant_ht, taux_tva, montant_tva, montant_ttc,
    statut, date_debut, date_fin_prevue, delai_execution_mois, actif
)
SELECT
    'MAR-2024-003', '2024-04-25',
    f.id, c.id,
    'Développement numérique PME - Infrastructure',
    15000000.00, 20.00, 3000000.00, 18000000.00,
    'EN_COURS', '2024-05-01', '2025-10-31', 18, true
FROM fournisseurs f, conventions c
WHERE f.code = 'FOUR-003' AND c.code = 'CONV-2024-002'
ON CONFLICT DO NOTHING;

-- Marché 4 pour Convention 6
INSERT INTO marches (
    numero_marche, date_marche, fournisseur_id, convention_id,
    objet, montant_ht, taux_tva, montant_tva, montant_ttc,
    statut, date_debut, date_fin_prevue, delai_execution_mois, actif
)
SELECT
    'MAR-2024-004', '2024-03-25',
    f.id, c.id,
    'Amélioration centres de santé - Construction',
    35000000.00, 20.00, 7000000.00, 42000000.00,
    'EN_COURS', '2024-04-01', '2026-03-31', 24, true
FROM fournisseurs f, conventions c
WHERE f.code = 'FOUR-001' AND c.code = 'CONV-2024-006'
ON CONFLICT DO NOTHING;

-- Marché 5 pour Convention 7
INSERT INTO marches (
    numero_marche, date_marche, fournisseur_id, convention_id,
    objet, montant_ht, taux_tva, montant_tva, montant_ttc,
    statut, date_debut, date_fin_prevue, delai_execution_mois, actif
)
SELECT
    'MAR-2024-005', '2024-05-20',
    f.id, c.id,
    'Aménagement zones vertes et espaces publics',
    22000000.00, 20.00, 4400000.00, 26400000.00,
    'EN_COURS', '2024-06-01', '2025-11-30', 18, true
FROM fournisseurs f, conventions c
WHERE f.code = 'FOUR-006' AND c.code = 'CONV-2024-007'
ON CONFLICT DO NOTHING;

-- =========================================
-- DÉCOMPTES (situations de travaux)
-- =========================================

-- Décomptes pour Marché 1 (MAR-2024-001)
INSERT INTO decomptes (
    marche_id, numero_decompte, date_decompte, periode_debut, periode_fin,
    statut, montant_brut_ht, montant_tva, montant_ttc,
    cumul_precedent, cumul_actuel, actif
)
SELECT
    m.id, 'DEC-001-01', '2024-04-30', '2024-03-01', '2024-04-30',
    'VALIDE', 5000000.00, 1000000.00, 6000000.00,
    0.00, 6000000.00, true
FROM marches m WHERE m.numero_marche = 'MAR-2024-001'
ON CONFLICT DO NOTHING;

INSERT INTO decomptes (
    marche_id, numero_decompte, date_decompte, periode_debut, periode_fin,
    statut, montant_brut_ht, montant_tva, montant_ttc,
    cumul_precedent, cumul_actuel, actif
)
SELECT
    m.id, 'DEC-001-02', '2024-07-31', '2024-05-01', '2024-07-31',
    'VALIDE', 8000000.00, 1600000.00, 9600000.00,
    6000000.00, 15600000.00, true
FROM marches m WHERE m.numero_marche = 'MAR-2024-001'
ON CONFLICT DO NOTHING;

INSERT INTO decomptes (
    marche_id, numero_decompte, date_decompte, periode_debut, periode_fin,
    statut, montant_brut_ht, montant_tva, montant_ttc,
    cumul_precedent, cumul_actuel, actif
)
SELECT
    m.id, 'DEC-001-03', '2024-10-31', '2024-08-01', '2024-10-31',
    'EN_COURS', 7000000.00, 1400000.00, 8400000.00,
    15600000.00, 24000000.00, true
FROM marches m WHERE m.numero_marche = 'MAR-2024-001'
ON CONFLICT DO NOTHING;

-- Décomptes pour Marché 2 (MAR-2024-002)
INSERT INTO decomptes (
    marche_id, numero_decompte, date_decompte, periode_debut, periode_fin,
    statut, montant_brut_ht, montant_tva, montant_ttc,
    cumul_precedent, cumul_actuel, actif
)
SELECT
    m.id, 'DEC-002-01', '2024-06-30', '2024-03-01', '2024-06-30',
    'VALIDE', 3000000.00, 600000.00, 3600000.00,
    0.00, 3600000.00, true
FROM marches m WHERE m.numero_marche = 'MAR-2024-002'
ON CONFLICT DO NOTHING;

INSERT INTO decomptes (
    marche_id, numero_decompte, date_decompte, periode_debut, periode_fin,
    statut, montant_brut_ht, montant_tva, montant_ttc,
    cumul_precedent, cumul_actuel, actif
)
SELECT
    m.id, 'DEC-002-02', '2024-09-30', '2024-07-01', '2024-09-30',
    'VALIDE', 2500000.00, 500000.00, 3000000.00,
    3600000.00, 6600000.00, true
FROM marches m WHERE m.numero_marche = 'MAR-2024-002'
ON CONFLICT DO NOTHING;

-- Décomptes pour Marché 3 (MAR-2024-003)
INSERT INTO decomptes (
    marche_id, numero_decompte, date_decompte, periode_debut, periode_fin,
    statut, montant_brut_ht, montant_tva, montant_ttc,
    cumul_precedent, cumul_actuel, actif
)
SELECT
    m.id, 'DEC-003-01', '2024-07-31', '2024-05-01', '2024-07-31',
    'VALIDE', 4000000.00, 800000.00, 4800000.00,
    0.00, 4800000.00, true
FROM marches m WHERE m.numero_marche = 'MAR-2024-003'
ON CONFLICT DO NOTHING;

INSERT INTO decomptes (
    marche_id, numero_decompte, date_decompte, periode_debut, periode_fin,
    statut, montant_brut_ht, montant_tva, montant_ttc,
    cumul_precedent, cumul_actuel, actif
)
SELECT
    m.id, 'DEC-003-02', '2024-10-31', '2024-08-01', '2024-10-31',
    'VALIDE', 5000000.00, 1000000.00, 6000000.00,
    4800000.00, 10800000.00, true
FROM marches m WHERE m.numero_marche = 'MAR-2024-003'
ON CONFLICT DO NOTHING;

-- Décomptes pour Marché 4 (MAR-2024-004)
INSERT INTO decomptes (
    marche_id, numero_decompte, date_decompte, periode_debut, periode_fin,
    statut, montant_brut_ht, montant_tva, montant_ttc,
    cumul_precedent, cumul_actuel, actif
)
SELECT
    m.id, 'DEC-004-01', '2024-06-30', '2024-04-01', '2024-06-30',
    'VALIDE', 8000000.00, 1600000.00, 9600000.00,
    0.00, 9600000.00, true
FROM marches m WHERE m.numero_marche = 'MAR-2024-004'
ON CONFLICT DO NOTHING;

INSERT INTO decomptes (
    marche_id, numero_decompte, date_decompte, periode_debut, periode_fin,
    statut, montant_brut_ht, montant_tva, montant_ttc,
    cumul_precedent, cumul_actuel, actif
)
SELECT
    m.id, 'DEC-004-02', '2024-09-30', '2024-07-01', '2024-09-30',
    'VALIDE', 10000000.00, 2000000.00, 12000000.00,
    9600000.00, 21600000.00, true
FROM marches m WHERE m.numero_marche = 'MAR-2024-004'
ON CONFLICT DO NOTHING;

-- =========================================
-- ORDRES DE PAIEMENT
-- =========================================

-- OP pour Décompte DEC-001-01
INSERT INTO ordres_paiement (
    decompte_id, numero_op, date_op, statut,
    montant_a_payer, mode_paiement, date_prevue_paiement, actif
)
SELECT
    d.id, 'OP-2024-001', '2024-05-05', 'PAYE',
    6000000.00, 'VIREMENT', '2024-05-15', true
FROM decomptes d WHERE d.numero_decompte = 'DEC-001-01'
ON CONFLICT DO NOTHING;

-- OP pour Décompte DEC-001-02
INSERT INTO ordres_paiement (
    decompte_id, numero_op, date_op, statut,
    montant_a_payer, mode_paiement, date_prevue_paiement, actif
)
SELECT
    d.id, 'OP-2024-002', '2024-08-05', 'PAYE',
    9600000.00, 'VIREMENT', '2024-08-15', true
FROM decomptes d WHERE d.numero_decompte = 'DEC-001-02'
ON CONFLICT DO NOTHING;

-- OP pour Décompte DEC-001-03
INSERT INTO ordres_paiement (
    decompte_id, numero_op, date_op, statut,
    montant_a_payer, mode_paiement, date_prevue_paiement, actif
)
SELECT
    d.id, 'OP-2024-003', '2024-11-05', 'EN_COURS',
    8400000.00, 'VIREMENT', '2024-11-20', true
FROM decomptes d WHERE d.numero_decompte = 'DEC-001-03'
ON CONFLICT DO NOTHING;

-- OP pour Décompte DEC-002-01
INSERT INTO ordres_paiement (
    decompte_id, numero_op, date_op, statut,
    montant_a_payer, mode_paiement, date_prevue_paiement, actif
)
SELECT
    d.id, 'OP-2024-004', '2024-07-05', 'PAYE',
    3600000.00, 'VIREMENT', '2024-07-15', true
FROM decomptes d WHERE d.numero_decompte = 'DEC-002-01'
ON CONFLICT DO NOTHING;

-- OP pour Décompte DEC-002-02
INSERT INTO ordres_paiement (
    decompte_id, numero_op, date_op, statut,
    montant_a_payer, mode_paiement, date_prevue_paiement, actif
)
SELECT
    d.id, 'OP-2024-005', '2024-10-05', 'PAYE',
    3000000.00, 'VIREMENT', '2024-10-15', true
FROM decomptes d WHERE d.numero_decompte = 'DEC-002-02'
ON CONFLICT DO NOTHING;

-- OP pour Décompte DEC-003-01
INSERT INTO ordres_paiement (
    decompte_id, numero_op, date_op, statut,
    montant_a_payer, mode_paiement, date_prevue_paiement, actif
)
SELECT
    d.id, 'OP-2024-006', '2024-08-05', 'PAYE',
    4800000.00, 'VIREMENT', '2024-08-20', true
FROM decomptes d WHERE d.numero_decompte = 'DEC-003-01'
ON CONFLICT DO NOTHING;

-- OP pour Décompte DEC-003-02
INSERT INTO ordres_paiement (
    decompte_id, numero_op, date_op, statut,
    montant_a_payer, mode_paiement, date_prevue_paiement, actif
)
SELECT
    d.id, 'OP-2024-007', '2024-11-05', 'PAYE',
    6000000.00, 'VIREMENT', '2024-11-20', true
FROM decomptes d WHERE d.numero_decompte = 'DEC-003-02'
ON CONFLICT DO NOTHING;

-- OP pour Décompte DEC-004-01
INSERT INTO ordres_paiement (
    decompte_id, numero_op, date_op, statut,
    montant_a_payer, mode_paiement, date_prevue_paiement, actif
)
SELECT
    d.id, 'OP-2024-008', '2024-07-10', 'PAYE',
    9600000.00, 'VIREMENT', '2024-07-25', true
FROM decomptes d WHERE d.numero_decompte = 'DEC-004-01'
ON CONFLICT DO NOTHING;

-- OP pour Décompte DEC-004-02
INSERT INTO ordres_paiement (
    decompte_id, numero_op, date_op, statut,
    montant_a_payer, mode_paiement, date_prevue_paiement, actif
)
SELECT
    d.id, 'OP-2024-009', '2024-10-10', 'PAYE',
    12000000.00, 'VIREMENT', '2024-10-25', true
FROM decomptes d WHERE d.numero_decompte = 'DEC-004-02'
ON CONFLICT DO NOTHING;

-- =========================================
-- PAIEMENTS (paiements effectifs)
-- =========================================

-- Paiement pour OP-2024-001
INSERT INTO paiements (
    ordre_paiement_id, reference_paiement, date_valeur, date_execution,
    montant_paye, mode_paiement, actif
)
SELECT
    op.id, 'PAY-2024-001', '2024-05-10', '2024-05-12',
    6000000.00, 'VIREMENT', true
FROM ordres_paiement op WHERE op.numero_op = 'OP-2024-001'
ON CONFLICT DO NOTHING;

-- Paiement pour OP-2024-002
INSERT INTO paiements (
    ordre_paiement_id, reference_paiement, date_valeur, date_execution,
    montant_paye, mode_paiement, actif
)
SELECT
    op.id, 'PAY-2024-002', '2024-08-10', '2024-08-13',
    9600000.00, 'VIREMENT', true
FROM ordres_paiement op WHERE op.numero_op = 'OP-2024-002'
ON CONFLICT DO NOTHING;

-- Paiement pour OP-2024-004
INSERT INTO paiements (
    ordre_paiement_id, reference_paiement, date_valeur, date_execution,
    montant_paye, mode_paiement, actif
)
SELECT
    op.id, 'PAY-2024-004', '2024-07-10', '2024-07-12',
    3600000.00, 'VIREMENT', true
FROM ordres_paiement op WHERE op.numero_op = 'OP-2024-004'
ON CONFLICT DO NOTHING;

-- Paiement pour OP-2024-005
INSERT INTO paiements (
    ordre_paiement_id, reference_paiement, date_valeur, date_execution,
    montant_paye, mode_paiement, actif
)
SELECT
    op.id, 'PAY-2024-005', '2024-10-10', '2024-10-13',
    3000000.00, 'VIREMENT', true
FROM ordres_paiement op WHERE op.numero_op = 'OP-2024-005'
ON CONFLICT DO NOTHING;

-- Paiement pour OP-2024-006
INSERT INTO paiements (
    ordre_paiement_id, reference_paiement, date_valeur, date_execution,
    montant_paye, mode_paiement, actif
)
SELECT
    op.id, 'PAY-2024-006', '2024-08-15', '2024-08-18',
    4800000.00, 'VIREMENT', true
FROM ordres_paiement op WHERE op.numero_op = 'OP-2024-006'
ON CONFLICT DO NOTHING;

-- Paiement pour OP-2024-007
INSERT INTO paiements (
    ordre_paiement_id, reference_paiement, date_valeur, date_execution,
    montant_paye, mode_paiement, actif
)
SELECT
    op.id, 'PAY-2024-007', '2024-11-15', '2024-11-18',
    6000000.00, 'VIREMENT', true
FROM ordres_paiement op WHERE op.numero_op = 'OP-2024-007'
ON CONFLICT DO NOTHING;

-- Paiement pour OP-2024-008
INSERT INTO paiements (
    ordre_paiement_id, reference_paiement, date_valeur, date_execution,
    montant_paye, mode_paiement, actif
)
SELECT
    op.id, 'PAY-2024-008', '2024-07-20', '2024-07-23',
    9600000.00, 'VIREMENT', true
FROM ordres_paiement op WHERE op.numero_op = 'OP-2024-008'
ON CONFLICT DO NOTHING;

-- Paiement pour OP-2024-009
INSERT INTO paiements (
    ordre_paiement_id, reference_paiement, date_valeur, date_execution,
    montant_paye, mode_paiement, actif
)
SELECT
    op.id, 'PAY-2024-009', '2024-10-20', '2024-10-23',
    12000000.00, 'VIREMENT', true
FROM ordres_paiement op WHERE op.numero_op = 'OP-2024-009'
ON CONFLICT DO NOTHING;

-- ========================================================================================================
-- RÉSUMÉ DES DONNÉES CRÉÉES
-- ========================================================================================================
--
-- Fournisseurs:        6 fournisseurs
-- Budgets:            5 budgets (pour conventions validées/en cours)
-- Marchés:            5 marchés (liés aux conventions)
-- Décomptes:          10 décomptes (situations de travaux)
-- Ordres Paiement:    9 ordres de paiement
-- Paiements:          8 paiements effectifs
--
-- Montants totaux:
-- - Marchés:          ~130M MAD TTC
-- - Décomptes:        ~67M MAD TTC
-- - Paiements:        ~54M MAD
-- - Taux exécution:   ~41% (54M / 130M)
--
-- ========================================================================================================
