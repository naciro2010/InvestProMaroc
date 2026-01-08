-- ========================================================================================================
-- V6__seed_dimensions_analytiques.sql
-- InvestPro Maroc - Seed Dimensions Analytiques & Valeurs pour tests
-- ========================================================================================================

-- Insert Dimensions Analytiques
INSERT INTO dimensions_analytiques (code, nom, description, ordre, active, obligatoire) VALUES
('AXE', 'Axe Stratégique', 'Axes stratégiques de développement', 1, true, true),
('PROJET', 'Projet', 'Projets d''intervention', 2, true, true),
('VOLET', 'Volet/Composante', 'Volets ou composantes des programmes', 3, true, false),
('REGION', 'Région', 'Régions administratives du Maroc', 4, true, false),
('SECTEUR', 'Secteur d''Activité', 'Secteurs économiques ciblés', 5, true, false)
ON CONFLICT (code) DO NOTHING;

-- Insert Valeurs pour AXE
INSERT INTO valeurs_dimensions (dimension_id, code, libelle, description, ordre, active)
SELECT d.id, 'AXE-01', 'Développement Territorial', 'Développement des territoires et infrastructures', 1, true
FROM dimensions_analytiques d WHERE d.code = 'AXE'
ON CONFLICT DO NOTHING;

INSERT INTO valeurs_dimensions (dimension_id, code, libelle, description, ordre, active)
SELECT d.id, 'AXE-02', 'Capital Humain', 'Formation et développement des compétences', 2, true
FROM dimensions_analytiques d WHERE d.code = 'AXE'
ON CONFLICT DO NOTHING;

INSERT INTO valeurs_dimensions (dimension_id, code, libelle, description, ordre, active)
SELECT d.id, 'AXE-03', 'Innovation & Digitalisation', 'Transformation numérique et innovation', 3, true
FROM dimensions_analytiques d WHERE d.code = 'AXE'
ON CONFLICT DO NOTHING;

INSERT INTO valeurs_dimensions (dimension_id, code, libelle, description, ordre, active)
SELECT d.id, 'AXE-04', 'Développement Durable', 'Environnement et développement durable', 4, true
FROM dimensions_analytiques d WHERE d.code = 'AXE'
ON CONFLICT DO NOTHING;

-- Insert Valeurs pour PROJET
INSERT INTO valeurs_dimensions (dimension_id, code, libelle, description, ordre, active)
SELECT d.id, 'PROJ-2024-001', 'Infrastructures Routières 2024', 'Programme de modernisation des routes', 1, true
FROM dimensions_analytiques d WHERE d.code = 'PROJET'
ON CONFLICT DO NOTHING;

INSERT INTO valeurs_dimensions (dimension_id, code, libelle, description, ordre, active)
SELECT d.id, 'PROJ-2024-002', 'Écoles Numériques', 'Digitalisation des établissements scolaires', 2, true
FROM dimensions_analytiques d WHERE d.code = 'PROJET'
ON CONFLICT DO NOTHING;

INSERT INTO valeurs_dimensions (dimension_id, code, libelle, description, ordre, active)
SELECT d.id, 'PROJ-2024-003', 'Centres de Santé Rurale', 'Construction et équipement centres santé', 3, true
FROM dimensions_analytiques d WHERE d.code = 'PROJET'
ON CONFLICT DO NOTHING;

INSERT INTO valeurs_dimensions (dimension_id, code, libelle, description, ordre, active)
SELECT d.id, 'PROJ-2024-004', 'Smart Cities', 'Villes intelligentes et connectées', 4, true
FROM dimensions_analytiques d WHERE d.code = 'PROJET'
ON CONFLICT DO NOTHING;

INSERT INTO valeurs_dimensions (dimension_id, code, libelle, description, ordre, active)
SELECT d.id, 'PROJ-2024-005', 'Agriculture Durable', 'Modernisation agricole et irrigation', 5, true
FROM dimensions_analytiques d WHERE d.code = 'PROJET'
ON CONFLICT DO NOTHING;

-- Insert Valeurs pour VOLET
INSERT INTO valeurs_dimensions (dimension_id, code, libelle, description, ordre, active)
SELECT d.id, 'VOL-01', 'Infrastructure', 'Travaux d''infrastructure', 1, true
FROM dimensions_analytiques d WHERE d.code = 'VOLET'
ON CONFLICT DO NOTHING;

INSERT INTO valeurs_dimensions (dimension_id, code, libelle, description, ordre, active)
SELECT d.id, 'VOL-02', 'Équipement', 'Acquisition et installation d''équipements', 2, true
FROM dimensions_analytiques d WHERE d.code = 'VOLET'
ON CONFLICT DO NOTHING;

INSERT INTO valeurs_dimensions (dimension_id, code, libelle, description, ordre, active)
SELECT d.id, 'VOL-03', 'Formation', 'Formation et renforcement des capacités', 3, true
FROM dimensions_analytiques d WHERE d.code = 'VOLET'
ON CONFLICT DO NOTHING;

INSERT INTO valeurs_dimensions (dimension_id, code, libelle, description, ordre, active)
SELECT d.id, 'VOL-04', 'Assistance Technique', 'Support technique et conseil', 4, true
FROM dimensions_analytiques d WHERE d.code = 'VOLET'
ON CONFLICT DO NOTHING;

-- Insert Valeurs pour REGION
INSERT INTO valeurs_dimensions (dimension_id, code, libelle, description, ordre, active)
SELECT d.id, 'REG-01', 'Casablanca-Settat', 'Région du Grand Casablanca', 1, true
FROM dimensions_analytiques d WHERE d.code = 'REGION'
ON CONFLICT DO NOTHING;

INSERT INTO valeurs_dimensions (dimension_id, code, libelle, description, ordre, active)
SELECT d.id, 'REG-02', 'Rabat-Salé-Kénitra', 'Région de la capitale', 2, true
FROM dimensions_analytiques d WHERE d.code = 'REGION'
ON CONFLICT DO NOTHING;

INSERT INTO valeurs_dimensions (dimension_id, code, libelle, description, ordre, active)
SELECT d.id, 'REG-03', 'Marrakech-Safi', 'Région touristique du centre', 3, true
FROM dimensions_analytiques d WHERE d.code = 'REGION'
ON CONFLICT DO NOTHING;

INSERT INTO valeurs_dimensions (dimension_id, code, libelle, description, ordre, active)
SELECT d.id, 'REG-04', 'Fès-Meknès', 'Région historique et culturelle', 4, true
FROM dimensions_analytiques d WHERE d.code = 'REGION'
ON CONFLICT DO NOTHING;

INSERT INTO valeurs_dimensions (dimension_id, code, libelle, description, ordre, active)
SELECT d.id, 'REG-05', 'Tanger-Tétouan-Al Hoceïma', 'Région du nord', 5, true
FROM dimensions_analytiques d WHERE d.code = 'REGION'
ON CONFLICT DO NOTHING;

-- Insert Valeurs pour SECTEUR
INSERT INTO valeurs_dimensions (dimension_id, code, libelle, description, ordre, active)
SELECT d.id, 'SECT-01', 'Éducation', 'Secteur éducatif et formation', 1, true
FROM dimensions_analytiques d WHERE d.code = 'SECTEUR'
ON CONFLICT DO NOTHING;

INSERT INTO valeurs_dimensions (dimension_id, code, libelle, description, ordre, active)
SELECT d.id, 'SECT-02', 'Santé', 'Secteur de la santé publique', 2, true
FROM dimensions_analytiques d WHERE d.code = 'SECTEUR'
ON CONFLICT DO NOTHING;

INSERT INTO valeurs_dimensions (dimension_id, code, libelle, description, ordre, active)
SELECT d.id, 'SECT-03', 'Infrastructure', 'Routes, ponts, réseaux', 3, true
FROM dimensions_analytiques d WHERE d.code = 'SECTEUR'
ON CONFLICT DO NOTHING;

INSERT INTO valeurs_dimensions (dimension_id, code, libelle, description, ordre, active)
SELECT d.id, 'SECT-04', 'Agriculture', 'Secteur agricole et rural', 4, true
FROM dimensions_analytiques d WHERE d.code = 'SECTEUR'
ON CONFLICT DO NOTHING;

INSERT INTO valeurs_dimensions (dimension_id, code, libelle, description, ordre, active)
SELECT d.id, 'SECT-05', 'Tourisme', 'Développement touristique', 5, true
FROM dimensions_analytiques d WHERE d.code = 'SECTEUR'
ON CONFLICT DO NOTHING;

INSERT INTO valeurs_dimensions (dimension_id, code, libelle, description, ordre, active)
SELECT d.id, 'SECT-06', 'Industrie', 'Secteur industriel et manufacturier', 6, true
FROM dimensions_analytiques d WHERE d.code = 'SECTEUR'
ON CONFLICT DO NOTHING;
