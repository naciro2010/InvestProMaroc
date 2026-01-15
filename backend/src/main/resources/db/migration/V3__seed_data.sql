-- =============================================================================
-- Seed Data for InvestPro Maroc
-- =============================================================================
-- Test users with BCrypt hashed passwords

-- Users (passwords: admin123, manager123, user123)
INSERT INTO users (username, password, email, full_name) VALUES
('admin', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'admin@investpro.ma', 'Administrateur Système'),
('manager', '$2a$10$V2OjFqX/HqPKjVlT3K1Uh.TkVN0V7Ln2mJvNNjRGCMZWgPKW8t2Zu', 'manager@investpro.ma', 'Manager Principal'),
('user', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user@investpro.ma', 'Utilisateur Standard');

INSERT INTO user_roles (user_id, role) VALUES
(1, 'ADMIN'),
(2, 'MANAGER'),
(3, 'USER');

-- Dimensions analytiques
INSERT INTO dimensions_analytiques (code, nom, ordre, obligatoire) VALUES
('BUDGET', 'Ligne budgetaire', 1, true),
('PROJET', 'Projet', 2, true),
('SECTEUR', 'Secteur activite', 3, false),
('REGION', 'Region administrative', 4, false);

INSERT INTO valeurs_dimensions (dimension_id, code, libelle) VALUES
(1, 'B001', 'Budget Infrastructure'),
(1, 'B002', 'Budget Equipement'),
(2, 'P001', 'Projet Infrastructure Routiere'),
(2, 'P002', 'Projet Equipement Public'),
(3, 'S001', 'Secteur Public'),
(3, 'S002', 'Secteur Prive'),
(4, 'R001', 'Casablanca-Settat'),
(4, 'R002', 'Rabat-Sale-Kenitra'),
(4, 'R003', 'Tanger-Tetouan-Al Hoceima');

-- Fournisseurs avec coordonnées complètes
INSERT INTO fournisseurs (code, raison_sociale, ice, identifiant_fiscal, adresse, ville, telephone, email) VALUES
('F001', 'Entreprise BTP Maroc SARL', '001234567890001', 'IF123456', '123 Boulevard Mohammed V', 'Casablanca', '+212522123456', 'contact@btpmaroc.ma'),
('F002', 'Societe Equipement SA', '001234567890002', 'IF789012', '45 Avenue Hassan II', 'Rabat', '+212537654321', 'info@equipement-sa.ma'),
('F003', 'Construction Nord SARL', '001234567890003', 'IF345678', '78 Rue de Tanger', 'Tetouan', '+212539876543', 'commercial@construction-nord.ma'),
('F004', 'Atlas Travaux Publics', '001234567890004', 'IF901234', '12 Place de la Victoire', 'Agadir', '+212528345678', 'atlas@travaux.ma');

-- Projets
INSERT INTO projets (code, nom, budget_total, statut, date_debut) VALUES
('PROJ-001', 'Infrastructure Routiere Casablanca', 5000000.00, 'EN_PREPARATION', '2024-01-01'),
('PROJ-002', 'Equipement Public Rabat', 3000000.00, 'EN_COURS', '2024-02-01'),
('PROJ-003', 'Amenagement Urbain Tanger', 4500000.00, 'EN_PREPARATION', '2024-03-01');

-- Conventions
INSERT INTO conventions (code, numero, libelle, objet, type_convention, date_convention, budget, taux_commission, statut) VALUES
('CONV-001', 'CONV/2024/001', 'Convention Cadre Infrastructure', 'Gestion projets infrastructure routiere et urbaine', 'CADRE', '2024-01-15', 10000000.00, 2.5, 'VALIDEE'),
('CONV-002', 'CONV/2024/002', 'Convention Equipement Public', 'Acquisition equipements collectifs', 'CADRE', '2024-02-01', 5000000.00, 3.0, 'VALIDEE');

-- Marchés avec géolocalisation
INSERT INTO marches (
    fournisseur_id, convention_id, numero_marche, objet,
    montant_ht, taux_tva, montant_tva, montant_ttc,
    date_marche, statut, date_debut, date_fin_prevue, delai_execution_mois,
    adresse, latitude, longitude, zone_geographique
) VALUES
(
    1, 1, 'M-2024-001', 'Travaux de voirie Boulevard Zerktouni',
    800000.00, 20.00, 160000.00, 960000.00,
    '2024-02-15', 'EN_COURS', '2024-02-20', '2024-08-20', 6,
    'Boulevard Zerktouni, Casablanca', 33.5731, -7.6298, 'Casablanca-Settat'
),
(
    2, 1, 'M-2024-002', 'Amenagement Avenue Mohammed V, Rabat',
    1200000.00, 20.00, 240000.00, 1440000.00,
    '2024-03-01', 'EN_COURS', '2024-03-10', '2024-12-10', 9,
    'Avenue Mohammed V, Rabat', 34.0209, -6.8416, 'Rabat-Sale-Kenitra'
),
(
    3, 2, 'M-2024-003', 'Construction Ecole Primaire Tanger',
    2500000.00, 20.00, 500000.00, 3000000.00,
    '2024-03-15', 'VALIDE', '2024-04-01', '2025-03-31', 12,
    'Zone Industrielle, Tanger', 35.7595, -5.8340, 'Tanger-Tetouan-Al Hoceima'
),
(
    4, 1, 'M-2024-004', 'Rehabilitation Route Nationale N1, Agadir',
    3500000.00, 20.00, 700000.00, 4200000.00,
    '2024-04-01', 'EN_COURS', '2024-04-15', '2025-04-15', 12,
    'Route Nationale N1, Agadir', 30.4278, -9.5981, 'Souss-Massa'
),
(
    1, 1, 'M-2024-005', 'Travaux assainissement Meknes',
    1800000.00, 20.00, 360000.00, 2160000.00,
    '2024-04-10', 'EN_ATTENTE', NULL, NULL, 10,
    'Quartier Hamria, Meknes', 33.8730, -5.5540, 'Fes-Meknes'
);

-- Lignes de marché avec imputation analytique
INSERT INTO marche_lignes (marche_id, numero_ligne, designation, quantite, unite, prix_unitaire_ht, montant_ht, taux_tva, montant_tva, montant_ttc, imputation_analytique) VALUES
(1, 1, 'Revetement routier en enrobe', 1000.00, 'M2', 650.00, 650000.00, 20.00, 130000.00, 780000.00, '{"BUDGET":"B001","PROJET":"P001","SECTEUR":"S001","REGION":"R001"}'),
(1, 2, 'Bordures de trottoir en beton', 500.00, 'ML', 300.00, 150000.00, 20.00, 30000.00, 180000.00, '{"BUDGET":"B001","PROJET":"P001","SECTEUR":"S001","REGION":"R001"}'),
(2, 1, 'Terrassement et nivellement', 2000.00, 'M3', 400.00, 800000.00, 20.00, 160000.00, 960000.00, '{"BUDGET":"B001","PROJET":"P001","SECTEUR":"S001","REGION":"R002"}'),
(2, 2, 'Revetement asphalte', 1500.00, 'M2', 266.67, 400000.00, 20.00, 80000.00, 480000.00, '{"BUDGET":"B001","PROJET":"P001","SECTEUR":"S001","REGION":"R002"}'),
(3, 1, 'Construction structure batiment', 1.00, 'ENS', 1800000.00, 1800000.00, 20.00, 360000.00, 2160000.00, '{"BUDGET":"B002","PROJET":"P002","SECTEUR":"S001","REGION":"R003"}'),
(3, 2, 'Equipements scolaires', 1.00, 'LOT', 700000.00, 700000.00, 20.00, 140000.00, 840000.00, '{"BUDGET":"B002","PROJET":"P002","SECTEUR":"S001","REGION":"R003"}');

-- Décomptes
INSERT INTO decomptes (marche_id, numero_decompte, date_decompte, periode_debut, periode_fin, montant_brut_ht, montant_tva, montant_ttc, total_retenues, net_a_payer, statut) VALUES
(1, 'DEC-001-2024', '2024-05-30', '2024-02-20', '2024-05-30', 400000.00, 80000.00, 480000.00, 48000.00, 432000.00, 'VALIDE'),
(2, 'DEC-002-2024', '2024-06-15', '2024-03-10', '2024-06-15', 600000.00, 120000.00, 720000.00, 72000.00, 648000.00, 'BROUILLON');

-- Retenues sur décomptes
INSERT INTO decompte_retenues (decompte_id, type_retenue, taux_pourcent, montant, libelle) VALUES
(1, 'GARANTIE', 10.00, 48000.00, 'Retenue de garantie 10%'),
(2, 'GARANTIE', 10.00, 72000.00, 'Retenue de garantie 10%');
