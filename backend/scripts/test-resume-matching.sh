#!/bin/bash
# Integration Test Script for Resume Matching System
# This script demonstrates the entire end-to-end workflow

BASE_URL="http://localhost:4000"
ADMIN_TOKEN=""
USER_TOKEN=""
USER_ID=""
JOB_ID=""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Resume Matching System Integration Test ===${NC}\n"

# 1. Register Admin User
echo -e "${BLUE}1. Registering Admin User...${NC}"
ADMIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "AdminPass123!",
    "name": "Admin User"
  }')
echo "$ADMIN_RESPONSE"

# 2. Login Admin
echo -e "\n${BLUE}2. Logging in Admin...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "AdminPass123!"
  }')
ADMIN_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')
echo "Admin Token: ${ADMIN_TOKEN:0:20}..."

# Make admin (this would normally require direct DB update or admin endpoint)
# For testing, you might need to manually set roles in MongoDB

# 3. Register Regular User
echo -e "\n${BLUE}3. Registering Regular User...${NC}"
USER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jobseeker@test.com",
    "password": "UserPass123!",
    "name": "Job Seeker"
  }')
echo "$USER_RESPONSE"

# 4. Login User
echo -e "\n${BLUE}4. Logging in User...${NC}"
USER_LOGIN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jobseeker@test.com",
    "password": "UserPass123!"
  }')
USER_TOKEN=$(echo "$USER_LOGIN" | jq -r '.accessToken')
USER_ID=$(echo "$USER_TOKEN" | jq -R 'split(".")[1] | @base64d | fromjson | .sub')
echo "User Token: ${USER_TOKEN:0:20}..."
echo "User ID: $USER_ID"

# 5. Upload Resume (dummy text-based for testing)
echo -e "\n${BLUE}5. Uploading Resume (simulating PDF conversion)...${NC}"
# Note: For real testing, create a test PDF/DOCX file
# For now, update user with resume text directly via API would be needed
# Example curl would be:
# curl -X POST "$BASE_URL/api/resume/upload" \
#   -H "Authorization: Bearer $USER_TOKEN" \
#   -F "resume=@sample_resume.pdf"

echo "TODO: Upload actual resume file"

# 6. Check Resume Status
echo -e "\n${BLUE}6. Checking Resume Status...${NC}"
curl -s "$BASE_URL/api/resume/status" \
  -H "Authorization: Bearer $USER_TOKEN" | jq '.'

# 7. Create a Job (as Admin)
echo -e "\n${BLUE}7. Creating a Job (Admin)...${NC}"
JOB_RESPONSE=$(curl -s -X POST "$BASE_URL/api/jobs" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior React Developer",
    "description": "We are looking for a senior React developer with 5+ years of experience. You should be proficient in TypeScript, Node.js, and modern web technologies.",
    "requirements": ["React", "TypeScript", "Node.js", "AWS", "Docker"],
    "responsibilities": ["Build scalable web applications", "Mentor junior developers", "Design system architecture"],
    "location": "Remote",
    "company": "TechCorp",
    "status": "draft",
    "ctc": "30-35 LPA"
  }')
JOB_ID=$(echo "$JOB_RESPONSE" | jq -r '._id')
echo "Created Job ID: $JOB_ID"
echo "$JOB_RESPONSE" | jq '.'

# 8. Publish Job (triggers embedding & matching)
echo -e "\n${BLUE}8. Publishing Job (triggers embedding & matching)...${NC}"
PUBLISH_RESPONSE=$(curl -s -X PATCH "$BASE_URL/api/jobs/$JOB_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "published"}')
echo "$PUBLISH_RESPONSE" | jq '.'

# Give the system a moment to process embeddings
sleep 2

# 9. Get Matching Jobs for User
echo -e "\n${BLUE}9. Getting Matching Jobs for User...${NC}"
MATCHES=$(curl -s "$BASE_URL/api/resume/matching-jobs?minScore=70" \
  -H "Authorization: Bearer $USER_TOKEN")
echo "$MATCHES" | jq '.'

# 10. Admin Manual Embedding Trigger (if needed)
echo -e "\n${BLUE}10. Admin Triggering Manual Re-embedding (optional)...${NC}"
curl -s -X POST "$BASE_URL/api/ai/job-embedding/$JOB_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'

# 11. Get User's Job Matches (Admin View)
echo -e "\n${BLUE}11. Getting User's Job Matches (Admin View)...${NC}"
curl -s "$BASE_URL/api/ai/job-matches/$USER_ID?minScore=70" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'

# 12. Create an Application to Matched Job
echo -e "\n${BLUE}12. Creating Application to Matched Job...${NC}"
if [ ! -z "$JOB_ID" ] && [ ! -z "$USER_ID" ]; then
  APP_RESPONSE=$(curl -s -X POST "$BASE_URL/api/applications" \
    -H "Authorization: Bearer $USER_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"jobId\": \"$JOB_ID\",
      \"userId\": \"$USER_ID\"
    }")
  echo "$APP_RESPONSE" | jq '.'
fi

echo -e "\n${GREEN}=== Test Complete ===${NC}"
echo -e "${BLUE}Summary:${NC}"
echo "- Admin User: admin@test.com"
echo "- Job Seeker: jobseeker@test.com"
echo "- Created Job: $JOB_ID"
echo "- Job Status: published (with embeddings)"
echo "- User matches should appear in step 9"

echo -e "\n${BLUE}Next Steps for Manual Testing:${NC}"
echo "1. Create a test PDF/DOCX resume file"
echo "2. Upload via: POST /api/resume/upload with multipart form data"
echo "3. Run this script again to see matches"
echo "4. Monitor MongoDB for JobMatch, ResumeEmbedding, JobEmbedding collections"
