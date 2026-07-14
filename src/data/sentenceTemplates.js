// GRE-style sentence templates for different vocabulary themes.
// {blank} will be replaced by the target word.
// Each template includes the sentence structure and hints.

const templates = {
  // List 1
  "g1_prediction": "The meteorologist was able to {blank} the path of the category 5 hurricane, allowing city officials to evacuate residents in time.",
  "g2_sign_warning": "The sudden drop in temperature and the eerie silence of the birds were {blank} signs of the approaching blizzard.",
  "g3_causing_fear": "The mountaineers faced a {blank} challenge as they stared up at the sheer, icy vertical wall of K2.",
  "g4_very_angry": "The local citizens were {blank} when they discovered the city council had secretly voted to increase property taxes by forty percent.",
  "g5_detailed_knowledge_intellectual": "The professor delivered an {blank} lecture on ancient Mesoamerican civilizations, demonstrating a profound depth of scholarship.",
  "g6_skillful": "The watchmaker's {blank} hands carefully assembled the microscopic gears of the luxury Swiss chronograph.",
  "g7_flexible": "The modern dancer's {blank} movements captivated the audience, as her body bent in ways that seemed almost impossible.",
  "g8_having_twists_turns_complex": "The legal counsel spent weeks navigating the {blank} network of shell companies and offshore bank accounts to trace the stolen funds.",
  "g9_inclination": "He has a strong {blank} toward mathematical research, often spending his leisure time solving complex calculus proofs.",
  "g10_ineffective": "All of the rescue team's attempts to establish radio contact with the stranded climbers proved {blank} in the heavy snowstorm.",
  "g11_horrifying_shocking": "The inspectors uncovered a {blank} violation of safety codes at the food processing facility, leading to its immediate closure.",
  "g12_attractive": "The new art gallery was praised for its {blank} design, which beautifully integrated raw concrete with soft, warm wood tones.",
  "g13_separate_connected": "The political analyst explained that the two social movements are not {blank}; indeed, they share a deep, historical connection.",
  "g14_very_talented_child": "The young piano {blank} was composing full symphonies and performing before European royalty at the age of just nine.",
  "g15_avoid_dodge": "During the press conference, the politician tried to {blank} questions about the investigation by changing the subject to economic growth.",
  "g16_awkward_clumsy": "The toddler took a few {blank} steps across the polished hardwood floor before falling safely onto a pile of cushions.",
  "g17_optimistic": "Despite the severe quarterly losses, the startup's founders remained {blank} about securing their next round of venture funding.",
  "g18_be_slow_waste_time": "The supervisor warned the construction crew that {blank} work habits would not be tolerated given the project's strict deadline.",
  "g19_instructive": "The museum's interactive exhibit was highly {blank}, teaching children the basic principles of physics through play.",
  "g20_spread": "The public health agency launched a campaign to {blank} accurate information about the vaccine and dispel widespread myths.",
  "g21_excessive_flattery": "The dictator was constantly surrounded by {blank} advisors who agreed with his every decision, isolating him from reality.",
  "g22_bodily": "The theologian argued that human beings possess both a transient, {blank} body and an eternal, non-physical soul.",

  // List 2
  "g1_hate": "The long-standing border dispute fostered deep {blank} between the neighboring countries, preventing any peace talks.",
  "g2_old_fashioned_outdated": "The office finally decided to replace its {blank} desktop computers, which were running software from two decades ago.",
  "g3_arranged_in_time": "The historian compiled a detailed {blank} of the American Civil War, logging events day by day.",
  "g4_co_existing": "The museum display showed how two very different cultural traditions were {blank} in the same ancient city.",
  "g5_cautious_careful_risky": "A financial advisor must be {blank} when managing retirement portfolios, balancing growth against potential losses.",
  "g6_self_satisfaction": "The champion was warned against becoming {blank}, as his next opponent was training with intense dedication.",
  "g7_scolding": "The head coach gave a stern {blank} to the team at halftime, demanding more discipline and effort on the field.",
  "g8_criticize": "The editorial board chose to {blank} the administration's foreign policy, calling it short-sighted and ineffective.",
  "g9_to_defeat_surrender": "The general was determined to {blank} the rebel forces and restore peace to the northern province.",
  "g10_rule_principle_law": "The academy's strict code of conduct is built on several fundamental {blank} that all members are expected to uphold.",
  "g11_rebellious_unconventional": "The artist was known as a {blank} in the traditional art world, constantly defying established techniques and styles.",
  "g12_to_stir_up_revolt": "The underground leader was accused of trying to {blank} a rebellion against the authoritarian regime.",
  "g13_complain_low_degree": "The customer was notoriously {blank}, frequently writing lengthy emails to complain about minor details of the service.",
  "g14_danger": "Operating a nuclear power plant without proper safety measures places the entire region in grave {blank}.",
  "g15_bitter_feelings_ill_will": "The editorial was written with extreme {blank}, attacking the author's character rather than evaluating her book.",
  "g16_troubled": "The prime minister was {blank} by economic crises, cabinet resignations, and growing public dissatisfaction.",
  "g17_mock_disrespect": "The comedian's routine was full of sharp satire designed to {blank} the arrogance of high-profile politicians.",
  "g18_praise": "The young scientist received high {blank} from her peers for her groundbreaking discovery in genetic engineering.",
  "g19_emphasize": "In his final address, the professor sought to {blank} the importance of ethics in scientific research.",
  "g20_similarity": "The psychologist drew an {blank} between the development of a child's mind and the growth of a complex ecosystem.",
  "g21_coming_together": "The community began to {blank} around the local library after it was threatened with budget cuts and closure.",

  // List 3
  "g1_equality": "The labor union demanded {blank} in pay and benefits between part-time workers and full-time employees.",
  "g2_agreement_harmony": "The two nations reached a peace {blank} after months of negotiations, ending a decade of conflict.",
  "g3_split_gap": "The political debate highlighted a growing {blank} between urban and rural voters on environmental policy.",
  "g4_aggressive_argumentative": "The talk show host was known for his {blank} style, frequently interrupting guests and provoking arguments.",
  "g5_argue_fight": "What started as a quiet disagreement quickly escalated into a heated {blank} in the middle of the office.",
  "g6_confused_taken_aback": "The sudden change in corporate policy left many employees completely {blank} as to their future roles.",
  "g7_clear_understandable": "The manual provided {blank} instructions for assembling the bookshelf, complete with simple diagrams.",
  "g8_hard_to_understand": "The philosopher's writing was notoriously {blank}, requiring students to read each sentence multiple times.",
  "g9_secret_mysterious": "The intelligence agency conducted {blank} operations to gather data on the hostile nation's nuclear program.",
  "g10_unimportant_minor": "The manager brushed off the customer's complaint as a {blank} issue, focusing instead on larger operational bugs.",
  "g11_unimportant_silly": "He spent the entire afternoon reading {blank} articles online instead of preparing for his final exam.",
  "g12_serious_sad": "The atmosphere at the memorial service was deeply {blank}, as friends gathered to pay their respects.",
  "g13_not_serious_silly": "Her {blank} attitude during the serious business meeting was seen as highly unprofessional by the board.",
  "g14_stubborn": "Despite the overwhelming evidence against his theory, the researcher remained {blank} in his beliefs.",
  "g15_flexible_obedient": "The new assistant was highly {blank}, adapting quickly to the varying demands of the executives.",
  "g16_abundant_full": "The tropical rainforest is {blank} with life, hosting thousands of unique plant and animal species.",
  "g17_scarce_empty": "During the drought, clean drinking water became extremely {blank} in the remote villages.",
  "g18_wasteful_spending": "The heir's {blank} lifestyle soon drained the massive fortune left by his grandfather.",
  "g19_frugal_saving": "Growing up in a low-income household taught her to be highly {blank} with her finances, avoiding any unnecessary luxury.",
  "g20_greedy": "The corporate buyout was driven by {blank} executives who cared only about short-term stock gains.",
  "g21_generous_charitable": "The billionaire made a {blank} donation to the university's research hospital, funding five new oncology labs.",
  "g22_harmful_toxic": "The factory was fined for releasing {blank} chemicals into the local river, damaging the aquatic ecosystem."
};

// Cleans up group name for fallback sentences
// e.g. "g11_rebellious_unconventional" -> "rebellious or unconventional"
function cleanGroupName(groupKey) {
  return groupKey
    .replace(/^g\d+_/, "")
    .replace(/_/g, " ");
}

/**
 * Retrieves a GRE-style sentence template for the given list and group key.
 * If no specific template is found, a high-quality fallback is generated.
 * @param {string} groupKey 
 * @param {string} word 
 * @returns {string}
 */
export function getSentenceTemplate(groupKey, word) {
  let template = templates[groupKey];
  
  if (!template) {
    const cleanedTheme = cleanGroupName(groupKey);
    // Generic high-quality fallbacks based on group theme
    const genericTemplates = [
      `The behavior was described as {blank}, aligning with a broader theme of ${cleanedTheme} in their culture.`,
      `Although some criticized the decision, others saw it as {blank}, demonstrating a clear case of ${cleanedTheme}.`,
      `Her latest academic paper was a {blank} study, providing a classic example of ${cleanedTheme} in action.`,
      `The director's approach is often {blank}, illustrating a standard expression of ${cleanedTheme}.`
    ];
    // Use the word's length or characters to stably select a generic template
    const index = (word || "").charCodeAt(0) % genericTemplates.length;
    template = genericTemplates[isNaN(index) ? 0 : index];
  }

  return template;
}

/**
 * Returns a human-friendly theme name from the groupKey
 * e.g. "g11_rebellious_unconventional" -> "Rebellious / Unconventional"
 */
export function getThemeName(groupKey) {
  return groupKey
    .replace(/^g\d+_/, "")
    .split("_")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" / ");
}
