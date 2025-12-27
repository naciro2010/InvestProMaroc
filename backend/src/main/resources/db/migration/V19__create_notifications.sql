-- Migration V19: Notification system
-- Alerts for expiration, validation pending, payment reminders

CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    type_notification VARCHAR(50) NOT NULL, -- EXPIRATION, VALIDATION_PENDING, PAIEMENT_RETARD
    priorite VARCHAR(20) DEFAULT 'NORMALE', -- HAUTE, NORMALE, BASSE
    titre VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type_entite VARCHAR(50),
    entite_id BIGINT,
    destinataire_id BIGINT NOT NULL,
    date_envoi TIMESTAMP DEFAULT NOW(),
    est_lu BOOLEAN DEFAULT FALSE,
    date_lecture TIMESTAMP,
    action_url TEXT, -- URL vers l'entité concernée

    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS regles_notification (
    id BIGSERIAL PRIMARY KEY,
    nom_regle VARCHAR(100) NOT NULL,
    type_evenement VARCHAR(50) NOT NULL, -- CONVENTION_EXPIRE_DANS_30J, VALIDATION_EN_ATTENTE_3J
    type_notification VARCHAR(50) NOT NULL,
    condition_declenchement JSONB,
    template_message TEXT,
    destinataires_roles JSONB, -- Array of roles
    est_active BOOLEAN DEFAULT TRUE,

    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_destinataire ON notifications(destinataire_id, est_lu);
CREATE INDEX idx_notifications_date ON notifications(date_envoi);
CREATE INDEX idx_notifications_type ON notifications(type_notification);
CREATE INDEX idx_regles_notification_actives ON regles_notification(est_active);

COMMENT ON TABLE notifications IS 'Notifications envoyées aux utilisateurs';
COMMENT ON TABLE regles_notification IS 'Règles de déclenchement automatique des notifications';
