# /find-issues - Scan for Code Quality Issues

Comprehensive scan for common issues in the InvestPro codebase.

## Steps

### TypeScript Issues
1. Search for `any` type usage (forbidden)
2. Search for hardcoded colors (hex codes, rgb values)
3. Search for files > 300 lines
4. Search for missing barrel exports
5. Search for `console.log` in production code

### Kotlin Issues
6. Search for `Any` type usage (forbidden)
7. Search for `Map<String, Any>` patterns
8. Search for missing `@Transactional` on write operations
9. Search for raw entity exposure (should use DTOs)

### Architecture Issues
10. Check for monolithic endpoints (returning nested collections)
11. Check for components loading data they don't display
12. Check for missing StatusBadge usage (manual Chip for statuses)
13. Check for hardcoded spacing/typography values

### Security Issues
14. Search for exposed secrets or API keys
15. Check for missing security annotations on controllers
16. Search for SQL string concatenation (injection risk)

## Output
Prioritized list of issues with file:line references and severity (CRITICAL/WARNING/INFO).
