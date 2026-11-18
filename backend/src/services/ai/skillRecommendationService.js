/**
 * AI Skill Recommendation Service
 * Analyzes a worker's trade category, current skills, and market demand
 * to recommend high-paying upskilling paths and complementary capabilities.
 */

const CATEGORY_ROADMAPS = {
  'electrician': [
    { skill: 'Solar Inverter & Rooftop PV Wiring', demand: 'High', earningBoost: '+25%', reason: 'Growing customer adoption of rooftop solar panels requires certified wiring.' },
    { skill: 'Smart Home Automation & IoT Switches', demand: 'Very High', earningBoost: '+35%', reason: 'Modern apartment owners seek Wi-Fi enabled switch and ambient lighting setup.' },
    { skill: 'EV Charger Installation', demand: 'Emerging', earningBoost: '+30%', reason: 'Electric vehicles in metro cities need dedicated 15A/32A home charging points.' }
  ],
  'plumber': [
    { skill: 'Acoustic Ultrasonic Leakage Detection', demand: 'High', earningBoost: '+30%', reason: 'Detects concealed pipe leaks without chiseling tiles, commanding premium diagnostic fees.' },
    { skill: 'Solar Water Heater & Pressure Pumps', demand: 'High', earningBoost: '+25%', reason: 'Villa and duplex projects consistently need pressurized hot water plumbing.' },
    { skill: 'RO Water Purifier Servicing', demand: 'Moderate', earningBoost: '+20%', reason: 'Quarterly recurring filter replacement contracts create steady monthly income.' }
  ],
  'carpenter': [
    { skill: 'CNC & Acrylic Modular Cabinet Assembly', demand: 'Very High', earningBoost: '+40%', reason: 'Contemporary interior design studios look for factory-finish installers.' },
    { skill: 'Italian PU Polish Application', demand: 'High', earningBoost: '+30%', reason: 'Luxury high-gloss and matte finishes yield premium profit margins.' },
    { skill: 'Smart Digital Lock Installation', demand: 'High', earningBoost: '+20%', reason: 'Quick high-demand service with great add-on earning opportunities.' }
  ],
  'cook-chef': [
    { skill: 'Sattvic & Diabetic Diet Planning', demand: 'High', earningBoost: '+25%', reason: 'Urban households pay premium rates for specialized low-glycemic, nutritious cooking.' },
    { skill: 'Continental & Italian Pasta/Bakes', demand: 'Moderate', earningBoost: '+20%', reason: 'Popular with younger families and weekend party catering.' },
    { skill: 'HACCP & Advanced Hygiene Standards', demand: 'High', earningBoost: '+15%', reason: 'Builds instant trust with health-conscious customers.' }
  ]
};

function recommendSkills({ categorySlug = 'electrician', currentSkills = [] }) {
  const normalizedCategory = (categorySlug || 'electrician').toLowerCase();
  const currentSkillsLower = currentSkills.map(s => s.toLowerCase());

  const roadmap = CATEGORY_ROADMAPS[normalizedCategory] || [
    { skill: 'Digital Customer Communication', demand: 'High', earningBoost: '+15%', reason: 'Improves repeat hiring rates and positive review scores.' },
    { skill: 'Safety Protocol & First Aid', demand: 'Moderate', earningBoost: '+10%', reason: 'Increases eligibility for corporate and commercial site contracts.' },
    { skill: 'Tool Care & Preventive Maintenance', demand: 'Moderate', earningBoost: '+12%', reason: 'Extends equipment life and avoids downtime on jobs.' }
  ];

  // Filter out skills the worker already holds
  const recommendations = roadmap.filter(item => {
    return !currentSkillsLower.some(cs => cs.includes(item.skill.toLowerCase()));
  });

  return {
    category: categorySlug,
    totalRecommendations: recommendations.length,
    recommendations
  };
}

module.exports = {
  recommendSkills
};

