# Convex Database Migration Plan

## Overview

This document outlines the database migration strategy for deploying the VizTechStack Roadmap feature to production.

## Current Schema Status

**Location:** `convex/schema.ts`

**Tables Defined:**
- `roadmaps` - Main roadmap data with graph structure
- `roadmapSummaries` - Denormalized data for list queries
- `topics` - Detailed content for nodes
- `progress` - User progress tracking
- `bookmarks` - User bookmarks

**Indexes:**
- `by_slug` on roadmaps
- `by_category` on roadmaps
- `by_status` on roadmaps
- `by_createdAt` on roadmaps
- User-specific indexes on progress and bookmarks

## Deployment Strategy

### Phase 1: Schema Deployment

1. **Deploy to Convex Cloud**
   ```bash
   npx convex deploy
   ```
   - Convex automatically handles schema migrations
   - No downtime required for additive changes
   - Indexes are created automatically

2. **Verify Schema**
   - Check Convex dashboard for table creation
   - Verify indexes are active
   - Test queries in Convex dashboard

### Phase 2: Data Seeding (Optional)

If seeding initial data:

1. **Create Seed Script**
   - Location: `convex/seed.ts`
   - Seed sample roadmaps for testing
   - Seed admin user data if needed

2. **Run Seed**
   ```bash
   npx convex run seed:seedRoadmaps
   ```

### Phase 3: Verification

1. **Test Queries**
   - List roadmaps: `npx convex run roadmaps:list`
   - Get by slug: `npx convex run roadmaps:getBySlug --slug "frontend-developer"`
   - Verify real-time subscriptions work

2. **Test Mutations**
   - Create test roadmap via GraphQL API
   - Update roadmap
   - Delete test roadmap

3. **Performance Testing**
   - Test with 100+ nodes roadmap
   - Verify query performance
   - Check real-time sync latency

## Rollback Plan

### Scenario 1: Schema Issues

**Problem:** Schema deployment fails or causes errors

**Solution:**
1. Convex maintains schema history
2. Revert to previous deployment:
   ```bash
   npx convex rollback
   ```
3. Fix schema issues locally
4. Redeploy when ready

### Scenario 2: Data Corruption

**Problem:** Data becomes corrupted or invalid

**Solution:**
1. Convex provides point-in-time recovery
2. Contact Convex support for data restoration
3. Alternatively, clear affected tables and reseed:
   ```bash
   npx convex run admin:clearTable --table "roadmaps"
   npx convex run seed:seedRoadmaps
   ```

### Scenario 3: Performance Issues

**Problem:** Queries are slow or timing out

**Solution:**
1. Check index usage in Convex dashboard
2. Add missing indexes if needed
3. Optimize queries to use indexes
4. Consider denormalization (already done with roadmapSummaries)

## Production Checklist

- [ ] Convex project created in production environment
- [ ] Environment variables configured in Vercel
  - `CONVEX_URL` - Production Convex URL
  - `NEXT_PUBLIC_CONVEX_URL` - Public Convex URL
- [ ] Schema deployed to production
- [ ] Indexes verified active
- [ ] Test queries executed successfully
- [ ] Real-time subscriptions tested
- [ ] Performance benchmarks met
- [ ] Monitoring and alerts configured

## Monitoring

### Key Metrics to Monitor

1. **Query Performance**
   - Average query time < 100ms
   - P95 query time < 500ms
   - Real-time subscription latency < 50ms

2. **Database Size**
   - Monitor table sizes
   - Set up alerts for rapid growth
   - Plan for scaling if needed

3. **Error Rates**
   - Monitor failed queries
   - Track validation errors
   - Alert on error spikes

### Convex Dashboard

- Access: https://dashboard.convex.dev
- Monitor real-time metrics
- View query logs
- Check function execution times

## Backup Strategy

**Convex Automatic Backups:**
- Convex maintains automatic backups
- Point-in-time recovery available
- Contact support for restoration

**Manual Backups (Optional):**
- Export data periodically via queries
- Store exports in secure location
- Document restoration procedure

## Migration Timeline

**Estimated Time:** 30 minutes

1. Schema deployment: 5 minutes
2. Verification: 10 minutes
3. Performance testing: 10 minutes
4. Monitoring setup: 5 minutes

**Recommended Window:** Low-traffic period (e.g., late night)

## Post-Migration Tasks

1. Monitor error logs for 24 hours
2. Verify all features working in production
3. Check performance metrics
4. Gather user feedback
5. Document any issues encountered

## Contact Information

**Convex Support:**
- Email: support@convex.dev
- Discord: https://discord.gg/convex
- Documentation: https://docs.convex.dev

**Team Contacts:**
- Database Admin: [Your contact]
- DevOps Lead: [Your contact]
- On-call Engineer: [Your contact]

---

**Last Updated:** 2026-03-07
**Status:** Ready for deployment
