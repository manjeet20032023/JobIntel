# Resume Matching System - Quick Reference

## Installation
```bash
cd backend && npm install
```

## Environment Setup
```bash
# Add to .env
OPENAI_API_KEY=sk-...
OPENAI_EMBEDDINGS_URL=https://api.openai.com/v1/embeddings
OPENAI_EMBEDDINGS_MODEL=text-embedding-ada-002
```

## API Quick Start

### 1. Upload Resume
```bash
curl -X POST http://localhost:4000/api/resume/upload \
  -H "Authorization: Bearer <token>" \
  -F "resume=@resume.pdf"
```

### 2. Check Resume Status
```bash
curl http://localhost:4000/api/resume/status \
  -H "Authorization: Bearer <token>"
```

### 3. Get Matching Jobs
```bash
curl "http://localhost:4000/api/resume/matching-jobs?minScore=70" \
  -H "Authorization: Bearer <token>"
```

### 4. Admin: Embed a Job (Manual)
```bash
curl -X POST http://localhost:4000/api/ai/job-embedding/:jobId \
  -H "Authorization: Bearer <admin_token>"
```

## Database Models

### ResumeEmbedding
```typescript
{
  userId: ObjectId,           // Unique per user
  embedding: [number[]],      // 1536 dimensions
  textHash: string,           // SHA256 of resume text
  createdAt: Date,
  updatedAt: Date
}
```

### JobEmbedding
```typescript
{
  jobId: ObjectId,            // Unique per job
  embedding: [number[]],      // 1536 dimensions
  textHash: string,           // SHA256 of job description
  createdAt: Date,
  updatedAt: Date
}
```

### JobMatch
```typescript
{
  userId: ObjectId,
  jobId: ObjectId,
  matchScore: number,         // 0-100%
  similarityScore: number,    // 0-1 (cosine)
  notified: boolean,
  notificationSentAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## File Structure

```
backend/
├── src/
│   ├── models/
│   │   ├── ResumeEmbedding.ts      (NEW)
│   │   ├── JobEmbedding.ts         (NEW)
│   │   ├── JobMatch.ts             (NEW)
│   │   └── User.ts                 (EXTENDED)
│   ├── services/
│   │   ├── embeddingService.ts     (NEW)
│   │   ├── resumeService.ts        (NEW)
│   │   ├── matchingEngine.ts       (NEW)
│   │   └── jobEmbeddingService.ts  (NEW)
│   ├── controllers/
│   │   ├── resumeController.ts     (NEW)
│   │   └── jobController.ts        (MODIFIED)
│   ├── routes/
│   │   ├── resume.ts               (NEW)
│   │   └── ai.ts                   (EXTENDED)
│   └── index.ts                    (MODIFIED - added resume route)
├── docs/
│   ├── RESUME_MATCHING.md          (Complete API docs)
│   ├── DEPLOYMENT.md               (Setup guide)
│   └── RESUME_MATCHING_IMPLEMENTATION.md (This implementation)
└── scripts/
    └── test-resume-matching.sh     (Integration test)
```

## Key Functions

### embeddingService.ts
```typescript
cosineSimilarity(vecA, vecB): number        // 0-1
getEmbedding(text): Promise<number[]>       // Calls OpenAI
similarityToMatchScore(similarity): number  // 0-100%
meetsMatchThreshold(similarity): boolean    // >= 0.7
```

### resumeService.ts
```typescript
processResume(userId, buffer, mimeType): Promise<{resumeText, embedding, textHash}>
getResumeEmbedding(userId): Promise<IResumeEmbedding>
userHasResume(userId): Promise<boolean>
```

### matchingEngine.ts
```typescript
matchJobAgainstAllResumes(jobId, jobEmbedding): Promise<MatchResult[]>
getUserMatchingJobs(userId, minScore): Promise<any[]>
getJobMatchDetails(userId, jobId): Promise<IJobMatch>
markMatchesAsNotified(matches): Promise<void>
```

### jobEmbeddingService.ts
```typescript
generateJobEmbedding(jobId): Promise<{embedding, matches}>
triggerJobMatchNotifications(jobId, matches): Promise<void>
getJobEmbedding(jobId): Promise<IJobEmbedding>
```

## Workflow Diagram

```
┌─ User Uploads Resume ─┐
│                        │
│  1. Parse PDF/DOCX    │
│  2. Generate Embedding│
│  3. Store in DB       │
│  4. Ready for matches │
└───────────────────────┘
              │
              ▼
┌─ Admin Posts Job ─────┐
│                        │
│  1. Create job (draft)│
│  2. Publish (status)  │
│  3. Auto-embed        │
│  4. Match resumes     │
│  5. Queue notifs      │
└───────────────────────┘
              │
              ▼
┌─ User Sees Matches ───┐
│                        │
│  GET /matching-jobs   │
│  Returns ALL >= 70%   │
│  Sorted by score DESC │
└───────────────────────┘
              │
              ▼
┌─ User Applies ────────┐
│                        │
│  POST /applications   │
│  Select matched job   │
│  Apply (tracked)      │
└───────────────────────┘
```

## Configuration Options

### Threshold
Default: 70% (0.7 similarity)
Change in: `matchingEngine.ts`

### Model
Default: text-embedding-ada-002 (1536 dims)
Change in: `.env` OPENAI_EMBEDDINGS_MODEL

### File Size
Default: 5MB
Change in: `resumeController.ts` multer config

### Max Text for Embedding
Default: 8000 chars
Change in: `embeddingService.ts` maxChars

## Debugging

### Check if Resume Uploaded
```bash
db.resumeembeddings.find({ userId: ObjectId("...") })
db.users.findOne({ _id: ObjectId("...") }).resume
```

### Check if Job Embedded
```bash
db.jobembeddings.find({ jobId: ObjectId("...") })
```

### Check Matches Created
```bash
db.jobmatches.find({ userId: ObjectId("...") }).sort({ matchScore: -1 })
```

### Check Notifications Queued
```bash
# In Redis CLI
LLEN bull:notifications:*
```

## Performance Tips

1. **Batch uploads**: Upload multiple resumes during off-hours
2. **Lazy embeddings**: Only embed published jobs (not drafts)
3. **Cache resumes**: Avoid re-parsing same file
4. **Index queries**: Indexes created automatically on collections
5. **Monitor API usage**: Check OpenAI dashboard for costs

## Troubleshooting

### "OpenAI API Error"
- Verify OPENAI_API_KEY is set
- Check API status: https://status.openai.com
- Increase timeout if needed

### "No matches found"
- Verify resume uploaded: `GET /resume/status`
- Verify job published: `GET /jobs/:id` → status="published"
- Lower threshold: `GET /matching-jobs?minScore=50`

### "Embedding already exists (unchanged)"
- File hash matches previous upload
- System avoids redundant API calls
- Delete from ResumeEmbedding to force re-embed

### "File too large"
- Max 5MB
- Try compressing PDF or upload DOCX instead

## Monitoring Checklist

- [ ] OpenAI API daily usage quota
- [ ] MongoDB ResumeEmbedding collection size
- [ ] JobMatch documents created
- [ ] Notification queue depth
- [ ] API response times
- [ ] Error logs in console

## Support

See detailed docs:
- `RESUME_MATCHING.md` - Complete API documentation
- `DEPLOYMENT.md` - Production setup guide
- `RESUME_MATCHING_IMPLEMENTATION.md` - Implementation details

## Testing

```bash
# Run integration test
bash backend/scripts/test-resume-matching.sh

# Manual test with curl
./test-resume-matching.sh
```

---

**Last Updated**: January 2025
**Status**: Production Ready ✅
