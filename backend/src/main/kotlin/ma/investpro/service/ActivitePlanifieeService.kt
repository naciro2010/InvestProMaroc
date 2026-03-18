package ma.investpro.service

import ma.investpro.dto.ActivitePlanifieeResponse
import ma.investpro.dto.CreateActivitePlanifieeRequest
import ma.investpro.dto.UpdateActivitePlanifieeRequest
import ma.investpro.entity.ActivitePlanifiee
import ma.investpro.repository.ActivitePlanifieeRepository
import ma.investpro.repository.ConventionRepository
import ma.investpro.repository.UserRepository
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ActivitePlanifieeService(
    private val activitePlanifieeRepository: ActivitePlanifieeRepository,
    private val conventionRepository: ConventionRepository,
    private val userRepository: UserRepository,
) {

    @Transactional(readOnly = true)
    fun getByConvention(conventionId: Long): List<ActivitePlanifieeResponse> {
        return activitePlanifieeRepository
            .findByConventionIdAndActifTrueOrderByFaitAscDatePrevueAsc(conventionId)
            .map { it.toResponse() }
    }

    @Transactional
    fun create(conventionId: Long, request: CreateActivitePlanifieeRequest): ActivitePlanifieeResponse {
        val convention = conventionRepository.findById(conventionId)
            .orElseThrow { IllegalArgumentException("Convention introuvable: $conventionId") }

        val user = getCurrentUser()

        val activite = ActivitePlanifiee(
            convention = convention,
            typeActivite = request.typeActivite,
            titre = request.titre,
            datePrevue = request.datePrevue,
            note = request.note,
            createdBy = user,
        )

        return activitePlanifieeRepository.save(activite).toResponse()
    }

    @Transactional
    fun update(id: Long, request: UpdateActivitePlanifieeRequest): ActivitePlanifieeResponse {
        val activite = activitePlanifieeRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Activité introuvable: $id") }

        request.typeActivite?.let { activite.typeActivite = it }
        request.titre?.let { activite.titre = it }
        request.datePrevue?.let { activite.datePrevue = it }
        request.fait?.let { activite.fait = it }
        if (request.note != null) activite.note = request.note

        return activitePlanifieeRepository.save(activite).toResponse()
    }

    @Transactional
    fun toggleDone(id: Long): ActivitePlanifieeResponse {
        val activite = activitePlanifieeRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Activité introuvable: $id") }

        activite.fait = !activite.fait
        return activitePlanifieeRepository.save(activite).toResponse()
    }

    @Transactional
    fun delete(id: Long) {
        val activite = activitePlanifieeRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Activité introuvable: $id") }

        activite.actif = false
        activitePlanifieeRepository.save(activite)
    }

    private fun ActivitePlanifiee.toResponse() = ActivitePlanifieeResponse(
        id = id ?: 0,
        conventionId = convention.id ?: 0,
        typeActivite = typeActivite,
        titre = titre,
        datePrevue = datePrevue,
        note = note,
        fait = fait,
        createdByName = createdBy?.fullName,
        createdAt = createdAt,
    )

    private fun getCurrentUser(): ma.investpro.entity.User? {
        val username = SecurityContextHolder.getContext().authentication?.name ?: return null
        return userRepository.findByUsername(username).orElse(null)
    }
}
