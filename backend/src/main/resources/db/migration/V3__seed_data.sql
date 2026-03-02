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

-- Conventions CADRE (principales)
INSERT INTO conventions (id, code, numero, libelle, objet, type_convention, date_convention, budget, taux_commission, statut, date_debut, date_fin, created_by_id, valide_par_id, date_validation, version, is_locked) VALUES
(1, 'CONV-001', 'CONV/2024/001', 'Convention Cadre Infrastructure', 'Gestion projets infrastructure routiere et urbaine', 'CADRE', '2024-01-15', 10000000.00, 2.5, 'VALIDE', '2024-01-15', '2026-01-15', 1, 2, '2024-01-16', 'V0', true),
(2, 'CONV-002', 'CONV/2024/002', 'Convention Equipement Public', 'Acquisition equipements collectifs', 'CADRE', '2024-02-01', 5000000.00, 3.0, 'VALIDE', '2024-02-01', '2026-02-01', 1, 2, '2024-02-02', 'V0', true),
(8, 'CONV-003', 'CONV/2024/003', 'Convention Aménagement Territorial', 'Programme amenagement zones industrielles et zones d''activites', 'CADRE', '2024-03-15', 15000000.00, 2.0, 'EN_EXECUTION', '2024-04-01', '2027-03-31', 2, 1, '2024-03-20', 'V0', true),
(9, 'CONV-004', 'CONV/2024/004', 'Convention Eau et Assainissement', 'Travaux d''adduction d''eau potable et assainissement liquide', 'CADRE', '2024-05-01', 8000000.00, 2.5, 'SOUMIS', '2024-06-01', '2026-05-31', 3, NULL, NULL, 'V0', false),
(10, 'CONV-005', 'CONV/2024/005', 'Convention Energie Renouvelable', 'Installation panneaux solaires et eclairage public LED', 'CADRE', '2024-06-10', 6500000.00, 3.5, 'BROUILLON', '2024-07-01', '2026-06-30', 2, NULL, NULL, 'V0', false),
(11, 'CONV-006', 'CONV/2023/006', 'Convention Transport Urbain', 'Modernisation reseau transport public urbain', 'CADRE', '2023-01-15', 12000000.00, 2.0, 'ACHEVE', '2023-02-01', '2024-12-31', 1, 2, '2023-01-20', 'V1', true),
(12, 'CONV-007', 'CONV/2024/007', 'Convention Numerique et Digital', 'Transformation digitale des services publics', 'CADRE', '2024-08-01', 4500000.00, 4.0, 'VALIDE', '2024-09-01', '2026-08-31', 1, 2, '2024-08-05', 'V0', true),
(13, 'CONV-008', 'CONV/2024/008', 'Convention Sport et Jeunesse', 'Construction et rehabilitation infrastructures sportives', 'CADRE', '2024-09-15', 7500000.00, 2.5, 'EN_EXECUTION', '2024-10-01', '2027-09-30', 2, 1, '2024-09-20', 'V0', true);

-- Sous-Conventions (SPECIFIQUE type, inheriting from parent CADRE conventions)
INSERT INTO conventions (
    id, code, numero, libelle, objet, type_convention,
    date_convention, budget, taux_commission, base_calcul, taux_tva,
    statut, date_debut, date_fin,
    parent_convention_id, herite_parametres,
    created_by_id, created_at
) VALUES
-- Sous-conventions pour CONV-001 (Infrastructure)
(
    3, 'SC-001', 'SC/2024/001', 'Sous-Convention Voirie Urbaine Casablanca',
    'Travaux de voirie et amenagement urbain dans la region de Casablanca',
    'SPECIFIQUE',
    '2024-02-01', 3500000.00, 2.5, 'DECAISSEMENTS_TTC', 20.00,
    'VALIDE', '2024-02-15', '2025-02-15',
    1, true,  -- parent_convention_id = 1 (CONV-001), herite_parametres = true
    2, CURRENT_TIMESTAMP
),
(
    4, 'SC-002', 'SC/2024/002', 'Sous-Convention Routes Nationales',
    'Rehabilitation et entretien des routes nationales',
    'SPECIFIQUE',
    '2024-03-01', 4000000.00, 2.5, 'DECAISSEMENTS_TTC', 20.00,
    'VALIDE', '2024-03-15', '2025-09-15',
    1, true,  -- parent_convention_id = 1 (CONV-001)
    2, CURRENT_TIMESTAMP
),
(
    5, 'SC-003', 'SC/2024/003', 'Sous-Convention Ponts et Ouvrages',
    'Construction et maintenance des ponts et ouvrages d''art',
    'SPECIFIQUE',
    '2024-04-01', 2500000.00, 3.0, 'DECAISSEMENTS_TTC', 20.00,
    'BROUILLON', '2024-05-01', '2025-11-01',
    1, false,  -- parent_convention_id = 1, herite_parametres = false (custom rate: 3.0%)
    2, CURRENT_TIMESTAMP
),
-- Sous-conventions pour CONV-002 (Equipement Public)
(
    6, 'SC-004', 'SC/2024/004', 'Sous-Convention Equipement Scolaire',
    'Fourniture et installation equipements scolaires',
    'SPECIFIQUE',
    '2024-03-10', 2000000.00, 3.0, 'DECAISSEMENTS_TTC', 20.00,
    'VALIDE', '2024-04-01', '2025-04-01',
    2, true,  -- parent_convention_id = 2 (CONV-002)
    2, CURRENT_TIMESTAMP
),
(
    7, 'SC-005', 'SC/2024/005', 'Sous-Convention Equipement Sanitaire',
    'Equipement des centres de sante et hopitaux',
    'SPECIFIQUE',
    '2024-04-15', 3000000.00, 3.0, 'DECAISSEMENTS_TTC', 20.00,
    'VALIDE', '2024-05-01', '2025-10-31',
    2, true,  -- parent_convention_id = 2 (CONV-002)
    2, CURRENT_TIMESTAMP
);

-- 8 parent conventions + 5 sous-conventions = 13 total
SELECT setval('conventions_id_seq', 13);

-- Projets liés aux conventions
INSERT INTO projets (id, code, nom, budget_total, statut, date_debut, convention_id, description) VALUES
-- Projets liés à la Convention 1 (Infrastructure)
(1, 'PROJ-001', 'Infrastructure Routiere Casablanca', 5000000.00, 'EN_COURS', '2024-01-01', 1, 'Programme de renovation et extension du reseau routier de Casablanca'),
(2, 'PROJ-002', 'Amenagement Boulevard Zerktouni', 2500000.00, 'EN_PREPARATION', '2024-03-01', 1, 'Amenagement et modernisation du boulevard principal'),
-- Projets liés à la Convention 2 (Équipement Public)
(3, 'PROJ-003', 'Equipement Ecoles Rabat', 3000000.00, 'EN_COURS', '2024-02-01', 2, 'Equipement de 15 ecoles primaires avec mobilier et materiel pedagogique'),
(4, 'PROJ-004', 'Centres de Sante Regionaux', 4000000.00, 'EN_PREPARATION', '2024-04-01', 2, 'Equipement medical pour 5 centres de sante'),
-- Projets liés à la Convention 8 (Aménagement Territorial)
(5, 'PROJ-005', 'Zone Industrielle Kenitra', 6000000.00, 'EN_COURS', '2024-05-01', 8, 'Amenagement et viabilisation de la nouvelle zone industrielle'),
-- Projet sans convention (indépendant)
(6, 'PROJ-006', 'Amenagement Urbain Tanger', 4500000.00, 'EN_PREPARATION', '2024-03-01', NULL, 'Programme amenagement centre-ville Tanger');

SELECT setval('projets_id_seq', 6);

-- Marchés avec géolocalisation, type et nature
INSERT INTO marches (
    id, fournisseur_id, convention_id, numero_marche, objet,
    montant_ht, taux_tva, montant_tva, montant_ttc,
    date_marche, statut, date_debut, date_fin_prevue, delai_execution_mois,
    adresse, latitude, longitude, zone_geographique,
    type_marche, nature_prestation, date_signature, date_notification, taux_penalite
) VALUES
(
    1, 1, 1, 'M-2024-001', 'Travaux de voirie Boulevard Zerktouni',
    800000.00, 20.00, 160000.00, 960000.00,
    '2024-02-15', 'EN_COURS', '2024-02-20', '2024-08-20', 6,
    'Boulevard Zerktouni, Casablanca', 33.5731, -7.6298, 'Casablanca-Settat',
    'MARCHE', 'TRAVAUX', '2024-02-10', '2024-02-12', 0.05
),
(
    2, 2, 1, 'M-2024-002', 'Amenagement Avenue Mohammed V, Rabat',
    1200000.00, 20.00, 240000.00, 1440000.00,
    '2024-03-01', 'EN_COURS', '2024-03-10', '2024-12-10', 9,
    'Avenue Mohammed V, Rabat', 34.0209, -6.8416, 'Rabat-Sale-Kenitra',
    'CONTRAT', 'SERVICES', '2024-02-25', '2024-02-28', 0.05
),
(
    3, 3, 2, 'M-2024-003', 'Construction Ecole Primaire Tanger',
    2500000.00, 20.00, 500000.00, 3000000.00,
    '2024-03-15', 'VALIDE', '2024-04-01', '2025-03-31', 12,
    'Zone Industrielle, Tanger', 35.7595, -5.8340, 'Tanger-Tetouan-Al Hoceima',
    'BON_DE_COMMANDE', 'FOURNITURES', '2024-03-10', '2024-03-12', 0.05
),
(
    4, 4, 1, 'M-2024-004', 'Rehabilitation Route Nationale N1, Agadir',
    3500000.00, 20.00, 700000.00, 4200000.00,
    '2024-04-01', 'EN_COURS', '2024-04-15', '2025-04-15', 12,
    'Route Nationale N1, Agadir', 30.4278, -9.5981, 'Souss-Massa',
    'MARCHE', 'TRAVAUX', '2024-03-28', '2024-03-30', 0.05
),
(
    5, 1, 1, 'M-2024-005', 'Travaux assainissement Meknes',
    1800000.00, 20.00, 360000.00, 2160000.00,
    '2024-04-10', 'EN_ATTENTE', NULL, NULL, 10,
    'Quartier Hamria, Meknes', 33.8730, -5.5540, 'Fes-Meknes',
    'LETTRE_DE_COMMANDE', 'ETUDES', NULL, NULL, 0.10
);

SELECT setval('marches_id_seq', 5);

-- Ordres de service (commencement, arret, reprise)
INSERT INTO ordres_service (id, marche_id, numero_ordre, type_ordre, date_ordre, date_effet, reference, motif, observations) VALUES
(1, 1, 'OS-001-COM', 'COMMENCEMENT', '2024-02-20', '2024-02-20', 'REF-OS-001', NULL, 'Demarrage des travaux de voirie'),
(2, 1, 'OS-001-ARR', 'ARRET', '2024-04-15', '2024-04-15', 'REF-OS-002', 'Intemperies - fortes pluies', 'Arret temporaire pour raisons climatiques'),
(3, 1, 'OS-001-REP', 'REPRISE', '2024-05-01', '2024-05-01', 'REF-OS-003', NULL, 'Reprise apres fin des intemperies'),
(4, 2, 'OS-002-COM', 'COMMENCEMENT', '2024-04-01', '2024-04-01', 'REF-OS-004', NULL, 'Demarrage de la mission de suivi');

SELECT setval('ordres_service_id_seq', 4, true);

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

-- ============================================================================
-- Subventions (financements externes)
-- ============================================================================
INSERT INTO subventions (id, convention_id, organisme_bailleur, type_subvention, montant_total, devise, taux_change, date_signature, date_debut_validite, date_fin_validite, conditions, observations) VALUES
-- Convention 1 - Infrastructure
(1, 1, 'Banque Mondiale', 'PRET', 2000000.00, 'USD', 10.2500, '2024-01-20', '2024-02-01', '2028-01-31', 'Décaissement progressif selon avancement des travaux', 'Prêt à taux préférentiel 2%'),
(2, 1, 'Union Européenne', 'DON', 1500000.00, 'EUR', 10.8000, '2024-02-15', '2024-03-01', '2026-12-31', 'Rapport semestriel obligatoire', 'Programme de coopération UE-Maroc'),
(3, 2, 'BAD - Banque Africaine de Développement', 'PRET', 3000000.00, 'MAD', NULL, '2024-03-01', '2024-04-01', '2029-03-31', 'Audit annuel requis', 'Financement équipements publics'),
(4, 1, 'Fonds Hassan II', 'DON', 500000.00, 'MAD', NULL, '2024-04-10', '2024-05-01', '2025-12-31', NULL, 'Subvention nationale'),
-- Convention 8 - Aménagement Territorial
(5, 8, 'BID - Banque Islamique de Développement', 'PRET', 5000000.00, 'USD', 10.3000, '2024-04-01', '2024-05-01', '2029-04-30', 'Conformité Sharia requise', 'Financement zones industrielles'),
(6, 8, 'Fonds Vert pour le Climat', 'DON', 2000000.00, 'EUR', 10.9000, '2024-05-15', '2024-06-01', '2027-05-31', 'Critères environnementaux stricts', 'Composante écologique'),
-- Convention 12 - Numérique
(7, 12, 'USAID', 'DON', 1000000.00, 'USD', 10.2000, '2024-09-01', '2024-10-01', '2026-09-30', NULL, 'Programme e-gouvernement'),
-- Convention 13 - Sport
(8, 13, 'FIFA Forward', 'DON', 800000.00, 'USD', 10.2500, '2024-10-01', '2024-11-01', '2027-10-31', 'Rapport annuel FIFA', 'Développement football');

SELECT setval('subventions_id_seq', 8, true);

-- ============================================================================
-- Partenaires (organismes partenaires)
-- ============================================================================
INSERT INTO partenaires (id, code, raison_sociale, sigle, type_partenaire, email, telephone, adresse, description) VALUES
(1, 'MIN-EQUIP', 'Ministère de l''Équipement et de l''Eau', 'MEE', 'PUBLIC', 'contact@equipement.gov.ma', '+212537123456', 'Avenue Mohammed V, Rabat', 'Tutelle administrative'),
(2, 'AU-CASA', 'Agence Urbaine de Casablanca', 'AUC', 'PUBLIC', 'contact@auc.ma', '+212522654321', 'Boulevard Zerktouni, Casablanca', 'Appui technique urbanisme'),
(3, 'CR-CS', 'Conseil Régional Casablanca-Settat', 'CRCS', 'PUBLIC', 'contact@cr-cs.ma', '+212522789012', 'Place Mohammed V, Casablanca', 'Co-financement régional'),
(4, 'DCL', 'Direction des Collectivités Locales', 'DCL', 'PUBLIC', 'contact@dcl.gov.ma', '+212537234567', 'Avenue Al Fassia, Rabat', 'Tutelle collectivités'),
(5, 'ONEE', 'Office National de l''Électricité et de l''Eau', 'ONEE', 'PUBLIC', 's.amrani@onee.ma', '+212522345678', 'Rue Hassan II, Casablanca', 'Raccordement électrique'),
(6, 'MEN', 'Ministère de l''Éducation Nationale', 'MEN', 'PUBLIC', 'contact@men.gov.ma', '+212537772233', 'Avenue Allal Ben Abdellah, Rabat', 'Tutelle éducation'),
(7, 'MS', 'Ministère de la Santé', 'MS', 'PUBLIC', 'contact@sante.gov.ma', '+212537776655', 'Avenue Ibn Sina, Rabat', 'Tutelle santé'),
(8, 'ANCFCC', 'Agence Nationale de la Conservation Foncière', 'ANCFCC', 'PUBLIC', 'contact@ancfcc.gov.ma', '+212537665544', 'Avenue My Rachid, Rabat', 'Conservation foncière');

SELECT setval('partenaires_id_seq', 8, true);

-- ============================================================================
-- Partenaires conventions (liaison convention-partenaire avec budget)
-- ============================================================================
INSERT INTO convention_partenaires (id, convention_id, partenaire_id, budget_alloue, pourcentage, commission_intervention, est_maitre_oeuvre, est_maitre_oeuvre_delegue, remarques) VALUES
-- Convention 1 - Infrastructure
(1, 1, 1, 4000000.00, 40.00, 100000.00, true, false, 'Maître d''ouvrage principal'),
(2, 1, 2, 3000000.00, 30.00, 75000.00, false, true, 'Maître d''ouvrage délégué'),
(3, 1, 3, 3000000.00, 30.00, 75000.00, false, false, 'Co-financement régional'),
-- Convention 2 - Équipement Public
(4, 2, 4, 2500000.00, 50.00, 75000.00, true, false, 'Maître d''ouvrage'),
(5, 2, 5, 2500000.00, 50.00, 75000.00, false, false, 'Partenaire technique'),
-- Convention 8 - Aménagement Territorial
(6, 8, 1, 7500000.00, 50.00, 150000.00, true, false, 'Maître d''ouvrage'),
(7, 8, 8, 7500000.00, 50.00, 150000.00, false, true, 'Gestion foncière');

SELECT setval('convention_partenaires_id_seq', 7, true);

-- ============================================================================
-- Versements prévisionnels
-- ============================================================================
INSERT INTO versements_previsionnels (id, convention_id, partenaire_id, volet, date_versement, montant, remarques) VALUES
-- Convention 1 - Infrastructure (partenaire 1 = MEE)
(1, 1, 1, 'Tranche 1 - Démarrage', '2024-03-15', 1500000.00, 'Premier versement après validation'),
(2, 1, 1, 'Tranche 2 - Avancement 50%', '2024-06-15', 1500000.00, 'Deuxième versement à 50% avancement'),
(3, 1, 2, 'Tranche 1 - Études', '2024-04-01', 1000000.00, 'Études préliminaires'),
(4, 1, 2, 'Tranche 2 - Travaux', '2024-09-01', 2000000.00, 'Lancement travaux'),
-- Convention 2 - Équipement Public (partenaire 4 = DCL)
(5, 2, 4, 'Mobilier scolaire', '2024-05-01', 1200000.00, 'Commande mobilier'),
(6, 2, 4, 'Matériel médical', '2024-06-01', 1800000.00, 'Équipement centres de santé'),
-- Convention 8 - Aménagement Territorial (partenaire 1 = MEE)
(7, 8, 1, 'Phase 1 - Viabilisation', '2024-05-01', 3000000.00, 'Viabilisation terrain'),
(8, 8, 1, 'Phase 2 - Construction', '2024-09-01', 4000000.00, 'Construction bâtiments'),
(9, 8, 8, 'Phase 1 - Foncier', '2024-06-15', 3500000.00, 'Acquisition foncière'),
-- Convention 12 - Numérique (partenaire 4 = DCL)
(10, 12, 4, 'Développement', '2024-10-01', 1500000.00, 'Développement plateforme'),
(11, 12, 4, 'Déploiement', '2025-02-01', 1200000.00, 'Formation et déploiement'),
-- Convention 13 - Sport (partenaire 6 = MEN)
(12, 13, 6, 'Construction stades', '2024-11-01', 2500000.00, 'Construction stade municipal'),
(13, 13, 6, 'Réhabilitation', '2025-01-15', 2000000.00, 'Rénovation complexes sportifs');

SELECT setval('versements_previsionnels_id_seq', 13, true);

-- ============================================================================
-- Imputations prévisionnelles conventions
-- ============================================================================
INSERT INTO imputations_analytiques (id, type_imputation, reference_id, montant, dimensions_valeurs) VALUES
-- Convention 1 - Infrastructure
(1, 'CONVENTION', 1, 4000000.00, '{"BUDGET":"B001","PROJET":"P001","SECTEUR":"S001","REGION":"R001"}'),
(2, 'CONVENTION', 1, 3500000.00, '{"BUDGET":"B001","PROJET":"P001","SECTEUR":"S001","REGION":"R002"}'),
(3, 'CONVENTION', 1, 2500000.00, '{"BUDGET":"B001","PROJET":"P001","SECTEUR":"S001","REGION":"R003"}'),
-- Convention 2 - Équipement Public
(4, 'CONVENTION', 2, 2500000.00, '{"BUDGET":"B002","PROJET":"P002","SECTEUR":"S001","REGION":"R001"}'),
(5, 'CONVENTION', 2, 2500000.00, '{"BUDGET":"B002","PROJET":"P002","SECTEUR":"S001","REGION":"R002"}'),
-- Convention 8 - Aménagement Territorial
(6, 'CONVENTION', 8, 6000000.00, '{"BUDGET":"B001","PROJET":"P001","SECTEUR":"S002","REGION":"R002"}'),
(7, 'CONVENTION', 8, 5000000.00, '{"BUDGET":"B001","PROJET":"P001","SECTEUR":"S002","REGION":"R003"}'),
(8, 'CONVENTION', 8, 4000000.00, '{"BUDGET":"B001","PROJET":"P001","SECTEUR":"S002","REGION":"R001"}'),
-- Convention 12 - Numérique
(9, 'CONVENTION', 12, 2500000.00, '{"BUDGET":"B002","PROJET":"P002","SECTEUR":"S001","REGION":"R001"}'),
(10, 'CONVENTION', 12, 2000000.00, '{"BUDGET":"B002","PROJET":"P002","SECTEUR":"S001","REGION":"R002"}'),
-- Convention 13 - Sport
(11, 'CONVENTION', 13, 4000000.00, '{"BUDGET":"B002","PROJET":"P002","SECTEUR":"S001","REGION":"R001"}'),
(12, 'CONVENTION', 13, 3500000.00, '{"BUDGET":"B002","PROJET":"P002","SECTEUR":"S001","REGION":"R002"}');

SELECT setval('imputations_analytiques_id_seq', 12, true);

-- ============================================================================
-- Lignes budget par catégorie de dépense (convention_budget_lignes)
-- ============================================================================
INSERT INTO convention_budget_lignes (id, convention_id, categorie_depense_id, designation, montant, pourcentage, actif) VALUES
-- Convention 1 - Infrastructure (budget = 10 000 000)
(1, 1, 1, 'Travaux routiers et génie civil', 5000000.00, 50.00, TRUE),
(2, 1, 4, 'Études techniques et topographiques', 1500000.00, 15.00, TRUE),
(3, 1, 6, 'Équipements de signalisation', 2000000.00, 20.00, TRUE),
(4, 1, 3, 'Services de maîtrise d''œuvre', 1500000.00, 15.00, TRUE),
-- Convention 2 - Équipement Public (budget = 5 000 000)
(5, 2, 6, 'Équipements scolaires et médicaux', 2500000.00, 50.00, TRUE),
(6, 2, 2, 'Fournitures de bureau et consommables', 1000000.00, 20.00, TRUE),
(7, 2, 5, 'Formation du personnel', 750000.00, 15.00, TRUE),
(8, 2, 7, 'Maintenance préventive', 750000.00, 15.00, TRUE),
-- Convention 8 - Aménagement Territorial (budget = 15 000 000)
(9, 8, 1, 'Travaux de viabilisation', 8000000.00, 53.33, TRUE),
(10, 8, 4, 'Études d''impact et faisabilité', 2000000.00, 13.33, TRUE),
(11, 8, 6, 'Équipements industriels', 3000000.00, 20.00, TRUE),
(12, 8, 8, 'Conseil et assistance technique', 2000000.00, 13.33, TRUE);

SELECT setval('convention_budget_lignes_id_seq', 12, true);

-- ============================================================================
-- Imputations par ligne budget (budget_ligne_imputations)
-- ============================================================================
INSERT INTO budget_ligne_imputations (id, budget_ligne_id, projet_id, projet_code, projet_libelle, pourcentage, montant, actif) VALUES
-- Ligne 1: Travaux routiers (5M) → répartis entre PROJ-001 et PROJ-002
(1, 1, 1, 'PROJ-001', 'Infrastructure Routière Casablanca', 60.00, 3000000.00, TRUE),
(2, 1, 2, 'PROJ-002', 'Aménagement Boulevard Zerktouni', 40.00, 2000000.00, TRUE),
-- Ligne 2: Études techniques (1.5M) → principalement PROJ-001
(3, 2, 1, 'PROJ-001', 'Infrastructure Routière Casablanca', 70.00, 1050000.00, TRUE),
(4, 2, 2, 'PROJ-002', 'Aménagement Boulevard Zerktouni', 30.00, 450000.00, TRUE),
-- Ligne 3: Équipements signalisation (2M) → répartis
(5, 3, 1, 'PROJ-001', 'Infrastructure Routière Casablanca', 50.00, 1000000.00, TRUE),
(6, 3, 2, 'PROJ-002', 'Aménagement Boulevard Zerktouni', 50.00, 1000000.00, TRUE),
-- Ligne 5: Équipements scolaires et médicaux (2.5M) → répartis entre PROJ-003 et PROJ-004
(7, 5, 3, 'PROJ-003', 'Équipement Écoles Rabat', 60.00, 1500000.00, TRUE),
(8, 5, 4, 'PROJ-004', 'Centres de Santé Régionaux', 40.00, 1000000.00, TRUE),
-- Ligne 9: Travaux viabilisation (8M) → PROJ-005
(9, 9, 5, 'PROJ-005', 'Zone Industrielle Kénitra', 100.00, 8000000.00, TRUE);

SELECT setval('budget_ligne_imputations_id_seq', 9, true);
