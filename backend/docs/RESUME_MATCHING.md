# AI-Powered Resume ↔ Job Matching System

## Overview

This system enables automatic matching between user resumes and job postings using OpenAI embeddings and cosine similarity scoring. The system includes:

- **Resume Upload & Parsing**: PDF/DOCX support with automatic text extraction
- **Vector Embeddings**: OpenAI embeddings for resumes and jobs
- **Smart Matching**: Cosine similarity matching with 70% threshold
- **Auto-Notifications**: Users are notified when jobs match their resume
- **Dynamic Results**: Shows ALL matching jobs, sorted by match score

## Architecture

### Models

#### ResumeEmbedding
- Stores resume vector embeddings per user
- Unique index on `userId` (1:1 relationship)
- Includes text hash to detect resume changes

#### JobEmbedding
- Stores job vector embeddings
- Unique index on `jobId` (1:1 relationship)
- Includes text hash to detect job description changes

#### JobMatch
- Tracks matching results between users and jobs
- Stores matchScore (0-100%) and similarityScore (0-1)
- Tracks notification status
- Compound index on `(userId, jobId)` for uniqueness

#### User (Extended)
```typescript
resume?: {
  rawText?: string;      // Extracted resume text
  parsedAt?: Date;       // When resume was processed
  embeddingId?: string;  // Reference to ResumeEmbedding
}
```

## API Endpoints

### Resume Management

#### Upload Resume
**POST** `/api/resume/upload`
- **Auth**: Required (Bearer token)
- **Content-Type**: `multipart/form-data`
- **Field**: `resume` (file)
- **Supported Formats**: PDF, DOCX
- **Max Size**: 5MB

**Request**:
```bash
curl -X POST http://localhost:4000/api/resume/upload \
  -H "Authorization: Bearer <token>" \
  -F "resume=@resume.pdf"
```

**Response**:
```json
{
  "success": true,
  "message": "Resume uploaded and processed successfully",
  "resume": {
    "fileName": "resume.pdf",
    "fileSize": 45678,
    "textLength": 2341,
    "embeddingDimensions": 1536,
    "textHash": "abc123..."
  }
}
```

#### Check Resume Status
**GET** `/api/resume/status`
- **Auth**: Required
- **Response**: Current resume info and last update time

**Request**:
```bash
curl http://localhost:4000/api/resume/status \
  -H "Authorization: Bearer <token>"
```

**Response**:
```json
{
  "hasResume": true,
  "resumeText": "John Doe\nSoftware Engineer...",
  "lastUpdated": "2025-01-16T10:30:00Z"
}
```

#### Get Matching Jobs
**GET** `/api/resume/matching-jobs?minScore=70`
- **Auth**: Required
- **Query Params**:
  - `minScore`: Minimum match percentage (0-100, default: 70)
- **Returns**: All jobs matching the threshold, sorted by score DESC

**Request**:
```bash
curl "http://localhost:4000/api/resume/matching-jobs?minScore=70" \
  -H "Authorization: Bearer <token>"
```

**Response**:
```json
{
  "count": 5,
  "minScore": 70,
  "jobs": [
    {
      "_id": "job123",
      "title": "Senior React Developer",
      "company": "TechCorp",
      "location": "Remote",
      "description": "...",
      "matchScore": 87,
      "similarityScore": 0.87
    },
    {
      "_id": "job124",
      "title": "Full Stack Engineer",
      "company": "StartupXYZ",
      "location": "Bangalore",
      "matchScore": 75,
      "similarityScore": 0.75
    }
  ]
}
```

### AI Endpoints (Admin Only)

#### Manually Embed a Job
**POST** `/api/ai/job-embedding/:jobId`
- **Auth**: Required + Admin role
- **Purpose**: Re-embed a job or manually trigger matching
- **Returns**: Match count and embedding info

**Request**:
```bash
curl -X POST http://localhost:4000/api/ai/job-embedding/job123 \
  -H "Authorization: Bearer <admin_token>"
```

**Response**:
```json
{
  "success": true,
  "jobId": "job123",
  "matchCount": 3,
  "embeddingDimensions": 1536
}
```

#### Get User's Job Matches (Admin)
**GET** `/api/ai/job-matches/:userId?minScore=70`
- **Auth**: Required + Admin role (or own user)
- **Returns**: All matches for user

**Request**:
```bash
curl "http://localhost:4000/api/ai/job-matches/user123?minScore=70" \
  -H "Authorization: Bearer <token>"
```

**Response**:
```json
{
  "userId": "user123",
  "minScore": 70,
  "matchCount": 5,
  "matches": [...]
}
```

## Workflow

### 1. User Uploads Resume
```
User uploads PDF/DOCX
   ↓
System extracts text from file
   ↓
Generate OpenAI embedding (1536 dims)
   ↓
Store in ResumeEmbedding collection
   ↓
Update User.resume.rawText & parsedAt
```

### 2. Admin Posts a Job
```
Admin creates job with status: "draft"
   ↓
Admin changes status to "published"
   ↓
System detects status change
   ↓
Generate job embedding from:
  - title + description + requirements + responsibilities
   ↓
Match against ALL user resumes using cosine similarity
   ↓
Save matches to JobMatch collection (only >= 70%)
   ↓
Queue notifications for matching users
   ↓
Notification worker sends emails/WhatsApp/Telegram
```

### 3. User Sees Matching Jobs
```
User calls GET /api/resume/matching-jobs
   ↓
System queries JobMatch for this user
   ↓
Filter by matchScore >= 70
   ↓
Sort by matchScore DESC
   ↓
Return all matching jobs with scores
```

## Configuration

### Environment Variables Required

```env
# OpenAI API
OPENAI_API_KEY=sk-...
OPENAI_EMBEDDINGS_URL=https://api.openai.com/v1/embeddings
OPENAI_EMBEDDINGS_MODEL=text-embedding-ada-002

# Database
MONGODB_URI=mongodb://...

# Notification (optional, for match notifications)
SMTP_HOST=...
SMTP_USER=...
SMTP_PASS=...
```

## Matching Algorithm

### Cosine Similarity
```
similarity = (A · B) / (||A|| × ||B||)
  where A = resume embedding
        B = job embedding
        · = dot product
        ||X|| = magnitude of vector X

Range: 0 to 1
  - 0 = completely different
  - 1 = identical
```

### Match Score Conversion
```
matchScore = round(similarity × 100)

Threshold: >= 70% is considered a match
```

## Database Indexes

For optimal performance, the following indexes are created:

```javascript
// ResumeEmbedding
db.resumeembeddings.createIndex({ userId: 1 }, { unique: true })

// JobEmbedding
db.jobembeddings.createIndex({ jobId: 1 }, { unique: true })

// JobMatch
db.jobmatches.createIndex({ userId: 1, jobId: 1 }, { unique: true })
db.jobmatches.createIndex({ userId: 1, matchScore: -1 })
```

## Example: End-to-End Flow

### Step 1: User Registers & Uploads Resume
```bash
# Login
POST /api/auth/login
  → token = "eyJhbGc..."

# Upload resume
POST /api/resume/upload
  -H "Authorization: Bearer eyJhbGc..."
  -F "resume=@resume.pdf"
  
# Response: Resume processed, embedding generated
```

### Step 2: Admin Posts a Job
```bash
# Create job (draft)
POST /api/jobs
{
  "title": "Senior React Developer",
  "description": "...",
  "requirements": ["React", "TypeScript", "Node.js"],
  "status": "draft"
}
→ job._id = "job123"

# Publish job
PATCH /api/jobs/job123
{ "status": "published" }

# System automatically:
# 1. Generates embedding for job
# 2. Compares against all user resumes
# 3. Creates JobMatch records (score >= 70%)
# 4. Queues notifications
```

### Step 3: User Sees Matches
```bash
# Get all matching jobs
GET /api/resume/matching-jobs
  -H "Authorization: Bearer eyJhbGc..."

# Response: [
#   { jobId: "job123", title: "Senior React Developer", matchScore: 87 },
#   { jobId: "job124", title: "Full Stack Engineer", matchScore: 75 }
# ]
```

### Step 4: User Applies to Job
```bash
# Apply through existing application endpoint
POST /api/applications
{ jobId: "job123", userId: "user123" }

# Notification tracked in NotificationLog & JobMatch
```

## Performance Considerations

### Embedding Generation
- **Time**: ~500ms-1s per document (network + API call)
- **Cost**: ~0.02 cents per 1000 tokens
- **Caching**: Same text = same hash = no re-embedding

### Matching
- **Time**: O(n) where n = number of users with resumes
- **Database**: Efficient with compound indexes
- **Scalability**: Can handle 100k+ resumes efficiently

### Optimization Tips
1. **Batch embeddings**: If re-embedding many jobs, do it during off-hours
2. **Lazy embeddings**: Only generate when job is published
3. **Cached similarities**: Store in JobMatch to avoid recomputation
4. **Incremental updates**: Resume changes update incrementally

## Troubleshooting

### No Matches Found
- Check if user has uploaded resume: `GET /api/resume/status`
- Check if job has been published: `GET /api/jobs/:id`
- Verify threshold: Try lowering minScore to 50

### Embedding Generation Failed
- Ensure OPENAI_API_KEY is set
- Check OpenAI API status
- Verify text extraction worked (`GET /api/resume/status` should show resumeText)

### Slow Matching
- Check MongoDB connection
- Verify indexes are created
- Use admin endpoint to manually trigger: `POST /api/ai/job-embedding/:jobId`

## Security Notes

- ✅ Resume uploads are only accessible to authenticated users
- ✅ Users can only see their own matching jobs
- ✅ Admins have full access to embeddings & matches
- ✅ Embeddings stored in private MongoDB
- ✅ No embeddings sent to frontend (only match scores)
- ✅ API key secured in environment variables

## Future Enhancements

1. **Skill-based matching**: Extract & tag skills from resumes
2. **Salary filtering**: Match based on expected salary ranges
3. **Location filtering**: Geographic proximity matching
4. **Experience level**: Automatically detect & match experience years
5. **Batch embedding**: Background job to re-embed all content
6. **Analytics**: Track match rates, user preferences, conversion metrics
