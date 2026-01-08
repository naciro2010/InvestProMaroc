-- V2__seed_test_data.sql
-- Test data for InvestPro Maroc

-- Users
INSERT INTO users (username, email, password_hash, full_name, role, actif) VALUES
    ('admin', 'admin@investpro.ma', '$2a$10$slYQmyNdGzin7olVN3p5Be7DPwSKMfrLxQvWsadTO5P0p8sS9V5mS', 'Admin User', 'ADMIN', true),
    ('manager', 'manager@investpro.ma', '$2a$10$slYQmyNdGzin7olVN3p5Be7DPwSKMfrLxQvWsadTO5P0p8sS9V5mS', 'Manager User', 'MANAGER', true),
    ('user', 'user@investpro.ma', '$2a$10$slYQmyNdGzin7olVN3p5Be7DPwSKMfrLxQvWsadTO5P0p8sS9V5mS', 'Regular User', 'USER', true)
ON CONFLICT (username) DO NOTHING;

-- Fournisseurs
INSERT INTO fournisseurs (code, designation, ice, actif) VALUES
    ('FOURN-001', 'Constructis Maroc SARL', '001234567890123', true),
    ('FOURN-002', 'Ingénierie Solutions', '002345678901234', true)
ON CONFLICT (code) DO NOTHING;

-- Partenaires
INSERT INTO partenaires (code, designation, type_partenaire, actif) VALUES
    ('PART-001', 'Partenaire Principal', 'PRINCIPAL', true),
    ('PART-002', 'Partenaire Secondaire', 'SECONDAIRE', true)
ON CONFLICT (code) DO NOTHING;

-- Conventions
INSERT INTO conventions (code, numero, designation, type_convention, statut, actif) VALUES
    ('CONV-2024-001', 'CONV/2024/001', 'Convention Principale 2024', 'FOURNITURE', 'VALIDEE', true),
    ('CONV-2024-002', 'CONV/2024/002', 'Convention Travaux 2024', 'TRAVAUX', 'VALIDEE', true)
ON CONFLICT (code) DO NOTHING;

-- Dimensions analytiques
INSERT INTO dimensions_analytiques (code, designation, ordre, obligatoire, actif) VALUES
    ('BUDGET', 'Budget', 1, true, true),
    ('SECTEUR', 'Secteur', 2, false, true),
    ('PHASE', 'Phase', 3, false, true)
ON CONFLICT (code) DO NOTHING;

-- Valeurs des dimensions
INSERT INTO valeurs_dimensions (dimension_analytique_id, code, designation, ordre, actif)
SELECT id, 'B001', 'Budget 2024', 1, true FROM dimensions_analytiques WHERE code = 'BUDGET'
ON CONFLICT DO NOTHING;

-- Projets
INSERT INTO projets (code, nom, description, convention_id, budget_total, statut, actif)
SELECT 'PRJ-2024-001', 'Projet Pilote', 'Projet pilote infrastructure', conventions.id, 5000000.00, 'EN_COURS', true
FROM conventions WHERE code = 'CONV-2024-001'
ON CONFLICT (code) DO NOTHING;
