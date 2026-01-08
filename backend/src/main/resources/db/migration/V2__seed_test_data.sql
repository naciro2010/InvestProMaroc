-- V2__seed_test_data.sql
-- Test data for InvestPro Maroc

-- Users (with bcrypt hashed password: admin123)
INSERT INTO users (username, email, password, full_name, account_non_expired, account_non_locked, credentials_non_expired, enabled, actif)
VALUES
    ('admin', 'admin@investpro.ma', '$2a$10$slYQmyNdGzin7olVN3p5Be7DPwSKMfrLxQvWsadTO5P0p8sS9V5mS', 'Admin User', TRUE, TRUE, TRUE, TRUE, TRUE),
    ('manager', 'manager@investpro.ma', '$2a$10$slYQmyNdGzin7olVN3p5Be7DPwSKMfrLxQvWsadTO5P0p8sS9V5mS', 'Manager User', TRUE, TRUE, TRUE, TRUE, TRUE),
    ('user', 'user@investpro.ma', '$2a$10$slYQmyNdGzin7olVN3p5Be7DPwSKMfrLxQvWsadTO5P0p8sS9V5mS', 'Regular User', TRUE, TRUE, TRUE, TRUE, TRUE)
ON CONFLICT (username) DO NOTHING;

-- User Roles
INSERT INTO user_roles (user_id, role)
VALUES
    ((SELECT id FROM users WHERE username = 'admin'), 'ADMIN'),
    ((SELECT id FROM users WHERE username = 'manager'), 'MANAGER'),
    ((SELECT id FROM users WHERE username = 'user'), 'USER')
ON CONFLICT DO NOTHING;

-- Fournisseurs
INSERT INTO fournisseurs (code, raison_sociale, actif)
VALUES
    ('FOURN-001', 'Constructis Maroc SARL', TRUE),
    ('FOURN-002', 'Ingénierie Solutions EIRL', TRUE)
ON CONFLICT (code) DO NOTHING;

-- Partenaires
INSERT INTO partenaires (code, raison_sociale, type_partenaire, actif)
VALUES
    ('PART-001', 'Partenaire Principal SARL', 'PRINCIPAL', TRUE),
    ('PART-002', 'Partenaire Secondaire LLC', 'SECONDAIRE', TRUE)
ON CONFLICT (code) DO NOTHING;

-- Conventions (using valid enum values: CADRE, NON_CADRE, SPECIFIQUE, AVENANT)
INSERT INTO conventions (code, numero, libelle, date_convention, type_convention, statut, date_debut, budget, taux_commission, base_calcul, taux_tva, actif)
VALUES
    ('CONV-2024-001', 'CONV/2024/001', 'Convention de partenariat 2024', '2024-01-15', 'CADRE', 'VALIDEE', '2024-01-15', 10000000.00, 2.50, 'DECAISSEMENTS_TTC', 20.00, TRUE),
    ('CONV-2024-002', 'CONV/2024/002', 'Convention pour travaux et services', '2024-03-01', 'SPECIFIQUE', 'VALIDEE', '2024-03-01', 5000000.00, 3.00, 'DECAISSEMENTS_TTC', 20.00, TRUE)
ON CONFLICT (code) DO NOTHING;

-- Projets
INSERT INTO projets (code, nom, description, convention_id, budget_total, statut, date_debut, date_fin_prevue, duree_mois, pourcentage_avancement, actif)
VALUES
    ('PRJ-2024-001', 'Projet Pilote Infrastructure', 'Modernisation des infrastructures de base',
     (SELECT id FROM conventions WHERE code = 'CONV-2024-001'), 5000000.00, 'EN_COURS', '2024-01-15', '2025-01-15', 12, 45.00, TRUE),
    ('PRJ-2024-002', 'Projet Formation Professionnelle', 'Programme de formation et renforcement des capacités',
     (SELECT id FROM conventions WHERE code = 'CONV-2024-001'), 2000000.00, 'EN_PREPARATION', '2024-06-01', '2025-06-01', 12, 0.00, TRUE),
    ('PRJ-2024-003', 'Projet Développement Rural', 'Amélioration des conditions de vie en zones rurales',
     (SELECT id FROM conventions WHERE code = 'CONV-2024-002'), 3000000.00, 'EN_COURS', '2024-03-01', '2026-03-01', 24, 60.00, TRUE)
ON CONFLICT (code) DO NOTHING;
