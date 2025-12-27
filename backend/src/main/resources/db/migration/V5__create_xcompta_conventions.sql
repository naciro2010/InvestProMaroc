-- Migration V5: Extension XCOMPTA des Conventions
-- Ajoute les champs XCOMPTA à la table conventions et crée les tables associées

-- =====================================================
-- 1. Modifier la table conventions existante
-- =====================================================

-- Ajouter les nouveaux champs XCOMPTA
ALTER TABLE conventions ADD COLUMN IF NOT EXISTS numero VARCHAR(100) UNIQUE NOT NULL DEFAULT '';
ALTER TABLE conventions ADD COLUMN IF NOT EXISTS date_convention DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE conventions ADD COLUMN IF NOT EXISTS type_convention VARCHAR(20) NOT NULL DEFAULT 'CADRE';
ALTER TABLE conventions ADD COLUMN IF NOT EXISTS statut VARCHAR(20) NOT NULL DEFAULT 'EN_COURS';
ALTER TABLE conventions ADD COLUMN IF NOT EXISTS objet TEXT;
ALTER TABLE conventions ADD COLUMN IF NOT EXISTS budget DECIMAL(15,2) NOT NULL DEFAULT 0;

-- Modifier base_calcul pour accepter les valeurs XCOMPTA
ALTER TABLE conventions ALTER COLUMN base_calcul TYPE VARCHAR(20);
UPDATE conventions SET base_calcul = 'DECAISSEMENTS_TTC' WHERE base_calcul = 'TTC';
UPDATE conventions SET base_calcul = 'DECAISSEMENTS_HT' WHERE base_calcul = 'HT';

-- Créer les index pour les nouveaux champs
CREATE INDEX IF NOT EXISTS idx_conventions_numero ON conventions(numero);
CREATE INDEX IF NOT EXISTS idx_conventions_type ON conventions(type_convention);
CREATE INDEX IF NOT EXISTS idx_conventions_statut ON conventions(statut);

-- Ajouter des commentaires
COMMENT ON COLUMN conventions.numero IS 'Numéro unique de la convention (ex: CONV-2024-001)';
COMMENT ON COLUMN conventions.date_convention IS 'Date de signature de la convention';
COMMENT ON COLUMN conventions.type_convention IS 'Type: CADRE, NON_CADRE, SPECIFIQUE, AVENANT';
COMMENT ON COLUMN conventions.statut IS 'Statut: VALIDEE, EN_COURS, ACHEVE, EN_RETARD, ANNULE';
COMMENT ON COLUMN conventions.objet IS 'Description détaillée de l''objet de la convention';
COMMENT ON COLUMN conventions.budget IS 'Budget total alloué en DH (affiché en M DH dans l''interface)';
COMMENT ON COLUMN conventions.base_calcul IS 'Base de calcul: DECAISSEMENTS_TTC ou DECAISSEMENTS_HT';

-- =====================================================
-- 2. Créer la table partenaires
-- =====================================================

CREATE TABLE IF NOT EXISTS partenaires (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    raison_sociale VARCHAR(200) NOT NULL,
    sigle VARCHAR(100),
    type_partenaire VARCHAR(50),
    email VARCHAR(100),
    telephone VARCHAR(20),
    adresse TEXT,
    description TEXT,
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

CREATE INDEX idx_partenaires_code ON partenaires(code);
CREATE INDEX idx_partenaires_actif ON partenaires(actif);

COMMENT ON TABLE partenaires IS 'Organismes partenaires (Ministères, Agences, Bailleurs)';
COMMENT ON COLUMN partenaires.code IS 'Code unique du partenaire';
COMMENT ON COLUMN partenaires.raison_sociale IS 'Nom complet de l''organisme';
COMMENT ON COLUMN partenaires.sigle IS 'Sigle/Acronyme (ex: AFD, BM, MASEN)';
COMMENT ON COLUMN partenaires.type_partenaire IS 'Type: Ministère, Agence, Bailleur, etc.';

-- =====================================================
-- 3. Créer la table convention_partenaires
-- =====================================================

CREATE TABLE IF NOT EXISTS convention_partenaires (
    id BIGSERIAL PRIMARY KEY,
    convention_id BIGINT NOT NULL REFERENCES conventions(id) ON DELETE CASCADE,
    partenaire_id BIGINT NOT NULL REFERENCES partenaires(id) ON DELETE CASCADE,
    budget_alloue DECIMAL(15,2) NOT NULL DEFAULT 0,
    pourcentage DECIMAL(5,2) NOT NULL DEFAULT 0,
    commission_intervention DECIMAL(15,2),
    est_maitre_oeuvre BOOLEAN NOT NULL DEFAULT FALSE,
    est_maitre_oeuvre_delegue BOOLEAN NOT NULL DEFAULT FALSE,
    remarques TEXT,
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    CONSTRAINT uk_convention_partenaire UNIQUE (convention_id, partenaire_id)
);

CREATE INDEX idx_convention_partenaires_convention ON convention_partenaires(convention_id);
CREATE INDEX idx_convention_partenaires_partenaire ON convention_partenaires(partenaire_id);

COMMENT ON TABLE convention_partenaires IS 'Liaison Convention-Partenaire avec allocations budgétaires';
COMMENT ON COLUMN convention_partenaires.budget_alloue IS 'Budget alloué au partenaire en DH';
COMMENT ON COLUMN convention_partenaires.pourcentage IS 'Pourcentage du budget total (0-100)';
COMMENT ON COLUMN convention_partenaires.commission_intervention IS 'Commission d''intervention = budget × taux';
COMMENT ON COLUMN convention_partenaires.est_maitre_oeuvre IS 'Partenaire est Maître d''Œuvre (MO)';
COMMENT ON COLUMN convention_partenaires.est_maitre_oeuvre_delegue IS 'Partenaire est Maître d''Œuvre Délégué (MOD)';

-- =====================================================
-- 4. Créer la table imputations_previsionnelles
-- =====================================================

CREATE TABLE IF NOT EXISTS imputations_previsionnelles (
    id BIGSERIAL PRIMARY KEY,
    convention_id BIGINT NOT NULL REFERENCES conventions(id) ON DELETE CASCADE,
    axe_analytique_id BIGINT NOT NULL REFERENCES axes_analytiques(id) ON DELETE RESTRICT,
    projet_id BIGINT NOT NULL REFERENCES projets(id) ON DELETE RESTRICT,
    volet VARCHAR(200),
    date_demarrage DATE NOT NULL,
    delai_mois INTEGER NOT NULL DEFAULT 12,
    date_fin_prevue DATE,
    remarques TEXT,
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

CREATE INDEX idx_imputations_convention ON imputations_previsionnelles(convention_id);
CREATE INDEX idx_imputations_axe ON imputations_previsionnelles(axe_analytique_id);
CREATE INDEX idx_imputations_projet ON imputations_previsionnelles(projet_id);

COMMENT ON TABLE imputations_previsionnelles IS 'Répartition budgétaire prévisionnelle par axe/projet';
COMMENT ON COLUMN imputations_previsionnelles.volet IS 'Segment/Composante du projet';
COMMENT ON COLUMN imputations_previsionnelles.delai_mois IS 'Durée d''exécution en mois';
COMMENT ON COLUMN imputations_previsionnelles.date_fin_prevue IS 'Date fin calculée = date_demarrage + delai_mois';

-- =====================================================
-- 5. Créer la table versements_previsionnels
-- =====================================================

CREATE TABLE IF NOT EXISTS versements_previsionnels (
    id BIGSERIAL PRIMARY KEY,
    convention_id BIGINT NOT NULL REFERENCES conventions(id) ON DELETE CASCADE,
    axe_analytique_id BIGINT NOT NULL REFERENCES axes_analytiques(id) ON DELETE RESTRICT,
    projet_id BIGINT NOT NULL REFERENCES projets(id) ON DELETE RESTRICT,
    volet VARCHAR(200),
    date_versement DATE NOT NULL,
    montant DECIMAL(15,2) NOT NULL DEFAULT 0,
    partenaire_id BIGINT NOT NULL REFERENCES partenaires(id) ON DELETE RESTRICT,
    mod_id BIGINT REFERENCES partenaires(id) ON DELETE SET NULL,
    remarques TEXT,
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

CREATE INDEX idx_versements_convention ON versements_previsionnels(convention_id);
CREATE INDEX idx_versements_axe ON versements_previsionnels(axe_analytique_id);
CREATE INDEX idx_versements_projet ON versements_previsionnels(projet_id);
CREATE INDEX idx_versements_partenaire ON versements_previsionnels(partenaire_id);
CREATE INDEX idx_versements_date ON versements_previsionnels(date_versement);

COMMENT ON TABLE versements_previsionnels IS 'Planification des paiements prévisionnels';
COMMENT ON COLUMN versements_previsionnels.volet IS 'Segment/Composante';
COMMENT ON COLUMN versements_previsionnels.montant IS 'Montant du versement en DH';
COMMENT ON COLUMN versements_previsionnels.partenaire_id IS 'Partenaire bénéficiaire du versement';
COMMENT ON COLUMN versements_previsionnels.mod_id IS 'Maître d''Œuvre Délégué responsable (optionnel)';

-- =====================================================
-- 6. Données de test pour les partenaires
-- =====================================================

INSERT INTO partenaires (code, raison_sociale, sigle, type_partenaire, email, telephone, description) VALUES
('PART-001', 'Agence Française de Développement', 'AFD', 'Bailleur International', 'contact@afd.fr', '+33 1 53 44 31 31', 'Bailleur de fonds international'),
('PART-002', 'Banque Mondiale', 'BM', 'Bailleur International', 'info@worldbank.org', '+1 202 473 1000', 'Institution financière internationale'),
('PART-003', 'Ministère de l''Économie et des Finances', 'MEF', 'Ministère', 'contact@mef.gov.ma', '+212 537 67 74 00', 'Ministère marocain'),
('PART-004', 'Agence Marocaine pour l''Énergie Durable', 'MASEN', 'Agence Publique', 'contact@masen.ma', '+212 537 57 71 30', 'Agence publique marocaine')
ON CONFLICT (code) DO NOTHING;
