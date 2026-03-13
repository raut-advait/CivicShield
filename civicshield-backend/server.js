require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const FLASK_API_KEY = process.env.FLASK_API_KEY;
const FLASK_API_URL = process.env.FLASK_API_URL || 'http://localhost:5000';

const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
  'in', 'is', 'it', 'its', 'of', 'on', 'or', 'that', 'the', 'to', 'was', 'were',
  'will', 'with', 'this', 'these', 'those', 'your', 'you', 'they', 'their',
  'about', 'news', 'latest', 'today', 'new', 'update', 'updates', 'scheme',
  'claim', 'claims', 'fact', 'facts', 'check', 'checking'
]);

function extractKeywords(input) {
  const normalized = (input || '').replace(/pmkisan/gi, 'pm kisan');
  const rawTokens = normalized
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

  const keywords = rawTokens.filter((token) => {
    if (STOPWORDS.has(token)) return false;
    if (token.length >= 3) return true;
    // Keep common short public-policy abbreviations.
    return ['pm', 'upi', 'gst'].includes(token);
  });

  return [...new Set(keywords)];
}

function getRelevanceScore(text, keywords) {
  if (!text || keywords.length === 0) return 0;
  const t = text.toLowerCase();
  let score = 0;
  for (const kw of keywords) {
    if (t.includes(kw)) score += 1;
  }
  return score;
}

function isTrueRating(rating) {
  if (!rating) return false;
  const r = rating.toLowerCase();
  if (r.includes('false') || r.includes('fake') || r.includes('mislead') || r.includes('pants on fire')) {
    return false;
  }
  return r.includes('true') || r.includes('correct') || r.includes('accurate') || r.includes('mostly true');
}

function buildSearchQueries(inputText, keywords) {
  const queryCandidates = [inputText, ...keywords];

  if (keywords.length > 1) {
    queryCandidates.push(keywords.join(' '));
  }

  // Add n-grams to increase recall from one-result Flask searches.
  for (let i = 0; i < keywords.length; i += 1) {
    if (i + 1 < keywords.length) queryCandidates.push(`${keywords[i]} ${keywords[i + 1]}`);
    if (i + 2 < keywords.length) queryCandidates.push(`${keywords[i]} ${keywords[i + 1]} ${keywords[i + 2]}`);
  }

  // Common scheme/support suffixes improve coverage for government portals.
  const suffixes = ['scheme', 'status', 'beneficiary', 'registration', 'portal', 'official'];
  for (const kw of keywords) {
    if (kw.length < 4) continue;
    for (const sx of suffixes) {
      queryCandidates.push(`${kw} ${sx}`);
    }
  }

  // Domain-specific variants for PM Kisan style queries.
  if (keywords.includes('pm') && keywords.includes('kisan')) {
    queryCandidates.push('pmkisan', 'pm kisan status', 'pm kisan beneficiary list', 'pm kisan registration');
  }

  return [...new Set(queryCandidates.map((q) => q.trim()).filter(Boolean))].slice(0, 40);
}

function extractNumbers(text) {
  const matches = (text || '').match(/\b\d+(?:\.\d+)?\b/g);
  return new Set(matches || []);
}

function hasNegation(text) {
  const tokens = new Set((text || '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
  return ['not', 'no', 'never', 'none', 'without', 'fake', 'false'].some((w) => tokens.has(w));
}

function overlapScore(a, b) {
  const aTokens = new Set(extractKeywords(a));
  const bTokens = new Set(extractKeywords(b));
  if (aTokens.size === 0) return 0;
  let common = 0;
  for (const t of aTokens) {
    if (bTokens.has(t)) common += 1;
  }
  return common / aTokens.size;
}

function normalizeGovMatch(match = {}) {
  return {
    url: match.page_url || match.url || match.pdf_url || '',
    source: match.source_site || match.source || '',
    title: match.title || match.document_title || '',
    snippet: match.snippet || match.text_snippet || match.summary || match.content || '',
    content: match.content || match.text_snippet || match.snippet || '',
    sectionAnchor: match.section_anchor || '',
    pdfPageNumber: match.pdf_page_number ?? match.page_number ?? null,
    pdfUrl: match.pdf_url || '',
    evidenceType: match.evidence_type || match.source_type || '',
    score: match.score || {},
  };
}

function createFlaskHeaders() {
  const headers = {};
  if (FLASK_API_KEY) headers['X-API-Key'] = FLASK_API_KEY;
  return headers;
}

function normalizeVerifyPayload(data, claim, fallbackKeywords = [], fallbackQueries = []) {
  const evidenceInput = Array.isArray(data?.evidence)
    ? data.evidence
    : Array.isArray(data?.matches)
      ? data.matches
      : Array.isArray(data?.results)
        ? data.results
        : [];

  const evidence = evidenceInput.map((item) => {
    const normalized = normalizeGovMatch(item);
    return {
      ...normalized,
      source_site: item.source_site || normalized.source,
      page_url: item.page_url || normalized.url,
      supportScore: item.supportScore ?? item.support_score ?? normalized.score?.support_score ?? 0,
      contradictionScore: item.contradictionScore ?? item.contradiction_score ?? normalized.score?.contradiction_score ?? 0,
    };
  });

  const classification = data?.classification || data?.verdict || (data?.status === 'found' ? 'Partially True' : 'False');
  const explanation = data?.explanation || data?.reason || data?.message || '';
  const incorrectParts = data?.incorrectParts || data?.incorrect_parts || [];
  const keywords = data?.keywords || fallbackKeywords;
  const queriesTried = data?.queriesTried || data?.queries_tried || fallbackQueries;
  const primaryEvidence = evidence[0] || {};
  const results = data?.results || evidence.slice(0, 10).map((item) => ({
    claim: item.content,
    rating: classification,
    source: item.source,
    url: item.url,
    title: item.title,
    snippet: item.snippet,
    sectionAnchor: item.sectionAnchor,
    pdfPageNumber: item.pdfPageNumber,
    pdfUrl: item.pdfUrl,
  }));

  return {
    status: data?.status || (evidence.length > 0 ? 'found' : 'not_found'),
    classification,
    explanation,
    incorrectParts,
    keywords,
    queriesTried,
    confidence: data?.confidence ?? null,
    evidence: evidence.slice(0, 10),
    source_site: data?.source_site || primaryEvidence.source_site || '',
    page_url: data?.page_url || primaryEvidence.page_url || '',
    verdict: data?.verdict || classification,
    results,
  };
}

async function getFlaskVerifyResult(claim, keywords, queriesTried) {
  const response = await axios.post(
    `${FLASK_API_URL}/verify`,
    { text: claim, top_k: 10, limit: 10 },
    {
      headers: createFlaskHeaders(),
      validateStatus: () => true,
    }
  );

  if (response.status === 404 || response.status === 405) {
    return null;
  }

  if (response.status >= 400) {
    throw new Error(response.data?.message || response.data?.error || 'Flask verify request failed.');
  }

  const data = response.data || {};
  if (!data || typeof data !== 'object') {
    return null;
  }

  if (
    data.classification ||
    data.verdict ||
    data.status === 'found' ||
    Array.isArray(data.evidence) ||
    Array.isArray(data.results) ||
    Array.isArray(data.matches)
  ) {
    return normalizeVerifyPayload(data, claim, keywords, queriesTried);
  }

  return null;
}

async function getGovSearchResults(inputText, maxResults = 50) {
  const keywords = extractKeywords(inputText);
  const queries = buildSearchQueries(inputText, keywords);

  const responses = await Promise.allSettled(
    queries.map((q) =>
      axios.post(
        `${FLASK_API_URL}/search`,
        { text: q, top_k: 10, limit: 10 },
        { headers: createFlaskHeaders() }
      )
    )
  );

  const merged = [];
  for (const entry of responses) {
    if (entry.status !== 'fulfilled') continue;
    const data = entry.value.data || {};

    if (Array.isArray(data.matches)) {
      for (const m of data.matches) {
        merged.push(normalizeGovMatch(m));
      }
    } else if (Array.isArray(data.results)) {
      for (const m of data.results) {
        merged.push(normalizeGovMatch(m));
      }
    } else if (data.status === 'found') {
      merged.push(normalizeGovMatch(data));
    }
  }

  const byUrl = new Map();
  for (const item of merged) {
    if (!item.url) continue;
    const existing = byUrl.get(item.url);
    const currentScore = item.score?.ranking_score || 0;
    const existingScore = existing?.score?.ranking_score || 0;
    if (!existing || currentScore > existingScore) {
      byUrl.set(item.url, item);
    }
  }

  const results = [...byUrl.values()]
    .sort((a, b) => (b.score?.ranking_score || 0) - (a.score?.ranking_score || 0))
    .slice(0, maxResults);

  return { keywords, queriesTried: queries, results };
}

async function getFlaskNotifications({ limit = 20, category = '' } = {}) {
  const maxLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const params = { limit: maxLimit };
  if (category && category.trim()) params.category = category.trim();

  const response = await axios.get(`${FLASK_API_URL}/notifications`, {
    headers: createFlaskHeaders(),
    params,
    validateStatus: () => true,
  });

  if (response.status >= 400) {
    throw new Error(response.data?.message || response.data?.error || 'Flask notifications request failed.');
  }

  const payload = response.data || {};
  const rows = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.results)
      ? payload.results
      : Array.isArray(payload)
        ? payload
        : [];

  const notifications = rows.map((item) => ({
    id: item.id || null,
    title: item.title || item.scheme_title || 'Government update',
    description: item.description || item.summary || '',
    source_site: item.source_site || item.source || '',
    page_url: item.page_url || item.url || '',
    category: item.category || 'Government Schemes',
    created_at: item.created_at || new Date().toISOString(),
  }));

  return {
    status: payload.status || 'success',
    count: notifications.length,
    data: notifications,
  };
}

// Middleware
app.use(cors());
app.use(express.json());

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'CivicShield Backend', version: '1.0.0' });
});

// ─── GET /notifications ─────────────────────────────────────────────────────
/**
 * Proxies Flask notifications feed for new schemes/policies announcements.
 * Query: limit, category
 */
app.get('/notifications', async (req, res) => {
  try {
    const limit = Number(req.query?.limit) || 20;
    const category = String(req.query?.category || '');
    const payload = await getFlaskNotifications({ limit, category });
    return res.json(payload);
  } catch (error) {
    console.error('Notifications API Error:', error?.response?.data || error.message);
    return res.status(500).json({
      error: 'Failed to fetch notifications from Flask API.',
      details: error?.response?.data?.message || error.message,
    });
  }
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

  const keywords = extractKeywords(text.trim());

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

    // Flatten and normalize results.
    const results = [];
    for (const claim of rawClaims) {
      const claimText = claim.text || '';
      const reviews = claim.claimReview || [];
      for (const review of reviews) {
        const combined = `${claimText} ${review.textualRating || ''} ${review.publisher?.name || ''}`;
        const relevanceScore = getRelevanceScore(combined, keywords);
        results.push({
          claim: claimText,
          rating: review.textualRating || 'Unknown',
          source: review.publisher?.name || review.publisher?.site || 'Unknown Source',
          url: review.url || '',
          relevanceScore,
        });
      }
    }

    // 1) Keep only keyword-relevant entries when keywords are present.
    const keywordFiltered = keywords.length > 0
      ? results.filter((item) => item.relevanceScore > 0)
      : results;

    // 2) Keep only true/correct/accurate fact checks.
    const trueFacts = keywordFiltered
      .filter((item) => isTrueRating(item.rating))
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    const cleanedResults = trueFacts.map(({ relevanceScore, ...rest }) => rest);
    const verdict = cleanedResults.length > 0
      ? 'True facts found for keywords'
      : 'No true fact-check found for extracted keywords';

    return res.json({ verdict, keywords, results: cleanedResults });
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

// ─── POST /search ──────────────────────────────────────────────────────────────
/**
 * Uses the GovScanner Flask API for context around a claim.
 * Request body:  { "text": "claim to search" }
 * Response:      { "results": [ { url, source, score } ] }
 */
app.post('/search', async (req, res) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Missing required field: text' });
  }

  try {
    const inputText = text.trim();
    const maxResults = Math.min(Math.max(Number(req.body?.maxResults) || 50, 1), 200);
    const { keywords, queriesTried, results } = await getGovSearchResults(inputText, maxResults);

    return res.json({
      status: results.length > 0 ? 'found' : 'not_found',
      keywords,
      queriesTried,
      results,
    });
  } catch (error) {
    console.error('Flask API Error:', error?.response?.data || error.message);

    return res.status(500).json({
      error: 'Failed to fetch data from GovScanner API.',
      details: error?.response?.data?.message || error.message,
    });
  }
});

// ─── POST /verify ─────────────────────────────────────────────────────────────
/**
 * Verifies a claim against related records from GovScanner search results.
 * Request body: { "text": "claim" }
 * Response: { classification, explanation, incorrectParts, evidence }
 */
app.post('/verify', async (req, res) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Missing required field: text' });
  }

  try {
    const claim = text.trim();
    const claimNums = extractNumbers(claim);
    const claimNeg = hasNegation(claim);
    const { keywords, queriesTried, results } = await getGovSearchResults(claim, 50);

    const flaskVerifyResult = await getFlaskVerifyResult(claim, keywords, queriesTried);
    if (flaskVerifyResult) {
      return res.json(flaskVerifyResult);
    }

    if (results.length === 0) {
      return res.json({
        status: 'not_found',
        classification: 'False',
        explanation: 'No related government record found for this claim.',
        incorrectParts: ['No supporting record found in the database for extracted keywords.'],
        keywords,
        queriesTried,
        evidence: [],
        verdict: 'No match found',
        results: [],
      });
    }

    const evidence = results.map((item) => {
      const supportScore = overlapScore(claim, item.content || `${item.source} ${item.url}`);
      const itemNums = extractNumbers(item.content || '');
      const numsConflict = claimNums.size > 0 && itemNums.size > 0 &&
        [...claimNums].some((n) => !itemNums.has(n));
      const negConflict = claimNeg !== hasNegation(item.content || '');
      const contradictionScore = (numsConflict ? 0.6 : 0) + (negConflict ? 0.4 : 0);
      return {
        title: item.title || '',
        snippet: item.snippet || '',
        content: item.content || '',
        source_site: item.source || '',
        page_url: item.url || '',
        sectionAnchor: item.sectionAnchor || '',
        pdfPageNumber: item.pdfPageNumber,
        pdfUrl: item.pdfUrl || '',
        evidenceType: item.evidenceType || '',
        score: item.score || {},
        supportScore: Number(supportScore.toFixed(3)),
        contradictionScore: Number(contradictionScore.toFixed(3)),
      };
    });

    evidence.sort((a, b) => (b.supportScore - a.supportScore) || ((b.score?.ranking_score || 0) - (a.score?.ranking_score || 0)));

    const bestSupport = evidence[0]?.supportScore || 0;
    const maxContradiction = Math.max(...evidence.map((e) => e.contradictionScore));
    const textfulEvidenceCount = evidence.filter((e) => (e.content || '').trim().length >= 30).length;
    const sparseEvidence = textfulEvidenceCount < Math.ceil(evidence.length * 0.4);

    let classification = 'Partially True';
    if (!sparseEvidence) {
      if (bestSupport >= 0.62 && maxContradiction < 0.3) classification = 'True';
      else if (bestSupport < 0.35 || maxContradiction >= 0.72) classification = 'False';
    } else {
      // Option 2: bias toward True when top official matches are strong even if content text is sparse.
      if (maxContradiction >= 0.8) classification = 'False';
      else if (bestSupport >= 0.45 && (evidence[0]?.score?.ranking_score || 0) >= 20) classification = 'True';
      else classification = 'Partially True';
    }

    const incorrectParts = [];
    if (classification !== 'True') {
      if (maxContradiction >= 0.6) incorrectParts.push('Numerical values or negation in the claim conflict with supporting records.');
      if (bestSupport < 0.7 && !sparseEvidence) incorrectParts.push('Some keywords in the claim are not strongly supported by retrieved evidence.');
      if (sparseEvidence) incorrectParts.push('Available records contain limited extracted text, so verification confidence is moderate.');
      if (incorrectParts.length === 0) incorrectParts.push('Claim is only partially aligned with available government information.');
    }

    const explanation = classification === 'True'
      ? 'Claim is supported by retrieved government records.'
      : sparseEvidence
        ? 'Related government records were found, but many entries have limited text content, so this is treated as partially verified.'
        : 'Claim is not fully supported by retrieved government records.';

    const mappedResults = evidence.slice(0, 10).map((e) => ({
      title: e.title,
      claim: e.content,
      snippet: e.snippet,
      rating: classification,
      source: e.source_site,
      url: e.page_url,
      sectionAnchor: e.sectionAnchor,
      pdfPageNumber: e.pdfPageNumber,
      pdfUrl: e.pdfUrl,
    }));

    return res.json({
      status: 'found',
      classification,
      explanation,
      incorrectParts,
      keywords,
      queriesTried,
      evidence: evidence.slice(0, 10),
      source_site: evidence[0]?.source_site || '',
      page_url: evidence[0]?.page_url || '',
      verdict: classification,
      results: mappedResults,
    });
  } catch (error) {
    console.error('Verify API Error:', error?.response?.data || error.message);
    return res.status(500).json({
      error: 'Failed to verify claim.',
      details: error?.response?.data?.message || error.message,
    });
  }
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🛡️  CivicShield Backend running at http://0.0.0.0:${PORT}`);
  console.log(`   POST http://localhost:${PORT}/factcheck`);
  console.log(`   POST http://localhost:${PORT}/search`);
  console.log(`   POST http://localhost:${PORT}/verify\n`);
  console.log(`   GET  http://localhost:${PORT}/notifications\n`);

  if (!GOOGLE_API_KEY || GOOGLE_API_KEY === 'YOUR_GOOGLE_API_KEY_HERE') {
    console.warn('⚠️  WARNING: GOOGLE_API_KEY is not set in .env file!');
    console.warn('   Add your key to civicshield-backend/.env to enable fact-checking.\n');
  } else {
    console.log('✅  Google Fact Check API key loaded.\n');
  }
});

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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🛡️  CivicShield Backend running at http://0.0.0.0:${PORT}`);
  console.log(`   POST http://localhost:${PORT}/factcheck\n`);

  if (!GOOGLE_API_KEY || GOOGLE_API_KEY === 'YOUR_GOOGLE_API_KEY_HERE') {
    console.warn('⚠️  WARNING: GOOGLE_API_KEY is not set in .env file!');
    console.warn('   Add your key to civicshield-backend/.env to enable fact-checking.\n');
  } else {
    console.log('✅  Google Fact Check API key loaded.\n');
  }
});
