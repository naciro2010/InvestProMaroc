package ma.investpro.service

import ma.investpro.dto.PieceJointeCreateRequest
import ma.investpro.dto.PieceJointeDTO
import ma.investpro.dto.PieceJointeUpdateRequest
import ma.investpro.entity.PieceJointe
import ma.investpro.entity.User
import ma.investpro.repository.PieceJointeRepository
import ma.investpro.repository.UserRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.core.io.Resource
import org.springframework.core.io.UrlResource
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import java.io.IOException
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.nio.file.StandardCopyOption
import java.time.LocalDateTime
import java.util.*

@Service
@Transactional
class PieceJointeService(
    private val pieceJointeRepository: PieceJointeRepository,
    private val userRepository: UserRepository
) {

    @Value("\${file.upload-dir:uploads}")
    private lateinit var uploadDir: String

    private val uploadPath: Path
        get() = Paths.get(uploadDir).toAbsolutePath().normalize()

    init {
        try {
            Files.createDirectories(uploadPath)
        } catch (ex: IOException) {
            throw RuntimeException("Could not create upload directory!", ex)
        }
    }

    /**
     * Upload un fichier et crée l'entité PieceJointe
     */
    fun uploadFile(
        file: MultipartFile,
        request: PieceJointeCreateRequest,
        userId: Long
    ): PieceJointeDTO {
        // Générer un nom unique pour le fichier
        val fileName = "${UUID.randomUUID()}_${file.originalFilename}"
        val targetLocation = uploadPath.resolve(fileName)

        // Copier le fichier
        file.inputStream.use { inputStream ->
            Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING)
        }

        // Récupérer l'utilisateur
        val user = userRepository.findById(userId).orElseThrow {
            RuntimeException("User not found with id: $userId")
        }

        // Créer l'entité
        val pieceJointe = PieceJointe(
            nom = fileName,
            nomOriginal = file.originalFilename ?: fileName,
            typeMime = file.contentType ?: "application/octet-stream",
            taille = file.size,
            cheminFichier = targetLocation.toString(),
            description = request.description,
            typeEntite = request.typeEntite,
            entiteId = request.entiteId,
            dateUpload = LocalDateTime.now(),
            uploadedBy = user,
            actif = true
        )

        val saved = pieceJointeRepository.save(pieceJointe)
        return toDTO(saved)
    }

    /**
     * Récupère toutes les pièces jointes pour une entité
     */
    fun getPiecesJointesForEntite(
        typeEntite: PieceJointe.TypeEntite,
        entiteId: Long
    ): List<PieceJointeDTO> {
        return pieceJointeRepository.findByTypeEntiteAndEntiteId(typeEntite, entiteId)
            .map { toDTO(it) }
    }

    /**
     * Récupère une pièce jointe par ID
     */
    fun getById(id: Long): PieceJointeDTO {
        val pieceJointe = pieceJointeRepository.findById(id).orElseThrow {
            RuntimeException("Pièce jointe non trouvée avec l'id: $id")
        }
        return toDTO(pieceJointe)
    }

    /**
     * Télécharge un fichier
     */
    fun downloadFile(id: Long): Resource {
        val pieceJointe = pieceJointeRepository.findById(id).orElseThrow {
            RuntimeException("Pièce jointe non trouvée avec l'id: $id")
        }

        val filePath = Paths.get(pieceJointe.cheminFichier).normalize()
        val resource = UrlResource(filePath.toUri())

        if (resource.exists()) {
            return resource
        } else {
            throw RuntimeException("Fichier non trouvé: ${pieceJointe.nom}")
        }
    }

    /**
     * Met à jour une pièce jointe
     */
    fun updatePieceJointe(id: Long, request: PieceJointeUpdateRequest): PieceJointeDTO {
        val pieceJointe = pieceJointeRepository.findById(id).orElseThrow {
            RuntimeException("Pièce jointe non trouvée avec l'id: $id")
        }

        pieceJointe.description = request.description
        val updated = pieceJointeRepository.save(pieceJointe)
        return toDTO(updated)
    }

    /**
     * Supprime une pièce jointe (soft delete)
     */
    fun deletePieceJointe(id: Long) {
        val pieceJointe = pieceJointeRepository.findById(id).orElseThrow {
            RuntimeException("Pièce jointe non trouvée avec l'id: $id")
        }
        pieceJointe.actif = false
        pieceJointeRepository.save(pieceJointe)
    }

    /**
     * Supprime physiquement un fichier
     */
    fun deletePieceJointePhysically(id: Long) {
        val pieceJointe = pieceJointeRepository.findById(id).orElseThrow {
            RuntimeException("Pièce jointe non trouvée avec l'id: $id")
        }

        // Supprimer le fichier physique
        try {
            val filePath = Paths.get(pieceJointe.cheminFichier)
            Files.deleteIfExists(filePath)
        } catch (ex: IOException) {
            throw RuntimeException("Erreur lors de la suppression du fichier", ex)
        }

        // Supprimer l'entité
        pieceJointeRepository.delete(pieceJointe)
    }

    private fun toDTO(entity: PieceJointe): PieceJointeDTO {
        return PieceJointeDTO(
            id = entity.id,
            nom = entity.nom,
            nomOriginal = entity.nomOriginal,
            typeMime = entity.typeMime,
            taille = entity.taille,
            tailleFormatee = entity.getTailleFormatee(),
            extension = entity.getExtension(),
            description = entity.description,
            typeEntite = entity.typeEntite,
            entiteId = entity.entiteId,
            dateUpload = entity.dateUpload,
            uploadedByName = entity.uploadedBy?.fullName,
            downloadUrl = "/api/pieces-jointes/${entity.id}/download"
        )
    }
}
