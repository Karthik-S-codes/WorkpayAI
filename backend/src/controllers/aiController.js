const { calculateWorkerMatch } = require('../services/ai/workerMatchingService');
const { predictSalary } = require('../services/ai/salaryPredictionService');
const { handleChatMessage } = require('../services/ai/chatbotService');
const { generateWorkerProfile } = require('../services/ai/profileBuilderService');
const { recommendSkills } = require('../services/ai/skillRecommendationService');
const { evaluateUserRisk } = require('../services/ai/fraudDetectionService');
const { analyzeReviews } = require('../services/ai/reviewAnalysisService');
const { generateJobDescription } = require('../services/ai/jobDescGeneratorService');
const { analyzeWorkerIncome } = require('../services/ai/incomeAnalysisService');
const { query } = require('../config/db');

/**
 * 1. AI Worker Matching for a Job (POST /api/ai/match-workers)
 */
async function matchWorkersForJob(req, res, next) {
  try {
    const { jobId, customJob } = req.body;
    let targetJob = customJob;

    if (jobId) {
      const jobRows = await query('SELECT * FROM jobs WHERE id = ?', [jobId]);
      if (jobRows.length > 0) {
        targetJob = jobRows[0];
      }
    }

    if (!targetJob) {
      return res.status(400).json({ success: false, message: 'Job ID or custom job parameters required.' });
    }

    // Fetch candidate workers matching category or generally available
    const workers = await query(`
      SELECT
        wp.id as worker_id,
        wp.user_id,
        u.full_name,
        u.avatar_url,
        wc.name as category_name,
        wc.slug as category_slug,
        wp.preferred_location,
        wp.address,
        wp.experience_years,
        wp.expected_salary,
        wp.rating_avg,
        wp.total_completed_jobs,
        wp.verification_status,
        GROUP_CONCAT(DISTINCT s.name SEPARATOR ', ') as skills_list
      FROM worker_profiles wp
      JOIN users u ON wp.user_id = u.id
      LEFT JOIN worker_categories wc ON wp.category_id = wc.id
      LEFT JOIN worker_skills ws ON wp.id = ws.worker_id
      LEFT JOIN skills s ON ws.skill_id = s.id
      WHERE u.is_active = TRUE AND wp.availability_status != 'unavailable'
      GROUP BY wp.id
    `);

    // Attempt Python Scikit-Learn TF-IDF + Cosine Matching
    let mlMatchedWorkers = null;
    try {
      const pyRes = await fetch('http://127.0.0.1:8000/match-workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_title: targetJob.title || '',
          job_description: targetJob.description || '',
          required_skills: targetJob.required_skills || '',
          location: targetJob.location || '',
          budget: parseFloat(targetJob.budget) || 1000,
          workers: workers.map(w => ({
            id: w.worker_id,
            full_name: w.full_name,
            skills_text: `${w.skills_list || ''} ${w.category_name || ''}`,
            experience_years: parseFloat(w.experience_years) || 1.0,
            rating_avg: parseFloat(w.rating_avg) || 4.5,
            preferred_location: w.preferred_location || '',
            expected_salary: parseFloat(w.expected_salary) || 800
          }))
        }),
        signal: AbortSignal.timeout(1000)
      });
      if (pyRes.ok) {
        const pyData = await pyRes.json();
        if (pyData && pyData.matches) {
          const matchMap = new Map(pyData.matches.map(m => [m.worker_id, m]));
          mlMatchedWorkers = workers.map(worker => {
            const mlMatch = matchMap.get(worker.worker_id);
            return {
              ...worker,
              matchScore: mlMatch ? mlMatch.match_score : 70,
              reasons: mlMatch ? mlMatch.reasons : ['Skills align with job specifications'],
              cosine_similarity: mlMatch ? mlMatch.cosine_similarity : 0.5,
              engine: 'Python Scikit-Learn (TF-IDF + Cosine Similarity)'
            };
          });
        }
      }
    } catch (pyErr) {
      // Python ML offline, fall back to JS MCDA matcher
    }

    const rankedWorkers = mlMatchedWorkers || workers.map(worker => {
      const { matchScore, reasons } = calculateWorkerMatch(targetJob, worker);
      return {
        ...worker,
        matchScore,
        reasons,
        engine: 'JavaScript MCDA Heuristic'
      };
    });

    // Sort descending by matchScore
    rankedWorkers.sort((a, b) => b.matchScore - a.matchScore);

    return res.json({
      success: true,
      count: rankedWorkers.length,
      recommendations: rankedWorkers.slice(0, 10)
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 2. AI Salary Prediction (POST /api/ai/predict-salary)
 */
async function predictSalaryEndpoint(req, res, next) {
  try {
    const result = await predictSalary(req.body);
    return res.json({ success: true, prediction: result });
  } catch (error) {
    next(error);
  }
}

/**
 * 3. AI Chatbot (POST /api/ai/chat)
 */
async function chatEndpoint(req, res, next) {
  try {
    const { message, language = 'en', sessionId } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message text is required.' });
    }

    const chatResult = await handleChatMessage({ message, language, userId });

    // Optionally record in database for audit
    if (sessionId) {
      try {
        const [conv] = await query('SELECT id FROM chatbot_conversations WHERE session_id = ?', [sessionId]);
        let convId = conv?.id;
        if (!convId) {
          const insertConv = await query(
            'INSERT INTO chatbot_conversations (user_id, session_id, language) VALUES (?, ?, ?)',
            [userId, sessionId, language]
          );
          convId = insertConv.insertId;
        }

        await query('INSERT INTO chatbot_messages (conversation_id, sender, message, intent) VALUES (?, "user", ?, ?)', [convId, message, chatResult.intent]);
        await query('INSERT INTO chatbot_messages (conversation_id, sender, message, intent) VALUES (?, "bot", ?, ?)', [convId, chatResult.reply, chatResult.intent]);
      } catch (dbErr) {
        console.warn('[Chat History Warning]:', dbErr.message);
      }
    }

    return res.json({ success: true, ...chatResult });
  } catch (error) {
    next(error);
  }
}

/**
 * 4. AI Profile Builder (POST /api/ai/build-profile)
 */
function buildProfileEndpoint(req, res) {
  const generated = generateWorkerProfile(req.body);
  return res.json({ success: true, profile: generated });
}

/**
 * 5. AI Skill Recommendations (POST /api/ai/recommend-skills)
 */
function recommendSkillsEndpoint(req, res) {
  const recommendations = recommendSkills(req.body);
  return res.json({ success: true, ...recommendations });
}

/**
 * 6. AI Fraud Detection Analysis (GET /api/ai/check-fraud/:userId)
 */
async function checkFraudEndpoint(req, res, next) {
  try {
    const userId = req.params.userId;
    const evaluation = await evaluateUserRisk(userId);
    return res.json({ success: true, evaluation });
  } catch (error) {
    next(error);
  }
}

/**
 * 7. AI Review Analysis (POST /api/ai/analyze-reviews)
 */
async function analyzeReviewsEndpoint(req, res, next) {
  try {
    const { workerId, reviews } = req.body;
    let targetReviews = reviews;

    if (workerId && !targetReviews) {
      const workerRows = await query('SELECT user_id FROM worker_profiles WHERE id = ?', [workerId]);
      if (workerRows.length > 0) {
        targetReviews = await query('SELECT rating, review_text FROM job_reviews WHERE reviewee_id = ?', [workerRows[0].user_id]);
      }
    }

    const analysis = await analyzeReviews(targetReviews || []);
    return res.json({ success: true, analysis });
  } catch (error) {
    next(error);
  }
}

/**
 * 8. AI Job Description Generator (POST /api/ai/generate-job-desc)
 */
function generateJobDescEndpoint(req, res) {
  const jobDraft = generateJobDescription(req.body);
  return res.json({ success: true, jobDraft });
}

/**
 * 9. AI Income Analysis & Insights (GET /api/ai/income-insights/:workerId)
 */
async function incomeInsightsEndpoint(req, res, next) {
  try {
    let workerId = req.params.workerId;
    if (workerId === 'me' && req.user && req.user.worker_id) {
      workerId = req.user.worker_id;
    }

    const insights = await analyzeWorkerIncome(workerId);
    return res.json({ success: true, insights });
  } catch (error) {
    next(error);
  }
}

/**
 * 10. Voice Search Query Parser (POST /api/ai/parse-voice-search)
 * Extracts intent, category, location, and keywords from spoken queries.
 */
function parseVoiceSearchEndpoint(req, res) {
  const speechText = (req.body.transcript || '').toLowerCase().trim();

  const categories = [
    'electrician', 'plumber', 'carpenter', 'painter', 'mason',
    'driver', 'cook', 'cleaner', 'gardener', 'babysitter',
    'security', 'tutor', 'mechanic', 'delivery'
  ];

  let detectedCategory = null;
  for (const cat of categories) {
    if (speechText.includes(cat)) {
      detectedCategory = cat;
      break;
    }
  }

  const locations = ['bengaluru', 'bangalore', 'btm', 'koramangala', 'indiranagar', 'whitefield', 'hsr', 'jayanagar', 'malleshwaram'];
  let detectedLocation = null;
  for (const loc of locations) {
    if (speechText.includes(loc)) {
      detectedLocation = loc;
      break;
    }
  }

  return res.json({
    success: true,
    originalText: speechText,
    detectedCategory,
    detectedLocation,
    cleanedSearchQuery: speechText.replace(/(i need|looking for|find me a|find a|hire|near me)/g, '').trim()
  });
}

module.exports = {
  matchWorkersForJob,
  predictSalaryEndpoint,
  chatEndpoint,
  buildProfileEndpoint,
  recommendSkillsEndpoint,
  checkFraudEndpoint,
  analyzeReviewsEndpoint,
  generateJobDescEndpoint,
  incomeInsightsEndpoint,
  parseVoiceSearchEndpoint
};

