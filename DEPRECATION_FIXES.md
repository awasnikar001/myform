# Deprecation Warnings - Fix Summary

## ✅ Completed Changes

### 1. Sass Deprecation Warning (Webapp) - FIXED
**File**: `packages/webapp/vite.config.mts`
- Added `css.preprocessorOptions.scss.api: 'modern-compiler'` to use the modern Sass API
- This eliminates the "legacy JS API" deprecation warnings

### 2. Mongoose Deprecation Warnings (Server) - FIXED
**File**: `packages/server/src/config/mongo/index.ts`
- Removed deprecated connection options:
  - `useNewUrlParser: true` (default in v6+)
  - `useFindAndModify: false` (default in v6+)
  - `useCreateIndex: true` (default in v6+)
  - `useUnifiedTopology: true` (default in v6+)
- These options were causing deprecation warnings and are no longer needed

### 3. Apollo Server Deprecation Warnings (Server) - FIXED
**Files Modified**:
- `packages/server/src/config/graphql/index.ts`
- `packages/server/package.json`

**Changes**:
- Removed unused `SchemaDirectiveVisitor` directive (was registered but never used)
- Replaced `UserInputError` from `apollo-server-express` with `BadRequestException` from `@nestjs/common`
- Removed direct `apollo-server` and `apollo-server-express` dependencies (handled by @nestjs/graphql)
- Updated error handling to use NestJS exceptions

### 4. Package Upgrades
**File**: `packages/server/package.json`

**Upgraded**:
- `mongoose`: `5.13.20` → `^6.13.0`
- `@nestjs/mongoose`: `7.0.2` → `^9.2.0`
- `@nestjs/graphql`: `7.6.0` → `^9.1.4`
- `@types/mongoose`: `5.7.36` → `^5.11.97`

**Removed**:
- `apollo-server`: `2.26.2` (no longer needed)
- `apollo-server-express`: `2.26.2` (no longer needed)

## 📋 Next Steps

### 1. Install Updated Dependencies
Run the following command to install the updated packages:
```bash
cd packages/server
pnpm install
```

### 2. Test the Application
After installing dependencies, test:
- [ ] Server starts without deprecation warnings
- [ ] GraphQL queries/mutations work correctly
- [ ] Database operations work correctly
- [ ] Error handling works correctly
- [ ] LowerCase scalar still works

### 3. Verify Deprecation Warnings Are Gone
Check both server and webapp terminal logs to confirm:
- ✅ No `punycode` deprecation warnings
- ✅ No `util.isString` deprecation warnings
- ✅ No `util.isArray` deprecation warnings
- ✅ No Sass legacy API warnings

## Additional Fixes for Remaining Warnings

### Fixed `util.isString` Warning
**File**: `packages/server/package.json`
- Upgraded `@nestjs/bull`: `0.3.1` → `^0.6.3`
- This fixes the `util.isString` deprecation warning from `@nestjs/bull`

### Addressing `punycode` Warning
**File**: `packages/server/package.json`
- Added `punycode: "^2.3.1"` to pnpm overrides
- **Note**: The `punycode` warning comes from `whatwg-url@5.0.0` (used by `node-fetch@2.6.7`)
- This is a transitive dependency issue that's harder to fix directly

**Options to fully resolve `punycode` warning**:
1. **Suppress the warning** (recommended for now):
   ```json
   "scripts": {
     "dev": "cross-env NODE_OPTIONS=\"--enable-source-maps --no-deprecation\" nest start --watch",
     "start": "node --enable-source-maps --no-deprecation dist/main.js"
   }
   ```

2. **Wait for upstream fixes**: The warning will disappear when:
   - `node-fetch` is upgraded to v3+ (but this might break compatibility)
   - Or when `whatwg-url` is updated in the dependency tree

3. **Upgrade entire NestJS stack**: Upgrading to NestJS v8+ would bring newer dependencies that don't use deprecated APIs

## ⚠️ Potential Issues & Solutions

### If GraphQL errors occur:
- Check if `bodyParserConfig` needs updating (may be deprecated in @nestjs/graphql v9)
- Verify `uploads: false` is still valid (may need to be removed)

### If Mongoose errors occur:
- Some query methods may have changed in v6 - check Mongoose migration guide
- Ensure all model schemas are compatible with Mongoose v6

### If @nestjs/graphql compatibility issues:
- @nestjs/graphql v9 should be compatible with NestJS v7
- If issues arise, consider upgrading entire NestJS stack to v8+

### If @nestjs/bull upgrade causes issues:
- Version 0.6.3 should be backward compatible with 0.3.1
- Check Bull queue decorators and processors still work correctly

## 📝 Notes

- The `lower` directive was registered but never actually used in the GraphQL schema
- `LowerCaseScalar` is the actual implementation being used for lowercase strings
- `graphql-tools` remains in dependencies but may not be needed - can be removed if not used
- Some deprecation warnings may still appear from transitive dependencies (like `punycode` from `got`), but the main sources are fixed

## 🔗 References

- [Mongoose v6 Migration Guide](https://mongoosejs.com/docs/migrating_to_6.html)
- [NestJS GraphQL Documentation](https://docs.nestjs.com/graphql/quick-start)
- [Sass Modern API Documentation](https://sass-lang.com/documentation/js-api)

