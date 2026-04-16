# /ai-feature - Add AI-Powered Feature

Add an AI/ML feature to InvestPro (using Claude API or local logic).

## Input

The user provides: feature description (prediction, analysis, recommendation, etc.)

## Common AI Features for ERP

### 1. Smart Dashboard (existing: AiDashboardService)
- Natural language queries about financial data
- Auto-generated charts from questions
- Uses Claude API for interpretation

### 2. Budget Prediction
- Forecast budget consumption based on historical data
- Anomaly detection on spending patterns

### 3. Document Analysis
- Extract data from uploaded invoices/contracts
- Auto-fill form fields from scanned documents

### 4. Smart Search
- Semantic search across conventions, marchés, projets
- Natural language filtering

## Steps

### Backend

1. **Service** with Claude API integration (if needed):
   - Use Anthropic Kotlin SDK or REST API
   - Strongly typed request/response DTOs
   - Error handling for API failures

2. **Controller** endpoint with `@WriteAccess`

### Frontend

3. **UI Component** - Chat interface or result display
4. **Loading states** - Skeleton/spinner during AI processing
5. **Error handling** - Graceful fallback if AI unavailable

## Rules
- Never expose API keys in frontend
- Cache AI responses when appropriate
- Provide fallback for offline/error states
- Strong typing for all AI response structures
