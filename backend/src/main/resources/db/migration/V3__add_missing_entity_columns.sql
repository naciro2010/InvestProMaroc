-- =====================================================
-- Migration V3: Ajout des colonnes manquantes
-- =====================================================
-- Ajoute toutes les colonnes présentes dans les entités Kotlin
-- mais manquantes dans le schéma SQL V1

-- =====================================================
-- 1. AVENANT_MARCHES - 10 colonnes manquantes
-- =====================================================
ALTER TABLE avenant_marches
    ADD COLUMN IF NOT EXISTS date_effet DATE,
    ADD COLUMN IF NOT EXISTS motif TEXT,
    ADD COLUMN IF NOT EXISTS date_fin_initiale DATE,
    ADD COLUMN IF NOT EXISTS date_fin_apres DATE,
    ADD COLUMN IF NOT EXISTS details_avant TEXT,
    ADD COLUMN IF NOT EXISTS details_apres TEXT,
    ADD COLUMN IF NOT EXISTS details_modifications TEXT,
    ADD COLUMN IF NOT EXISTS valide_par_id BIGINT,
    ADD COLUMN IF NOT EXISTS remarques TEXT,
    ADD COLUMN IF NOT EXISTS fichier_avenant VARCHAR(500);

-- =====================================================
-- 2. MARCHES - 1 colonne manquante
-- =====================================================
ALTER TABLE marches
    ADD COLUMN IF NOT EXISTS remarques TEXT;

-- =====================================================
-- 3. MARCHE_LIGNES - 1 colonne manquante
-- =====================================================
ALTER TABLE marche_lignes
    ADD COLUMN IF NOT EXISTS remarques TEXT;

-- =====================================================
-- 4. DECOMPTES - 7 colonnes manquantes
-- =====================================================
ALTER TABLE decomptes
    ADD COLUMN IF NOT EXISTS periode_debut DATE,
    ADD COLUMN IF NOT EXISTS periode_fin DATE,
    ADD COLUMN IF NOT EXISTS cumul_precedent DECIMAL(15,2),
    ADD COLUMN IF NOT EXISTS cumul_actuel DECIMAL(15,2),
    ADD COLUMN IF NOT EXISTS valide_par_id BIGINT,
    ADD COLUMN IF NOT EXISTS montant_paye DECIMAL(15,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS est_solde BOOLEAN DEFAULT false;

-- =====================================================
-- 5. DECOMPTE_IMPUTATIONS - 1 colonne manquante
-- =====================================================
ALTER TABLE decompte_imputations
    ADD COLUMN IF NOT EXISTS remarques TEXT;

-- =====================================================
-- 6. ORDRES_PAIEMENT - 8 colonnes manquantes
-- =====================================================
ALTER TABLE ordres_paiement
    ADD COLUMN IF NOT EXISTS date_op DATE,
    ADD COLUMN IF NOT EXISTS montant_a_payer DECIMAL(15,2),
    ADD COLUMN IF NOT EXISTS est_paiement_partiel BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS date_prevue_paiement DATE,
    ADD COLUMN IF NOT EXISTS mode_paiement VARCHAR(20),
    ADD COLUMN IF NOT EXISTS compte_bancaire_id BIGINT REFERENCES comptes_bancaires(id),
    ADD COLUMN IF NOT EXISTS date_validation DATE,
    ADD COLUMN IF NOT EXISTS valide_par_id BIGINT;

-- =====================================================
-- 7. OP_IMPUTATIONS - 1 colonne manquante
-- =====================================================
ALTER TABLE op_imputations
    ADD COLUMN IF NOT EXISTS remarques TEXT;

-- =====================================================
-- 8. PAIEMENTS - 5 colonnes manquantes
-- =====================================================
ALTER TABLE paiements
    ADD COLUMN IF NOT EXISTS reference_paiement VARCHAR(100),
    ADD COLUMN IF NOT EXISTS date_valeur DATE,
    ADD COLUMN IF NOT EXISTS date_execution DATE,
    ADD COLUMN IF NOT EXISTS est_paiement_partiel BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS compte_bancaire_id BIGINT REFERENCES comptes_bancaires(id);

-- =====================================================
-- 9. PAIEMENT_IMPUTATIONS - 4 colonnes manquantes
-- =====================================================
ALTER TABLE paiement_imputations
    ADD COLUMN IF NOT EXISTS montant_reel DECIMAL(15,2),
    ADD COLUMN IF NOT EXISTS montant_budgete DECIMAL(15,2),
    ADD COLUMN IF NOT EXISTS ecart DECIMAL(15,2),
    ADD COLUMN IF NOT EXISTS remarques TEXT;

-- =====================================================
-- 10. CONVENTIONS - 14 colonnes manquantes
-- =====================================================
ALTER TABLE conventions
    ADD COLUMN IF NOT EXISTS taux_commission DECIMAL(5,2),
    ADD COLUMN IF NOT EXISTS budget DECIMAL(15,2),
    ADD COLUMN IF NOT EXISTS base_calcul VARCHAR(20),
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS date_soumission DATE,
    ADD COLUMN IF NOT EXISTS date_validation DATE,
    ADD COLUMN IF NOT EXISTS valide_par_id BIGINT,
    ADD COLUMN IF NOT EXISTS version VARCHAR(10),
    ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS motif_verrouillage TEXT,
    ADD COLUMN IF NOT EXISTS parent_convention_id BIGINT REFERENCES conventions(id),
    ADD COLUMN IF NOT EXISTS herite_parametres BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS surcharge_taux_commission DECIMAL(5,2),
    ADD COLUMN IF NOT EXISTS surcharge_base_calcul VARCHAR(50);

-- =====================================================
-- 11. FOURNISSEURS - 4 colonnes manquantes
-- =====================================================
ALTER TABLE fournisseurs
    ADD COLUMN IF NOT EXISTS ville VARCHAR(100),
    ADD COLUMN IF NOT EXISTS fax VARCHAR(20),
    ADD COLUMN IF NOT EXISTS non_resident BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS remarques TEXT;

-- =====================================================
-- 12. COMPTES_BANCAIRES - 5 colonnes manquantes
-- =====================================================
ALTER TABLE comptes_bancaires
    ADD COLUMN IF NOT EXISTS agence VARCHAR(200),
    ADD COLUMN IF NOT EXISTS type_compte VARCHAR(50),
    ADD COLUMN IF NOT EXISTS titulaire VARCHAR(200),
    ADD COLUMN IF NOT EXISTS devise VARCHAR(10) DEFAULT 'MAD',
    ADD COLUMN IF NOT EXISTS remarques TEXT;

-- =====================================================
-- 13. COMMISSIONS - 8 colonnes manquantes
-- =====================================================
ALTER TABLE commissions
    ADD COLUMN IF NOT EXISTS depense_id BIGINT REFERENCES depenses_investissement(id),
    ADD COLUMN IF NOT EXISTS convention_id BIGINT REFERENCES conventions(id),
    ADD COLUMN IF NOT EXISTS montant_base DECIMAL(15,2),
    ADD COLUMN IF NOT EXISTS taux_tva DECIMAL(5,2) DEFAULT 20.00,
    ADD COLUMN IF NOT EXISTS montant_commission_ht DECIMAL(15,2),
    ADD COLUMN IF NOT EXISTS montant_tva_commission DECIMAL(15,2),
    ADD COLUMN IF NOT EXISTS montant_commission_ttc DECIMAL(15,2),
    ADD COLUMN IF NOT EXISTS remarques TEXT;

-- =====================================================
-- 14. DEPENSES_INVESTISSEMENT - 23 colonnes manquantes
-- =====================================================
ALTER TABLE depenses_investissement
    ADD COLUMN IF NOT EXISTS numero_facture VARCHAR(100),
    ADD COLUMN IF NOT EXISTS date_facture DATE,
    ADD COLUMN IF NOT EXISTS projet_id BIGINT,
    ADD COLUMN IF NOT EXISTS axe_analytique_id BIGINT,
    ADD COLUMN IF NOT EXISTS convention_id BIGINT REFERENCES conventions(id),
    ADD COLUMN IF NOT EXISTS reference_marche VARCHAR(100),
    ADD COLUMN IF NOT EXISTS numero_decompte VARCHAR(100),
    ADD COLUMN IF NOT EXISTS retenue_tva DECIMAL(15,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS retenue_is_tiers DECIMAL(15,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS retenue_non_resident DECIMAL(15,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS retenue_garantie DECIMAL(15,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS date_paiement DATE,
    ADD COLUMN IF NOT EXISTS reference_paiement VARCHAR(100),
    ADD COLUMN IF NOT EXISTS compte_bancaire_id BIGINT REFERENCES comptes_bancaires(id),
    ADD COLUMN IF NOT EXISTS paye BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS type_depense VARCHAR(20),
    ADD COLUMN IF NOT EXISTS taux_commission DECIMAL(5,2),
    ADD COLUMN IF NOT EXISTS base_calcul VARCHAR(10),
    ADD COLUMN IF NOT EXISTS objet TEXT,
    ADD COLUMN IF NOT EXISTS date_demarrage DATE,
    ADD COLUMN IF NOT EXISTS delai_mois INTEGER,
    ADD COLUMN IF NOT EXISTS date_fin_prevue DATE,
    ADD COLUMN IF NOT EXISTS designation VARCHAR(500);

-- =====================================================
-- 15. PLAN_ANALYTIQUE_DIMENSIONS - 2 colonnes manquantes
-- =====================================================
ALTER TABLE plan_analytique_dimensions
    ADD COLUMN IF NOT EXISTS obligatoire BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS created_by_id BIGINT;

-- =====================================================
-- Indexes supplémentaires pour performance
-- =====================================================

-- Indexes pour les foreign keys ajoutées
CREATE INDEX IF NOT EXISTS idx_ordres_paiement_compte ON ordres_paiement(compte_bancaire_id);
CREATE INDEX IF NOT EXISTS idx_paiements_compte ON paiements(compte_bancaire_id);
CREATE INDEX IF NOT EXISTS idx_conventions_parent ON conventions(parent_convention_id);
CREATE INDEX IF NOT EXISTS idx_commissions_depense ON commissions(depense_id);
CREATE INDEX IF NOT EXISTS idx_commissions_convention ON commissions(convention_id);
CREATE INDEX IF NOT EXISTS idx_depenses_convention ON depenses_investissement(convention_id);
CREATE INDEX IF NOT EXISTS idx_depenses_compte ON depenses_investissement(compte_bancaire_id);

-- =====================================================
-- FIN DE LA MIGRATION V3
-- =====================================================
