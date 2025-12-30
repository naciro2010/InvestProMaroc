package ma.investpro.integration

import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Disabled
import org.springframework.beans.factory.annotation.Autowired
import javax.sql.DataSource

@Disabled("Integration tests require Testcontainers - use: ./gradlew build -x test")
class DatabaseConnectionTest : BaseIntegrationTest() {

    @Autowired
    private lateinit var dataSource: DataSource

    @Test
    fun `should connect to H2 test database successfully`() {
        dataSource.connection.use { connection ->
            assertTrue(connection.isValid(1))
            val metaData = connection.metaData
            assertTrue(metaData.databaseProductName.contains("H2"))
        }
    }

    @Test
    fun `should verify test database is accessible`() {
        dataSource.connection.use { connection ->
            val statement = connection.createStatement()
            val result = statement.executeQuery("SELECT 1")
            assertTrue(result.next())
        }
    }
}
