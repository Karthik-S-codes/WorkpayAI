/**
 * AI Job Description Generator Service
 * Helps customers draft clear, structured, and professional job postings
 * to attract qualified applicants quickly.
 */

function generateJobDescription({
  category = 'Electrician',
  shortSummary = '',
  location = 'Bengaluru',
  budget = 1500,
  duration = '1 Day',
  urgency = 'Standard'
}) {
  const cat = (category || 'Electrician').trim();
  const summary = (shortSummary || '').trim();

  let generatedTitle = `Seeking Experienced ${cat} for Residential Project in ${location}`;
  let description = '';
  let deliverables = [];
  let safetyAndTools = [];

  if (summary.length > 3) {
    generatedTitle = `${cat} Required: ${summary.slice(0, 50)}...`;
  }

  switch (cat.toLowerCase()) {
    case 'electrician':
      description = `We are seeking a licensed, safety-trained electrician for a project located in ${location}. Work involves diagnostics, wiring inspection, circuit breaker testing, and ensuring all fixtures comply with Indian domestic safety norms.`;
      deliverables = [
        'Complete diagnostic audit of existing wiring and circuit points',
        'Replacement or fitting of necessary breakers, switches, or inverters',
        'Proper earthing verification to prevent power surges',
        'Clean work area post-installation with testing in presence of homeowner'
      ];
      safetyAndTools = [
        'Worker must carry standard insulated safety hand tools & digital tester',
        'Rubber-soled safety footwear required on site'
      ];
      break;

    case 'plumber':
      description = `Looking for an experienced plumber in ${location} to handle pipe fitting, leak rectification, and sanitaryware maintenance. Candidate should have hands-on experience with CPVC/PPR joints and bathroom fixtures.`;
      deliverables = [
        'Precise diagnosis of leakage or water pressure blockage',
        'Installation or repair of taps, valves, and water heater inlets',
        'Pressure seal testing on all joints to ensure zero recurring seepage',
        'Neat cleanup and removal of debris'
      ];
      safetyAndTools = [
        'Worker should bring pipe wrenches, sealant tape, and standard fitting gear',
        'Protective gloves and clean footwear'
      ];
      break;

    case 'carpenter':
      description = `Need a skilled wood artisan and carpenter in ${location} for custom cabinetry, furniture fitting, and repair work. Precision measurements and flawless edge finish expected.`;
      deliverables = [
        'Accurate measurement and cutting of panels or solid wood components',
        'Installation of heavy-duty soft-close hinges, channels, or locks',
        'Surface sanding and smooth finish alignment',
        'Waste sawdust vacuuming and site cleanup'
      ];
      safetyAndTools = [
        'Worker brings measuring tape, power drill, hand saws, and alignment levels'
      ];
      break;

    default:
      description = `We are looking for a reliable and verified ${cat} in ${location}. The assignment involves dependable service, high-quality execution, and courteous communication.`;
      deliverables = [
        `Completion of agreed ${cat} tasks within scheduled ${duration}`,
        'Inspection with client before job sign-off',
        'Transparent mutual agreement on any required spare parts'
      ];
      safetyAndTools = [
        'Standard trade tools and basic protective gear'
      ];
      break;
  }

  if (summary.length > 0) {
    description += `\n\nSpecific Client Scope Notes: "${summary}".`;
  }

  return {
    title: generatedTitle,
    description,
    deliverables,
    safetyAndTools,
    suggestedBudget: budget,
    paymentType: 'per_job',
    expectedDuration: duration,
    workingHours: '8 Hours / Flexible'
  };
}

module.exports = {
  generateJobDescription
};

