package ma.investpro.integration

import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import javax.sql.DataSource

class DatabaseConnectionTest : BaseIntegrationTest() {

    @Autowired
    private lateinit var dataSource: DataSource

    @Test
    fun `should connect to PostgreSQL test container successfully`() {
        dataSource.connection.use { connection ->
            assertTrue(connection.isValid(1))
            val metaData = connection.metaData
            assertTrue(metaData.databaseProductName.contains("PostgreSQL"))
        }
    }

    @Test
    fun `should verify testcontainer is running`() {
        assertTrue(postgresContainer.isRunning)
        println("PostgreSQL container running on: ${postgresContainer.jdbcUrl}")
    }
}
