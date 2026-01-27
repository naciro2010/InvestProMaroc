package ma.investpro.repository

import ma.investpro.entity.ConventionConfiguration
import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.JpaRepository

interface ConventionConfigurationRepository : JpaRepository<ConventionConfiguration, Long> {
    @EntityGraph(attributePaths = ["typeConfigurations"])
    fun findFirstByOrderByIdAsc(): ConventionConfiguration?
}
