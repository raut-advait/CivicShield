require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// Middleware
app.use(cors());
app.use(express.json());

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'CivicShield Backend', version: '1.0.0' });
});

// ─── POST /factcheck ─────────────────────────────────────────────────────────
/**
 * Request body:  { "text": "claim to check" }
 * Response:      { "verdict": "...", "results": [...] }
 */
app.post('/factcheck', async (req, res) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Missing required field: text' });
  }

  if (!GOOGLE_API_KEY || GOOGLE_API_KEY === 'YOUR_GOOGLE_API_KEY_HERE') {
    return res.status(500).json({
      error: 'Google API key not configured. Add it to .env file.',
    });
  }

  try {
    const response = await axios.get(
      'https://factchecktools.googleapis.com/v1alpha1/claims:search',
      {
        params: {
          query: text.trim(),
          key: GOOGLE_API_KEY,
          languageCode: 'en',
        },
      }
    );

    const rawClaims = response.data.claims || [];

    if (rawClaims.length === 0) {
      return res.json({
        verdict: 'No Fact Check Found',
        results: [],
      });
    }

    // Flatten and normalize results
    const results = [];
    for (const claim of rawClaims) {
      const claimText = claim.text || '';
      const reviews = claim.claimReview || [];
      for (const review of reviews) {
        results.push({
          claim: claimText,
          rating: review.textualRating || 'Unknown',
          source: review.publisher?.name || review.publisher?.site || 'Unknown Source',
          url: review.url || '',
        });
      }
    }

    const verdict = results.length > 0 ? 'Fact checks found' : 'No Fact Check Found';

    return res.json({ verdict, results });
  } catch (error) {
    console.error('Google Fact Check API Error:', error?.response?.data || error.message);

    if (error?.response?.status === 403) {
      return res.status(403).json({
        error: 'Invalid or unauthorized API key. Check your Google Cloud Console.',
      });
    }

    return res.status(500).json({
      error: 'Failed to fetch fact-check data. Please try again.',
      details: error?.response?.data?.error?.message || error.message,
    });
  }
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🛡️  CivicShield Backend running at http://localhost:${PORT}`);
  console.log(`   POST http://localhost:${PORT}/factcheck\n`);

  if (!GOOGLE_API_KEY || GOOGLE_API_KEY === 'YOUR_GOOGLE_API_KEY_HERE') {
    console.warn('⚠️  WARNING: GOOGLE_API_KEY is not set in .env file!');
    console.warn('   Add your key to civicshield-backend/.env to enable fact-checking.\n');
  } else {
    console.log('✅  Google Fact Check API key loaded.\n');
  }
});
