import { generateSeoData } from "../../utils/seoGenerator.js";
import { inferStateAndRegionFromCity } from "../../utils/locationHelper.js";

const stripHtml = (html = "") =>
  String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();

const normalizeTitle = (title = "") => {
  return String(title)
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^(urgent|immediate requirement|hiring for|vacancy for|job opening:?)\s*/i, "")
    .replace(/\s*\(m\/f\/d\)$/i, "");
};

const parseSalary = (rawSalary, description = "") => {
  if (typeof rawSalary === "object" && rawSalary !== null) {
    return {
      min: rawSalary.min || null,
      max: rawSalary.max || null,
      currency: rawSalary.currency || "INR",
    };
  }

  const text = `${rawSalary || ""} ${description}`.toLowerCase();
  let currency = "INR";
  if (text.includes("$") || text.includes("usd")) currency = "USD";
  else if (text.includes("€") || text.includes("eur")) currency = "EUR";

  const matches = text.match(/(\d+[\d,]*)\s*(?:k|lakh|lpa|to|-)\s*(\d+[\d,]*)/i);
  if (matches) {
    let min = parseInt(matches[1].replace(/,/g, ""), 10);
    let max = parseInt(matches[2].replace(/,/g, ""), 10);
    if (text.includes("k")) { min *= 1000; max *= 1000; }
    else if (text.includes("lpa") || text.includes("lakh")) { min *= 100000; max *= 100000; }
    return { min, max, currency };
  }

  const singleMatch = text.match(/(\d+[\d,]{3,})/);
  if (singleMatch) {
    const val = parseInt(singleMatch[1].replace(/,/g, ""), 10);
    return { min: val, max: val, currency };
  }

  return { min: null, max: null, currency };
};

const CATEGORY_MAP = {
  "Software & Technology": ["software", "developer", "engineer", "frontend", "backend", "fullstack", "react", "node", "python", "java", "sql", "devops", "cloud", "security", "qa", "tester"],
  "Artificial Intelligence": ["ai", "machine learning", "deep learning", "nlp", "llm", "pytorch", "tensorflow", "computer vision", "neural network"],
  "Healthcare & Hospital": ["nurse", "doctor", "hospital", "clinic", "pharma", "medical", "lab technician", "healthcare", "therapist", "patient care", "pharmacist"],
  "Education & Teaching": ["teacher", "professor", "school", "college", "tutor", "lecturer", "education", "trainer", "principal", "math"],
  "Retail & Sales": ["retail", "sales", "store", "cashier", "showroom", "shop", "counter", "business development", "field executive"],
  "Hotel & Restaurant": ["chef", "cook", "waiter", "hotel", "restaurant", "hospitality", "barista", "kitchen", "housekeeping"],
  "Manufacturing & Factory": ["factory", "machine operator", "assembly", "technician", "fitter", "welder", "production", "quality control", "maintenance", "electrical", "textile"],
  "Logistics & Delivery": ["driver", "delivery", "logistics", "warehouse", "courier", "dispatch", "fleet"],
  "Customer Support & BPO": ["call center", "telecaller", "customer support", "bpo", "helpdesk", "voice process", "teleperformance"],
  "Administrative & Office": ["data entry", "office assistant", "receptionist", "hr", "accountant", "billing", "admin", "clerk", "banking", "finance"],
  "Construction & Skilled Labor": ["carpenter", "electrician", "plumber", "mason", "construction", "site engineer", "civil engineering", "labor"],
};

const autoCategorize = (title = "", description = "") => {
  const haystack = `${title} ${description}`.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
    if (keywords.some((keyword) => haystack.includes(keyword))) {
      return category;
    }
  }

  return "General";
};

const detectSuspiciousJob = (title = "", description = "", companyName = "") => {
  const text = `${title} ${description} ${companyName}`.toLowerCase();
  const suspiciousKeywords = [
    "pay registration fee",
    "deposit money to get job",
    "100% work from home guaranteed $5000",
    "send bitcoin",
    "whatsapp only for urgent cash",
    "no interview instant payment required",
    "transfer money first",
  ];

  for (const phrase of suspiciousKeywords) {
    if (text.includes(phrase)) {
      return { isSuspicious: true, reason: `Contains suspicious term: "${phrase}"` };
    }
  }

  if (title.length < 3 || description.length < 15) {
    return { isSuspicious: true, reason: "Incomplete or too short title/description" };
  }

  return { isSuspicious: false, reason: "" };
};

const parseLocation = (rawLocation = "") => {
  const loc = String(rawLocation).trim();
  if (!loc) {
    return { location: "Remote", city: "Remote", state: "", country: "India", pincode: "", isLocal: false };
  }

  const pincodeMatch = loc.match(/\b\d{6}\b/);
  const pincode = pincodeMatch ? pincodeMatch[0] : "";

  const parts = loc.split(",").map((p) => p.trim());
  const city = parts[0] || "Remote";
  let state = parts[1] || "";
  const country = parts[2] || "India";

  if (!state) {
    const inferred = inferStateAndRegionFromCity(city || loc);
    if (inferred.state) state = inferred.state;
  }

  const isLocal = Boolean(pincode || loc.match(/(district|town|village|mandal|panchayat|bazar|colony|road|street|nagar)/i));

  return {
    location: loc,
    city,
    state,
    country,
    pincode,
    isLocal,
  };
};

const extractSkills = (title = "", description = "") => {
  const text = `${title} ${description}`.toLowerCase();
  const knownSkills = [
    "JavaScript", "TypeScript", "React", "Node.js", "Python", "Java", "SQL", "MongoDB",
    "Communication", "Customer Service", "Sales", "Accounting", "Microsoft Office",
    "Data Entry", "Driving", "Cooking", "Electrical Maintenance", "Teaching", "Tally",
    "Photoshop", "SEO", "Graphic Design", "Digital Marketing", "Nursing", "Inventory Management",
    "AWS", "Docker", "Kubernetes", "DevOps", "PyTorch", "Machine Learning", "Civil Engineering",
    "Quality Control", "Pharmacy", "Pharmacist", "Patient Care", "Hospitality"
  ];

  return knownSkills.filter((skill) => text.includes(skill.toLowerCase()));
};

const cleanAndNormalizeJob = (rawJob) => {
  const cleanTitle = normalizeTitle(rawJob.title);
  const cleanDescription = stripHtml(rawJob.description || rawJob.title);
  const salary = parseSalary(rawJob.salary, cleanDescription);
  const locationData = parseLocation(rawJob.location || rawJob.city);
  const category = rawJob.category && rawJob.category !== "General" ? rawJob.category : autoCategorize(cleanTitle, cleanDescription);
  const skills = Array.from(new Set([...(rawJob.skills || []), ...extractSkills(cleanTitle, cleanDescription)]));
  const suspiciousCheck = detectSuspiciousJob(cleanTitle, cleanDescription, rawJob.companyName);

  const normalizedJob = {
    title: cleanTitle,
    companyName: rawJob.companyName?.trim() || "Local Employer",
    companyLogo: rawJob.companyLogo || "",
    description: cleanDescription,
    skills,
    salaryMin: salary.min,
    salaryMax: salary.max,
    currency: salary.currency,
    employmentType: rawJob.employmentType || "full-time",
    experienceLevel: rawJob.experienceLevel || "entry",
    education: rawJob.education || "Not Specified",
    category,
    location: locationData.location,
    city: locationData.city,
    state: rawJob.state || locationData.state,
    country: locationData.country,
    district: rawJob.district || locationData.city,
    town: rawJob.town || "",
    village: rawJob.village || "",
    pincode: locationData.pincode,
    isLocal: rawJob.isLocal || locationData.isLocal,
    remote: Boolean(rawJob.remote || locationData.city.toLowerCase() === "remote"),
    deadline: rawJob.deadline ? new Date(rawJob.deadline) : null,
    sourceUrl: rawJob.sourceUrl || "http://localhost:5000",
    sourceName: rawJob.sourceName || "System Ingestion",
    postedDate: rawJob.postedDate ? new Date(rawJob.postedDate) : new Date(),
    suspiciousCheck,
  };

  const seo = generateSeoData(normalizedJob);
  normalizedJob.seo = seo;

  return normalizedJob;
};

export { cleanAndNormalizeJob, detectSuspiciousJob, autoCategorize, parseSalary, parseLocation };
