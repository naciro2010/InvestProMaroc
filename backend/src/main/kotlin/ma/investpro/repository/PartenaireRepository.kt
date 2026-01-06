package ma.investpro.repository

import ma.investpro.entity.Partenaire
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface PartenaireRepository : JpaRepository<Partenaire, Long>