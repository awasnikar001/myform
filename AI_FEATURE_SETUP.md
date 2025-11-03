# Create Form with AI - Setup Guide

## Overview
The "Create Form with AI" feature has been fixed and is now ready to use. This guide will help you configure and test the feature.

## What Was Fixed

### 1. Environment Configuration Bug (Critical)
**Location:** `packages/server/src/environments/index.ts`

**Problem:** The `OPENAI_API_KEY` was incorrectly defaulting to the base URL string `'https://api.openai.com/v1'` when not set, which meant:
- The `helper.isEmpty(OPENAI_API_KEY)` check never passed
- OpenAI API calls always failed with invalid credentials
- The feature always fell back to generic placeholder fields

**Fix:** 
```typescript
// Before (incorrect):
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'https://api.openai.com/v1'

// After (correct):
export const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY
```

### 2. GraphQL Response Mismatch
**Locations:** 
- `packages/server/src/resolver/form/form.ai.resolver.ts`
- `packages/webapp/src/consts/gql.ts`

**Problem:** The mutation returned a full `FormModel` object, but the webapp expected just a form ID string (like the regular `createForm` mutation).

**Fix:** Changed the resolver to return `String` (form ID) instead of `FormType` (full form object) for consistency.

## Configuration

### Required Environment Variables

Add these to your environment configuration (`.env` file or deployment platform):

```bash
# OpenAI Configuration (Required for AI features)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Optional: Custom OpenAI endpoint (defaults to https://api.openai.com/v1)
OPENAI_BASE_URL=https://api.openai.com/v1

# Optional: Custom GPT model (defaults to gpt-3.5-turbo-0125)
OPENAI_GPT_MODEL=gpt-3.5-turbo-0125
```

### Getting an OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy and add it to your environment variables

### Supported Models

The feature works with any OpenAI chat completion model that supports JSON mode:
- `gpt-3.5-turbo` (default, most cost-effective)
- `gpt-3.5-turbo-0125` (latest 3.5)
- `gpt-4`
- `gpt-4-turbo-preview`
- `gpt-4o` (newest, most capable)

## How It Works

### 1. User Flow
```
User enters form topic → 
Optional: Reference/context → 
AI generates conversational questions → 
Form created with draft fields → 
User can edit/publish
```

### 2. Technical Flow

```typescript
// Frontend (packages/webapp/src/layouts/Workspace/CreateWithAIModel.tsx)
const formId = await FormService.createWithAI({
  projectId: 'project-id',
  topic: 'Customer Satisfaction Survey',
  reference: 'Focus on product quality and service'
})

// Backend (packages/server/src/resolver/form/form.ai.resolver.ts)
1. Validates OPENAI_API_KEY is set
2. Calls OpenAI with structured prompt
3. Parses AI-generated fields
4. Normalizes field types to HeyForm schema
5. Creates form with fields in _drafts
6. Returns form ID
```

### 3. Fallback Behavior

If OpenAI is unavailable or API key is missing, the feature gracefully falls back to basic fields:
- Name field (short_text, required)
- Email field (email, required)
- Thank you screen

This ensures the feature never completely fails.

## Testing

### 1. Start the Server

```bash
cd packages/server
# Make sure OPENAI_API_KEY is in your environment
npm run start:dev
```

### 2. Start the Webapp

```bash
cd packages/webapp
npm run dev
```

### 3. Test the Feature

1. Log in to your HeyForm instance
2. Navigate to a project
3. Click "Create Form"
4. Select "Create with AI"
5. Enter a form topic (e.g., "Employee Feedback Survey")
6. Optionally add reference/context
7. Submit and verify the form is created with AI-generated fields

### 4. Check Logs

Monitor server logs for:
```
✓ Successful: Form created with AI-generated fields
✗ Error: "Failed to generate form with AI" (check API key and OpenAI status)
```

## Troubleshooting

### Issue: Forms always have generic fields (name, email, thank you)

**Cause:** OpenAI API key not configured or invalid

**Solution:**
1. Verify `OPENAI_API_KEY` is set in environment
2. Check the key is valid (not expired or revoked)
3. Verify you have API credits in your OpenAI account
4. Check server logs for specific OpenAI errors

### Issue: API calls timing out

**Cause:** Model taking too long to respond

**Solution:**
1. Try a faster model like `gpt-3.5-turbo`
2. Reduce prompt complexity
3. Check your network connection

### Issue: Generated fields have wrong types

**Cause:** AI returning unexpected field kinds

**Solution:**
The normalizer maps AI output to valid HeyForm field types. Unknown types default to `short_text`. This is expected behavior and safe.

## Cost Optimization

### Token Usage
- Average prompt: ~200 tokens
- Average response: ~800 tokens
- Total per form: ~1000 tokens

### Estimated Costs (as of 2024)
- GPT-3.5-Turbo: ~$0.001 per form creation
- GPT-4: ~$0.03 per form creation
- GPT-4o: ~$0.01 per form creation

**Recommendation:** Use GPT-3.5-Turbo for production to keep costs low.

## Advanced Configuration

### Custom Base URL (for Azure OpenAI, etc.)

```bash
OPENAI_BASE_URL=https://your-azure-endpoint.openai.azure.com/
OPENAI_API_KEY=your-azure-api-key
```

### Adjusting AI Behavior

The prompt can be customized in `packages/server/src/resolver/form/form.ai.resolver.ts`:

```typescript
const prompt = {
  topic: input.topic,
  reference: input.reference ?? null,
  instructions: 'Generate concise conversational questions...'
}
```

## Support

For issues or questions:
1. Check server logs for detailed error messages
2. Verify environment configuration
3. Test OpenAI API key directly with curl:
   ```bash
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer $OPENAI_API_KEY"
   ```
4. Refer to [HeyForm documentation](https://docs.heyform.net)
5. Join the [Discord community](https://discord.gg/sgT4v4GSTe)

## Next Steps

After setting up:
1. Rebuild the server if necessary: `cd packages/server && npm run build`
2. Restart your services
3. Test the feature with various form topics
4. Monitor usage and costs in your OpenAI dashboard
5. Consider implementing rate limiting for production use

---

**Note:** This feature requires an active OpenAI API key and internet connectivity. Make sure your deployment environment can reach OpenAI's API endpoints.

