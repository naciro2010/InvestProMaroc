# Schema Synchronization Guide - InvestPro Maroc

## Overview

This document explains the complete schema synchronization between Kotlin JPA entities and the PostgreSQL database schema in InvestPro Maroc.

**Status:** ✅ COMPLETE - All 26 entities fully mapped to 40+ database tables

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | January 2026 | Complete entity-to-schema mapping for all 26 entities |
| 1.0 | Initial | Basic schema without full entity mapping |

## Entity-to-Table Mapping

### Authentication & User Management

| Entity | Table | Key Columns |
|--------|-------|------------|
| User | users | username, email, password, full_name, enabled, account_non_expired, account_non_locked, credentials_non_expired |
| User Roles | user_roles | user_id, role |

### Organizational Partners & Suppliers

| Entity | Table | Key Columns |
|--------|-------|------------|
| Partenaire | partenaires | code, raison_sociale, sigle, type_partenaire, email, telephone, adresse, description |
| Fournisseur | fournisseurs | code, raison_sociale, identifiant_fiscal, ice, adresse, ville, telephone, fax, email, contact, non_resident |
| CompteBancaire | comptes_bancaires | code, rib, banque, agence, type_compte, titulaire, devise |

### Analytical Dimensions (Plan Analytique Dynamique)

| Entity | Table | Key Columns |
|--------|-------|------------|
| DimensionAnalytique | dimensions_analytiques | code, nom, description, ordre, active, obligatoire, created_by_id |
| ValeurDimension | valeurs_dimensions | dimension_id, code, libelle, description, active, ordre |
| ImputationAnalytique | imputations_analytiques | type_imputation, reference_id, montant, **dimensions_valeurs (JSONB)** |

### Convention Management

| Entity | Table | Key Columns |
|--------|-------|------------|
| Convention | conventions | code, numero, type_convention, statut, libelle, objet, taux_commission, budget, base_calcul, taux_tva, dates, workflow fields, sub-convention fields |
| AvenantConvention | avenant_conventions | convention_id, numero_avenant, statut, **donnees_avant (JSONB)**, **modifications (JSONB)**, financial impacts, workflow dates |
| ConventionPartenaire | convention_partenaires | convention_id, partenaire_id, budget_alloue, pourcentage, commission_intervention, roles |
| Budget | budgets | convention_id, version, statut, plafond_convention, total_budget, revision tracking |
| LigneBudget | lignes_budget | budget_id, code, libelle, montant, ordre_affichage, description |
| Subvention | subventions | convention_id, organisme_bailleur, type_subvention, montant_total, devise, taux_change, dates, conditions |
| EcheanceSubvention | echeances_subvention | subvention_id, date_echeance, montant, statut, date_reception |

### Projects

| Entity | Table | Key Columns |
|--------|-------|------------|
| Projet | projets | code, nom, description, convention_id, budget_total, dates, chef_projet_id, statut, pourcentage_avancement |
| ImputationPrevisionnelle | imputations_previsionnelles | convention_id, volet, date_demarrage, delai_mois, date_fin_prevue |
| VersementPrevisionnel | versements_previsionnels | convention_id, volet, date_versement, montant, partenaire_id, mod_id |

### Procurement Contracts (Marchés)

| Entity | Table | Key Columns |
|--------|-------|------------|
| Marche | marches | numero_marche, num_ao, date_marche, fournisseur_id, convention_id, objet, montant_ht/tva/ttc, statut, delai_execution_mois, retenue_garantie |
| MarcheLigne | marche_lignes | marche_id, numero_ligne, designation, unite, quantite, prix_unitaire_ht, montant_ht/tva/ttc, **imputation_analytique (JSONB)** |
| AvenantMarche | avenant_marches | marche_id, numero_avenant, statut, montant impacts (before/after), délai impacts, details |
| BonCommande | bons_commande | numero, marche_id, fournisseur_id, date_bon_commande, objet, montant_ht/tva/ttc, statut |

### Investment Expenses

| Entity | Table | Key Columns |
|--------|-------|------------|
| DepenseInvestissement | depenses_investissement | numero_facture, date_facture, fournisseur_id, convention_id, montant_ht/tva/ttc, retenues (tva, is_tiers, non_resident, garantie), payment tracking, type/statut, taux_commission, base_calcul |
| Commission | commissions | depense_id, convention_id, date_calcul, base_calcul, montant_base, taux_commission, taux_tva, montant_commission_ht/tva/ttc |

### Billing Statements (Décomptes)

| Entity | Table | Key Columns |
|--------|-------|------------|
| Decompte | decomptes | marche_id, numero_decompte, periode (debut/fin), statut, montant_brut_ht/tva/ttc, total_retenues, net_a_payer, cumul, validation fields, solde tracking |
| DecompteRetenue | decompte_retenues | decompte_id, type_retenue (GARANTIE, RAS, PENALITES, AVANCES), montant, taux_pourcent, libelle |
| DecompteImputation | decompte_imputations | decompte_id, montant, **dimensions_valeurs (JSONB)** |

### Payment Orders & Payments

| Entity | Table | Key Columns |
|--------|-------|------------|
| OrdrePaiement | ordres_paiement | decompte_id, numero_op, statut, montant_a_payer, est_paiement_partiel, mode_paiement, compte_bancaire_id, validation fields |
| OPImputation | op_imputations | ordre_paiement_id, montant, **dimensions_valeurs (JSONB)** |
| Paiement | paiements | ordre_paiement_id, reference_paiement, date_valeur, date_execution, montant_paye, est_paiement_partiel, mode_paiement |
| PaiementImputation | paiement_imputations | paiement_id, montant_reel, **dimensions_valeurs (JSONB)**, montant_budgete, ecart |

### Convention Amendments (Legacy)

| Entity | Table | Key Columns |
|--------|-------|------------|
| Avenant | avenants | convention_id, numero_avenant, version_resultante, statut, before/after values (montant, taux_commission, date_fin), impacts |

## Key Field Mappings

### Enumerations

| Kotlin Enum | Column | Valid Values |
|-------------|--------|--------------|
| TypeConvention | type_convention | CADRE, NON_CADRE, SPECIFIQUE, AVENANT |
| StatutConvention | statut | BROUILLON, SOUMIS, VALIDEE, REJETE, EN_EXECUTION, ACHEVE, ANNULE |
| StatutAvenantConvention | statut | BROUILLON, SOUMIS, VALIDE |
| TypeImputation | type_imputation | BUDGET, DECOMPTE, ORDRE_PAIEMENT, PAIEMENT |
| StatutMarche | statut | EN_COURS, VALIDE, TERMINE, SUSPENDU, ANNULE, EN_ATTENTE |
| StatutDecompte | statut | BROUILLON, SOUMIS, VALIDE, REJETE, PAYE_PARTIEL, PAYE_TOTAL |
| TypeRetenue | type_retenue | GARANTIE, RAS, PENALITES, AVANCES |
| StatutOP | statut | BROUILLON, VALIDE, EXECUTE, REJETE, ANNULE |
| ModePaiement | mode_paiement | VIREMENT, CHEQUE, ESPECES, AUTRE |
| StatutBudget | statut | BROUILLON, SOUMIS, VALIDE, REJETE, ARCHIVE |
| StatutEcheance | statut | PREVU, RECU, RETARD, ANNULE |
| StatutProjet | statut | EN_PREPARATION, EN_COURS, SUSPENDU, TERMINE, ANNULE |
| TypeDepense | type_depense | STANDARD, CADRE, NON_CADRE, SPECIFIQUE, AVENANT |
| StatutDepense | statut | VALIDEE, EN_COURS, ACHEVE, EN_RETARD, ANNULE |
| BaseCalcul | base_calcul | TTC, HT |
| StatutAvenant | statut | BROUILLON, SOUMIS, VALIDE, REJETE, ANNULE |
| StatutBonCommande | statut | EN_ATTENTE, APPROUVE, EN_COURS, LIVRE, ANNULE |

### JSONB Fields (PostgreSQL JSON Storage)

JSONB fields provide flexible, queryable storage for analytical dimensions:

| Field | Table | Content |
|-------|-------|---------|
| donnees_avant | avenant_conventions | Snapshot of convention fields before amendment |
| modifications | avenant_conventions | Map of field changes (oldValue → newValue) |
| dimensions_valeurs | imputations_analytiques | {dimensionCode: valeurCode} allocation map |
| imputation_analytique | marche_lignes | {dimensionCode: valeurCode} per line item |
| dimensions_valeurs | decompte_imputations | {dimensionCode: valeurCode} per decompte |
| dimensions_valeurs | op_imputations | {dimensionCode: valeurCode} per payment order |
| dimensions_valeurs | paiement_imputations | {dimensionCode: valeurCode} per payment |

### Base Entity Fields (All Tables)

Every table includes:
- `id BIGSERIAL PRIMARY KEY` - Auto-incrementing unique identifier
- `created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP` - Creation timestamp
- `updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP` - Last modification timestamp
- `actif BOOLEAN DEFAULT TRUE NOT NULL` - Soft delete flag (logical deletion)

## Column Type Mappings

| Kotlin Type | PostgreSQL Type | Precision | Usage |
|-------------|-----------------|-----------|-------|
| BigDecimal | DECIMAL(15,2) | 15 digits, 2 decimals | Financial amounts (budgets, montants) |
| BigDecimal (%) | DECIMAL(5,2) | 5 digits, 2 decimals | Percentages (0.00-100.00) |
| BigDecimal (%) | DECIMAL(10,4) | 10 digits, 4 decimals | Exchange rates |
| Long | BIGINT | - | IDs, foreign keys |
| Int | INTEGER | - | Counts, months, days |
| String (short) | VARCHAR(n) | 20-100 | Codes, short texts |
| String (medium) | VARCHAR(n) | 100-500 | Names, descriptions |
| String (long) | TEXT | unlimited | Full descriptions, notes |
| LocalDate | DATE | - | Dates (YYYY-MM-DD) |
| LocalDateTime | TIMESTAMP | - | Timestamps with timezone |
| Boolean | BOOLEAN | - | Flags (TRUE/FALSE) |
| Enum | VARCHAR(20-50) | - | Enumeration values |
| Map<String, String> | JSONB | unlimited | Flexible dimension mappings |
| Map<String, Any?> | JSONB | unlimited | Complex snapshots/diffs |

## Indexes for Performance

### Type-Specific Indexes

1. **Unique Indexes** (enforce data integrity):
   - All CODE fields (conventions, partenaires, fournisseurs, etc.)
   - All NUMERO fields (marches, decomptes, operations)
   - All REFERENCE fields (paiements, factures)
   - Foreign key relationships

2. **Performance Indexes** (speed up queries):
   - Status columns (statut, active, actif)
   - Date columns (date_*.*, created_at)
   - Foreign key columns (convention_id, marche_id, etc.)
   - Frequently searched combinations (type_imputation + reference_id)

3. **GIN Indexes** (JSONB fast searching):
   - donnees_avant, modifications (avenant_conventions)
   - dimensions_valeurs (all imputation tables)
   - imputation_analytique (marche_lignes)

### Total Indexes: 80+

## Constraints & Integrity

### Foreign Key Relationships

- **CASCADE DELETE**: Child records deleted when parent deleted
  - marche_lignes ← marches
  - decomptes ← marches
  - avenant_marches ← marches
  - bons_commande ← marches
  - All sub-tables under parent entities

- **SET NULL**: Foreign key nullified when referenced record deleted
  - created_by_id fields (when user deleted)
  - valide_par_id fields (when user deleted)

### Unique Constraints

- Single field: code, numero, email, ice, rib, CIN
- Composite: (dimension_id, code), (convention_id, partenaire_id)
- Enforced by PostgreSQL at database level

### Data Type Constraints

- NOT NULL on required fields (defined by @Column(nullable=false))
- DEFAULT values for calculated fields (CURRENT_TIMESTAMP, 0.00, FALSE)
- CHECK constraints (implicit through enum values)
- Precision constraints (DECIMAL(15,2) limits to 15 digits, 2 decimals)

## Synchronization Checklist

### Before Schema Deployment

- [x] All 26 entities mapped to tables
- [x] All @Column(name="...") annotations match table columns
- [x] All @JoinColumn(name="...") mappings correct
- [x] All DECIMAL precision/scale correct (15,2 for amounts, 5,2 for rates)
- [x] JSONB fields for flexible dimensions (dimensions_valeurs, imputation_analytique)
- [x] GIN indexes for JSONB fast searching
- [x] Base entity fields on all tables (id, created_at, updated_at, actif)
- [x] Enum field mappings to VARCHAR columns
- [x] All foreign key relationships defined
- [x] Cascade delete rules appropriate
- [x] Unique constraints on CODE/NUMERO fields

### During Development

**If adding new fields to an entity:**

1. Add `@Column(name="column_name", ...)` to entity field
2. Create new Flyway migration `V{n}__description.sql`
3. Add `ALTER TABLE ... ADD COLUMN ...` with proper type
4. Include DEFAULT value if needed
5. Test migration on clean database
6. Never modify existing migrations after commit

**If changing field types:**

1. Create new migration with `ALTER TABLE ... ALTER COLUMN ...`
2. Test data compatibility
3. Use `USING` clause for type conversion if needed

**If adding new tables:**

1. Create entity extending BaseEntity
2. Create table with all BaseEntity fields
3. Define all @Column mappings explicitly
4. Add migration to create table
5. Add indexes for performance

### Validation Tools

```bash
# Check Flyway state
./gradlew flywayInfo

# Validate migrations
./gradlew flywayValidate

# Repair if needed (use with caution)
./gradlew flywayRepair

# Generate schema info
pg_dump --schema-only investpro > schema_backup.sql
```

## Common Issues & Solutions

### Issue: "Unknown column" error

**Cause:** Entity field name doesn't match table column name
**Solution:** Add `@Column(name="actual_column_name")` to field

### Issue: "Type mismatch" in Hibernate

**Cause:** Entity type doesn't match column type
**Solution:** Update column type in migration (e.g., VARCHAR → DECIMAL)

### Issue: JSONB field not queryable

**Cause:** Missing GIN index
**Solution:** Add `CREATE INDEX ON table USING GIN(jsonb_column)`

### Issue: Decimal precision lost

**Cause:** DECIMAL(15,2) precision insufficient
**Solution:** Increase to DECIMAL(18,3) or higher in migration

### Issue: Foreign key constraint violation

**Cause:** ON DELETE action incorrect
**Solution:** Use CASCADE for child records, SET NULL for optional refs

## Best Practices

1. **Always use CREATE TABLE IF NOT EXISTS** - Idempotent migrations
2. **Never modify existing migrations** - Create new ones instead
3. **Include comments** - Document table and column purposes
4. **Test migrations on fresh DB** - Ensure compatibility
5. **Use consistent naming** - snake_case for columns, tables
6. **Index strategically** - Foreign keys, status fields, dates
7. **Document JSONB structure** - Include example JSON in comments
8. **Version budgets explicitly** - V0, V1, V2... tracked in version field
9. **Snapshot before changes** - Use donnees_avant for amendments
10. **Track audit fields** - created_at, updated_at on all tables

## Migration Planning (Next Steps)

### Upcoming Migrations (if needed)

- V3: Additional seed data/test records
- V4: Performance tuning indexes
- V5: Add audit trails
- V6: Archive management

## Files Reference

| File | Purpose |
|------|---------|
| `/backend/src/main/resources/db/migration/V2__create_schema.sql` | Complete schema definition (THIS FILE) |
| `/backend/src/main/kotlin/ma/investpro/entity/` | All JPA entity classes |
| `/CLAUDE.md` | Project overview and architecture |
| `/DEVELOPMENT_GUIDELINES.md` | Code quality standards |

## Contact & Support

For schema questions:
1. Check this guide for field mappings
2. Review the relevant entity file
3. Consult Flyway migration history
4. Test changes on local database first

---

**Last Updated:** January 15, 2026
**Version:** 2.0
**Status:** ✅ Production Ready
