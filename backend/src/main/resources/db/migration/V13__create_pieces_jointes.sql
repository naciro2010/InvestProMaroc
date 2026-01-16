-- Migration V13: Création de la table pieces_jointes pour gérer les pièces jointes (documents)

CREATE TABLE IF NOT EXISTS pieces_jointes (
    id BIGSERIAL PRIMARY KEY,
    nom VARCHAR(500) NOT NULL,
    nom_original VARCHAR(500) NOT NULL,
    type_mime VARCHAR(200) NOT NULL,
    taille BIGINT NOT NULL,
    chemin_fichier VARCHAR(1000) NOT NULL,
    description VARCHAR(500),
    type_entite VARCHAR(50) NOT NULL CHECK (type_entite IN ('CONVENTION', 'SOUS_CONVENTION', 'AVENANT', 'MARCHE', 'DECOMPTE')),
    entite_id BIGINT NOT NULL,
    date_upload TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    uploaded_by_id BIGINT,
    actif BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_pieces_jointes_uploaded_by FOREIGN KEY (uploaded_by_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Index pour recherche rapide par entité
CREATE INDEX IF NOT EXISTS idx_pieces_jointes_entite ON pieces_jointes(type_entite, entite_id, actif);

-- Index pour recherche par date
CREATE INDEX IF NOT EXISTS idx_pieces_jointes_date ON pieces_jointes(date_upload DESC);

-- Index pour recherche par utilisateur
CREATE INDEX IF NOT EXISTS idx_pieces_jointes_user ON pieces_jointes(uploaded_by_id);

-- Commentaires
COMMENT ON TABLE pieces_jointes IS 'Table pour stocker les métadonnées des pièces jointes (documents) liées aux conventions, sous-conventions, avenants, marchés et décomptes';
COMMENT ON COLUMN pieces_jointes.nom IS 'Nom du fichier stocké (unique avec UUID)';
COMMENT ON COLUMN pieces_jointes.nom_original IS 'Nom original du fichier uploadé';
COMMENT ON COLUMN pieces_jointes.type_mime IS 'Type MIME du fichier (ex: application/pdf, image/jpeg)';
COMMENT ON COLUMN pieces_jointes.taille IS 'Taille du fichier en bytes';
COMMENT ON COLUMN pieces_jointes.chemin_fichier IS 'Chemin complet du fichier sur le système de fichiers';
COMMENT ON COLUMN pieces_jointes.type_entite IS 'Type de l''entité parente (CONVENTION, SOUS_CONVENTION, AVENANT, etc.)';
COMMENT ON COLUMN pieces_jointes.entite_id IS 'ID de l''entité parente';
COMMENT ON COLUMN pieces_jointes.date_upload IS 'Date et heure de l''upload';
COMMENT ON COLUMN pieces_jointes.uploaded_by_id IS 'Utilisateur qui a uploadé le fichier';
COMMENT ON COLUMN pieces_jointes.actif IS 'Indicateur de soft delete (false = supprimé logiquement)';
