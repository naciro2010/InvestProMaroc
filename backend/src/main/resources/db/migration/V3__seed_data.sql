-- =============================================================================
-- Seed Data for InvestPro Maroc
-- =============================================================================
-- Test users with BCrypt hashed passwords

-- Users with correct individual BCrypt hashes (cost 10)
-- Password: admin123
-- Password: manager123
-- Password: user123
-- Each password has its own unique hash generated via Spring Security BCryptPasswordEncoder
INSERT INTO users (id, username, password, email, full_name) VALUES
(1, 'admin', '$2a$10$G9mprAUozHWOs.VLmMh.3e.k90SbdGUcbVOxxR8rQ5KrcTPPtGr7C', 'admin@investpro.ma', 'Administrateur Système'),
(2, 'manager', '$2a$10$xsgYxT6trAjwUqt5x32.zuW4zzclaR0wl6EistZSnKKIn2y8LiroG', 'manager@investpro.ma', 'Manager Principal'),
(3, 'user', '$2a$10$djjqMLHRZzaFgANySgMkquJII8jbsVT6NG3bHC8pXR.4gYuzNJ0Zy', 'user@investpro.ma', 'Utilisateur Standard');

-- Reset sequence to continue after explicit IDs
SELECT setval('users_id_seq', 3);

INSERT INTO user_roles (user_id, role) VALUES
(1, 'ADMIN'),
(2, 'MANAGER'),
(3, 'USER');

-- Dimensions analytiques
INSERT INTO dimensions_analytiques (id, code, nom, ordre, obligatoire) VALUES
(1, 'BUDGET', 'Ligne budgetaire', 1, true),
(2, 'PROJET', 'Projet', 2, true),
(3, 'SECTEUR', 'Secteur activite', 3, false),
(4, 'REGION', 'Region administrative', 4, false);

SELECT setval('dimensions_analytiques_id_seq', 4);

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
INSERT INTO fournisseurs (id, code, raison_sociale, ice, identifiant_fiscal, adresse, ville, telephone, email) VALUES
(1, 'F001', 'Entreprise BTP Maroc SARL', '001234567890001', 'IF123456', '123 Boulevard Mohammed V', 'Casablanca', '+212522123456', 'contact@btpmaroc.ma'),
(2, 'F002', 'Societe Equipement SA', '001234567890002', 'IF789012', '45 Avenue Hassan II', 'Rabat', '+212537654321', 'info@equipement-sa.ma'),
(3, 'F003', 'Construction Nord SARL', '001234567890003', 'IF345678', '78 Rue de Tanger', 'Tetouan', '+212539876543', 'commercial@construction-nord.ma'),
(4, 'F004', 'Atlas Travaux Publics', '001234567890004', 'IF901234', '12 Place de la Victoire', 'Agadir', '+212528345678', 'atlas@travaux.ma');

SELECT setval('fournisseurs_id_seq', 4);

-- Projets
INSERT INTO projets (id, code, nom, budget_total, statut, date_debut) VALUES
(1, 'PROJ-001', 'Infrastructure Routiere Casablanca', 5000000.00, 'EN_PREPARATION', '2024-01-01'),
(2, 'PROJ-002', 'Equipement Public Rabat', 3000000.00, 'EN_COURS', '2024-02-01'),
(3, 'PROJ-003', 'Amenagement Urbain Tanger', 4500000.00, 'EN_PREPARATION', '2024-03-01');

SELECT setval('projets_id_seq', 3);

-- Conventions
INSERT INTO conventions (id, code, numero, libelle, objet, type_convention, date_convention, budget, taux_commission, statut, date_debut, date_fin, created_by_id, valide_par_id, date_validation, version, is_locked) VALUES
(1, 'CONV-001', 'CONV/2024/001', 'Convention Cadre Infrastructure', 'Gestion projets infrastructure routiere et urbaine', 'CADRE', '2024-01-15', 10000000.00, 2.5, 'VALIDEE', '2024-01-15', '2026-01-15', 1, 2, '2024-01-16', 'V0', true),
(2, 'CONV-002', 'CONV/2024/002', 'Convention Equipement Public', 'Acquisition equipements collectifs', 'CADRE', '2024-02-01', 5000000.00, 3.0, 'VALIDEE', '2024-02-01', '2026-02-01', 1, 2, '2024-02-02', 'V0', true);

-- Sous-Conventions (SPECIFIQUE type, inheriting from parent CADRE conventions)
INSERT INTO conventions (
    code, numero, libelle, objet, type_convention,
    date_convention, budget, taux_commission, base_calcul, taux_tva,
    statut, date_debut, date_fin,
    parent_convention_id, herite_parametres,
    created_by_id, created_at
) VALUES
-- Sous-conventions pour CONV-001 (Infrastructure)
(
    'SC-001', 'SC/2024/001', 'Sous-Convention Voirie Urbaine Casablanca',
    'Travaux de voirie et amenagement urbain dans la region de Casablanca',
    'SPECIFIQUE',
    '2024-02-01', 3500000.00, 2.5, 'DECAISSEMENTS_TTC', 20.00,
    'VALIDEE', '2024-02-15', '2025-02-15',
    1, true,  -- parent_convention_id = 1 (CONV-001), herite_parametres = true
    2, CURRENT_TIMESTAMP
),
(
    'SC-002', 'SC/2024/002', 'Sous-Convention Routes Nationales',
    'Rehabilitation et entretien des routes nationales',
    'SPECIFIQUE',
    '2024-03-01', 4000000.00, 2.5, 'DECAISSEMENTS_TTC', 20.00,
    'EN_EXECUTION', '2024-03-15', '2025-09-15',
    1, true,  -- parent_convention_id = 1 (CONV-001)
    2, CURRENT_TIMESTAMP
),
(
    'SC-003', 'SC/2024/003', 'Sous-Convention Ponts et Ouvrages',
    'Construction et maintenance des ponts et ouvrages d''art',
    'SPECIFIQUE',
    '2024-04-01', 2500000.00, 3.0, 'DECAISSEMENTS_TTC', 20.00,
    'BROUILLON', '2024-05-01', '2025-11-01',
    1, false,  -- parent_convention_id = 1, herite_parametres = false (custom rate: 3.0%)
    2, CURRENT_TIMESTAMP
),
-- Sous-conventions pour CONV-002 (Equipement Public)
(
    'SC-004', 'SC/2024/004', 'Sous-Convention Equipement Scolaire',
    'Fourniture et installation equipements scolaires',
    'SPECIFIQUE',
    '2024-03-10', 2000000.00, 3.0, 'DECAISSEMENTS_TTC', 20.00,
    'VALIDEE', '2024-04-01', '2025-04-01',
    2, true,  -- parent_convention_id = 2 (CONV-002)
    2, CURRENT_TIMESTAMP
),
(
    'SC-005', 'SC/2024/005', 'Sous-Convention Equipement Sanitaire',
    'Equipement des centres de sante et hopitaux',
    'SPECIFIQUE',
    '2024-04-15', 3000000.00, 3.0, 'DECAISSEMENTS_TTC', 20.00,
    'EN_EXECUTION', '2024-05-01', '2025-10-31',
    2, true,  -- parent_convention_id = 2 (CONV-002)
    2, CURRENT_TIMESTAMP
);

-- 2 parent conventions + 5 sous-conventions = 7 total
SELECT setval('conventions_id_seq', 7);

-- Marchés avec géolocalisation
INSERT INTO marches (
    id, fournisseur_id, convention_id, numero_marche, objet,
    montant_ht, taux_tva, montant_tva, montant_ttc,
    date_marche, statut, date_debut, date_fin_prevue, delai_execution_mois,
    adresse, latitude, longitude, zone_geographique
) VALUES
(
    1, 1, 1, 'M-2024-001', 'Travaux de voirie Boulevard Zerktouni',
    800000.00, 20.00, 160000.00, 960000.00,
    '2024-02-15', 'EN_COURS', '2024-02-20', '2024-08-20', 6,
    'Boulevard Zerktouni, Casablanca', 33.5731, -7.6298, 'Casablanca-Settat'
),
(
    2, 2, 1, 'M-2024-002', 'Amenagement Avenue Mohammed V, Rabat',
    1200000.00, 20.00, 240000.00, 1440000.00,
    '2024-03-01', 'EN_COURS', '2024-03-10', '2024-12-10', 9,
    'Avenue Mohammed V, Rabat', 34.0209, -6.8416, 'Rabat-Sale-Kenitra'
),
(
    3, 3, 2, 'M-2024-003', 'Construction Ecole Primaire Tanger',
    2500000.00, 20.00, 500000.00, 3000000.00,
    '2024-03-15', 'VALIDE', '2024-04-01', '2025-03-31', 12,
    'Zone Industrielle, Tanger', 35.7595, -5.8340, 'Tanger-Tetouan-Al Hoceima'
),
(
    4, 4, 1, 'M-2024-004', 'Rehabilitation Route Nationale N1, Agadir',
    3500000.00, 20.00, 700000.00, 4200000.00,
    '2024-04-01', 'EN_COURS', '2024-04-15', '2025-04-15', 12,
    'Route Nationale N1, Agadir', 30.4278, -9.5981, 'Souss-Massa'
),
(
    5, 1, 1, 'M-2024-005', 'Travaux assainissement Meknes',
    1800000.00, 20.00, 360000.00, 2160000.00,
    '2024-04-10', 'EN_ATTENTE', NULL, NULL, 10,
    'Quartier Hamria, Meknes', 33.8730, -5.5540, 'Fes-Meknes'
);

SELECT setval('marches_id_seq', 5);

-- Lignes de marché avec imputation analytique
INSERT INTO marche_lignes (marche_id, numero_ligne, designation, quantite, unite, prix_unitaire_ht, montant_ht, taux_tva, montant_tva, montant_ttc, imputation_analytique) VALUES
(1, 1, 'Revetement routier en enrobe', 1000.00, 'M2', 650.00, 650000.00, 20.00, 130000.00, 780000.00, '{"BUDGET":"B001","PROJET":"P001","SECTEUR":"S001","REGION":"R001"}'),
(1, 2, 'Bordures de trottoir en beton', 500.00, 'ML', 300.00, 150000.00, 20.00, 30000.00, 180000.00, '{"BUDGET":"B001","PROJET":"P001","SECTEUR":"S001","REGION":"R001"}'),
(2, 1, 'Terrassement et nivellement', 2000.00, 'M3', 400.00, 800000.00, 20.00, 160000.00, 960000.00, '{"BUDGET":"B001","PROJET":"P001","SECTEUR":"S001","REGION":"R002"}'),
(2, 2, 'Revetement asphalte', 1500.00, 'M2', 266.67, 400000.00, 20.00, 80000.00, 480000.00, '{"BUDGET":"B001","PROJET":"P001","SECTEUR":"S001","REGION":"R002"}'),
(3, 1, 'Construction structure batiment', 1.00, 'ENS', 1800000.00, 1800000.00, 20.00, 360000.00, 2160000.00, '{"BUDGET":"B002","PROJET":"P002","SECTEUR":"S001","REGION":"R003"}'),
(3, 2, 'Equipements scolaires', 1.00, 'LOT', 700000.00, 700000.00, 20.00, 140000.00, 840000.00, '{"BUDGET":"B002","PROJET":"P002","SECTEUR":"S001","REGION":"R003"}');

-- Décomptes
INSERT INTO decomptes (id, marche_id, numero_decompte, date_decompte, periode_debut, periode_fin, montant_brut_ht, montant_tva, montant_ttc, total_retenues, net_a_payer, statut) VALUES
(1, 1, 'DEC-001-2024', '2024-05-30', '2024-02-20', '2024-05-30', 400000.00, 80000.00, 480000.00, 48000.00, 432000.00, 'VALIDE'),
(2, 2, 'DEC-002-2024', '2024-06-15', '2024-03-10', '2024-06-15', 600000.00, 120000.00, 720000.00, 72000.00, 648000.00, 'BROUILLON');

SELECT setval('decomptes_id_seq', 2);

-- Retenues sur décomptes
INSERT INTO decompte_retenues (decompte_id, type_retenue, taux_pourcent, montant, libelle) VALUES
(1, 'GARANTIE', 10.00, 48000.00, 'Retenue de garantie 10%'),
(2, 'GARANTIE', 10.00, 72000.00, 'Retenue de garantie 10%');

-- ============================================================================
-- Paramétrage des conventions
-- ============================================================================
INSERT INTO convention_configurations (id, code_mask_pattern, code_mask_placeholder, numero_mask_pattern, numero_mask_placeholder, actif)
VALUES (1, '^[A-Za-z0-9-]+$', 'CON-09-01', '^[A-Za-z0-9/-]+$', 'N°2026/001', TRUE);

INSERT INTO convention_type_configurations (id, configuration_id, type_code, libelle, enabled, ordre_affichage, actif) VALUES
(1, 1, 'CADRE', 'Convention cadre', TRUE, 1, TRUE),
(2, 1, 'NON_CADRE', 'Convention non-cadre', TRUE, 2, TRUE),
(3, 1, 'SPECIFIQUE', 'Convention spécifique', FALSE, 3, TRUE),
(4, 1, 'AVENANT', 'Convention avenant', FALSE, 4, TRUE);

SELECT setval('convention_configurations_id_seq', 1, true);
SELECT setval('convention_type_configurations_id_seq', 4, true);

-- ============================================================================
-- Types de dépenses (référentiel) - JANUARY 2026
-- ============================================================================
INSERT INTO categories_depenses (id, code, libelle, description, categorie, ordre_affichage, actif) VALUES
(1, 'TRAV', 'Travaux', 'Travaux de construction et réhabilitation', 'Investissement', 1, TRUE),
(2, 'FOUR', 'Fournitures', 'Fournitures de bureau et matériel', 'Fonctionnement', 2, TRUE),
(3, 'SERV', 'Services', 'Prestations de services', 'Fonctionnement', 3, TRUE),
(4, 'ETUD', 'Études', 'Études et diagnostics', 'Investissement', 4, TRUE),
(5, 'FORM', 'Formation', 'Formation et renforcement des capacités', 'Fonctionnement', 5, TRUE),
(6, 'EQUIP', 'Équipements', 'Acquisition d''équipements', 'Investissement', 6, TRUE),
(7, 'MAINT', 'Maintenance', 'Maintenance et entretien', 'Fonctionnement', 7, TRUE),
(8, 'CONS', 'Conseil', 'Missions de conseil et assistance', 'Fonctionnement', 8, TRUE),
(9, 'INFO', 'Informatique', 'Systèmes d''information et logiciels', 'Investissement', 9, TRUE),
(10, 'COMM', 'Communication', 'Actions de communication', 'Fonctionnement', 10, TRUE);

-- Reset sequence
SELECT setval('categories_depenses_id_seq', 10, true);
