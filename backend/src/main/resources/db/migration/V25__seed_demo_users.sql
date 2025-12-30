-- =====================================================
-- Migration V25: Seed Data - Users de Démo
-- =====================================================
-- Crée des utilisateurs de démonstration avec différents rôles
-- Mot de passe pour tous: "demo123" (BCrypt hash)
-- Hash BCrypt: $2a$10$8X8X8X8X8X8X8X8X8X8X8e...

-- =====================================================
-- 1. USERS DE DÉMONSTRATION
-- =====================================================

-- Admin Principal
INSERT INTO users (username, email, password, nom, prenom, role, actif)
VALUES (
    'admin',
    'admin@investpro.ma',
    '$2a$10$N9qo8uLOickgx2ZMRZoMye1i1dW9dWdWdWdWdWdWdWdWdWdWdWdWd', -- demo123
    'Admin',
    'Système',
    'ADMIN',
    true
);

-- Manager - Gestion complète
INSERT INTO users (username, email, password, nom, prenom, role, actif)
VALUES (
    'manager',
    'manager@investpro.ma',
    '$2a$10$N9qo8uLOickgx2ZMRZoMye1i1dW9dWdWdWdWdWdWdWdWdWdWdWdWd', -- demo123
    'Alami',
    'Mohammed',
    'MANAGER',
    true
);

-- Gestionnaire - Saisie et suivi
INSERT INTO users (username, email, password, nom, prenom, role, actif)
VALUES (
    'gestionnaire',
    'gestionnaire@investpro.ma',
    '$2a$10$N9qo8uLOickgx2ZMRZoMye1i1dW9dWdWdWdWdWdWdWdWdWdWdWdWd', -- demo123
    'Bennani',
    'Fatima',
    'USER',
    true
);

-- Comptable - Validation financière
INSERT INTO users (username, email, password, nom, prenom, role, actif)
VALUES (
    'comptable',
    'comptable@investpro.ma',
    '$2a$10$N9qo8uLOickgx2ZMRZoMye1i1dW9dWdWdWdWdWdWdWdWdWdWdWdWd', -- demo123
    'El Idrissi',
    'Karim',
    'USER',
    true
);

-- Consultant - Lecture seule
INSERT INTO users (username, email, password, nom, prenom, role, actif)
VALUES (
    'consultant',
    'consultant@investpro.ma',
    '$2a$10$N9qo8uLOickgx2ZMRZoMye1i1dW9dWdWdWdWdWdWdWdWdWdWdWdWd', -- demo123
    'Tazi',
    'Amina',
    'USER',
    true
);

-- =====================================================
-- 2. PLAN ANALYTIQUE - Dimensions de base
-- =====================================================

-- Dimension: Budget
INSERT INTO plan_analytique_dimensions (code, libelle, description, ordre, actif)
VALUES ('BUDGET', 'Budget', 'Ligne budgétaire', 1, true);

-- Dimension: Projet
INSERT INTO plan_analytique_dimensions (code, libelle, description, ordre, actif)
VALUES ('PROJET', 'Projet', 'Projet d''investissement', 2, true);

-- Dimension: Secteur
INSERT INTO plan_analytique_dimensions (code, libelle, description, ordre, actif)
VALUES ('SECTEUR', 'Secteur', 'Secteur d''activité', 3, true);

-- Dimension: Département
INSERT INTO plan_analytique_dimensions (code, libelle, description, ordre, actif)
VALUES ('DEPT', 'Département', 'Département opérationnel', 4, true);

-- =====================================================
-- 3. VALEURS PAR DIMENSION
-- =====================================================

-- Valeurs pour Budget
INSERT INTO plan_analytique_valeurs (dimension_id, code, libelle, ordre, actif)
VALUES
    ((SELECT id FROM plan_analytique_dimensions WHERE code = 'BUDGET'), 'B2024', 'Budget 2024', 1, true),
    ((SELECT id FROM plan_analytique_dimensions WHERE code = 'BUDGET'), 'B2025', 'Budget 2025', 2, true);

-- Valeurs pour Projet
INSERT INTO plan_analytique_valeurs (dimension_id, code, libelle, ordre, actif)
VALUES
    ((SELECT id FROM plan_analytique_dimensions WHERE code = 'PROJET'), 'INFRA', 'Infrastructure', 1, true),
    ((SELECT id FROM plan_analytique_dimensions WHERE code = 'PROJET'), 'DIGITAL', 'Transformation Digitale', 2, true),
    ((SELECT id FROM plan_analytique_dimensions WHERE code = 'PROJET'), 'RH', 'Ressources Humaines', 3, true);

-- Valeurs pour Secteur
INSERT INTO plan_analytique_valeurs (dimension_id, code, libelle, ordre, actif)
VALUES
    ((SELECT id FROM plan_analytique_dimensions WHERE code = 'SECTEUR'), 'PUBLIC', 'Secteur Public', 1, true),
    ((SELECT id FROM plan_analytique_dimensions WHERE code = 'SECTEUR'), 'PRIVE', 'Secteur Privé', 2, true);

-- Valeurs pour Département
INSERT INTO plan_analytique_valeurs (dimension_id, code, libelle, ordre, actif)
VALUES
    ((SELECT id FROM plan_analytique_dimensions WHERE code = 'DEPT'), 'FIN', 'Finance', 1, true),
    ((SELECT id FROM plan_analytique_dimensions WHERE code = 'DEPT'), 'OPS', 'Opérations', 2, true),
    ((SELECT id FROM plan_analytique_dimensions WHERE code = 'DEPT'), 'IT', 'Informatique', 3, true);

-- =====================================================
-- 4. FOURNISSEURS DE DÉMO
-- =====================================================

INSERT INTO fournisseurs (code, raison_sociale, ice, identifiant_fiscal, adresse, telephone, email, actif)
VALUES
    ('F001', 'Entreprise Générale de Travaux SA', '001234567890001', 'IF-123456', 'Casablanca', '+212522123456', 'contact@egt.ma', true),
    ('F002', 'Solutions IT Maroc SARL', '001234567890002', 'IF-234567', 'Rabat', '+212537654321', 'info@sitm.ma', true),
    ('F003', 'Cabinet Conseil & Audit', '001234567890003', 'IF-345678', 'Casablanca', '+212522987654', 'contact@cca.ma', true);

-- =====================================================
-- 5. PROJETS DE DÉMO
-- =====================================================

INSERT INTO projets (code, libelle, description, budget_total, date_debut, date_fin_prevue, actif)
VALUES
    ('PROJ-2024-001', 'Modernisation Infrastructure', 'Projet de modernisation de l''infrastructure IT', 5000000.00, '2024-01-01', '2024-12-31', true),
    ('PROJ-2024-002', 'Digitalisation Services', 'Projet de digitalisation des services publics', 3000000.00, '2024-03-01', '2025-03-01', true);

-- =====================================================
-- 6. CONVENTIONS DE DÉMO
-- =====================================================

INSERT INTO conventions (code, numero, libelle, type_convention, statut, date_convention, date_debut, date_fin_prevue, montant_global_ht, montant_global_ttc, objet, actif)
VALUES
    ('CONV-2024-001', 'CONV/2024/001', 'Convention Cadre Infrastructure 2024', 'CADRE', 'VALIDEE', '2024-01-15', '2024-02-01', '2024-12-31', 4000000.00, 4800000.00, 'Convention cadre pour les travaux d''infrastructure', true),
    ('CONV-2024-002', 'CONV/2024/002', 'Convention Spécifique Digital', 'SPECIFIQUE', 'EN_COURS', '2024-03-20', '2024-04-01', '2025-03-31', 2500000.00, 3000000.00, 'Convention pour la transformation digitale', true);

-- Lier conventions et projets
INSERT INTO convention_projets (convention_id, projet_id)
VALUES
    ((SELECT id FROM conventions WHERE code = 'CONV-2024-001'), (SELECT id FROM projets WHERE code = 'PROJ-2024-001')),
    ((SELECT id FROM conventions WHERE code = 'CONV-2024-002'), (SELECT id FROM projets WHERE code = 'PROJ-2024-002'));

-- =====================================================
-- 7. MARCHÉS DE DÉMO
-- =====================================================

INSERT INTO marches (
    numero_marche,
    convention_id,
    fournisseur_id,
    objet,
    num_ao,
    date_marche,
    date_debut,
    date_fin_prevue,
    delai_execution_mois,
    montant_ht,
    taux_tva,
    montant_tva,
    montant_ttc,
    retenue_garantie,
    statut,
    actif
)
VALUES (
    'M-2024-001',
    (SELECT id FROM conventions WHERE code = 'CONV-2024-001'),
    (SELECT id FROM fournisseurs WHERE code = 'F001'),
    'Travaux de construction et aménagement',
    'AO-2024-001',
    '2024-02-15',
    '2024-03-01',
    '2024-11-30',
    9,
    1500000.00,
    20.00,
    300000.00,
    1800000.00,
    7.00,
    'EN_COURS',
    true
);

-- =====================================================
-- FIN DE LA MIGRATION V25
-- =====================================================
