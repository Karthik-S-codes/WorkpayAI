/**
 * AI Profile Builder Service
 * Empowers workers to transform short, rough descriptions into
 * compelling, professional profiles to attract high-paying customers.
 */

function generateWorkerProfile({
  fullName = 'Trade Specialist',
  category = 'Electrician',
  experienceYears = 3,
  rawDescription = '',
  languages = 'English, Hindi, Kannada',
  location = 'Bengaluru'
}) {
  const expNum = parseFloat(experienceYears) || 2;
  const raw = (rawDescription || '').trim();

  // Template synthesis tailored by trade category
  let headline = `Certified ${category} with ${expNum}+ Years Hands-On Experience`;
  let bio = '';
  let highlights = [];
  let suggestedSkills = [];

  switch (category.toLowerCase()) {
    case 'electrician':
      headline = `Licensed Electrical Specialist | Residential & Commercial Systems`;
      bio = `Dedicated and safety-certified Electrician offering over ${expNum} years of proven expertise across ${location}. Proficient in full-scale conduit rewiring, circuit breaker (MCB) installations, power diagnostics, and inverter power backups. Committed to strict Indian electrical safety standards with flawless attention to detail.`;
      highlights = [
        'Adheres to IS 732 electrical installation safety standards',
        'Emergency short-circuit troubleshooting & fault rectification',
        'Expert in energy-saving inverter and solar integration',
        'Carries professional digital multimeters and insulated tools'
      ];
      suggestedSkills = ['House Wiring', 'MCB Setup', 'Inverter Installation', 'Appliance Repair', 'Earthing & Surge Protection'];
      break;

    case 'plumber':
      headline = `Master Plumber & Pipe Diagnostics Specialist`;
      bio = `Skilled and trusted Plumber with ${expNum} years of field experience serving residential communities in ${location}. Specialized in acoustic leak detection, sanitary fixture installations, CPVC/PPR pipeline fittings, and overhead water pressure maintenance. Known for timely arrival and tidy workmanship.`;
      highlights = [
        'Advanced concealed pipe leakage detection without wall destruction',
        'Expert bathroom sanitaryware and shower panel installations',
        'High-pressure drain clearance and backflow prevention',
        'Quality assurance on all fittings and joint seals'
      ];
      suggestedSkills = ['Concealed Piping', 'Leakage Detection', 'Sanitary Fittings', 'Pressure Boosters', 'Drain Unclogging'];
      break;

    case 'carpenter':
      headline = `Artisan Wood Craftsman & Custom Furniture Specialist`;
      bio = `Precision-driven Woodcraft Artisan with ${expNum} years of experience designing and repairing bespoke wooden furniture in ${location}. Specialized in modern modular kitchen cabinets, hardwood dining tables, antique furniture restoration, and high-security lock fittings.`;
      highlights = [
        'Custom modular kitchen fitting with millimeter accuracy',
        'Teakwood, Sheesham, and Rosewood polish restoration (PU/Melamine)',
        'Precision door frame alignment and concealed hinge fitting',
        'Durable material selection ensuring longevity'
      ];
      suggestedSkills = ['Modular Kitchen', 'Wood Polishing', 'Furniture Assembly', 'Lock Fitting', 'Cabinet Making'];
      break;

    case 'cook & chef':
    case 'cook-chef':
      headline = `Culinary Expert | Authentic Regional & Wholesome Meal Specialist`;
      bio = `Passionate culinary artist with ${expNum} years of dedicated kitchen experience crafting hygienic, flavorful, and nutritionally balanced meals. Well-versed in traditional South Indian, North Indian, and wholesome continental recipes customized to family dietary preferences.`;
      highlights = [
        'Strict hygiene and food safety standards following FSSAI guidelines',
        'Customized low-oil, diabetic-friendly, and sattvic diet preparation',
        'Efficient meal planning and pantry inventory management',
        'Accommodates large festive gatherings and daily family dining'
      ];
      suggestedSkills = ['South Indian Cuisine', 'North Indian Curries', 'Dietary Meal Prep', 'Party Catering', 'Food Safety & Hygiene'];
      break;

    default:
      headline = `Experienced ${category} Specialist | Reliable & Verified`;
      bio = `Motivated and hardworking ${category} with over ${expNum} years of reliable service in ${location}. Dedicated to delivering high customer satisfaction with dependable punctuality, fair pricing, and trustworthy service.`;
      highlights = [
        `Proven track record with ${expNum}+ years in the trade`,
        'Punctual, dependable, and highly communicative',
        'Transparent billing with no hidden costs',
        'Customer satisfaction guaranteed'
      ];
      suggestedSkills = [`Professional ${category}`, 'Maintenance & Repairs', 'Customer Care', 'Quality Inspection'];
      break;
  }

  // If user provided raw notes, weave their specific mentions into the bio
  if (raw.length > 5) {
    bio += ` Additional background notes: "${raw}".`;
  }

  return {
    headline,
    bio,
    highlights,
    suggestedSkills,
    languages: languages || 'English, Hindi, Kannada',
    recommendedPaymentPreference: 'daily'
  };
}

module.exports = {
  generateWorkerProfile
};

