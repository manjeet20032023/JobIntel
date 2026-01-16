# Resume Matching System - Deployment & Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

This will install new dependencies:
- `pdf-parse`: PDF parsing
- `mammoth`: DOCX parsing
- `multer`: File upload handling

### 2. Configure Environment Variables

Add to `.env`:
```env
# OpenAI Embeddings API
OPENAI_API_KEY=sk-YOUR_KEY
OPENAI_EMBEDDINGS_URL=https://api.openai.com/v1/embeddings
OPENAI_EMBEDDINGS_MODEL=text-embedding-ada-002

# Database (existing)
MONGODB_URI=mongodb+srv://...

# Redis (existing, required for notifications)
REDIS_URL=redis://...
```

### 3. Start Backend
```bash
npm run dev
```

### 4. Verify Setup
```bash
curl http://localhost:4000/api/health
# Should show: { "service": "jobscout-backend", "status": "ok", "mongo": "connected", "redis": "connected|optional" }
```

## Database Setup

The system automatically creates the following collections on first use:

```javascript
// ResumeEmbedding - Stores user resume vectors
db.resumeembeddings.createIndex({ userId: 1 }, { unique: true })

// JobEmbedding - Stores job vectors
db.jobembeddings.createIndex({ jobId: 1 }, { unique: true })

// JobMatch - Tracks matching results
db.jobmatches.createIndex({ userId: 1, jobId: 1 }, { unique: true })
db.jobmatches.createIndex({ userId: 1, matchScore: -1 })
```

If you want to pre-create indexes:
```bash
mongo jobintel < backend/scripts/create-indexes.js
```

## Production Deployment

### Environment Variables Checklist
- [ ] OPENAI_API_KEY (required)
- [ ] MONGODB_URI (required, use Atlas)
- [ ] REDIS_URL (required for notifications)
- [ ] SMTP_HOST, SMTP_USER, SMTP_PASS (for email notifications)
- [ ] JWT_SECRET (existing)
- [ ] NODE_ENV=production

### Performance Settings
```env
# Limit file uploads
MAX_FILE_SIZE=5242880  # 5MB

# Batch processing (if doing bulk embeddings)
EMBEDDING_BATCH_SIZE=10
EMBEDDING_BATCH_DELAY=500  # ms between batches
```

### Monitoring
Set up monitoring for:
1. **OpenAI API Calls**: Track token usage & costs
2. **Database Queries**: Monitor embedding lookups
3. **Notification Queue**: Track job match notifications
4. **Error Logs**: Resume parsing failures, API errors

### Backup Strategy
- **ResumeEmbedding**: Store embeds separately (can be regenerated)
- **JobEmbedding**: Store embeds separately (can be regenerated)
- **JobMatch**: Critical - includes user match history
- **User.resume**: Critical - raw resume text

## Troubleshooting

### OpenAI API Errors

**Error: "OPENAI_API_KEY not configured"**
- Check .env file has OPENAI_API_KEY
- Verify key is valid: `curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models`

**Error: "Invalid embedding response from OpenAI"**
- Check text length (max ~8000 chars after truncation)
- Verify API rate limits not exceeded
- Check API status: https://status.openai.com

**Error: "Timeout waiting for OpenAI"**
- Increase timeout in embeddingService.ts
- Check network connectivity
- Verify firewall allows HTTPS to api.openai.com

### Resume Upload Issues

**Error: "Only PDF and DOCX files are allowed"**
- Ensure file has correct extension (.pdf or .docx)
- Verify MIME type is correct
- Try uploading with curl: `curl -F "resume=@file.pdf" ...`

**Error: "Resume file is empty"**
- Check file is not corrupted
- Try opening file locally to verify content
- For PDFs: Ensure not scanned image-only PDF (requires OCR)

**Error: "File too large"**
- Max size is 5MB
- Compress or split large PDFs

### Matching Issues

**No matches found even though resume & job exist**
1. Check resume uploaded: `GET /api/resume/status`
2. Check job published: `GET /api/jobs/:id` (status should be "published")
3. Lower threshold: `GET /api/resume/matching-jobs?minScore=50`
4. Check embeddings generated:
   ```bash
   # In MongoDB shell
   db.resumeembeddings.findOne({ userId: ObjectId("...") })
   db.jobembeddings.findOne({ jobId: ObjectId("...") })
   ```

**Error: "Vectors must have the same dimension"**
- Indicates corrupt embedding in database
- Regenerate: Delete document and re-upload/publish
- Check OPENAI_EMBEDDINGS_MODEL matches deployment

### Database Issues

**Index conflicts**
```bash
# In MongoDB shell
db.resumeembeddings.getIndexes()  # Should show userId: 1 unique
db.jobembeddings.getIndexes()      # Should show jobId: 1 unique
db.jobmatches.getIndexes()         # Should show userId:1, jobId:1 unique
```

**Collection doesn't exist**
- Collections auto-create on first document insert
- If needed, manually create with: `db.createCollection("resumeembeddings")`

### Notification Issues

**Matches created but no notifications sent**
1. Check Redis connection: `GET /api/health`
2. Check notification queue: 
   ```bash
   # In Redis CLI
   LLEN bull:notifications:* 
   ```
3. Check NotificationLog for failed attempts:
   ```bash
   # In MongoDB shell
   db.notificationlogs.find({ status: "failed" })
   ```

## Cost Estimation

### OpenAI API Costs (as of Jan 2025)
- Embedding (text-embedding-ada-002): $0.02 per 1M tokens
- Average resume: ~500 tokens = $0.00001
- Average job: ~300 tokens = $0.000006
- Cost per user with resume: ~$0.00001 (one-time)
- Cost per job embedding: ~$0.000006 (one-time)

**Example**: 10,000 users × 1,000 jobs
- Resume embeddings: 10,000 × $0.00001 = $0.10
- Job embeddings: 1,000 × $0.000006 = $0.006
- **Total**: ~$0.11 (very cheap)

### Database Storage Costs
- Resume embedding: ~6KB per user (1536 floats)
- Job embedding: ~6KB per job
- JobMatch: ~200 bytes per match
- 10,000 users: ~60MB
- 1,000 jobs: ~6MB
- 1M matches: ~200MB

## Advanced Configuration

### Custom Similarity Threshold
Change in matchingEngine.ts:
```typescript
const THRESHOLD = 0.7;  // 70% - change this value
```

### Different Embedding Model
Change in embeddingService.ts:
```typescript
const EMBEDDINGS_MODEL = 'text-embedding-3-large';  // 3072 dimensions
```

### Batch Embedding Processor
For large datasets, create background job:
```bash
npm run batch-embed  # Custom script needed
```

## Health Checks

### Verify System Health
```bash
# Check API
curl http://localhost:4000/api/health

# Check OpenAI connectivity
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models | grep embedding

# Check MongoDB
mongosh "mongodb://..." --eval "db.adminCommand('ping')"

# Check Redis
redis-cli ping
```

### Monitor Embeddings
```bash
# Count embeddings
db.resumeembeddings.countDocuments()
db.jobembeddings.countDocuments()
db.jobmatches.countDocuments({ matchScore: { $gte: 70 } })

# Check latest embeddings
db.resumeembeddings.find().sort({ createdAt: -1 }).limit(10)
db.jobembeddings.find().sort({ createdAt: -1 }).limit(10)
```

## Scaling Strategies

### For 100K+ Users
1. **Cache embeddings in Redis**: Frequently accessed resumes
2. **Pre-compute similarity matrix**: Batch job updates
3. **Use vector database**: Pinecone, Weaviate, Milvus for faster search
4. **Separate worker service**: Handle embeddings async

### For 10K+ Jobs
1. **Incremental embedding**: Only new/updated jobs
2. **Background batch jobs**: Process during off-hours
3. **Vector similarity search**: Use vector DB instead of relational

### Implementation Example (Future)
```typescript
// Use Pinecone for vector similarity search
import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone();
const index = pinecone.Index('job-resumes');

// Store embedding
await index.upsert([{
  id: `resume_${userId}`,
  values: embedding,
  metadata: { userId, textHash }
}]);

// Query: Find top 50 similar jobs
const results = await index.query({
  vector: resumeEmbedding,
  topK: 50,
  filter: { status: 'published' }
});
```

## Migration from Existing System

If you already have jobs without embeddings:

```bash
# Generate embeddings for all published jobs (one-time)
npm run embed-all-jobs --filter="status:published"
```

## Security Checklist

- [ ] OPENAI_API_KEY not logged anywhere
- [ ] Resume text encrypted at rest (optional: MongoDB encryption)
- [ ] Only authenticated users can upload resumes
- [ ] Only authenticated users can see their own matches
- [ ] Admin role required for manual embedding
- [ ] API rate limiting enabled on upload endpoint
- [ ] File upload validation (type, size)
- [ ] No embeddings exposed in API responses (only scores)
