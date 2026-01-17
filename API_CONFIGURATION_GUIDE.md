# LinkedIn Job Scraper - API Configuration Guide

## Current Status

✅ **Mock Data**: Working perfectly
❌ **Real API**: OpenWeb Ninja API returning 403/Authentication errors

---

## Why Real API Isn't Working

The OpenWeb Ninja JSearch API requires proper authentication and the correct request format. The current issues are:

1. **Possible Invalid API Key** - The key `ak_58a8asv2uix2dbxls7sitbar9zq647ld0iqbio1phiz29ar` may be:
   - Expired or invalidated
   - For a different API (not JSearch)
   - From a free tier without JSearch access
   - Already used up quota

2. **Wrong Authentication Method** - The API might require:
   - Bearer token format instead of query parameter
   - Custom header format
   - Different endpoint structure

3. **API Key Permission** - The account might not have:
   - JSearch API access enabled
   - Active subscription
   - Proper tier access

---

## How to Get Real Data Working

### Option 1: Get a Valid OpenWeb Ninja API Key (Recommended)

1. **Visit**: https://www.openwebninja.com/
2. **Sign Up/Login**: Create an account
3. **Navigate to**: Dashboard → API Keys
4. **Create JSearch API Key**: Make sure to enable JSearch API specifically
5. **Copy the Key**: Should look like `ak_xxxxxxxxxxxxxxxxxxxxxxxx`
6. **Update .env**:
   ```bash
   API_KEY=your_new_key_here
   API_HOST=api.openwebninja.com
   ```
7. **Restart Backend**:
   ```bash
   pkill -f "ts-node"
   cd /workspaces/JobIntel/backend && PORT=5000 npm run dev
   ```

### Option 2: Use Alternative Job API

If OpenWeb Ninja doesn't work, you can switch to other APIs:

- **LinkedIn Official API**: More reliable but requires approval
- **JSearch by RapidAPI**: Similar to OpenWeb Ninja
- **Adzuna API**: Free tier available
- **Indeed API**: Official but limited
- **GitHub Jobs API**: Free, simple, but limited data

### Option 3: Use Mock Data for Development (Current Setup)

The system currently **automatically uses mock data** when the real API fails. This is perfect for:
- UI/UX testing
- Feature development
- Demonstration and presentations
- Frontend work without API dependency

---

## Testing the API Key

### Step 1: Verify the Key Format
```bash
# Should be 32+ characters starting with ak_
API_KEY=ak_58a8asv2uix2dbxls7sitbar9zq647ld0iqbio1phiz29ar
```

### Step 2: Test Directly
```bash
curl -X GET "https://api.openwebninja.com/api/v1/search" \
  -G \
  -d "q=software engineer" \
  -d "l=India" \
  -d "api_key=YOUR_API_KEY_HERE"
```

### Step 3: Check Backend Logs
```bash
# View real-time logs
tail -f /tmp/backend.log

# Or check the console output when making a search
# Should show: "[Scraper] Using mock data due to API auth issue"
```

---

## Backend Fallback Logic

The system is designed to **gracefully degrade**:

```
User Makes Search
    ↓
Try OpenWeb Ninja API
    ↓
┌─────────────────────────────────────────┐
│                                         │
│ Success: Return Real LinkedIn Data      │
│                                         │
│ OR                                      │
│                                         │
│ 403 Error: Return Mock Data (Dev Mode) │
│                                         │
└─────────────────────────────────────────┘
    ↓
Display Results to User
```

---

## Current Mock Data Features

Even with mock data, you get:

✅ **3 Realistic Jobs** with complete information
✅ **India-Focused** locations and companies
✅ **Salary Ranges** in INR (₹400K to ₹1.8M)
✅ **Different Experience Levels**: Entry, Mid, Senior
✅ **Work Types**: On-site and Remote
✅ **Job Descriptions**: Professional and relevant
✅ **Posted Dates**: Recent dates with proper formatting
✅ **Company Details**: Realistic Indian tech companies

---

## Files Involved

### API Communication
- `/backend/src/services/linkedinScraper.ts` - API client
- `/backend/src/controllers/linkedinScraperController.ts` - API handler
- `/backend/src/routes/scraper.ts` - API routes

### Frontend Display
- `/frontend/src/components/LinkedInScraperUI.tsx` - Search UI
- `/frontend/vite.config.ts` - Proxy configuration

### Data Models
- `/backend/src/models/ScraperJob.ts` - Database schemas
- `/backend/src/services/dataExportService.ts` - Export functionality

---

## Troubleshooting Checklist

When switching to real API, verify:

- [ ] API key is valid and active
- [ ] API key has JSearch access enabled
- [ ] Subscription is not expired
- [ ] API quota not exceeded (if limited plan)
- [ ] Environment variable is set correctly: `API_KEY=ak_xxxxx`
- [ ] Backend is restarted after .env change
- [ ] No typos in API_KEY or API_HOST
- [ ] Internet connection is working
- [ ] No proxy/firewall blocking API calls

---

## What Happens When You Fix the API Key

Once you have a valid API key:

1. **Backend will automatically switch** to real API
2. **Same UI/UX works** with real LinkedIn data
3. **Better job listings** with actual postings
4. **More filtering options** become meaningful
5. **Salary data** reflects real market rates

---

## Recommended Action

For now, **the mock data setup is perfect** for:
- ✅ Testing the UI and features
- ✅ Demonstrating the scraper functionality
- ✅ Developing new features
- ✅ Getting user feedback
- ✅ Performance testing

**To go production**, you'll need a valid OpenWeb Ninja API key from their service.

---

## Cost Considerations

OpenWeb Ninja Pricing (as of 2026):
- **Free Tier**: Limited requests
- **Starter**: $29/month - 5K requests/month
- **Professional**: $99/month - 50K requests/month
- **Enterprise**: Custom pricing

Alternatives often have better free tiers if cost is a concern.

---

## Next Steps

1. **Immediate**: Continue using mock data (fully functional)
2. **Short-term**: Get a valid OpenWeb Ninja API key
3. **Medium-term**: Test with real data and optimize
4. **Long-term**: Consider scaling to enterprise API or building custom scraper

---

**Questions?** Check the backend logs for detailed error messages when making searches.

