/**
 * AI Worker Matching Engine
 * Multi-criteria weighted scoring algorithm:
 * - Skill Match (35%)
 * - Experience Compatibility (20%)
 * - Location Compatibility (15%)
 * - Budget / Salary Compatibility (15%)
 * - Rating & Verification (10%)
 * - Completed Jobs Track Record (5%)
 */

function calculateWorkerMatch(job, worker) {
  let score = 0;
  const reasons = [];

  // 1. Skill Compatibility (35 points)
  const jobSkills = (job.required_skills || '')
    .toLowerCase()
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const workerSkills = (worker.skills_list || '')
    .toLowerCase()
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  let matchedSkillsCount = 0;
  if (jobSkills.length > 0) {
    jobSkills.forEach(reqSkill => {
      if (workerSkills.some(wSkill => wSkill.includes(reqSkill) || reqSkill.includes(wSkill))) {
        matchedSkillsCount++;
      }
    });
    const skillRatio = matchedSkillsCount / jobSkills.length;
    const skillPoints = Math.round(skillRatio * 35);
    score += skillPoints;

    if (skillRatio >= 0.8) {
      reasons.push('Excellent skill overlap matching required job specifications');
    } else if (skillRatio >= 0.5) {
      reasons.push(`Matches ${matchedSkillsCount} of ${jobSkills.length} required skill sets`);
    } else {
      reasons.push('Partial skill alignment with core requirements');
    }
  } else {
    // If no specific skills stated, match category directly
    score += 30;
    reasons.push('Category specialist matching primary job classification');
  }

  // 2. Experience Compatibility (20 points)
  const reqExp = parseFloat(job.required_experience || 1.0);
  const workerExp = parseFloat(worker.experience_years || 1.0);

  if (workerExp >= reqExp) {
    score += 20;
    reasons.push(`Experienced veteran with ${workerExp} years in trade (exceeds ${reqExp} yrs requirement)`);
  } else if (workerExp >= reqExp * 0.7) {
    score += 15;
    reasons.push(`Close experience profile (${workerExp} years vs ${reqExp} requested)`);
  } else {
    score += 8;
    reasons.push(`Emerging practitioner with ${workerExp} years hands-on experience`);
  }

  // 3. Location / Proximity (15 points)
  const jobLoc = (job.location || '').toLowerCase();
  const workerLoc = (worker.preferred_location || worker.address || '').toLowerCase();

  const isExactZone = jobLoc.split(',').some(part => workerLoc.includes(part.trim())) ||
                      workerLoc.split(',').some(part => jobLoc.includes(part.trim()));

  if (isExactZone) {
    score += 15;
    reasons.push('Prime local availability in the immediate neighborhood');
  } else if (jobLoc.includes('bengaluru') && workerLoc.includes('bengaluru')) {
    score += 10;
    reasons.push('Within the same metro transit radius');
  } else {
    score += 5;
    reasons.push('Available for dispatch across operational zone');
  }

  // 4. Budget / Salary Compatibility (15 points)
  const budget = parseFloat(job.budget || 0);
  const expectedSalary = parseFloat(worker.expected_salary || 0);

  if (budget > 0 && expectedSalary > 0) {
    if (expectedSalary <= budget) {
      score += 15;
      reasons.push(`Budget friendly: Worker expected fee (₹${expectedSalary}) fits within customer budget (₹${budget})`);
    } else if (expectedSalary <= budget * 1.2) {
      score += 10;
      reasons.push(`Slightly above budget (₹${expectedSalary} vs ₹${budget}), negotiable upon scope review`);
    } else {
      score += 4;
      reasons.push(`Premium tier rate (₹${expectedSalary}) reflecting high specialization`);
    }
  } else {
    score += 12;
  }

  // 5. Rating & Verification (10 points)
  const rating = parseFloat(worker.rating_avg || 4.5);
  const isVerified = worker.verification_status === 'verified';

  let ratingPoints = Math.min(7, Math.round((rating / 5.0) * 7));
  if (isVerified) ratingPoints += 3;
  score += ratingPoints;

  if (isVerified) {
    reasons.push('WorkPay Verified Worker Badge: Identity & credentials audited');
  }
  if (rating >= 4.8) {
    reasons.push(`Top-rated customer satisfaction rating of ${rating} ★`);
  }

  // 6. Track Record / Completed Jobs (5 points)
  const completed = parseInt(worker.total_completed_jobs || 0, 10);
  if (completed >= 20) {
    score += 5;
    reasons.push(`Proven reliability with ${completed}+ verified completed platform projects`);
  } else if (completed >= 5) {
    score += 3;
    reasons.push(`Solid delivery track record with ${completed} completed assignments`);
  } else {
    score += 2;
  }

  // Cap between 10 and 99%
  score = Math.min(99, Math.max(15, score));

  return {
    matchScore: score,
    reasons: reasons.slice(0, 4) // Return top 4 concise explanations
  };
}

module.exports = {
  calculateWorkerMatch
};

