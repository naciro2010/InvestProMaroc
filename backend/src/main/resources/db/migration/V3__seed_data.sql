-- Test users (passwords bcrypt for: admin123, manager123, user123)
INSERT INTO users (username, password, email, full_name) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z2L1MJLTzCIBkjy1kzp1HaT6', 'admin@investpro.ma', 'Admin User'),
('manager', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z2L1MJLTzCIBkjy1kzp1HaT6', 'manager@investpro.ma', 'Manager User'),
('user', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z2L1MJLTzCIBkjy1kzp1HaT6', 'user@investpro.ma', 'Regular User');

INSERT INTO user_roles (user_id, role) VALUES
(1, 'ADMIN'),
(2, 'MANAGER'),
(3, 'USER');

-- Dimensions analytiques
INSERT INTO dimensions_analytiques (code, nom, ordre, obligatoire) VALUES
('BUDGET', 'Ligne budgetaire', 1, true),
('PROJET', 'Projet', 2, true),
('SECTEUR', 'Secteur activite', 3, false);

INSERT INTO valeurs_dimensions (dimension_id, code, libelle) VALUES
(1, 'B001', 'Budget Principal'),
(2, 'P001', 'Projet Infrastructure'),
(3, 'S001', 'Secteur Public');

-- Fournisseurs
INSERT INTO fournisseurs (code, raison_sociale) VALUES
('F001', 'Entreprise BTP Maroc'),
('F002', 'Societe Equipement SA');

-- Projets
INSERT INTO projets (code, nom, budget_total, statut) VALUES
('PROJ-001', 'Infrastructure Routiere', 5000000.00, 'EN_PREPARATION');

-- Conventions
INSERT INTO conventions (code, numero, libelle, objet, type_convention, date_convention, budget, taux_commission, statut) VALUES
('CONV-001', 'CONV/2024/001', 'Convention Cadre Infrastructure', 'Gestion projets infrastructure', 'CADRE', '2024-01-15', 10000000.00, 2.5, 'BROUILLON');

-- Marchés
INSERT INTO marches (fournisseur_id, convention_id, numero_marche, objet, montant_ht, montant_tva, montant_ttc, date_marche, statut) VALUES
(1, 1, 'M-001', 'Travaux de voirie', 800000.00, 160000.00, 960000.00, '2024-02-15', 'EN_COURS');

-- Lignes de marché
INSERT INTO marche_lignes (marche_id, numero_ligne, designation, quantite, unite, prix_unitaire_ht, montant_ht) VALUES
(1, 1, 'Revetement routier', 1000, 'M2', 800.00, 800000.00);

-- Décomptes
INSERT INTO decomptes (marche_id, numero_decompte, date_decompte, periode_debut, periode_fin, montant_brut_ht, montant_ttc, net_a_payer, statut) VALUES
(1, 'DEC-001', '2024-05-30', '2024-02-15', '2024-05-30', 400000.00, 480000.00, 360000.00, 'BROUILLON');
