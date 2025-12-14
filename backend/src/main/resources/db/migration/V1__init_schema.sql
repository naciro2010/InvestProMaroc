-- =====================================================
-- InvestPro Maroc - Migration initiale
-- Création des tables pour la gestion des dépenses d'investissement
-- =====================================================

-- Table: conventions
CREATE TABLE conventions (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    libelle VARCHAR(200) NOT NULL,
    taux_commission DECIMAL(5, 2) NOT NULL CHECK (taux_commission >= 0 AND taux_commission <= 100),
    base_calcul VARCHAR(10) NOT NULL CHECK (base_calcul IN ('HT', 'TTC', 'AUTRE')),
    taux_tva DECIMAL(5, 2) NOT NULL DEFAULT 20.00 CHECK (taux_tva >= 0),
    date_debut DATE NOT NULL,
    date_fin DATE,
    description TEXT,
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_convention_dates CHECK (date_fin IS NULL OR date_fin >= date_debut)
);

CREATE INDEX idx_conventions_code ON conventions(code);
CREATE INDEX idx_conventions_actif ON conventions(actif);
CREATE INDEX idx_conventions_dates ON conventions(date_debut, date_fin);

COMMENT ON TABLE conventions IS 'Conventions de commissions d''intervention';
COMMENT ON COLUMN conventions.base_calcul IS 'Base de calcul: HT, TTC ou AUTRE';
COMMENT ON COLUMN conventions.taux_tva IS 'Taux de TVA en pourcentage (défaut 20% pour le Maroc)';

-- Table: projets
CREATE TABLE projets (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    nom VARCHAR(200) NOT NULL,
    description TEXT,
    responsable VARCHAR(100),
    statut VARCHAR(50),
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projets_code ON projets(code);
CREATE INDEX idx_projets_actif ON projets(actif);
CREATE INDEX idx_projets_statut ON projets(statut);

COMMENT ON TABLE projets IS 'Projets d''investissement';

-- Table: fournisseurs
CREATE TABLE fournisseurs (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    raison_sociale VARCHAR(200) NOT NULL,
    identifiant_fiscal VARCHAR(20),
    ice VARCHAR(15) UNIQUE,
    adresse TEXT,
    ville VARCHAR(100),
    telephone VARCHAR(20),
    fax VARCHAR(20),
    email VARCHAR(150),
    contact VARCHAR(100),
    non_resident BOOLEAN NOT NULL DEFAULT FALSE,
    remarques TEXT,
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_fournisseur_ice CHECK (ice IS NULL OR ice ~ '^[0-9]{15}$'),
    CONSTRAINT chk_fournisseur_if CHECK (identifiant_fiscal IS NULL OR identifiant_fiscal ~ '^[0-9]*$')
);

CREATE INDEX idx_fournisseurs_code ON fournisseurs(code);
CREATE INDEX idx_fournisseurs_ice ON fournisseurs(ice);
CREATE INDEX idx_fournisseurs_actif ON fournisseurs(actif);
CREATE INDEX idx_fournisseurs_non_resident ON fournisseurs(non_resident);

COMMENT ON TABLE fournisseurs IS 'Fournisseurs';
COMMENT ON COLUMN fournisseurs.identifiant_fiscal IS 'Identifiant Fiscal (IF)';
COMMENT ON COLUMN fournisseurs.ice IS 'Identifiant Commun de l''Entreprise (15 chiffres)';
COMMENT ON COLUMN fournisseurs.non_resident IS 'Fournisseur non-résident (IS tiers 10%)';

-- Table: axes_analytiques
CREATE TABLE axes_analytiques (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    libelle VARCHAR(200) NOT NULL,
    type VARCHAR(50),
    description TEXT,
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_axes_analytiques_code ON axes_analytiques(code);
CREATE INDEX idx_axes_analytiques_actif ON axes_analytiques(actif);
CREATE INDEX idx_axes_analytiques_type ON axes_analytiques(type);

COMMENT ON TABLE axes_analytiques IS 'Axes analytiques (départements, centres de coûts, activités, etc.)';

-- Table: comptes_bancaires
CREATE TABLE comptes_bancaires (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    rib VARCHAR(24) NOT NULL UNIQUE,
    banque VARCHAR(200) NOT NULL,
    agence VARCHAR(200),
    type_compte VARCHAR(50),
    titulaire VARCHAR(200),
    devise VARCHAR(10) DEFAULT 'MAD',
    remarques TEXT,
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_compte_rib CHECK (rib ~ '^[0-9]{24}$')
);

CREATE INDEX idx_comptes_bancaires_code ON comptes_bancaires(code);
CREATE INDEX idx_comptes_bancaires_rib ON comptes_bancaires(rib);
CREATE INDEX idx_comptes_bancaires_actif ON comptes_bancaires(actif);

COMMENT ON TABLE comptes_bancaires IS 'Comptes bancaires';
COMMENT ON COLUMN comptes_bancaires.rib IS 'RIB format marocain (24 chiffres)';

-- Table: depenses_investissement
CREATE TABLE depenses_investissement (
    id BIGSERIAL PRIMARY KEY,
    numero_facture VARCHAR(100) NOT NULL,
    date_facture DATE NOT NULL,
    fournisseur_id BIGINT NOT NULL REFERENCES fournisseurs(id),
    projet_id BIGINT NOT NULL REFERENCES projets(id),
    axe_analytique_id BIGINT REFERENCES axes_analytiques(id),
    convention_id BIGINT REFERENCES conventions(id),

    -- Montants facture
    montant_ht DECIMAL(15, 2) NOT NULL CHECK (montant_ht >= 0),
    taux_tva DECIMAL(5, 2) NOT NULL DEFAULT 20.00 CHECK (taux_tva >= 0),
    montant_tva DECIMAL(15, 2) NOT NULL CHECK (montant_tva >= 0),
    montant_ttc DECIMAL(15, 2) NOT NULL CHECK (montant_ttc >= 0),

    -- Références
    reference_marche VARCHAR(100),
    numero_decompte VARCHAR(100),

    -- Retenues
    retenue_tva DECIMAL(15, 2) DEFAULT 0.00 CHECK (retenue_tva >= 0),
    retenue_is_tiers DECIMAL(15, 2) DEFAULT 0.00 CHECK (retenue_is_tiers >= 0),
    retenue_non_resident DECIMAL(15, 2) DEFAULT 0.00 CHECK (retenue_non_resident >= 0),
    retenue_garantie DECIMAL(15, 2) DEFAULT 0.00 CHECK (retenue_garantie >= 0),

    -- Paiement
    date_paiement DATE,
    reference_paiement VARCHAR(100),
    compte_bancaire_id BIGINT REFERENCES comptes_bancaires(id),
    paye BOOLEAN NOT NULL DEFAULT FALSE,

    remarques TEXT,
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_depenses_numero_facture ON depenses_investissement(numero_facture);
CREATE INDEX idx_depenses_date_facture ON depenses_investissement(date_facture);
CREATE INDEX idx_depenses_fournisseur ON depenses_investissement(fournisseur_id);
CREATE INDEX idx_depenses_projet ON depenses_investissement(projet_id);
CREATE INDEX idx_depenses_axe ON depenses_investissement(axe_analytique_id);
CREATE INDEX idx_depenses_convention ON depenses_investissement(convention_id);
CREATE INDEX idx_depenses_paye ON depenses_investissement(paye);

COMMENT ON TABLE depenses_investissement IS 'Dépenses d''investissement';
COMMENT ON COLUMN depenses_investissement.retenue_garantie IS 'Retenue de garantie (généralement 10%)';
COMMENT ON COLUMN depenses_investissement.retenue_is_tiers IS 'Impôt sur les Sociétés tiers (10% pour non-résidents)';

-- Table: commissions
CREATE TABLE commissions (
    id BIGSERIAL PRIMARY KEY,
    depense_id BIGINT NOT NULL UNIQUE REFERENCES depenses_investissement(id),
    convention_id BIGINT NOT NULL REFERENCES conventions(id),
    date_calcul DATE NOT NULL,

    -- Base de calcul
    base_calcul VARCHAR(10) NOT NULL CHECK (base_calcul IN ('HT', 'TTC', 'AUTRE')),
    montant_base DECIMAL(15, 2) NOT NULL CHECK (montant_base >= 0),

    -- Taux (stockés pour historique)
    taux_commission DECIMAL(5, 2) NOT NULL CHECK (taux_commission >= 0),
    taux_tva DECIMAL(5, 2) NOT NULL CHECK (taux_tva >= 0),

    -- Montants calculés
    montant_commission_ht DECIMAL(15, 2) NOT NULL CHECK (montant_commission_ht >= 0),
    montant_tva_commission DECIMAL(15, 2) NOT NULL CHECK (montant_tva_commission >= 0),
    montant_commission_ttc DECIMAL(15, 2) NOT NULL CHECK (montant_commission_ttc >= 0),

    remarques TEXT,
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_commissions_depense ON commissions(depense_id);
CREATE INDEX idx_commissions_convention ON commissions(convention_id);
CREATE INDEX idx_commissions_date ON commissions(date_calcul);

COMMENT ON TABLE commissions IS 'Commissions d''intervention calculées';

-- Table: users
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    account_non_expired BOOLEAN NOT NULL DEFAULT TRUE,
    account_non_locked BOOLEAN NOT NULL DEFAULT TRUE,
    credentials_non_expired BOOLEAN NOT NULL DEFAULT TRUE,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

COMMENT ON TABLE users IS 'Utilisateurs du système';

-- Table: user_roles
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, role)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);

COMMENT ON TABLE user_roles IS 'Rôles des utilisateurs';

-- Trigger pour updated_at automatique
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conventions_updated_at BEFORE UPDATE ON conventions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projets_updated_at BEFORE UPDATE ON projets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fournisseurs_updated_at BEFORE UPDATE ON fournisseurs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_axes_analytiques_updated_at BEFORE UPDATE ON axes_analytiques FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comptes_bancaires_updated_at BEFORE UPDATE ON comptes_bancaires FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_depenses_investissement_updated_at BEFORE UPDATE ON depenses_investissement FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_commissions_updated_at BEFORE UPDATE ON commissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
