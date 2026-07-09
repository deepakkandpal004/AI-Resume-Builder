# 🔧 Fix AI Features - Groq API Key Issue

## ❌ Problem Identified
The Groq API key in your `.env` file is **invalid or expired**.

**Error:** `Invalid API Key`

---

## ✅ Solution: Get a New Groq API Key

### Step 1: Get Your Groq API Key (2 minutes)

1. **Go to:** https://console.groq.com/
2. **Sign in** or create a free account (GitHub/Google login available)
3. **Navigate to:** API Keys section
4. **Click:** "Create API Key"
5. **Copy:** Your new API key (starts with `gsk_...`)

### Step 2: Update Server Environment Variables

1. **Open:** `/server/.env`
2. **Find line 7:**
   ```
   GROQ_API_KEY="<your-key>"
   ```
3. **Replace with your new key:**
   ```
   GROQ_API_KEY="gsk_YOUR_NEW_KEY_HERE"
   ```
4. **Save** the file

### Step 3: Restart the Server

**In terminal where server is running:**
1. Press `Ctrl+C` to stop server
2. Run: `npm run server` (or `npm start`)
3. Wait for: "Server is running on http://localhost:3000"

---

## 🧪 Test AI Features Again

After restarting server, test:

### 1. Interview Prep
- Go to Resume Builder → Tools → Interview Prep
- Enter target role and click "Generate"
- Should see 10 questions

### 2. Professional Summary Enhancement
- Go to Summary section
- Click AI enhance button (✨ icon)
- Should enhance your summary

### 3. ATS Score
- Go to ATS Score section
- Paste job description
- Click "Run ATS Scan"
- Should show compatibility score

### 4. Cover Letter Generator
- Go to Cover Letter section
- Enter job details
- Click "Generate"
- Should create cover letter

---

## 🆓 Groq Free Tier Limits

**Your new API key includes:**
- ✅ 30 requests per minute
- ✅ 14,400 requests per day
- ✅ 100% free (no credit card needed)
- ✅ Fast inference (< 2 seconds)

**Models Available:**
- llama-3.3-70b-versatile (currently used)
- llama-3.1-70b-versatile
- mixtral-8x7b-32768
- gemma2-9b-it

---

## ⚠️ If You Still See Errors

### Check Browser Console:
1. Press `F12` → Console tab
2. Look for red errors related to:
   - "429" → Rate limit (wait 1 minute)
   - "401" → Invalid key (check .env)
   - "500" → Server error (check server logs)

### Check Server Terminal:
Look for errors like:
- `AI service configuration error`
- `GROQ_API_KEY is not defined`
- `Invalid AI API response`

### Common Issues:

**Issue 1: Key has spaces**
```env
# ❌ Wrong
GROQ_API_KEY=" gsk_key_here "

# ✅ Correct
GROQ_API_KEY="gsk_key_here"
```

**Issue 2: Server not restarted**
- Must restart server after changing .env
- `Ctrl+C` then `npm run server`

**Issue 3: Wrong model name**
```env
# ✅ Should be exactly this
GROQ_MODEL="llama-3.3-70b-versatile"
```

---

## 🔍 Verify It's Working

### Quick Test via Terminal:

```bash
cd server

# Test AI endpoint
curl -X POST http://localhost:3000/api/ai/enhance-pro-sum \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"userContent": "I am a developer with 5 years experience"}'
```

**Expected:** Should return enhanced summary, not an error

---

## 📝 Current Configuration Check

Your current `.env` has:
```
GROQ_API_KEY="<your-key>" ❌ Invalid
GROQ_BASE_URL="https://api.groq.com/openai/v1" ✅ Correct
GROQ_MODEL="llama-3.3-70b-versatile" ✅ Correct
```

**Just need to replace the API key!**

---

## ✅ Steps Summary

1. [ ] Get new API key from https://console.groq.com/
2. [ ] Update `GROQ_API_KEY` in `/server/.env`
3. [ ] Restart server (`Ctrl+C` then `npm run server`)
4. [ ] Test Interview Prep feature
5. [ ] Verify in browser console (no errors)

---

## 💡 Alternative: Use OpenAI API

If you prefer OpenAI instead of Groq:

```env
# In /server/.env
OPENAI_API_KEY="sk-your-openai-key"
OPENAI_MODEL="gpt-4o-mini"  # or gpt-3.5-turbo
```

Then update `/server/config/ai.js` to use OpenAI SDK.

---

**Need help?** Let me know if you see any errors after updating the API key!
