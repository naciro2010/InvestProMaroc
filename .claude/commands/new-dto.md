# /new-dto - Create New Data Transfer Object

Create strongly typed DTOs for API communication.

## Input

The user provides: entity name and fields needed.

## Steps

1. Create in `backend/src/main/kotlin/ma/investpro/dto/`
2. Follow naming convention:
   - `Create[Entity]Request` - for POST body
   - `Update[Entity]Request` - for PUT body
   - `[Entity]Response` - for full response
   - `[Entity]BasicDTO` - for lightweight response
   - `[Entity]StatsDTO` - for aggregated metrics
   - `[Entity]ListItemDTO` - for list views

3. Rules:
   - NEVER use `Any`, `Map<String, Any>`, or untyped structures
   - Use `BigDecimal` for monetary values
   - Use `LocalDate`/`LocalDateTime` for dates
   - Use `Long` for IDs
   - Mark nullable fields with `?`
   - Add `@field:NotBlank`, `@field:NotNull` validation annotations on request DTOs

## Template
```kotlin
data class Create[Entity]Request(
    @field:NotBlank val code: String,
    @field:NotBlank val designation: String,
    val montant: BigDecimal? = null
)

data class [Entity]Response(
    val id: Long,
    val code: String,
    val designation: String,
    val montant: BigDecimal,
    val status: String,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)
```
