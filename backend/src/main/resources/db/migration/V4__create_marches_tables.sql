-- Migration V4: Create Marchés, Bons de Commande, and Décomptes tables
-- Date: 2025-12-27
-- Description: Create procurement/market management tables with relationships

-- =====================================================
-- Table: marches (Marchés publics/Contrats)
-- =====================================================
CREATE TABLE IF NOT EXISTS marches (
    id BIGSERIAL PRIMARY KEY,
    numero_marche VARCHAR(100) NOT NULL UNIQUE,
    num_ao VARCHAR(100),
    date_marche DATE NOT NULL,
    fournisseur_id BIGINT NOT NULL,
    projet_id BIGINT NOT NULL,
    objet TEXT NOT NULL,
    montant_ht DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    taux_tva DECIMAL(5,2) NOT NULL DEFAULT 20.00,
    montant_tva DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    montant_ttc DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    statut VARCHAR(20) NOT NULL DEFAULT 'EN_COURS',
    date_debut DATE,
    date_fin_prevue DATE,
    delai_execution_mois INTEGER,
    retenue_garantie DECIMAL(15,2) DEFAULT 0.00,
    remarques TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_marches_fournisseur FOREIGN KEY (fournisseur_id)
        REFERENCES fournisseurs(id) ON DELETE RESTRICT,
    CONSTRAINT fk_marches_projet FOREIGN KEY (projet_id)
        REFERENCES projets(id) ON DELETE RESTRICT,
    CONSTRAINT chk_marches_statut CHECK (statut IN
        ('EN_COURS', 'VALIDE', 'TERMINE', 'SUSPENDU', 'ANNULE', 'EN_ATTENTE')),
    CONSTRAINT chk_marches_montants CHECK (
        montant_ht >= 0 AND montant_tva >= 0 AND montant_ttc >= 0 AND retenue_garantie >= 0
    )
);

-- =====================================================
-- Table: bons_commande (Purchase Orders)
-- =====================================================
CREATE TABLE IF NOT EXISTS bons_commande (
    id BIGSERIAL PRIMARY KEY,
    numero VARCHAR(100) NOT NULL UNIQUE,
    marche_id BIGINT NOT NULL,
    fournisseur_id BIGINT NOT NULL,
    num_consultation VARCHAR(100),
    date_bon_commande DATE NOT NULL,
    date_approbation DATE,
    objet TEXT,
    montant_ht DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    taux_tva DECIMAL(5,2) NOT NULL DEFAULT 20.00,
    montant_tva DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    montant_ttc DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    statut VARCHAR(20) NOT NULL DEFAULT 'EN_ATTENTE',
    remarques TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bons_commande_marche FOREIGN KEY (marche_id)
        REFERENCES marches(id) ON DELETE CASCADE,
    CONSTRAINT fk_bons_commande_fournisseur FOREIGN KEY (fournisseur_id)
        REFERENCES fournisseurs(id) ON DELETE RESTRICT,
    CONSTRAINT chk_bons_commande_statut CHECK (statut IN
        ('EN_ATTENTE', 'APPROUVE', 'EN_COURS', 'LIVRE', 'ANNULE')),
    CONSTRAINT chk_bons_commande_montants CHECK (
        montant_ht >= 0 AND montant_tva >= 0 AND montant_ttc >= 0
    )
);

-- =====================================================
-- Table: decomptes (Invoices/Progress Statements)
-- =====================================================
CREATE TABLE IF NOT EXISTS decomptes (
    id BIGSERIAL PRIMARY KEY,
    numero_decompte VARCHAR(100) NOT NULL,
    marche_id BIGINT NOT NULL,
    fournisseur_id BIGINT NOT NULL,
    date_decompte DATE NOT NULL,
    type_decompte VARCHAR(20) NOT NULL DEFAULT 'PROVISOIRE',
    numero_situation INTEGER,
    montant_ht DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    taux_tva DECIMAL(5,2) NOT NULL DEFAULT 20.00,
    montant_tva DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    montant_ttc DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    retenue_garantie DECIMAL(15,2) DEFAULT 0.00,
    taux_retenue_garantie DECIMAL(5,2) DEFAULT 10.00,
    cumul_anterieur DECIMAL(15,2) DEFAULT 0.00,
    cumul_actuel DECIMAL(15,2) DEFAULT 0.00,
    taux_avancement DECIMAL(5,2),
    statut VARCHAR(20) NOT NULL DEFAULT 'EN_COURS',
    date_validation DATE,
    date_paiement DATE,
    remarques TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_decomptes_marche FOREIGN KEY (marche_id)
        REFERENCES marches(id) ON DELETE CASCADE,
    CONSTRAINT fk_decomptes_fournisseur FOREIGN KEY (fournisseur_id)
        REFERENCES fournisseurs(id) ON DELETE RESTRICT,
    CONSTRAINT chk_decomptes_type CHECK (type_decompte IN
        ('PROVISOIRE', 'DEFINITIF', 'FINAL')),
    CONSTRAINT chk_decomptes_statut CHECK (statut IN
        ('EN_COURS', 'SOUMIS', 'VALIDE', 'PAYE', 'REJETE', 'ANNULE')),
    CONSTRAINT chk_decomptes_montants CHECK (
        montant_ht >= 0 AND montant_tva >= 0 AND montant_ttc >= 0 AND
        retenue_garantie >= 0 AND cumul_anterieur >= 0 AND cumul_actuel >= 0
    ),
    CONSTRAINT chk_decomptes_avancement CHECK (
        taux_avancement IS NULL OR (taux_avancement >= 0 AND taux_avancement <= 100)
    )
);

-- =====================================================
-- Indexes for performance
-- =====================================================

-- Marchés indexes
CREATE INDEX idx_marches_numero ON marches(numero_marche);
CREATE INDEX idx_marches_num_ao ON marches(num_ao);
CREATE INDEX idx_marches_fournisseur ON marches(fournisseur_id);
CREATE INDEX idx_marches_projet ON marches(projet_id);
CREATE INDEX idx_marches_statut ON marches(statut);
CREATE INDEX idx_marches_date ON marches(date_marche);

-- Bons de commande indexes
CREATE INDEX idx_bons_commande_numero ON bons_commande(numero);
CREATE INDEX idx_bons_commande_marche ON bons_commande(marche_id);
CREATE INDEX idx_bons_commande_fournisseur ON bons_commande(fournisseur_id);
CREATE INDEX idx_bons_commande_date ON bons_commande(date_bon_commande);

-- Décomptes indexes
CREATE INDEX idx_decomptes_numero ON decomptes(numero_decompte);
CREATE INDEX idx_decomptes_marche ON decomptes(marche_id);
CREATE INDEX idx_decomptes_fournisseur ON decomptes(fournisseur_id);
CREATE INDEX idx_decomptes_date ON decomptes(date_decompte);
CREATE INDEX idx_decomptes_type ON decomptes(type_decompte);

-- =====================================================
-- Comments for documentation
-- =====================================================

-- Marchés
COMMENT ON TABLE marches IS 'Marchés publics et contrats de procurement';
COMMENT ON COLUMN marches.numero_marche IS 'Numéro unique du marché';
COMMENT ON COLUMN marches.num_ao IS 'Numéro d''appel d''offres';
COMMENT ON COLUMN marches.statut IS 'EN_COURS, VALIDE, TERMINE, SUSPENDU, ANNULE, EN_ATTENTE';
COMMENT ON COLUMN marches.delai_execution_mois IS 'Délai d''exécution en mois';
COMMENT ON COLUMN marches.retenue_garantie IS 'Montant de la retenue de garantie';

-- Bons de commande
COMMENT ON TABLE bons_commande IS 'Bons de commande liés aux marchés';
COMMENT ON COLUMN bons_commande.num_consultation IS 'Numéro de consultation';
COMMENT ON COLUMN bons_commande.statut IS 'EN_ATTENTE, APPROUVE, EN_COURS, LIVRE, ANNULE';

-- Décomptes
COMMENT ON TABLE decomptes IS 'Décomptes/Factures progressives pour les marchés';
COMMENT ON COLUMN decomptes.type_decompte IS 'PROVISOIRE, DEFINITIF, FINAL';
COMMENT ON COLUMN decomptes.numero_situation IS 'Numéro de situation (1, 2, 3, ...)';
COMMENT ON COLUMN decomptes.retenue_garantie IS 'Montant de retenue de garantie pour ce décompte';
COMMENT ON COLUMN decomptes.taux_retenue_garantie IS 'Taux de retenue de garantie (généralement 10%)';
COMMENT ON COLUMN decomptes.cumul_anterieur IS 'Cumul des décomptes précédents';
COMMENT ON COLUMN decomptes.cumul_actuel IS 'Cumul incluant le décompte actuel';
COMMENT ON COLUMN decomptes.taux_avancement IS 'Pourcentage d''avancement du marché (0-100%)';
COMMENT ON COLUMN decomptes.statut IS 'EN_COURS, SOUMIS, VALIDE, PAYE, REJETE, ANNULE';
