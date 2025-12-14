-- =====================================================
-- InvestPro Maroc - Données initiales
-- Insertion de données de démonstration
-- =====================================================

-- Utilisateur admin par défaut (mot de passe: admin123)
-- Note: Le mot de passe doit être hashé avec BCrypt en production
INSERT INTO users (username, email, password, full_name, enabled, actif) VALUES
('admin', 'admin@investpro.ma', '$2a$10$xmx8wPCvCGBPm2c4GqYQvugQQFvHqVyj8jhq.r0SRz0LKhVYYvTSO', 'Administrateur', TRUE, TRUE),
('user', 'user@investpro.ma', '$2a$10$xmx8wPCvCGBPm2c4GqYQvugQQFvHqVyj8jhq.r0SRz0LKhVYYvTSO', 'Utilisateur Test', TRUE, TRUE);

INSERT INTO user_roles (user_id, role) VALUES
((SELECT id FROM users WHERE username = 'admin'), 'ADMIN'),
((SELECT id FROM users WHERE username = 'admin'), 'USER'),
((SELECT id FROM users WHERE username = 'user'), 'USER');

-- Conventions de commissions
INSERT INTO conventions (code, libelle, taux_commission, base_calcul, taux_tva, date_debut, description, actif) VALUES
('CONV-2024-001', 'Convention Standard 2024', 2.50, 'HT', 20.00, '2024-01-01', 'Convention standard pour les projets d''investissement', TRUE),
('CONV-2024-002', 'Convention Majorée 2024', 3.00, 'HT', 20.00, '2024-01-01', 'Convention majorée pour les grands projets', TRUE),
('CONV-2024-003', 'Convention Spéciale Infrastructure', 2.00, 'TTC', 20.00, '2024-01-01', 'Convention spécifique pour les projets d''infrastructure', TRUE);

-- Projets
INSERT INTO projets (code, nom, description, responsable, statut, actif) VALUES
('PROJ-001', 'Modernisation Système d''Information', 'Projet de modernisation des systèmes informatiques', 'Mohammed ALAMI', 'EN_COURS', TRUE),
('PROJ-002', 'Extension Bâtiment A', 'Extension et rénovation du bâtiment administratif', 'Fatima BENNANI', 'EN_COURS', TRUE),
('PROJ-003', 'Équipements Techniques', 'Acquisition d''équipements techniques spécialisés', 'Ahmed TAZI', 'EN_COURS', TRUE),
('PROJ-004', 'Infrastructure Réseau', 'Mise à niveau de l''infrastructure réseau', 'Nadia FILALI', 'EN_COURS', TRUE);

-- Fournisseurs
INSERT INTO fournisseurs (code, raison_sociale, identifiant_fiscal, ice, adresse, ville, telephone, email, non_resident, actif) VALUES
('FOUR-001', 'TECHNO SOLUTIONS MAROC SARL', '12345678', '001234567890001', 'Rue des Entrepreneurs, Zone Industrielle', 'Casablanca', '0522-123456', 'contact@technosolutions.ma', FALSE, TRUE),
('FOUR-002', 'BUILD CONSTRUCT SA', '23456789', '001234567890002', 'Boulevard Mohammed V', 'Rabat', '0537-234567', 'info@buildconstruct.ma', FALSE, TRUE),
('FOUR-003', 'EQUIPEMENTS MODERNES', '34567890', '001234567890003', 'Avenue Hassan II', 'Casablanca', '0522-345678', 'contact@equipmodernes.ma', FALSE, TRUE),
('FOUR-004', 'INTERNATIONAL TECH EUROPE', '45678901', '001234567890004', '123 Avenue des Champs-Élysées, Paris', 'Paris', '+33-1-23456789', 'contact@intltech.eu', TRUE, TRUE);

-- Axes analytiques
INSERT INTO axes_analytiques (code, libelle, type, description, actif) VALUES
('AXE-ADM', 'Administration Générale', 'DEPARTEMENT', 'Département administration générale', TRUE),
('AXE-IT', 'Technologies de l''Information', 'DEPARTEMENT', 'Département IT', TRUE),
('AXE-INF', 'Infrastructure', 'DEPARTEMENT', 'Département infrastructure', TRUE),
('AXE-LOG', 'Logistique', 'DEPARTEMENT', 'Département logistique', TRUE),
('CC-001', 'Centre de Coûts 001', 'CENTRE_COUT', 'Centre de coûts principal', TRUE),
('CC-002', 'Centre de Coûts 002', 'CENTRE_COUT', 'Centre de coûts secondaire', TRUE);

-- Comptes bancaires
INSERT INTO comptes_bancaires (code, rib, banque, agence, type_compte, titulaire, devise, actif) VALUES
('CB-001', '123456789012345678901234', 'Attijariwafa Bank', 'Agence Hay Riad Rabat', 'GENERAL', 'InvestPro Maroc', 'MAD', TRUE),
('CB-002', '234567890123456789012345', 'Banque Populaire', 'Agence Casa Centre', 'PROJET', 'InvestPro Maroc - Projets', 'MAD', TRUE),
('CB-003', '345678901234567890123456', 'BMCE Bank', 'Agence Rabat Agdal', 'REGIE', 'InvestPro Maroc - Régie', 'MAD', TRUE);

-- Dépenses d'investissement (exemples)
INSERT INTO depenses_investissement
(numero_facture, date_facture, fournisseur_id, projet_id, axe_analytique_id, convention_id,
 montant_ht, taux_tva, montant_tva, montant_ttc,
 retenue_garantie, retenue_is_tiers, paye)
VALUES
-- Facture 1
('FACT-2024-001', '2024-03-15',
 (SELECT id FROM fournisseurs WHERE code = 'FOUR-001'),
 (SELECT id FROM projets WHERE code = 'PROJ-001'),
 (SELECT id FROM axes_analytiques WHERE code = 'AXE-IT'),
 (SELECT id FROM conventions WHERE code = 'CONV-2024-001'),
 150000.00, 20.00, 30000.00, 180000.00,
 15000.00, 0.00, FALSE),

-- Facture 2
('FACT-2024-002', '2024-03-20',
 (SELECT id FROM fournisseurs WHERE code = 'FOUR-002'),
 (SELECT id FROM projets WHERE code = 'PROJ-002'),
 (SELECT id FROM axes_analytiques WHERE code = 'AXE-INF'),
 (SELECT id FROM conventions WHERE code = 'CONV-2024-002'),
 250000.00, 20.00, 50000.00, 300000.00,
 25000.00, 0.00, FALSE),

-- Facture 3 - Fournisseur non-résident avec IS tiers
('FACT-2024-003', '2024-03-25',
 (SELECT id FROM fournisseurs WHERE code = 'FOUR-004'),
 (SELECT id FROM projets WHERE code = 'PROJ-001'),
 (SELECT id FROM axes_analytiques WHERE code = 'AXE-IT'),
 (SELECT id FROM conventions WHERE code = 'CONV-2024-001'),
 100000.00, 20.00, 20000.00, 120000.00,
 10000.00, 10000.00, FALSE),

-- Facture 4 - Payée
('FACT-2024-004', '2024-02-10',
 (SELECT id FROM fournisseurs WHERE code = 'FOUR-003'),
 (SELECT id FROM projets WHERE code = 'PROJ-003'),
 (SELECT id FROM axes_analytiques WHERE code = 'AXE-LOG'),
 (SELECT id FROM conventions WHERE code = 'CONV-2024-001'),
 75000.00, 20.00, 15000.00, 90000.00,
 7500.00, 0.00, TRUE);

-- Mise à jour de la dernière facture payée avec les infos de paiement
UPDATE depenses_investissement
SET date_paiement = '2024-02-28',
    reference_paiement = 'VIR-2024-0123',
    compte_bancaire_id = (SELECT id FROM comptes_bancaires WHERE code = 'CB-001')
WHERE numero_facture = 'FACT-2024-004';

-- Commissions calculées pour les dépenses
-- Commission pour FACT-2024-001 (150000 HT * 2.5% = 3750 HT)
INSERT INTO commissions
(depense_id, convention_id, date_calcul, base_calcul, montant_base,
 taux_commission, taux_tva, montant_commission_ht, montant_tva_commission, montant_commission_ttc)
VALUES
((SELECT id FROM depenses_investissement WHERE numero_facture = 'FACT-2024-001'),
 (SELECT id FROM conventions WHERE code = 'CONV-2024-001'),
 '2024-03-15', 'HT', 150000.00,
 2.50, 20.00, 3750.00, 750.00, 4500.00),

-- Commission pour FACT-2024-002 (250000 HT * 3.0% = 7500 HT)
((SELECT id FROM depenses_investissement WHERE numero_facture = 'FACT-2024-002'),
 (SELECT id FROM conventions WHERE code = 'CONV-2024-002'),
 '2024-03-20', 'HT', 250000.00,
 3.00, 20.00, 7500.00, 1500.00, 9000.00),

-- Commission pour FACT-2024-004 (75000 HT * 2.5% = 1875 HT)
((SELECT id FROM depenses_investissement WHERE numero_facture = 'FACT-2024-004'),
 (SELECT id FROM conventions WHERE code = 'CONV-2024-001'),
 '2024-02-10', 'HT', 75000.00,
 2.50, 20.00, 1875.00, 375.00, 2250.00);
