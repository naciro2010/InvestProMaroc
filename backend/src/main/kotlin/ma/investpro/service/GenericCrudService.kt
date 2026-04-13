package ma.investpro.service

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.transaction.annotation.Transactional

@Transactional
abstract class GenericCrudService<T : Any, ID : Any>(
    protected val repository: JpaRepository<T, ID>
) {
    @Transactional(readOnly = true)
    open fun findAll(): List<T> = repository.findAll()

    @Transactional(readOnly = true)
    open fun findAll(pageable: Pageable): Page<T> = repository.findAll(pageable)

    @Transactional(readOnly = true)
    open fun findById(id: ID): T? = repository.findById(id).orElse(null)

    open fun create(entity: T): T = repository.save(entity)

    open fun update(id: ID, entity: T): T? {
        return if (repository.existsById(id)) {
            repository.save(entity)
        } else null
    }

    open fun delete(id: ID): Boolean {
        return if (repository.existsById(id)) {
            repository.deleteById(id)
            true
        } else false
    }

    @Transactional(readOnly = true)
    open fun count(): Long = repository.count()
}
