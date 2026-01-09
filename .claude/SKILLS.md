# Development Skills and Best Practices

## Commit Guidelines

### Before Committing: Mandatory Checklist

1. **Testing**
   - Always run full test suite before committing
   - Ensure 100% test coverage for new code
   - No test skipping or commenting out tests

2. **Code Quality**
   - Run linters with zero warnings
   - No temporary or commented-out code
   - Follow existing project architecture patterns
   - Prefer simplicity over complexity

3. **Validation Steps
   ```bash
   # Backend (Kotlin)
   ./gradlew test              # Run all tests
   ./gradlew lint              # Static code analysis
   ./gradlew build -x test     # Compile check

   # Frontend (React/TypeScript)
   npm run lint                # ESLint validation
   npm run type-check         # TypeScript type checking
   npm run test               # Run unit and integration tests
   npm run build              # Compilation check
   ```

## Commit Message Standards

### Format
```
<type>: <short descriptive message>

[Optional detailed description]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring
- `test`: Test-related changes
- `docs`: Documentation updates
- `style`: Code formatting
- `perf`: Performance improvements

### Examples
```
feat: Add user authentication flow for multi-factor login

- Implement JWT-based authentication
- Add TOTP support for additional security
- Update user model to support 2FA

refactor: Simplify API endpoint routing
```

## Solution Design Principles

1. **Simplicity is Key**
   - Avoid over-engineering
   - Choose the most straightforward solution
   - Minimize dependencies and complexity

2. **Maintainability**
   - Write self-documenting code
   - Add comments only when logic is non-trivial
   - Follow existing project patterns

3. **Performance**
   - Profile before optimizing
   - Use built-in language/framework features
   - Avoid premature optimization

4. **Scalability**
   - Design for future extension
   - Use interfaces and abstractions
   - Keep components loosely coupled

## Continuous Improvement

### Code Review Checklist
- [ ] Follows existing architectural patterns
- [ ] All tests pass
- [ ] No hardcoded values
- [ ] Proper error handling
- [ ] Performance considerations
- [ ] Security implications reviewed

### Skills Update Process
- Review and update this file after each significant project milestone
- Add lessons learned from code reviews
- Remove outdated practices
- Incorporate team's collective wisdom

## Red Flags (Avoid These)

- Quick fixes without tests
- Copy-paste code
- Ignoring compiler/linter warnings
- Introducing unnecessary complexity
- Bypassing established patterns
- Adding dependencies without thorough evaluation

## Learning Resources

- Project Architecture Documentation
- Design Patterns Reference
- Performance Profiling Techniques
- Security Best Practices

## Versioning This File

- Major version: Significant architectural changes
- Minor version: New best practices or guidelines
- Patch version: Clarifications or minor improvements