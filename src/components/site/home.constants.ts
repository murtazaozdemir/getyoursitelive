export const navItems = ["home", "about", "services", "technicians", "contact"] as const;

export const statTargets = [
  { label: "Years Experience", value: 15, suffix: "+" },
  { label: "Happy Clients", value: 12450, suffix: "+" },
  { label: "Services Done", value: 28500, suffix: "+" },
  { label: "Expert Technicians", value: 12, suffix: "+" },
] as const;

export const whyUsValues = [
  ["Honest Diagnostics", "We show photos of every issue before recommending repairs."],
  ["Same-Day Service", "Most repairs are completed in 24 hours."],
  ["Digital Updates", "Text and email progress reports from check-in to pickup."],
  ["2-Year Warranty", "24,000-mile parts and labor protection included."],
] as const;

export const pricingCards = [
  { name: "Oil Change", price: "$49", note: "Synthetic blend + 27-point inspection", popular: false },
  { name: "Brake Service", price: "$189", note: "Pads, rotor inspection, safety check", popular: true },
  { name: "Full Diagnostic", price: "$89", note: "Digital scan + road test report", popular: false },
] as const;

export const processSteps = ["Book (5 min)", "Inspect (30 min)", "Approve (15 min)", "Drive (same day)"] as const;

export const faqQuestions = [
  "Do I need an appointment?",
  "How long do repairs typically take?",
  "Do you work on all car brands?",
  "Do you offer financing?",
  "Is there a waiting area?",
  "What is your warranty?",
] as const;
