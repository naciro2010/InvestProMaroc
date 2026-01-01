-- ========================================================================================================
-- SCRIPT DE DONNÉES FICTIVES COHÉRENTES - InvestPro Maroc
-- ========================================================================================================
-- Ce script génère des données de test réalistes pour démontrer le système complet
-- Conventions → Projets → Marchés → Plan Analytique
-- ========================================================================================================

-- ========================================================================================================
-- 1. PLAN ANALYTIQUE - DIMENSIONS ET VALEURS
-- ========================================================================================================

-- Dimension: BUDGET (Enveloppe budgétaire)
INSERT INTO dimensions (code, libelle, description, ordre_affichage, obligatoire, actif)
VALUES
    ('BUDGET', 'Enveloppe Budgétaire', 'Classification par source de financement', 1, true, true),
    ('PROJET', 'Projet', 'Code projet d''investissement', 2, true, true),
    ('SECTEUR', 'Secteur', 'Secteur d''activité', 3, false, true),
    ('REGION', 'Région', 'Région administrative', 4, false, true),
    ('PHASE', 'Phase', 'Phase du projet', 5, false, true);

-- Valeurs pour dimension BUDGET
INSERT INTO dimension_valeurs (dimension_id, code, libelle, description, actif)
VALUES
    ((SELECT id FROM dimensions WHERE code = 'BUDGET'), 'BG-2024-01', 'Budget Investissement 2024', 'Budget principal investissement infrastructure', true),
    ((SELECT id FROM dimensions WHERE code = 'BUDGET'), 'BG-2024-02', 'Budget Équipement 2024', 'Budget acquisition équipements', true),
    ((SELECT id FROM dimensions WHERE code = 'BUDGET'), 'BG-2024-03', 'Budget Innovation 2024', 'Budget projets innovation et R&D', true),
    ((SELECT id FROM dimensions WHERE code = 'BUDGET'), 'BG-2025-01', 'Budget Investissement 2025', 'Budget prévisionnel 2025', true);

-- Valeurs pour dimension PROJET
INSERT INTO dimension_valeurs (dimension_id, code, libelle, description, actif)
VALUES
    ((SELECT id FROM dimensions WHERE code = 'PROJET'), 'PRJ-ROUTE-2024', 'Autoroute Casa-Marrakech', 'Extension autoroute Casa-Marrakech', true),
    ((SELECT id FROM dimensions WHERE code = 'PROJET'), 'PRJ-PORT-2024', 'Port Tanger Med 3', 'Développement Terminal 3', true),
    ((SELECT id FROM dimensions WHERE code = 'PROJET'), 'PRJ-ENERGIE-2024', 'Centrale Solaire Ouarzazate', 'Extension centrale solaire', true),
    ((SELECT id FROM dimensions WHERE code = 'PROJET'), 'PRJ-EAU-2024', 'Station Dessalement Agadir', 'Nouvelle station de dessalement', true),
    ((SELECT id FROM dimensions WHERE code = 'PROJET'), 'PRJ-DIGIT-2024', 'Digitalisation Services Publics', 'Transformation digitale', true);

-- Valeurs pour dimension SECTEUR
INSERT INTO dimension_valeurs (dimension_id, code, libelle, description, actif)
VALUES
    ((SELECT id FROM dimensions WHERE code = 'SECTEUR'), 'SEC-INFRA', 'Infrastructure', 'Projets d''infrastructure', true),
    ((SELECT id FROM dimensions WHERE code = 'SECTEUR'), 'SEC-ENERGIE', 'Énergie', 'Projets énergétiques', true),
    ((SELECT id FROM dimensions WHERE code = 'SECTEUR'), 'SEC-EAU', 'Eau et Assainissement', 'Projets eau et assainissement', true),
    ((SELECT id FROM dimensions WHERE code = 'SECTEUR'), 'SEC-DIGIT', 'Digital', 'Projets de digitalisation', true),
    ((SELECT id FROM dimensions WHERE code = 'SECTEUR'), 'SEC-SOCIAL', 'Social', 'Projets sociaux et santé', true);

-- Valeurs pour dimension REGION
INSERT INTO dimension_valeurs (dimension_id, code, libelle, description, actif)
VALUES
    ((SELECT id FROM dimensions WHERE code = 'REGION'), 'REG-CASA', 'Casablanca-Settat', 'Région économique de Casablanca', true),
    ((SELECT id FROM dimensions WHERE code = 'REGION'), 'REG-RABAT', 'Rabat-Salé-Kénitra', 'Région administrative capitale', true),
    ((SELECT id FROM dimensions WHERE code = 'REGION'), 'REG-TANGER', 'Tanger-Tétouan-Al Hoceima', 'Région nord', true),
    ((SELECT id FROM dimensions WHERE code = 'REGION'), 'REG-MARRAK', 'Marrakech-Safi', 'Région centre', true),
    ((SELECT id FROM dimensions WHERE code = 'REGION'), 'REG-SOUS', 'Souss-Massa', 'Région sud', true);

-- Valeurs pour dimension PHASE
INSERT INTO dimension_valeurs (dimension_id, code, libelle, description, actif)
VALUES
    ((SELECT id FROM dimensions WHERE code = 'PHASE'), 'PH-ETUDE', 'Études', 'Phase études et conception', true),
    ((SELECT id FROM dimensions WHERE code = 'PHASE'), 'PH-TRAVAUX', 'Travaux', 'Phase réalisation travaux', true),
    ((SELECT id FROM dimensions WHERE code = 'PHASE'), 'PH-EQUIP', 'Équipement', 'Phase équipement et installation', true),
    ((SELECT id FROM dimensions WHERE code = 'PHASE'), 'PH-EXPLOIT', 'Exploitation', 'Phase mise en exploitation', true);

-- ========================================================================================================
-- 2. PROJETS D'INVESTISSEMENT
-- ========================================================================================================

INSERT INTO projets (code, libelle, description, statut, budget, date_debut, date_fin_prevue, actif)
VALUES
    ('PRJ-ROUTE-2024', 'Autoroute Casa-Marrakech', 'Extension de l''autoroute Casablanca-Marrakech de 6 à 8 voies sur 230 km', 'EN_COURS', 4500000000.00, '2024-01-15', '2026-12-31', true),
    ('PRJ-PORT-2024', 'Port Tanger Med 3', 'Construction du Terminal 3 du Port Tanger Med avec capacité 5M conteneurs', 'EN_COURS', 3200000000.00, '2024-03-01', '2027-06-30', true),
    ('PRJ-ENERGIE-2024', 'Centrale Solaire Ouarzazate', 'Extension de la centrale solaire Noor Ouarzazate avec 500 MW additionnels', 'EN_COURS', 2800000000.00, '2024-02-01', '2026-09-30', true),
    ('PRJ-EAU-2024', 'Station Dessalement Agadir', 'Construction d''une station de dessalement d''eau de mer capacité 275,000 m3/jour', 'EN_COURS', 1850000000.00, '2024-04-01', '2026-12-31', true),
    ('PRJ-DIGIT-2024', 'Digitalisation Services Publics', 'Transformation digitale des services publics - Phase 2', 'EN_COURS', 950000000.00, '2024-01-01', '2025-12-31', true);

-- ========================================================================================================
-- 3. FOURNISSEURS
-- ========================================================================================================

INSERT INTO fournisseurs (ice, nom, raison_sociale, type_fournisseur, email, telephone, adresse, ville, code_postal, pays, rib, actif)
VALUES
    ('002123456789012', 'Groupe BTP CASA', 'Groupe BTP Casablanca SARL', 'ENTREPRISE', 'contact@btpcasa.ma', '+212522334455', 'Zone Industrielle Oukacha', 'Casablanca', '20250', 'Maroc', '230450000111222333344445', true),
    ('002234567890123', 'SOTRAVO Maroc', 'Société Travaux Voiries SOTRAVO SA', 'ENTREPRISE', 'commercial@sotravo.ma', '+212522445566', 'Bd Bir Anzarane', 'Casablanca', '20100', 'Maroc', '230450000222333444555666', true),
    ('002345678901234', 'DELTA Engineering', 'Delta Engineering & Construction', 'BUREAU_ETUDES', 'contact@deltaeng.ma', '+212537667788', 'Agdal, Rue Ibn Sina', 'Rabat', '10000', 'Maroc', '230610000333444555666777', true),
    ('002456789012345', 'Tech Solutions Maroc', 'Tech Solutions Digital Maroc SARL', 'FOURNISSEUR', 'info@techsolutions.ma', '+212522778899', 'Twin Center, Tour A', 'Casablanca', '20100', 'Maroc', '230450000444555666777888', true),
    ('002567890123456', 'HYDRO Maroc', 'Hydraulique & Assainissement Maroc SA', 'ENTREPRISE', 'contact@hydromaroc.ma', '+212528889900', 'Route Essaouira Km 12', 'Agadir', '80000', 'Maroc', '230640000555666777888999', true),
    ('002678901234567', 'Énergie Solaire Maroc', 'Société Énergie Solaire du Maroc', 'ENTREPRISE', 'commercial@esm.ma', '+212524112233', 'Avenue Mohammed VI', 'Ouarzazate', '45000', 'Maroc', '230710000666777888999000', true),
    ('002789012345678', 'Consulting & Audit Pro', 'Cabinet Consulting & Audit Professionnel', 'BUREAU_ETUDES', 'contact@cap-consulting.ma', '+212537223344', 'Hassan, Avenue Allal Ben Abdellah', 'Rabat', '10020', 'Maroc', '230610000777888999000111', true);

-- ========================================================================================================
-- 4. CONVENTIONS D'INTERVENTION
-- ========================================================================================================

-- Convention CADRE 1: Infrastructure et Travaux Publics
INSERT INTO conventions (
    code, numero, libelle, objet, type_convention, statut,
    date_convention, date_debut, date_fin,
    budget, taux_commission, base_calcul, taux_tva,
    is_locked, actif
) VALUES (
    'CONV-INFRA-2024',
    'CONV-2024-001',
    'Convention Cadre Infrastructure et Travaux Publics 2024-2026',
    'Convention cadre pour le financement et la gestion des projets d''infrastructure routière et portuaire. Couverture des travaux de construction, réhabilitation et équipement des infrastructures de transport.',
    'CADRE',
    'VALIDEE',
    '2024-01-10',
    '2024-01-15',
    '2026-12-31',
    8500000000.00,
    2.50,
    'DECAISSEMENTS_TTC',
    20.00,
    true,
    true
);

-- Marquer comme validée avec version V0
UPDATE conventions SET
    date_validation = '2024-01-12',
    version = 'V0',
    valide_par_id = (SELECT id FROM users WHERE username = 'admin' LIMIT 1)
WHERE code = 'CONV-INFRA-2024';

-- Convention CADRE 2: Énergie et Environnement
INSERT INTO conventions (
    code, numero, libelle, objet, type_convention, statut,
    date_convention, date_debut, date_fin,
    budget, taux_commission, base_calcul, taux_tva,
    is_locked, actif
) VALUES (
    'CONV-ENERGIE-2024',
    'CONV-2024-002',
    'Convention Cadre Énergie Renouvelable et Environnement 2024-2027',
    'Convention cadre dédiée aux projets d''énergie renouvelable (solaire, éolien) et de gestion environnementale. Financement des centrales de production d''énergie verte et infrastructures associées.',
    'CADRE',
    'VALIDEE',
    '2024-01-20',
    '2024-02-01',
    '2027-12-31',
    3500000000.00,
    2.75,
    'DECAISSEMENTS_TTC',
    20.00,
    true,
    true
);

UPDATE conventions SET
    date_validation = '2024-01-25',
    version = 'V0',
    valide_par_id = (SELECT id FROM users WHERE username = 'admin' LIMIT 1)
WHERE code = 'CONV-ENERGIE-2024';

-- Convention SPECIFIQUE 1: Eau et Assainissement
INSERT INTO conventions (
    code, numero, libelle, objet, type_convention, statut,
    date_convention, date_debut, date_fin,
    budget, taux_commission, base_calcul, taux_tva,
    is_locked, actif
) VALUES (
    'CONV-EAU-2024',
    'CONV-2024-003',
    'Convention Spécifique Eau et Assainissement Agadir',
    'Convention spécifique pour le projet de dessalement d''eau de mer à Agadir. Comprend la construction de la station, réseau de distribution et station de traitement des eaux usées.',
    'SPECIFIQUE',
    'VALIDEE',
    '2024-03-15',
    '2024-04-01',
    '2026-12-31',
    2100000000.00,
    3.00,
    'DECAISSEMENTS_TTC',
    20.00,
    true,
    true
);

UPDATE conventions SET
    date_validation = '2024-03-20',
    version = 'V0',
    valide_par_id = (SELECT id FROM users WHERE username = 'manager' LIMIT 1)
WHERE code = 'CONV-EAU-2024';

-- Convention NON_CADRE: Digitalisation
INSERT INTO conventions (
    code, numero, libelle, objet, type_convention, statut,
    date_convention, date_debut, date_fin,
    budget, taux_commission, base_calcul, taux_tva,
    is_locked, actif
) VALUES (
    'CONV-DIGIT-2024',
    'CONV-2024-004',
    'Convention Non-Cadre Transformation Digitale Services Publics',
    'Convention non-cadre dédiée à la transformation digitale des services publics. Développement de plateformes numériques, applications mobiles, infrastructure cloud et formation.',
    'NON_CADRE',
    'VALIDEE',
    '2023-12-10',
    '2024-01-01',
    '2025-12-31',
    1200000000.00,
    3.50,
    'DECAISSEMENTS_HT',
    20.00,
    true,
    true
);

UPDATE conventions SET
    date_validation = '2023-12-15',
    version = 'V0',
    valide_par_id = (SELECT id FROM users WHERE username = 'admin' LIMIT 1)
WHERE code = 'CONV-DIGIT-2024';

-- Convention en BROUILLON (pour test workflow)
INSERT INTO conventions (
    code, numero, libelle, objet, type_convention, statut,
    date_convention, date_debut, date_fin,
    budget, taux_commission, base_calcul, taux_tva,
    is_locked, actif
) VALUES (
    'CONV-SOCIAL-2025',
    'CONV-2025-001',
    'Convention Cadre Projets Sociaux et Santé 2025',
    'Convention en préparation pour les projets sociaux et de santé publique. Construction d''hôpitaux, centres de santé et équipements médicaux.',
    'CADRE',
    'BROUILLON',
    '2025-01-01',
    '2025-02-01',
    '2027-12-31',
    2500000000.00,
    2.50,
    'DECAISSEMENTS_TTC',
    20.00,
    false,
    true
);

-- ========================================================================================================
-- 5. MARCHÉS PUBLICS
-- ========================================================================================================

-- Marché 1: Autoroute Casa-Marrakech - Lot 1 (Travaux)
INSERT INTO marches (
    numero, objet, type_marche, statut,
    montant_initial_ht, montant_initial_ttc, taux_tva,
    retenue_garantie_pct,
    date_marche, date_notification, date_os, date_debut, date_fin_prevue,
    convention_id, fournisseur_id,
    actif
) VALUES (
    'M-2024-001',
    'Travaux d''élargissement Autoroute Casa-Marrakech - Lot 1 (Km 0 à 115)',
    'TRAVAUX',
    'EN_COURS',
    1875000000.00,
    2250000000.00,
    20.00,
    7.00,
    '2024-02-01',
    '2024-02-10',
    '2024-02-15',
    '2024-02-20',
    '2026-06-30',
    (SELECT id FROM conventions WHERE code = 'CONV-INFRA-2024'),
    (SELECT id FROM fournisseurs WHERE ice = '002123456789012'),
    true
);

-- Lignes du Marché M-2024-001 avec imputation analytique
INSERT INTO marche_lignes (
    marche_id, numero, libelle, description,
    quantite, unite, prix_unitaire_ht,
    montant_ht, montant_tva, montant_ttc,
    dimensions_valeurs
) VALUES
    (
        (SELECT id FROM marches WHERE numero = 'M-2024-001'),
        'L-001',
        'Terrassement et plateforme',
        'Terrassement général, plateforme et fondations',
        115.00,
        'KM',
        6500000.00,
        747500000.00,
        149500000.00,
        897000000.00,
        '{
            "BUDGET": "BG-2024-01",
            "PROJET": "PRJ-ROUTE-2024",
            "SECTEUR": "SEC-INFRA",
            "REGION": "REG-CASA",
            "PHASE": "PH-TRAVAUX"
        }'::jsonb
    ),
    (
        (SELECT id FROM marches WHERE numero = 'M-2024-001'),
        'L-002',
        'Revêtement et couche de roulement',
        'Pose de la couche de base et revêtement final',
        230.00,
        'VOIE-KM',
        2750000.00,
        632500000.00,
        126500000.00,
        759000000.00,
        '{
            "BUDGET": "BG-2024-01",
            "PROJET": "PRJ-ROUTE-2024",
            "SECTEUR": "SEC-INFRA",
            "REGION": "REG-CASA",
            "PHASE": "PH-TRAVAUX"
        }'::jsonb
    ),
    (
        (SELECT id FROM marches WHERE numero = 'M-2024-001'),
        'L-003',
        'Signalisation et équipements de sécurité',
        'Installation de la signalisation routière et équipements sécurité',
        115.00,
        'KM',
        4300000.00,
        494500000.00,
        98900000.00,
        593400000.00,
        '{
            "BUDGET": "BG-2024-01",
            "PROJET": "PRJ-ROUTE-2024",
            "SECTEUR": "SEC-INFRA",
            "REGION": "REG-CASA",
            "PHASE": "PH-EQUIP"
        }'::jsonb
    );

-- Marché 2: Autoroute Casa-Marrakech - Lot 2 (Travaux)
INSERT INTO marches (
    numero, objet, type_marche, statut,
    montant_initial_ht, montant_initial_ttc, taux_tva,
    retenue_garantie_pct,
    date_marche, date_notification, date_os, date_debut, date_fin_prevue,
    convention_id, fournisseur_id,
    actif
) VALUES (
    'M-2024-002',
    'Travaux d''élargissement Autoroute Casa-Marrakech - Lot 2 (Km 115 à 230)',
    'TRAVAUX',
    'EN_COURS',
    1875000000.00,
    2250000000.00,
    20.00,
    7.00,
    '2024-02-05',
    '2024-02-15',
    '2024-02-20',
    '2024-02-25',
    '2026-09-30',
    (SELECT id FROM conventions WHERE code = 'CONV-INFRA-2024'),
    (SELECT id FROM fournisseurs WHERE ice = '002234567890123'),
    true
);

-- Lignes du Marché M-2024-002
INSERT INTO marche_lignes (
    marche_id, numero, libelle, description,
    quantite, unite, prix_unitaire_ht,
    montant_ht, montant_tva, montant_ttc,
    dimensions_valeurs
) VALUES
    (
        (SELECT id FROM marches WHERE numero = 'M-2024-002'),
        'L-001',
        'Terrassement et plateforme',
        'Terrassement général, plateforme et fondations',
        115.00,
        'KM',
        6500000.00,
        747500000.00,
        149500000.00,
        897000000.00,
        '{
            "BUDGET": "BG-2024-01",
            "PROJET": "PRJ-ROUTE-2024",
            "SECTEUR": "SEC-INFRA",
            "REGION": "REG-MARRAK",
            "PHASE": "PH-TRAVAUX"
        }'::jsonb
    ),
    (
        (SELECT id FROM marches WHERE numero = 'M-2024-002'),
        'L-002',
        'Revêtement et couche de roulement',
        'Pose de la couche de base et revêtement final',
        230.00,
        'VOIE-KM',
        2750000.00,
        632500000.00,
        126500000.00,
        759000000.00,
        '{
            "BUDGET": "BG-2024-01",
            "PROJET": "PRJ-ROUTE-2024",
            "SECTEUR": "SEC-INFRA",
            "REGION": "REG-MARRAK",
            "PHASE": "PH-TRAVAUX"
        }'::jsonb
    ),
    (
        (SELECT id FROM marches WHERE numero = 'M-2024-002'),
        'L-003',
        'Ouvrages d''art',
        'Construction de ponts et viaducs',
        12.00,
        'OUVRAGE',
        41250000.00,
        495000000.00,
        99000000.00,
        594000000.00,
        '{
            "BUDGET": "BG-2024-01",
            "PROJET": "PRJ-ROUTE-2024",
            "SECTEUR": "SEC-INFRA",
            "REGION": "REG-MARRAK",
            "PHASE": "PH-TRAVAUX"
        }'::jsonb
    );

-- Marché 3: Port Tanger Med 3 - Études techniques
INSERT INTO marches (
    numero, objet, type_marche, statut,
    montant_initial_ht, montant_initial_ttc, taux_tva,
    retenue_garantie_pct,
    date_marche, date_notification, date_os, date_debut, date_fin_prevue,
    convention_id, fournisseur_id,
    actif
) VALUES (
    'M-2024-003',
    'Études techniques et ingénierie Port Tanger Med 3',
    'ETUDES',
    'EN_COURS',
    125000000.00,
    150000000.00,
    20.00,
    5.00,
    '2024-03-01',
    '2024-03-10',
    '2024-03-15',
    '2024-03-20',
    '2025-03-31',
    (SELECT id FROM conventions WHERE code = 'CONV-INFRA-2024'),
    (SELECT id FROM fournisseurs WHERE ice = '002345678901234'),
    true
);

INSERT INTO marche_lignes (
    marche_id, numero, libelle, description,
    quantite, unite, prix_unitaire_ht,
    montant_ht, montant_tva, montant_ttc,
    dimensions_valeurs
) VALUES
    (
        (SELECT id FROM marches WHERE numero = 'M-2024-003'),
        'L-001',
        'Études géotechniques et bathymétriques',
        'Études des sols, bathymétrie et sismique',
        1.00,
        'FORFAIT',
        35000000.00,
        35000000.00,
        7000000.00,
        42000000.00,
        '{
            "BUDGET": "BG-2024-01",
            "PROJET": "PRJ-PORT-2024",
            "SECTEUR": "SEC-INFRA",
            "REGION": "REG-TANGER",
            "PHASE": "PH-ETUDE"
        }'::jsonb
    ),
    (
        (SELECT id FROM marches WHERE numero = 'M-2024-003'),
        'L-002',
        'Ingénierie détaillée et plans d''exécution',
        'Conception détaillée et plans d''exécution complets',
        1.00,
        'FORFAIT',
        65000000.00,
        65000000.00,
        13000000.00,
        78000000.00,
        '{
            "BUDGET": "BG-2024-01",
            "PROJET": "PRJ-PORT-2024",
            "SECTEUR": "SEC-INFRA",
            "REGION": "REG-TANGER",
            "PHASE": "PH-ETUDE"
        }'::jsonb
    ),
    (
        (SELECT id FROM marches WHERE numero = 'M-2024-003'),
        'L-003',
        'Études environnementales',
        'Étude d''impact environnemental et plan de gestion',
        1.00,
        'FORFAIT',
        25000000.00,
        25000000.00,
        5000000.00,
        30000000.00,
        '{
            "BUDGET": "BG-2024-01",
            "PROJET": "PRJ-PORT-2024",
            "SECTEUR": "SEC-INFRA",
            "REGION": "REG-TANGER",
            "PHASE": "PH-ETUDE"
        }'::jsonb
    );

-- Marché 4: Centrale Solaire Ouarzazate - Panneaux et équipements
INSERT INTO marches (
    numero, objet, type_marche, statut,
    montant_initial_ht, montant_initial_ttc, taux_tva,
    retenue_garantie_pct,
    date_marche, date_notification, date_os, date_debut, date_fin_prevue,
    convention_id, fournisseur_id,
    actif
) VALUES (
    'M-2024-004',
    'Fourniture et installation panneaux solaires et équipements - 500 MW',
    'FOURNITURE_POSE',
    'EN_COURS',
    2083333333.33,
    2500000000.00,
    20.00,
    10.00,
    '2024-03-15',
    '2024-03-25',
    '2024-04-01',
    '2024-04-10',
    '2026-06-30',
    (SELECT id FROM conventions WHERE code = 'CONV-ENERGIE-2024'),
    (SELECT id FROM fournisseurs WHERE ice = '002678901234567'),
    true
);

INSERT INTO marche_lignes (
    marche_id, numero, libelle, description,
    quantite, unite, prix_unitaire_ht,
    montant_ht, montant_tva, montant_ttc,
    dimensions_valeurs
) VALUES
    (
        (SELECT id FROM marches WHERE numero = 'M-2024-004'),
        'L-001',
        'Panneaux photovoltaïques haute performance',
        'Panneaux solaires 450W rendement 22%',
        1250000.00,
        'UNITE',
        1100.00,
        1375000000.00,
        275000000.00,
        1650000000.00,
        '{
            "BUDGET": "BG-2024-02",
            "PROJET": "PRJ-ENERGIE-2024",
            "SECTEUR": "SEC-ENERGIE",
            "REGION": "REG-MARRAK",
            "PHASE": "PH-EQUIP"
        }'::jsonb
    ),
    (
        (SELECT id FROM marches WHERE numero = 'M-2024-004'),
        'L-002',
        'Onduleurs et système de conversion',
        'Onduleurs centraux et système MPPT',
        250.00,
        'UNITE',
        1666666.67,
        416666666.67,
        83333333.33,
        500000000.00,
        '{
            "BUDGET": "BG-2024-02",
            "PROJET": "PRJ-ENERGIE-2024",
            "SECTEUR": "SEC-ENERGIE",
            "REGION": "REG-MARRAK",
            "PHASE": "PH-EQUIP"
        }'::jsonb
    ),
    (
        (SELECT id FROM marches WHERE numero = 'M-2024-004'),
        'L-003',
        'Structures de support et tracking',
        'Structures métalliques et système de suivi solaire',
        500.00,
        'MW',
        583333.33,
        291666666.67,
        58333333.33,
        350000000.00,
        '{
            "BUDGET": "BG-2024-02",
            "PROJET": "PRJ-ENERGIE-2024",
            "SECTEUR": "SEC-ENERGIE",
            "REGION": "REG-MARRAK",
            "PHASE": "PH-EQUIP"
        }'::jsonb
    );

-- Marché 5: Station Dessalement Agadir
INSERT INTO marches (
    numero, objet, type_marche, statut,
    montant_initial_ht, montant_initial_ttc, taux_tva,
    retenue_garantie_pct,
    date_marche, date_notification, date_os, date_debut, date_fin_prevue,
    convention_id, fournisseur_id,
    actif
) VALUES (
    'M-2024-005',
    'Construction station dessalement Agadir - 275,000 m³/jour',
    'TRAVAUX',
    'EN_COURS',
    1458333333.33,
    1750000000.00,
    20.00,
    10.00,
    '2024-04-15',
    '2024-04-25',
    '2024-05-01',
    '2024-05-10',
    '2026-12-31',
    (SELECT id FROM conventions WHERE code = 'CONV-EAU-2024'),
    (SELECT id FROM fournisseurs WHERE ice = '002567890123456'),
    true
);

INSERT INTO marche_lignes (
    marche_id, numero, libelle, description,
    quantite, unite, prix_unitaire_ht,
    montant_ht, montant_tva, montant_ttc,
    dimensions_valeurs
) VALUES
    (
        (SELECT id FROM marches WHERE numero = 'M-2024-005'),
        'L-001',
        'Génie civil et bâtiments',
        'Construction bassins, bâtiments techniques et administratifs',
        1.00,
        'FORFAIT',
        500000000.00,
        500000000.00,
        100000000.00,
        600000000.00,
        '{
            "BUDGET": "BG-2024-01",
            "PROJET": "PRJ-EAU-2024",
            "SECTEUR": "SEC-EAU",
            "REGION": "REG-SOUS",
            "PHASE": "PH-TRAVAUX"
        }'::jsonb
    ),
    (
        (SELECT id FROM marches WHERE numero = 'M-2024-005'),
        'L-002',
        'Équipements osmose inverse',
        'Membranes et systèmes d''osmose inverse',
        275000.00,
        'M3/JOUR',
        2500.00,
        687500000.00,
        137500000.00,
        825000000.00,
        '{
            "BUDGET": "BG-2024-02",
            "PROJET": "PRJ-EAU-2024",
            "SECTEUR": "SEC-EAU",
            "REGION": "REG-SOUS",
            "PHASE": "PH-EQUIP"
        }'::jsonb
    ),
    (
        (SELECT id FROM marches WHERE numero = 'M-2024-005'),
        'L-003',
        'Pompes et systèmes énergétiques',
        'Pompes haute pression et système de récupération d''énergie',
        1.00,
        'FORFAIT',
        270833333.33,
        270833333.33,
        54166666.67,
        325000000.00,
        '{
            "BUDGET": "BG-2024-02",
            "PROJET": "PRJ-EAU-2024",
            "SECTEUR": "SEC-EAU",
            "REGION": "REG-SOUS",
            "PHASE": "PH-EQUIP"
        }'::jsonb
    );

-- Marché 6: Digitalisation Services Publics
INSERT INTO marches (
    numero, objet, type_marche, statut,
    montant_initial_ht, montant_initial_ttc, taux_tva,
    retenue_garantie_pct,
    date_marche, date_notification, date_os, date_debut, date_fin_prevue,
    convention_id, fournisseur_id,
    actif
) VALUES (
    'M-2024-006',
    'Plateforme Digitale Unifiée Services Publics - Phase 2',
    'SERVICES',
    'EN_COURS',
    708333333.33,
    850000000.00,
    20.00,
    5.00,
    '2024-02-01',
    '2024-02-10',
    '2024-02-15',
    '2024-02-20',
    '2025-12-31',
    (SELECT id FROM conventions WHERE code = 'CONV-DIGIT-2024'),
    (SELECT id FROM fournisseurs WHERE ice = '002456789012345'),
    true
);

INSERT INTO marche_lignes (
    marche_id, numero, libelle, description,
    quantite, unite, prix_unitaire_ht,
    montant_ht, montant_tva, montant_ttc,
    dimensions_valeurs
) VALUES
    (
        (SELECT id FROM marches WHERE numero = 'M-2024-006'),
        'L-001',
        'Développement plateforme web et mobile',
        'Applications web responsive et apps iOS/Android',
        1.00,
        'FORFAIT',
        250000000.00,
        250000000.00,
        50000000.00,
        300000000.00,
        '{
            "BUDGET": "BG-2024-03",
            "PROJET": "PRJ-DIGIT-2024",
            "SECTEUR": "SEC-DIGIT",
            "REGION": "REG-RABAT",
            "PHASE": "PH-EQUIP"
        }'::jsonb
    ),
    (
        (SELECT id FROM marches WHERE numero = 'M-2024-006'),
        'L-002',
        'Infrastructure Cloud et Cybersécurité',
        'Infrastructure cloud souverain et systèmes de sécurité',
        1.00,
        'FORFAIT',
        300000000.00,
        300000000.00,
        60000000.00,
        360000000.00,
        '{
            "BUDGET": "BG-2024-03",
            "PROJET": "PRJ-DIGIT-2024",
            "SECTEUR": "SEC-DIGIT",
            "REGION": "REG-RABAT",
            "PHASE": "PH-EQUIP"
        }'::jsonb
    ),
    (
        (SELECT id FROM marches WHERE numero = 'M-2024-006'),
        'L-003',
        'Intégration et migration données',
        'Migration des systèmes legacy et intégration API',
        1.00,
        'FORFAIT',
        158333333.33,
        158333333.33,
        31666666.67,
        190000000.00,
        '{
            "BUDGET": "BG-2024-03",
            "PROJET": "PRJ-DIGIT-2024",
            "SECTEUR": "SEC-DIGIT",
            "REGION": "REG-RABAT",
            "PHASE": "PH-EXPLOIT"
        }'::jsonb
    );

-- ========================================================================================================
-- 6. AVENANTS (Modifications de marchés)
-- ========================================================================================================

-- Avenant pour le marché M-2024-001
INSERT INTO marche_avenants (
    marche_id, numero, objet, type_avenant,
    montant_supplementaire_ht, montant_supplementaire_ttc,
    delai_supplementaire_jours,
    date_avenant, date_approbation,
    statut, actif
) VALUES (
    (SELECT id FROM marches WHERE numero = 'M-2024-001'),
    'AV-M-2024-001-01',
    'Extension du périmètre: ajout de 2 échangeurs supplémentaires',
    'TECHNIQUE',
    125000000.00,
    150000000.00,
    60,
    '2024-06-15',
    '2024-06-25',
    'APPROUVE',
    true
);

-- Avenant pour le marché M-2024-004 (Centrale solaire)
INSERT INTO marche_avenants (
    marche_id, numero, objet, type_avenant,
    montant_supplementaire_ht, montant_supplementaire_ttc,
    delai_supplementaire_jours,
    date_avenant, date_approbation,
    statut, actif
) VALUES (
    (SELECT id FROM marches WHERE numero = 'M-2024-004'),
    'AV-M-2024-004-01',
    'Augmentation capacité de 500 MW à 550 MW',
    'AUGMENTATION',
    208333333.33,
    250000000.00,
    45,
    '2024-08-01',
    '2024-08-10',
    'APPROUVE',
    true
);

-- ========================================================================================================
-- RÉSUMÉ DES DONNÉES CRÉÉES
-- ========================================================================================================

-- Afficher le résumé
DO $$
BEGIN
    RAISE NOTICE '========================================================================================================';
    RAISE NOTICE 'DONNÉES FICTIVES CRÉÉES AVEC SUCCÈS';
    RAISE NOTICE '========================================================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Plan Analytique:';
    RAISE NOTICE '  - % dimensions créées', (SELECT COUNT(*) FROM dimensions);
    RAISE NOTICE '  - % valeurs de dimensions créées', (SELECT COUNT(*) FROM dimension_valeurs);
    RAISE NOTICE '';
    RAISE NOTICE 'Référentiel:';
    RAISE NOTICE '  - % projets créés', (SELECT COUNT(*) FROM projets);
    RAISE NOTICE '  - % fournisseurs créés', (SELECT COUNT(*) FROM fournisseurs);
    RAISE NOTICE '  - % conventions créées', (SELECT COUNT(*) FROM conventions);
    RAISE NOTICE '';
    RAISE NOTICE 'Marchés:';
    RAISE NOTICE '  - % marchés créés', (SELECT COUNT(*) FROM marches);
    RAISE NOTICE '  - % lignes de marché créées', (SELECT COUNT(*) FROM marche_lignes);
    RAISE NOTICE '  - % avenants créés', (SELECT COUNT(*) FROM marche_avenants);
    RAISE NOTICE '';
    RAISE NOTICE 'Montants totaux:';
    RAISE NOTICE '  - Budget total conventions: % MAD', (SELECT TO_CHAR(SUM(budget), '999,999,999,999.99') FROM conventions);
    RAISE NOTICE '  - Montant total marchés HT: % MAD', (SELECT TO_CHAR(SUM(montant_initial_ht), '999,999,999,999.99') FROM marches);
    RAISE NOTICE '  - Montant total marchés TTC: % MAD', (SELECT TO_CHAR(SUM(montant_initial_ttc), '999,999,999,999.99') FROM marches);
    RAISE NOTICE '';
    RAISE NOTICE '========================================================================================================';
END $$;
