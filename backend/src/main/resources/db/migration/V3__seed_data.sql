-- Test users (passwords: admin123, manager123, user123)
INSERT INTO users (username, password, email, full_name) VALUES
('admin', '$2a$10$xXQGZ9Q7L7yJ7MqKvZ4Yl.9Z1QxjZ4FjJZKjZjZ4Yl.9Z1QxjZ4FjJZK', 'admin@investpro.ma', 'Admin User'),
('manager', '$2a$10$xXQGZ9Q7L7yJ7MqKvZ4Yl.9Z1QxjZ4FjJZKjZjZ4Yl.9Z1QxjZ4FjJZK', 'manager@investpro.ma', 'Manager User'),
('user', '$2a$10$xXQGZ9Q7L7yJ7MqKvZ4Yl.9Z1QxjZ4FjJZKjZjZ4Yl.9Z1QxjZ4FjJZK', 'user@investpro.ma', 'Regular User');

INSERT INTO user_roles (user_id, role) VALUES
(1, 'ADMIN'),
(2, 'MANAGER'),
(3, 'USER');

-- Dimensions analytiques
INSERT INTO dimensions_analytiques (code, libelle, ordre, obligatoire) VALUES
('BUDGET', 'Ligne budgétaire', 1, true),
('PROJET', 'Projet', 2, true),
('SECTEUR', 'Secteur d''activité', 3, false),
('DEPT', 'Département', 4, false);

INSERT INTO valeurs_dimensions (dimension_id, code, libelle) VALUES
(1, 'B001', 'Budget Principal'),
(1, 'B002', 'Budget Secondaire'),
(2, 'P001', 'Projet Infrastructure'),
(2, 'P002', 'Projet Équipement'),
(3, 'S001', 'Secteur Public'),
(3, 'S002', 'Secteur Privé');

-- Fournisseurs de test
INSERT INTO fournisseurs (code, nom, ice, if_code) VALUES
('F001', 'Entreprise BTP Maroc', '001234567890001', 'IF123456'),
('F002', 'Société Équipement SA', '001234567890002', 'IF123457'),
('F003', 'Construction Moderne', '001234567890003', 'IF123458');

-- Projets de test
INSERT INTO projets (code, designation, budget_total, status) VALUES
('PROJ-2024-001', 'Infrastructure Routière', 5000000.00, 'EN_COURS'),
('PROJ-2024-002', 'Équipement Hospitalier', 3000000.00, 'PLANIFIE');

-- Conventions de test
INSERT INTO conventions (code, numero, libelle, objet, type_convention, date_convention, date_debut, budget, taux_commission, statut) VALUES
('CONV-2024-001', 'CONV/INV/2024/001', 'Convention Cadre Infrastructure', 'Gestion des projets d''infrastructure', 'CADRE', '2024-01-15', '2024-02-01', 10000000.00, 2.5, 'VALIDEE'),
('CONV-2024-002', 'CONV/INV/2024/002', 'Convention Équipement', 'Acquisition d''équipements', 'SPECIFIQUE', '2024-03-01', '2024-03-15', 5000000.00, 3.0, 'VALIDEE');

-- Marchés de test
INSERT INTO marches (convention_id, projet_id, fournisseur_id, code, objet, type_marche, montant_ht, montant_tva, montant_ttc, date_marche, statut) VALUES
(1, 1, 1, 'M-2024-001', 'Travaux de voirie', 'TRAVAUX', 800000.00, 160000.00, 960000.00, '2024-02-15', 'EN_COURS'),
(2, 2, 2, 'M-2024-002', 'Fourniture équipements médicaux', 'FOURNITURES', 500000.00, 100000.00, 600000.00, '2024-04-01', 'EN_COURS');

-- Lignes de marché
INSERT INTO marche_lignes (marche_id, designation, quantite, unite, prix_unitaire, montant_ligne, dimensions_valeurs) VALUES
(1, 'Revêtement routier', 1000, 'M2', 800.00, 800000.00, '{"BUDGET": "B001", "PROJET": "P001"}'),
(2, 'Scanner médical', 1, 'UNITE', 500000.00, 500000.00, '{"BUDGET": "B002", "PROJET": "P002"}');

-- Décomptes
INSERT INTO decomptes (marche_id, numero, type_decompte, date_decompte, montant_travaux, montant_precedent, montant_cumule, taux_avancement, net_a_payer, statut) VALUES
(1, 'DEC-001', 'PROVISOIRE', '2024-05-30', 400000.00, 0.00, 400000.00, 50.00, 360000.00, 'VALIDE');

-- Retenues sur décompte
INSERT INTO decompte_retenues (decompte_id, type_retenue, taux, montant) VALUES
(1, 'GARANTIE', 10.00, 40000.00);
