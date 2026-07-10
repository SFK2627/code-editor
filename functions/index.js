const { onRequest } = require('firebase-functions/v2/https');
const { defineString, defineSecret } = require('firebase-functions/params');
const logger = require('firebase-functions/logger');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

const openAiApiKey = defineSecret('OPENAI_API_KEY');
const openAiModel = defineString('OPENAI_MODEL', { default: 'gpt-4o-mini' });

function cleanPayload(payload = {}) {
  return {
    activity: payload.activity || null,
    rubricResult: payload.rubricResult || null,
    checkerItems: Array.isArray(payload.checkerItems) ? payload.checkerItems.slice(0, 12) : [],
    outputText: String(payload.outputText || '').slice(0, 4000),
    code: {
      html: String(payload.code?.html || '').slice(0, 6000),
      css: String(payload.code?.css || '').slice(0, 5000),
      js: String(payload.code?.js || '').slice(0, 5000)
    }
  };
}

function localFallbackReview(payload) {
  const result = payload.rubricResult || {};
  const criteria = Array.isArray(result.criteria) ? result.criteria : [];
  const weak = criteria.filter(item => ['fair', 'needsImprovement'].includes(item.levelKey)).slice(0, 4);
  const strong = criteria.filter(item => ['excellent', 'good'].includes(item.levelKey)).slice(0, 4);
  const errors = Array.isArray(payload.checkerItems)
    ? payload.checkerItems.filter(item => item.type === 'error' || item.type === 'warning').slice(0, 4)
    : [];

  return {
    mode: 'Rubric Review',
    officialScore: result.possible ? `${result.score}/${result.possible} (${result.percent}%)` : 'No rubric score',
    summary: result.percent >= 75
      ? 'Good work. The project meets several requirements but can still be improved.'
      : 'Needs improvement. Focus on the missing requirements and code checker hints first.',
    strengths: strong.length ? strong.map(item => item.title) : ['Student attempted the coding task.'],
    improvements: [
      ...weak.map(item => `Improve: ${item.title}. Current level: ${item.levelLabel || item.levelKey}.`),
      ...errors.map(item => `${item.title}: ${item.fix || item.detail}`)
    ].slice(0, 6),
    nextSteps: ['Fix one issue at a time.', 'Run the code again.', 'Check Result again after improving the code.'],
    teacherNote: ''
  };
}

function extractOpenAIText(data) {
  if (typeof data?.output_text === 'string') return data.output_text;
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === 'string') return content;
  return '';
}

function parseJSONOrFallback(text, fallback) {
  try {
    return JSON.parse(text);
  } catch (error) {
    const match = String(text || '').match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (_) {}
    }
    return fallback;
  }
}

function getBearerToken(req) {
  const header = req.headers.authorization || req.headers.Authorization || '';
  const match = String(header).match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : '';
}

async function requireSignedInTeacher(req) {
  const token = getBearerToken(req);
  if (!token) {
    const error = new Error('Teacher login is required.');
    error.status = 401;
    throw error;
  }

  try {
    return await admin.auth().verifyIdToken(token);
  } catch (error) {
    const authError = new Error('Invalid teacher login token. Please login again.');
    authError.status = 401;
    throw authError;
  }
}

async function callOpenAIChat({ apiKey, messages, temperature = 0.2, maxTokens = 1400 }) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: openAiModel.value(),
      response_format: { type: 'json_object' },
      messages,
      temperature,
      max_tokens: maxTokens
    })
  });

  if (!response.ok) {
    const text = await response.text();
    logger.warn('OpenAI request failed', { status: response.status, text: text.slice(0, 800) });
    const error = new Error(`Review provider returned ${response.status}.`);
    error.status = response.status;
    throw error;
  }

  const data = await response.json();
  return extractOpenAIText(data);
}

exports.aiReview = onRequest(
  {
    region: 'asia-southeast1',
    cors: true,
    timeoutSeconds: 60,
    memory: '512MiB',
    secrets: [openAiApiKey]
  },
  async (req, res) => {
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Use POST only.' });
      return;
    }

    const payload = cleanPayload(req.body || {});
    const apiKey = openAiApiKey.value();

    if (!apiKey) {
      res.json({ review: localFallbackReview(payload), warning: 'Review endpoint key is not configured.' });
      return;
    }

    const prompt = `You are an ICT Grade 8 web coding teacher. Review the student's HTML/CSS/JavaScript project.\n\nRules:\n- Use the official rubric result as the main score.\n- Give beginner-friendly feedback.\n- Do not provide a full replacement answer/code.\n- Focus on specific fixes and next steps.\n- Do not mention AI.\n- Respond ONLY as valid JSON with these keys: mode, officialScore, suggestedScore, summary, strengths, improvements, nextSteps, teacherNote.\n\nStudent data:\n${JSON.stringify(payload, null, 2)}`;

    try {
      const text = await callOpenAIChat({
        apiKey,
        messages: [
          { role: 'system', content: 'You are a strict but encouraging beginner web coding teacher. Do not mention AI. Use the teacher rubric as the basis for scoring.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        maxTokens: 1400
      });

      const review = parseJSONOrFallback(text, localFallbackReview(payload));
      res.json({ review });
    } catch (error) {
      logger.error('Feedback review failed', error);
      res.json({ review: localFallbackReview(payload), warning: 'Review failed; fallback review returned.' });
    }
  }
);

function cleanImagePayload(body = {}) {
  return {
    imageDataUrl: String(body.imageDataUrl || '').slice(0, 8_500_000),
    filename: String(body.filename || 'rubric-image').slice(0, 200),
    mimeType: String(body.mimeType || '').slice(0, 80),
    currentActivityTitle: String(body.currentActivityTitle || '').slice(0, 200),
    expectedLevels: Array.isArray(body.expectedLevels) ? body.expectedLevels.slice(0, 8) : ['Excellent', 'Good', 'Fair', 'Needs Improvement']
  };
}

function fallbackImportedRubric() {
  return {
    title: 'Imported Rubric Activity',
    description: 'Review and edit this imported activity before saving. The rubric image could not be read automatically.',
    passingScore: 75,
    criteria: [
      {
        title: 'Content and Requirements',
        points: 4,
        rule: 'minimum_effort',
        target: '',
        levels: {
          excellent: { points: 4, description: 'Complete and meets all requirements.' },
          good: { points: 3, description: 'Mostly complete with minor missing details.' },
          fair: { points: 2, description: 'Partially complete but needs improvement.' },
          needsImprovement: { points: 0, description: 'Incomplete or unclear.' }
        }
      }
    ]
  };
}

exports.rubricImageImport = onRequest(
  {
    region: 'asia-southeast1',
    cors: true,
    timeoutSeconds: 90,
    memory: '1GiB',
    secrets: [openAiApiKey]
  },
  async (req, res) => {
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Use POST only.' });
      return;
    }

    try {
      await requireSignedInTeacher(req);
    } catch (error) {
      res.status(error.status || 401).json({ error: error.message || 'Teacher login required.' });
      return;
    }

    const payload = cleanImagePayload(req.body || {});
    const apiKey = openAiApiKey.value();

    if (!apiKey) {
      res.status(503).json({ error: 'Rubric image reader is not configured. Set OPENAI_API_KEY for Firebase Functions.' });
      return;
    }

    if (!payload.imageDataUrl.startsWith('data:image/')) {
      res.status(400).json({ error: 'Please upload a valid rubric image.' });
      return;
    }

    const prompt = `Read the rubric image and convert it into a coding activity rubric for a Grade 8 web code editor.\n\nReturn ONLY valid JSON with this exact shape:\n{\n  "title": "Activity title",\n  "description": "Student instructions",\n  "passingScore": 75,\n  "criteria": [\n    {\n      "title": "Criterion name",\n      "points": 4,\n      "rule": "minimum_effort",\n      "target": "",\n      "levels": {\n        "excellent": { "points": 4, "description": "Excellent descriptor" },\n        "good": { "points": 3, "description": "Good descriptor" },\n        "fair": { "points": 2, "description": "Fair descriptor" },\n        "needsImprovement": { "points": 0, "description": "Needs improvement descriptor" }\n      }\n    }\n  ]\n}\n\nGuidelines:\n- Keep the four levels: excellent, good, fair, needsImprovement.\n- Use the rubric text from the image as much as possible.\n- If there is no activity title, create a short title based on the rubric.\n- If points are unclear, use 4, 3, 2, 0 for each criterion.\n- Use beginner-friendly wording.\n- Do not mention AI.\n- For rule, choose one of: full_html_structure, balanced_html_tags, output_has_visible_text, has_heading, has_paragraph, has_button, has_link, has_image, has_list, uses_css_property, uses_event_listener, js_changes_page, no_runtime_error, minimum_effort.\n- If unsure about the auto-checking rule, use minimum_effort.\n\nFilename: ${payload.filename}\nCurrent activity title: ${payload.currentActivityTitle || 'none'}\nExpected rubric levels: ${payload.expectedLevels.join(', ')}`;

    try {
      const text = await callOpenAIChat({
        apiKey,
        messages: [
          {
            role: 'system',
            content: 'You convert classroom rubric images into structured JSON rubrics for a Grade 8 web coding activity. Do not mention AI.'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: payload.imageDataUrl } }
            ]
          }
        ],
        temperature: 0.1,
        maxTokens: 2200
      });

      const activity = parseJSONOrFallback(text, fallbackImportedRubric());
      res.json({ activity });
    } catch (error) {
      logger.error('Rubric image import failed', error);
      res.status(500).json({ error: 'Could not read rubric image. Check image clarity and function setup.' });
    }
  }
);
