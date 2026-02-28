CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    recipient_id BIGINT NOT NULL REFERENCES users(id),
    title VARCHAR(180) NOT NULL,
    message VARCHAR(1500) NOT NULL,
    type VARCHAR(30) NOT NULL DEFAULT 'info',
    context_type VARCHAR(80),
    context_id VARCHAR(120),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    actif BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_notifications_recipient_created_at ON notifications(recipient_id, created_at DESC);
CREATE INDEX idx_notifications_recipient_read ON notifications(recipient_id, is_read);

CREATE TABLE team_messages (
    id BIGSERIAL PRIMARY KEY,
    sender_id BIGINT NOT NULL REFERENCES users(id),
    recipient_id BIGINT NOT NULL REFERENCES users(id),
    content VARCHAR(2000) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    actif BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_team_messages_participants ON team_messages(sender_id, recipient_id, created_at DESC);
CREATE INDEX idx_team_messages_recipient_read ON team_messages(recipient_id, is_read);
