<!-- 87be5921-7968-4276-ba5b-08dbc1467b9a fe4f846c-f64d-416a-9f51-562acbe001f0 -->
# NestJS 10 & TypeScript 5 Full Stack Upgrade Plan

## Overview

Safe, phase-by-phase upgrade of the entire stack from NestJS 7.4.4 + TypeScript 4.9.5 to NestJS 10.4.8 + TypeScript 5.5.3. This plan follows a conservative approach with testing between each phase to catch issues early.

## PHASE 1: Safety Net & Preparation (Day 1)

### 1.1 Create Git Safety Net

**Current state**: Working on `custom-branch`

**Actions**:

1. Commit and push all current changes to `custom-branch`
2. Create upgrade branch from `custom-branch`: `git checkout -b upgrade/nestjs-10-from-custom`
3. Tag current state: `git tag -a v3.0.0-pre-upgrade -m "Before NestJS 10 upgrade"`
4. Push branch and tag: `git push -u origin upgrade/nestjs-10-from-custom --tags`

**Files to verify are committed**:

- All `package.json` files
- All `tsconfig.json` files
- All source code in `packages/server/src/`
- Current `.env` configuration (if not gitignored)

### 1.2 Backup Local Environment

**Create backup directory**:

```bash
mkdir -p ~/myform-upgrade-backup-$(date +%Y%m%d)
```

**Backup critical files**:

1. Copy current `node_modules` state (for quick rollback)
2. Export current environment variables: `env | grep -E "(MONGO|REDIS|SMTP|STRIPE|OPENAI)" > .env.backup`
3. Save current `pnpm-lock.yaml`: `cp pnpm-lock.yaml ~/myform-upgrade-backup-$(date +%Y%m%d)/`
4. Document current working versions in `VERSIONS.md`

### 1.3 Create Upgrade Documentation

**Create `UPGRADE_LOG.md`** in project root:

```markdown
# Upgrade Log - NestJS 10 & TypeScript 5

## Start Date: [DATE]
## Branch: upgrade/nestjs-10-from-custom

## Version Changes
- NestJS: 7.4.4 → 10.4.8
- TypeScript: 4.9.5 → 5.5.3
- GraphQL: 15.3.0 → 16.9.0
- Apollo: 2.26.2 → 4.11.2 (@nestjs/apollo)
- Mongoose: 6.13.0 → 7.8.3

## Daily Progress
### Day 1: [Log activities]
### Day 2: [Log activities]
...
```

**Create `ROLLBACK.md`** with rollback procedure:

```markdown
# Emergency Rollback Procedure

1. Stop all running processes
2. Checkout original branch: `git checkout custom-branch`
3. Clean install: `rm -rf node_modules packages/*/node_modules pnpm-lock.yaml && pnpm install`
4. Rebuild: `pnpm build`
5. Restore .env if needed
```

### 1.4 Verify Current State Works

**Before making any changes**:

1. Clean build all packages: `pnpm build`
2. Start server: `pnpm --filter server dev`
3. Start webapp: `pnpm --filter webapp dev`
4. Verify basic operations:

                        - Access http://localhost:5173 (webapp)
                        - Access http://localhost:9157/graphql (GraphQL playground)
                        - Test login functionality
                        - Create a test form

5. Document any existing issues in `UPGRADE_LOG.md`

## PHASE 2: TypeScript & Shared Packages Upgrade (Days 2-3)

### 2.1 Update Shared Packages First

These packages have no NestJS dependencies, safer to upgrade first.

**Update `packages/shared-types-enums/package.json`**:

```json
{
  "devDependencies": {
    "@types/node": "^20.14.9",
    "typescript": "5.5.3"
  }
}
```

**Update `packages/shared-types-enums/tsconfig.json`**:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020"],
    "module": "commonjs",
    "forceConsistentCasingInFileNames": true,
    "esModuleInterop": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "strict": true,
    "removeComments": true,
    "allowSyntheticDefaultImports": true,
    "listEmittedFiles": true,
    "listFiles": true,
    "allowJs": false,
    "declaration": true,
    "sourceMap": true,
    "importHelpers": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "skipLibCheck": true
  }
}
```

**Update `packages/utils/package.json`** (already on 5.5.3, just verify):

- Ensure TypeScript is exactly `5.5.3` (not `^5.5.3`)

**Update `packages/answer-utils/package.json`** (already on 5.5.3, just verify):

- Ensure TypeScript is exactly `5.5.3`

**Update `packages/embed/package.json`**:

```json
{
  "devDependencies": {
    "typescript": "5.5.3"
  }
}
```

### 2.2 Test Shared Packages

```bash
# Clean install
rm -rf packages/shared-types-enums/node_modules
rm -rf packages/utils/node_modules
rm -rf packages/answer-utils/node_modules
rm -rf node_modules pnpm-lock.yaml

pnpm install

# Build in order
pnpm --filter shared-types-enums build
pnpm --filter utils build
pnpm --filter answer-utils build
pnpm --filter embed build

# Run tests
pnpm --filter utils test
pnpm --filter answer-utils test
```

**Success criteria**: All builds and tests pass without errors.

### 2.3 Update Server TypeScript Configuration

**Update `packages/server/tsconfig.json`**:

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2020",
    "lib": ["ES2020"],
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "paths": {
      "@decorator": ["src/common/decorator"],
      "@graphql": ["src/common/graphql"],
      "@guard": ["src/common/guard"],
      "@dto": ["src/common/dto"],
      "@interceptor": ["src/common/interceptor"],
      "@middleware": ["src/common/middleware"],
      "@config": ["src/config"],
      "@environments": ["src/environments"],
      "@controller": ["src/controller"],
      "@model": ["src/model"],
      "@resolver": ["src/resolver"],
      "@service": ["src/service"],
      "@schedule": ["src/schedule"],
      "@utils": ["src/utils"]
    },
    "incremental": true,
    "skipLibCheck": true,
    "declaration": false,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "noEmitOnError": false,
    "noUnusedLocals": true,
    "allowUnreachableCode": false,
    "allowUnusedLabels": false
  },
  "exclude": ["view", "node_modules", "dist"]
}
```

**Key additions**: `lib: ["ES2020"]`, `useDefineForClassFields: false`, `esModuleInterop`, `forceConsistentCasingInFileNames`

## PHASE 3: Core NestJS Dependencies Update (Days 3-4)

### 3.1 Update Server package.json

**Update `packages/server/package.json`** - Main dependencies:

```json
{
  "dependencies": {
    "@nestjs/apollo": "^12.2.0",
    "@nestjs/bull": "^10.2.1",
    "@nestjs/common": "^10.4.8",
    "@nestjs/core": "^10.4.8",
    "@nestjs/graphql": "^12.2.0",
    "@nestjs/mongoose": "^10.1.0",
    "@nestjs/platform-express": "^10.4.8",
    "@nestjs/schedule": "^4.1.1",
    "@nestjs/throttler": "^5.2.0",
    
    "@apollo/server": "^4.11.2",
    "graphql": "^16.9.0",
    "graphql-tools": "^9.0.1",
    
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.1",
    
    "bull": "^4.16.3",
    "mongoose": "^7.8.3",
    "ioredis": "^5.4.1",
    
    "typescript": "5.5.3",
    "reflect-metadata": "^0.2.2"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.4.9",
    "@types/node": "^20.14.9"
  }
}
```

See `packages/server/package.json` for complete updated file with all dependencies.

### 3.2 Update pnpm Overrides in Root

**Update root `package.json`** overrides:

```json
{
  "pnpm": {
    "overrides": {
      "ws": "^8.18.0"
    }
  }
}
```

(Keep all existing overrides, just update `ws` for security)

## PHASE 4: Code Migration for NestJS 10 (Days 4-5)

### 4.1 Update App Module

**File**: `packages/server/src/app.module.ts`

**Changes**:

1. Import `HttpModule` from `@nestjs/axios` instead of `@nestjs/common`
2. Change `HttpModule` to `HttpModule.register({})`
3. Add Apollo driver imports and configuration
4. Update `ThrottlerModule.forRoot` to accept array

**Before**:

```typescript
import { HttpModule } from '@nestjs/common'
// ...
imports: [HttpModule]
ThrottlerModule.forRoot({ ttl: hs('1m'), limit: 1000 })
```

**After**:

```typescript
import { HttpModule } from '@nestjs/axios'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
// ...
imports: [HttpModule.register({})]
ThrottlerModule.forRoot([{ ttl: hs('1m'), limit: 1000 }])
GraphQLModule.forRootAsync<ApolloDriverConfig>({
  driver: ApolloDriver,
  useClass: GraphqlService
})
```

### 4.2 Update GraphQL Configuration

**File**: `packages/server/src/config/graphql/index.ts`

**Changes**:

1. Import from `@nestjs/apollo`
2. Update `formatError` signature for GraphQL 16
3. Change return type to `ApolloDriverConfig`
4. Remove deprecated `uploads` option

**Key changes**:

```typescript
import { ApolloDriverConfig } from '@nestjs/apollo'
import { GraphQLError, GraphQLFormattedError } from 'graphql'

async createGqlOptions(): Promise<ApolloDriverConfig> {
  return {
    autoSchemaFile: true,
    formatError: (formattedError: GraphQLFormattedError, error: unknown) => {
      const graphQLError = error as GraphQLError
      // ... updated error handling
    }
    // Remove: uploads: false
  }
}
```

### 4.3 Update Main Bootstrap

**File**: `packages/server/src/main.ts`

**Changes**:

1. Update `helmet` import (now default export)
2. Update `express-rate-limit` import and API
3. Update `helmet` configuration

**Before**:

```typescript
import * as helmet from 'helmet'
import * as rateLimit from 'express-rate-limit'

app.use(rateLimit({ /* ... */ }))
app.use(helmet({ /* ... */ }))
```

**After**:

```typescript
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'

app.use(rateLimit({
  windowMs: ms('1m'),
  limit: 1000,
  standardHeaders: true,
  legacyHeaders: false
}))
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}))
```

### 4.4 Search and Update class-transformer Usage

**Search for**: `plainToClass`, `classToPlain`, `plainToClassFromExist`, `classToClass`

**Command**:

```bash
grep -r "plainToClass\|classToPlain\|plainToClassFromExist\|classToClass" packages/server/src --include="*.ts"
```

**Replace with**:

- `plainToClass` → `plainToInstance`
- `classToPlain` → `instanceToPlain`
- `plainToClassFromExist` → `plainToInstance` (with merge option)
- `classToClass` → `instanceToInstance`

### 4.5 Find and Update HttpService Imports

**Search for**: Services using `HttpService`

**Command**:

```bash
grep -r "HttpService" packages/server/src --include="*.ts" -l
```

**For each file found**, ensure the module imports `HttpModule`:

```typescript
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [HttpModule],
  providers: [YourService]
})
```

### 4.6 Evaluate Redis Client Compatibility

**Test current Redis configuration** with ioredis 5.4.1:

1. Update `@svtslv/nestjs-ioredis` if compatible version exists
2. If issues occur, document migration path to `@nestjs/ioredis` or `@songkeys/nestjs-redis`
3. Current usage in `packages/server/src/config/redis/index.ts` - verify it still works

**Decision point**: If `@svtslv/nestjs-ioredis` causes issues, create separate migration task.

## PHASE 5: Install & Build (Day 5)

### 5.1 Clean Install

```bash
# From project root
rm -rf node_modules
rm -rf packages/*/node_modules
rm pnpm-lock.yaml

# Fresh install
pnpm install
```

### 5.2 Build Order

```bash
# 1. Shared packages
pnpm --filter shared-types-enums build
pnpm --filter utils build
pnpm --filter answer-utils build

# 2. Frontend packages
pnpm --filter form-renderer build
pnpm --filter embed build

# 3. Server (expect some errors first time)
pnpm --filter server build
```

### 5.3 Fix Compilation Errors

**Common errors to expect**:

1. **HttpModule errors**: Verify all `HttpModule` imports changed to `@nestjs/axios`
2. **Decorator errors**: Ensure `useDefineForClassFields: false` in tsconfig
3. **class-transformer errors**: Verify all method names updated
4. **GraphQL type errors**: May need explicit type declarations: `@Field(() => Number)`

**Iterative process**: Fix error → rebuild → repeat until clean build

### 5.4 Update Build Scripts if Needed

Verify root `package.json` scripts still work:

- `pnpm build:server`
- `pnpm build:webapp`

## PHASE 6: Runtime Testing & Debugging (Days 6-7)

### 6.1 Start Development Environment

**Terminal 1** - Start MongoDB & Redis:

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongo-dev mongo:6
docker run -d -p 6379:6379 --name redis-dev redis:7-alpine
```

**Terminal 2** - Start Server:

```bash
pnpm --filter server dev
```

Watch for:

- Server starts without crashes
- MongoDB connects successfully
- Redis connects successfully
- GraphQL endpoint available at http://localhost:9157/graphql

**Terminal 3** - Start Webapp:

```bash
pnpm --filter webapp dev
```

### 6.2 Fix Runtime Errors

**Common runtime issues**:

1. **Mongoose connection fails**: Check deprecated options removed
2. **Redis connection fails**: May need Redis client migration
3. **Bull queue fails**: Verify Bull 4.x configuration
4. **GraphQL errors**: Check formatError implementation
5. **Decorator issues**: Verify metadata emission

**For each error**: Document in `UPGRADE_LOG.md`, fix, restart, verify

### 6.3 Manual Testing Checklist

Create `TESTING_CHECKLIST.md`:

```markdown
## Authentication Flow
- [ ] Visit http://localhost:5173
- [ ] Click Sign Up
- [ ] Create new account
- [ ] Verify email flow (check console if SMTP not configured)
- [ ] Log out
- [ ] Log in with new account
- [ ] Test "Forgot Password" flow

## Form Builder
- [ ] Create new workspace/project
- [ ] Click "Create Form"
- [ ] Test AI form generation (if OpenAI configured)
- [ ] Add different field types:
 - [ ] Short text
 - [ ] Email
 - [ ] Multiple choice
 - [ ] File upload
 - [ ] Payment (if Stripe configured)
- [ ] Test conditional logic
- [ ] Publish form
- [ ] Copy form URL

## Form Submission
- [ ] Open form URL in incognito/different browser
- [ ] Fill out and submit form
- [ ] Verify submission appears in dashboard
- [ ] Check email notification sent (if configured)
- [ ] Test partial submission (if applicable)

## Analytics
- [ ] View form analytics
- [ ] Check charts render correctly
- [ ] Test date range filters
- [ ] Export data to CSV

## Integrations
- [ ] Test webhook integration
- [ ] Test any configured third-party integrations

## Performance
- [ ] Check browser console for errors
- [ ] Check server logs for warnings
- [ ] Verify response times are reasonable
- [ ] Check memory usage: `node --heap-size-snapshot dist/main.js`
```

Work through checklist, mark items complete, document any issues.

### 6.4 Database Operations Testing

Test critical database operations:

```bash
# In MongoDB shell or Compass
# Verify collections exist and have data
use heyform
db.forms.findOne()
db.submissions.findOne()
db.users.findOne()
```

Verify:

- Data is being written correctly
- Queries are performing well
- No deprecated warnings in logs

## PHASE 7: Performance & Optimization (Day 8)

### 7.1 Memory & Performance Check

**Monitor server**:

```bash
# Start server with heap snapshot
node --enable-source-maps --inspect dist/main.js
```

Open Chrome DevTools → Node → Take heap snapshot → Check for memory leaks

**Benchmarks to compare**:

- Startup time
- First GraphQL query response time
- Form submission time
- Memory usage at idle
- Memory usage under load (create 10 forms)

### 7.2 Check for Deprecation Warnings

Review server logs for:

- Mongoose deprecation warnings
- Bull deprecation warnings
- Any "deprecated" messages from dependencies

Document in `UPGRADE_LOG.md` with plan to address.

### 7.3 Optimize Build

Check bundle sizes:

```bash
pnpm --filter server build
du -sh packages/server/dist

pnpm --filter webapp build
du -sh packages/webapp/dist
```

Compare with pre-upgrade sizes (if you documented them).

## PHASE 8: Documentation & Cleanup (Day 9)

### 8.1 Update Documentation

**Update README.md** with new requirements:

- Node.js version requirement: `>=18.0.0`
- Update any version-specific instructions

**Create CHANGELOG.md** entry:

```markdown
## [3.0.0-alpha.4] - 2025-XX-XX

### Upgraded
- NestJS from 7.4.4 to 10.4.8
- TypeScript from 4.9.5 to 5.5.3
- GraphQL from 15.3.0 to 16.9.0
- Mongoose from 6.13.0 to 7.8.3
- Bull from 3.22.0 to 4.16.3
- Many other dependencies for security and performance

### Breaking Changes
- Minimum Node.js version is now 18.0.0
- [Document any API changes if applicable]

### Migration Notes
- [Any notes for other developers]
```

### 8.2 Clean Up Development Files

Remove temporary testing files:

- Test forms created during testing
- Test user accounts
- Any backup files in repo

### 8.3 Final Code Review

Review all changed files:

```bash
git diff custom-branch..HEAD --name-only
```

Check for:

- Commented out code (remove or document why kept)
- Console.log statements (remove debugging logs)
- TODO comments (document or fix)
- Proper error handling maintained

## PHASE 9: Merge & Deploy Preparation (Day 10)

### 9.1 Comprehensive Final Testing

Run through entire `TESTING_CHECKLIST.md` one more time, fresh.

### 9.2 Commit Strategy

**Organize commits** by phase:

```bash
git add packages/shared-types-enums packages/utils packages/answer-utils
git commit -m "Phase 2: Upgrade TypeScript to 5.5.3 in shared packages"

git add packages/server/package.json packages/server/tsconfig.json
git commit -m "Phase 3: Update NestJS and related dependencies to v10"

git add packages/server/src
git commit -m "Phase 4: Migrate code for NestJS 10 compatibility"

# etc.
```

### 9.3 Update Branch

```bash
# Update with latest from custom-branch (if it moved forward)
git fetch origin
git merge origin/custom-branch

# Resolve any conflicts
# Test again after merge
```

### 9.4 Pre-Merge Checklist

- [ ] All tests passing
- [ ] No console errors in browser
- [ ] No critical warnings in server logs
- [ ] Manual testing checklist 100% complete
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] UPGRADE_LOG.md completed
- [ ] Commits are clean and descriptive

### 9.5 Create Pull Request

**PR Description Template**:

```markdown
## NestJS 10 & TypeScript 5 Upgrade

### Summary
Comprehensive upgrade of backend stack from NestJS 7 to NestJS 10 and TypeScript 4.9.5 to 5.5.3.

### Changes
- Upgraded NestJS core from 7.4.4 to 10.4.8
- Upgraded TypeScript from 4.9.5 to 5.5.3
- Migrated from Apollo Server 2 to Apollo Server 4 (@nestjs/apollo)
- Upgraded GraphQL from 15.3.0 to 16.9.0
- Upgraded Mongoose from 6.13.0 to 7.8.3
- Updated all related dependencies for compatibility

### Testing
✅ All manual tests passed
✅ Form creation and publishing working
✅ Form submission working
✅ Analytics working
✅ Integrations tested
✅ Authentication flows verified

### Breaking Changes
- Minimum Node.js version is now 18.0.0

### Files Changed
- [List key files]

### Rollback Plan
See ROLLBACK.md for emergency rollback procedure.
```

Push and create PR:

```bash
git push origin upgrade/nestjs-10-from-custom
# Create PR on GitHub from upgrade/nestjs-10-from-custom to custom-branch
```

## PHASE 10: Monitoring & Iteration (Ongoing)

### 10.1 Post-Merge Monitoring

After merge to `custom-branch`:

- Monitor for any issues in development
- Check server logs daily for first week
- Document any new issues in GitHub Issues

### 10.2 Future Improvements

**Track for future work**:

1. Add automated tests (currently none in server)
2. Consider Redis client migration if issues arise
3. Enable stricter TypeScript checks gradually
4. Add CI/CD pipeline
5. Add health check endpoint
6. Consider upgrading to NestJS 11 when stable

### 10.3 Lessons Learned

Document in `UPGRADE_LOG.md`:

- What went smoothly
- What was challenging
- Time estimates vs actual
- Tips for next major upgrade

## Emergency Procedures

### If Server Won't Start

1. Check for syntax errors: `pnpm --filter server type-check`
2. Check environment variables: `cat .env`
3. Check MongoDB running: `docker ps | grep mongo`
4. Check Redis running: `docker ps | grep redis`
5. Review server logs for specific error
6. If stuck > 2 hours, consider rollback

### If Tests Fail

1. Document the specific failing test
2. Check if test needs updating for new API
3. Temporarily skip if non-critical
4. Create GitHub issue to track
5. Don't let perfect be enemy of good

### If Need to Rollback

Follow `ROLLBACK.md`:

```bash
git checkout custom-branch
rm -rf node_modules packages/*/node_modules pnpm-lock.yaml
pnpm install
pnpm build
# Verify it works
# Debug upgrade issues on separate branch
```

## Success Criteria

Upgrade is complete when:

- [ ] All packages build without errors
- [ ] Server starts without crashes
- [ ] All items in TESTING_CHECKLIST.md pass
- [ ] No critical console errors
- [ ] No critical server log warnings
- [ ] Performance is equal or better than before
- [ ] Documentation is updated
- [ ] Code is merged to custom-branch

Estimated timeline: 10-12 days with testing

Risk level: Medium (phase-by-phase approach reduces risk)

Rollback availability: Yes (tagged version + documented procedure)

### To-dos

- [ ] Phase 1: Create safety net (git branch, tags, backups, documentation)
- [ ] Phase 2: Upgrade TypeScript in shared packages (shared-types-enums, utils, answer-utils, embed)
- [ ] Phase 3: Update NestJS and core dependencies in package.json files
- [ ] Phase 4: Migrate code for NestJS 10 (app.module, graphql config, main.ts, class-transformer)
- [ ] Phase 5: Clean install and build all packages, fix compilation errors
- [ ] Phase 6: Start services, fix runtime errors, complete manual testing checklist
- [ ] Phase 7: Performance testing, memory checks, optimization
- [ ] Phase 8: Update documentation, cleanup, final code review
- [ ] Phase 9: Final testing, organize commits, create PR to custom-branch
- [ ] Phase 10: Post-merge monitoring and future improvements tracking