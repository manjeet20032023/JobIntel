#!/bin/bash
# Resume Matching System - Getting Started Guide

set -e

echo "🚀 Resume Matching System - Setup Instructions"
echo "=============================================="
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install Node.js & npm first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo "✅ npm found: $(npm --version)"
echo ""

# Navigate to backend
cd backend || { echo "❌ backend/ directory not found"; exit 1; }

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔧 Configuration Required"
echo "========================="
echo ""
echo "Add the following to backend/.env:"
echo ""
echo "# OpenAI API Configuration (REQUIRED)"
echo "OPENAI_API_KEY=sk-your_actual_key_here"
echo "OPENAI_EMBEDDINGS_URL=https://api.openai.com/v1/embeddings"
echo "OPENAI_EMBEDDINGS_MODEL=text-embedding-ada-002"
echo ""
echo "# Existing configuration (already set)"
echo "MONGODB_URI=..."
echo "REDIS_URL=..."
echo "JWT_SECRET=..."
echo "SMTP_HOST=..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found in backend/"
    echo "   Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ .env created (edit with your actual keys)"
    else
        echo "   Please create backend/.env manually"
    fi
fi

echo ""
echo "🎯 Next Steps"
echo "============="
echo ""
echo "1. Update backend/.env with OPENAI_API_KEY"
echo ""
echo "2. Start backend:"
echo "   npm run dev"
echo ""
echo "3. Verify setup:"
echo "   curl http://localhost:4000/api/health"
echo ""
echo "4. Run integration test (optional):"
echo "   bash scripts/test-resume-matching.sh"
echo ""
echo "5. Read documentation:"
echo "   - docs/RESUME_MATCHING.md (Complete API docs)"
echo "   - docs/DEPLOYMENT.md (Setup & operations)"
echo "   - ../RESUME_MATCHING_QUICK_REFERENCE.md (Quick start)"
echo ""
echo "📚 API Endpoints"
echo "================"
echo ""
echo "Resume Endpoints:"
echo "  POST   /api/resume/upload                     Upload resume (PDF/DOCX)"
echo "  GET    /api/resume/status                     Check resume status"
echo "  GET    /api/resume/matching-jobs?minScore=70  Get matching jobs"
echo ""
echo "Admin Endpoints:"
echo "  POST   /api/ai/job-embedding/:jobId           Manually embed job"
echo "  GET    /api/ai/job-matches/:userId            View user's matches"
echo ""
echo "✨ Example Workflow"
echo "==================="
echo ""
echo "# 1. Upload resume"
echo "curl -X POST http://localhost:4000/api/resume/upload \\"
echo "  -H \"Authorization: Bearer <token>\" \\"
echo "  -F \"resume=@resume.pdf\""
echo ""
echo "# 2. Check status"
echo "curl http://localhost:4000/api/resume/status \\"
echo "  -H \"Authorization: Bearer <token>\""
echo ""
echo "# 3. Get matching jobs"
echo "curl \"http://localhost:4000/api/resume/matching-jobs?minScore=70\" \\"
echo "  -H \"Authorization: Bearer <token>\""
echo ""
echo "🎉 Setup complete!"
echo ""
echo "For detailed help:"
echo "  cat docs/RESUME_MATCHING.md"
echo "  cat docs/DEPLOYMENT.md"
echo "  cat ../RESUME_MATCHING_QUICK_REFERENCE.md"
echo ""
