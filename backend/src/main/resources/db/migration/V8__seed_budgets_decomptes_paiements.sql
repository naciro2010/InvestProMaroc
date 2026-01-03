-- ========================================================================================================
-- V8__seed_budgets_decomptes_paiements.sql
-- InvestPro Maroc - Budgets, Décomptes et Paiements fictifs
-- ========================================================================================================

-- =========================================
-- BUDGETS (pour les conventions validées/en cours)
-- =========================================

-- Budget pour Convention 1 (VALIDEE)
INSERT INTO budgets (
    convention_id, version, numero, date_budget, statut, total_budget,
    total_engage, total_ordonnance, total_paye, actif
)
SELECT
    c.id, 'V0', 'BUD-2024-001', '2024-02-01', 'VALIDE',
    50000000.00, 35000000.00, 25000000.00, 18000000.00, true
FROM conventions c WHERE c.code = 'CONV-2024-001'
ON CONFLICT DO NOTHING;

-- Budget pour Convention 2 (EN_COURS)
INSERT INTO budgets (
    convention_id, version, numero, date_budget, statut, total_budget,
    total_engage, total_ordonnance, total_paye, actif
)
SELECT
    c.id, 'V0', 'BUD-2024-002', '2024-04-15', 'VALIDE',
    25000000.00, 20000000.00, 15000000.00, 12000000.00, true
FROM conventions c WHERE c.code = 'CONV-2024-002'
ON CONFLICT DO NOTHING;

-- Budget pour Convention 6 (EN_COURS)
INSERT INTO budgets (
    convention_id, version, numero, date_budget, statut, total_budget,
    total_engage, total_ordonnance, total_paye, actif
)
SELECT
    c.id, 'V0', 'BUD-2024-006', '2024-03-15', 'VALIDE',
    45000000.00, 30000000.00, 20000000.00, 15000000.00, true
FROM conventions c WHERE c.code = 'CONV-2024-006'
ON CONFLICT DO NOTHING;

-- Budget pour Convention 7 (VALIDEE)
INSERT INTO budgets (
    convention_id, version, numero, date_budget, statut, total_budget,
    total_engage, total_ordonnance, total_paye, actif
)
SELECT
    c.id, 'V0', 'BUD-2024-007', '2024-05-10', 'VALIDE',
    28000000.00, 18000000.00, 12000000.00, 8000000.00, true
FROM conventions c WHERE c.code = 'CONV-2024-007'
ON CONFLICT DO NOTHING;

-- Budget pour Convention 8 (EN_COURS)
INSERT INTO budgets (
    convention_id, version, numero, date_budget, statut, total_budget,
    total_engage, total_ordonnance, total_paye, actif
)
SELECT
    c.id, 'V0', 'BUD-2024-008', '2024-06-20', 'VALIDE',
    18000000.00, 12000000.00, 8000000.00, 5000000.00, true
FROM conventions c WHERE c.code = 'CONV-2024-008'
ON CONFLICT DO NOTHING;

-- Budget pour Convention 9 (VALIDEE)
INSERT INTO budgets (
    convention_id, version, numero, date_budget, statut, total_budget,
    total_engage, total_ordonnance, total_paye, actif
)
SELECT
    c.id, 'V0', 'BUD-2024-009', '2024-07-15', 'VALIDE',
    60000000.00, 40000000.00, 28000000.00, 20000000.00, true
FROM conventions c WHERE c.code = 'CONV-2024-009'
ON CONFLICT DO NOTHING;

-- Budget pour Convention 11 (EN_COURS)
INSERT INTO budgets (
    convention_id, version, numero, date_budget, statut, total_budget,
    total_engage, total_ordonnance, total_paye, actif
)
SELECT
    c.id, 'V0', 'BUD-2024-011', '2024-09-15', 'VALIDE',
    38000000.00, 25000000.00, 16000000.00, 10000000.00, true
FROM conventions c WHERE c.code = 'CONV-2024-011'
ON CONFLICT DO NOTHING;

-- Budget pour Convention 12 (VALIDEE)
INSERT INTO budgets (
    convention_id, version, numero, date_budget, statut, total_budget,
    total_engage, total_ordonnance, total_paye, actif
)
SELECT
    c.id, 'V0', 'BUD-2024-012', '2024-10-10', 'VALIDE',
    22000000.00, 15000000.00, 10000000.00, 7000000.00, true
FROM conventions c WHERE c.code = 'CONV-2024-012'
ON CONFLICT DO NOTHING;

-- Budget pour Convention 13 (EN_COURS)
INSERT INTO budgets (
    convention_id, version, numero, date_budget, statut, total_budget,
    total_engage, total_ordonnance, total_paye, actif
)
SELECT
    c.id, 'V0', 'BUD-2024-013', '2024-11-10', 'VALIDE',
    32000000.00, 20000000.00, 12000000.00, 8000000.00, true
FROM conventions c WHERE c.code = 'CONV-2024-013'
ON CONFLICT DO NOTHING;

-- Budget pour Convention 15 (VALIDEE)
INSERT INTO budgets (
    convention_id, version, numero, date_budget, statut, total_budget,
    total_engage, total_ordonnance, total_paye, actif
)
SELECT
    c.id, 'V0', 'BUD-2024-015', '2025-01-20', 'VALIDE',
    16000000.00, 10000000.00, 6000000.00, 4000000.00, true
FROM conventions c WHERE c.code = 'CONV-2024-015'
ON CONFLICT DO NOTHING;

-- =========================================
-- DÉCOMPTES (situations de travaux)
-- =========================================

-- Décomptes pour Convention 1
INSERT INTO decomptes (
    budget_id, numero, date_decompte, statut, montant_ht, montant_ttc,
    pourcentage_avancement, observations, actif
)
SELECT
    b.id, 'DEC-001-01', '2024-03-15', 'VALIDE',
    8000000.00, 9600000.00, 20.00,
    'Décompte 1 - Travaux préparatoires', true
FROM budgets b
JOIN conventions c ON c.id = b.convention_id
WHERE c.code = 'CONV-2024-001'
ON CONFLICT DO NOTHING;

INSERT INTO decomptes (
    budget_id, numero, date_decompte, statut, montant_ht, montant_ttc,
    pourcentage_avancement, observations, actif
)
SELECT
    b.id, 'DEC-001-02', '2024-06-15', 'VALIDE',
    12000000.00, 14400000.00, 45.00,
    'Décompte 2 - Travaux principaux', true
FROM budgets b
JOIN conventions c ON c.id = b.convention_id
WHERE c.code = 'CONV-2024-001'
ON CONFLICT DO NOTHING;

INSERT INTO decomptes (
    budget_id, numero, date_decompte, statut, montant_ht, montant_ttc,
    pourcentage_avancement, observations, actif
)
SELECT
    b.id, 'DEC-001-03', '2024-09-15', 'EN_COURS',
    10000000.00, 12000000.00, 70.00,
    'Décompte 3 - Travaux de finition', true
FROM budgets b
JOIN conventions c ON c.id = b.convention_id
WHERE c.code = 'CONV-2024-001'
ON CONFLICT DO NOTHING;

-- Décomptes pour Convention 2
INSERT INTO decomptes (
    budget_id, numero, date_decompte, statut, montant_ht, montant_ttc,
    pourcentage_avancement, observations, actif
)
SELECT
    b.id, 'DEC-002-01', '2024-05-20', 'VALIDE',
    6000000.00, 7200000.00, 30.00,
    'Décompte 1 - Phase initiale', true
FROM budgets b
JOIN conventions c ON c.id = b.convention_id
WHERE c.code = 'CONV-2024-002'
ON CONFLICT DO NOTHING;

INSERT INTO decomptes (
    budget_id, numero, date_decompte, statut, montant_ht, montant_ttc,
    pourcentage_avancement, observations, actif
)
SELECT
    b.id, 'DEC-002-02', '2024-08-20', 'VALIDE',
    8000000.00, 9600000.00, 65.00,
    'Décompte 2 - Travaux en cours', true
FROM budgets b
JOIN conventions c ON c.id = b.convention_id
WHERE c.code = 'CONV-2024-002'
ON CONFLICT DO NOTHING;

-- Décomptes pour Convention 6
INSERT INTO decomptes (
    budget_id, numero, date_decompte, statut, montant_ht, montant_ttc,
    pourcentage_avancement, observations, actif
)
SELECT
    b.id, 'DEC-006-01', '2024-05-01', 'VALIDE',
    10000000.00, 12000000.00, 25.00,
    'Décompte 1 - Centres de santé zone 1', true
FROM budgets b
JOIN conventions c ON c.id = b.convention_id
WHERE c.code = 'CONV-2024-006'
ON CONFLICT DO NOTHING;

INSERT INTO decomptes (
    budget_id, numero, date_decompte, statut, montant_ht, montant_ttc,
    pourcentage_avancement, observations, actif
)
SELECT
    b.id, 'DEC-006-02', '2024-08-01', 'VALIDE',
    12000000.00, 14400000.00, 55.00,
    'Décompte 2 - Centres de santé zone 2', true
FROM budgets b
JOIN conventions c ON c.id = b.convention_id
WHERE c.code = 'CONV-2024-006'
ON CONFLICT DO NOTHING;

-- =========================================
-- PAIEMENTS (ordres de paiement)
-- =========================================

-- Paiements pour Convention 1
INSERT INTO paiements (
    decompte_id, numero_ordre, date_ordre, statut, montant_ordonnance,
    montant_paye, date_paiement, mode_paiement, actif
)
SELECT
    d.id, 'OP-001-01', '2024-03-20', 'PAYE',
    9600000.00, 9600000.00, '2024-03-25', 'VIREMENT', true
FROM decomptes d WHERE d.numero = 'DEC-001-01'
ON CONFLICT DO NOTHING;

INSERT INTO paiements (
    decompte_id, numero_ordre, date_ordre, statut, montant_ordonnance,
    montant_paye, date_paiement, mode_paiement, actif
)
SELECT
    d.id, 'OP-001-02', '2024-06-20', 'PAYE',
    14400000.00, 14400000.00, '2024-06-28', 'VIREMENT', true
FROM decomptes d WHERE d.numero = 'DEC-001-02'
ON CONFLICT DO NOTHING;

INSERT INTO paiements (
    decompte_id, numero_ordre, date_ordre, statut, montant_ordonnance,
    montant_paye, date_paiement, mode_paiement, actif
)
SELECT
    d.id, 'OP-001-03', '2024-09-20', 'EN_COURS',
    12000000.00, 0.00, NULL, 'VIREMENT', true
FROM decomptes d WHERE d.numero = 'DEC-001-03'
ON CONFLICT DO NOTHING;

-- Paiements pour Convention 2
INSERT INTO paiements (
    decompte_id, numero_ordre, date_ordre, statut, montant_ordonnance,
    montant_paye, date_paiement, mode_paiement, actif
)
SELECT
    d.id, 'OP-002-01', '2024-05-25', 'PAYE',
    7200000.00, 7200000.00, '2024-06-01', 'VIREMENT', true
FROM decomptes d WHERE d.numero = 'DEC-002-01'
ON CONFLICT DO NOTHING;

INSERT INTO paiements (
    decompte_id, numero_ordre, date_ordre, statut, montant_ordonnance,
    montant_paye, date_paiement, mode_paiement, actif
)
SELECT
    d.id, 'OP-002-02', '2024-08-25', 'PAYE',
    9600000.00, 9600000.00, '2024-09-05', 'VIREMENT', true
FROM decomptes d WHERE d.numero = 'DEC-002-02'
ON CONFLICT DO NOTHING;

-- Paiements pour Convention 6
INSERT INTO paiements (
    decompte_id, numero_ordre, date_ordre, statut, montant_ordonnance,
    montant_paye, date_paiement, mode_paiement, actif
)
SELECT
    d.id, 'OP-006-01', '2024-05-10', 'PAYE',
    12000000.00, 12000000.00, '2024-05-18', 'VIREMENT', true
FROM decomptes d WHERE d.numero = 'DEC-006-01'
ON CONFLICT DO NOTHING;

INSERT INTO paiements (
    decompte_id, numero_ordre, date_ordre, statut, montant_ordonnance,
    montant_paye, date_paiement, mode_paiement, actif
)
SELECT
    d.id, 'OP-006-02', '2024-08-10', 'PAYE',
    14400000.00, 14400000.00, '2024-08-20', 'VIREMENT', true
FROM decomptes d WHERE d.numero = 'DEC-006-02'
ON CONFLICT DO NOTHING;
