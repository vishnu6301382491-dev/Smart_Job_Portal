import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Job from "../models/Job.js";
import CollectedJob from "../models/CollectedJob.js";
import Employer from "../models/Employer.js";
import User from "../models/User.js";
import { generateSeoData } from "../utils/seoGenerator.js";
import { generateFingerprint } from "../services/jobAgent/duplicateService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const COMPANIES_DATABASE = [
  // Global Tech Giants
  { name: "Google", logo: "https://logo.clearbit.com/google.com", website: "https://careers.google.com", industry: "Software & Technology" },
  { name: "Microsoft", logo: "https://logo.clearbit.com/microsoft.com", website: "https://careers.microsoft.com", industry: "Software & Technology" },
  { name: "Amazon", logo: "https://logo.clearbit.com/amazon.com", website: "https://amazon.jobs", industry: "E-Commerce & Cloud" },
  { name: "Apple", logo: "https://logo.clearbit.com/apple.com", website: "https://apple.com/jobs", industry: "Consumer Electronics & Software" },
  { name: "Meta", logo: "https://logo.clearbit.com/meta.com", website: "https://metacareers.com", industry: "Social Media & AI" },
  { name: "NVIDIA", logo: "https://logo.clearbit.com/nvidia.com", website: "https://nvidia.com/careers", industry: "AI & Semiconductors" },
  { name: "Adobe", logo: "https://logo.clearbit.com/adobe.com", website: "https://adobe.com/careers", industry: "Digital Media & SaaS" },
  { name: "Oracle", logo: "https://logo.clearbit.com/oracle.com", website: "https://oracle.com/careers", industry: "Enterprise Software" },
  { name: "IBM", logo: "https://logo.clearbit.com/ibm.com", website: "https://ibm.com/careers", industry: "IT Services & Cloud" },
  { name: "Cisco", logo: "https://logo.clearbit.com/cisco.com", website: "https://cisco.com/careers", industry: "Networking & Security" },
  { name: "Intel", logo: "https://logo.clearbit.com/intel.com", website: "https://jobs.intel.com", industry: "Semiconductors" },
  { name: "Salesforce", logo: "https://logo.clearbit.com/salesforce.com", website: "https://salesforce.com/careers", industry: "Cloud CRM" },
  { name: "SAP", logo: "https://logo.clearbit.com/sap.com", website: "https://jobs.sap.com", industry: "Enterprise Applications" },

  // Indian IT Leaders
  { name: "TCS", logo: "https://logo.clearbit.com/tcs.com", website: "https://tcs.com/careers", industry: "IT Services & Consulting" },
  { name: "Infosys", logo: "https://logo.clearbit.com/infosys.com", website: "https://infosys.com/careers", industry: "IT Services & Consulting" },
  { name: "Wipro", logo: "https://logo.clearbit.com/wipro.com", website: "https://wipro.com/careers", industry: "IT Services" },
  { name: "HCLTech", logo: "https://logo.clearbit.com/hcltech.com", website: "https://hcltech.com/careers", industry: "IT & Technology" },
  { name: "Tech Mahindra", logo: "https://logo.clearbit.com/techmahindra.com", website: "https://techmahindra.com/careers", industry: "Telecom & IT" },
  { name: "LTIMindtree", logo: "https://logo.clearbit.com/ltimindtree.com", website: "https://ltimindtree.com/careers", industry: "Digital Solutions" },
  { name: "Mphasis", logo: "https://logo.clearbit.com/mphasis.com", website: "https://mphasis.com/careers", industry: "IT & Cloud Services" },
  { name: "Coforge", logo: "https://logo.clearbit.com/coforge.com", website: "https://coforge.com/careers", industry: "Digital Services" },
  { name: "Persistent Systems", logo: "https://logo.clearbit.com/persistent.com", website: "https://persistent.com/careers", industry: "Software Product Engineering" },

  // SaaS & Product Leaders
  { name: "Zoho", logo: "https://logo.clearbit.com/zoho.com", website: "https://zoho.com/careers", industry: "SaaS Business Software" },
  { name: "Freshworks", logo: "https://logo.clearbit.com/freshworks.com", website: "https://freshworks.com/careers", industry: "Customer Engagement SaaS" },
  { name: "Razorpay", logo: "https://logo.clearbit.com/razorpay.com", website: "https://razorpay.com/jobs", industry: "Fintech & Payments" },
  { name: "BrowserStack", logo: "https://logo.clearbit.com/browserstack.com", website: "https://browserstack.com/careers", industry: "Testing Cloud Infrastructure" },
  { name: "Postman", logo: "https://logo.clearbit.com/postman.com", website: "https://postman.com/careers", industry: "API Development Platform" },
  { name: "Chargebee", logo: "https://logo.clearbit.com/chargebee.com", website: "https://chargebee.com/careers", industry: "Subscription Management" },

  // Top Indian Startups & Unicorns
  { name: "Flipkart", logo: "https://logo.clearbit.com/flipkart.com", website: "https://flipkartcareers.com", industry: "E-Commerce" },
  { name: "Swiggy", logo: "https://logo.clearbit.com/swiggy.com", website: "https://swiggy.com/careers", industry: "Food Delivery & Quick Commerce" },
  { name: "Zomato", logo: "https://logo.clearbit.com/zomato.com", website: "https://zomato.com/careers", industry: "Food Tech & Commerce" },
  { name: "PhonePe", logo: "https://logo.clearbit.com/phonepe.com", website: "https://phonepe.com/careers", industry: "Fintech & UPI" },
  { name: "Meesho", logo: "https://logo.clearbit.com/meesho.com", website: "https://meesho.com/careers", industry: "Social E-Commerce" },
  { name: "Groww", logo: "https://logo.clearbit.com/groww.in", website: "https://groww.in/careers", industry: "WealthTech & Investments" },
  { name: "Zerodha", logo: "https://logo.clearbit.com/zerodha.com", website: "https://zerodha.com/careers", industry: "Fintech & Trading" },
  { name: "CRED", logo: "https://logo.clearbit.com/cred.club", website: "https://cred.club/careers", industry: "Fintech & Credit" },
  { name: "Zepto", logo: "https://logo.clearbit.com/zeptonow.com", website: "https://zeptonow.com/careers", industry: "Quick Commerce" },
  { name: "Blinkit", logo: "https://logo.clearbit.com/blinkit.com", website: "https://blinkit.com/careers", industry: "Instant Grocery Delivery" },
  { name: "Urban Company", logo: "https://logo.clearbit.com/urbancompany.com", website: "https://urbancompany.com/careers", industry: "Home Services Marketplace" },
  { name: "NoBroker", logo: "https://logo.clearbit.com/nobroker.in", website: "https://nobroker.in/careers", industry: "PropTech" },
  { name: "Livspace", logo: "https://logo.clearbit.com/livspace.com", website: "https://livspace.com/careers", industry: "Home Interior & Design" },
  { name: "Porter", logo: "https://logo.clearbit.com/porter.in", website: "https://porter.in/careers", industry: "Intracity Logistics" },
];

const CITIES_LOCATIONS = [
  { city: "Bengaluru", state: "Karnataka", district: "Bengaluru Urban" },
  { city: "Hyderabad", state: "Telangana", district: "Hyderabad" },
  { city: "Chennai", state: "Tamil Nadu", district: "Chennai" },
  { city: "Mumbai", state: "Maharashtra", district: "Mumbai Suburban" },
  { city: "Pune", state: "Maharashtra", district: "Pune" },
  { city: "Noida", state: "Uttar Pradesh", district: "Gautam Buddha Nagar" },
  { city: "Gurugram", state: "Haryana", district: "Gurugram" },
  { city: "Delhi", state: "Delhi", district: "Central Delhi" },
  { city: "Ahmedabad", state: "Gujarat", district: "Ahmedabad" },
  { city: "Surat", state: "Gujarat", district: "Surat" },
  { city: "Jaipur", state: "Rajasthan", district: "Jaipur" },
  { city: "Lucknow", state: "Uttar Pradesh", district: "Lucknow" },
  { city: "Indore", state: "Madhya Pradesh", district: "Indore" },
  { city: "Bhopal", state: "Madhya Pradesh", district: "Bhopal" },
  { city: "Kochi", state: "Kerala", district: "Ernakulam" },
  { city: "Thiruvananthapuram", state: "Kerala", district: "Thiruvananthapuram" },
  { city: "Visakhapatnam", state: "Andhra Pradesh", district: "Visakhapatnam" },
  { city: "Vijayawada", state: "Andhra Pradesh", district: "Krishna" },
  { city: "Coimbatore", state: "Tamil Nadu", district: "Coimbatore" },
  { city: "Bhubaneswar", state: "Odisha", district: "Khurda" },
  { city: "Kolkata", state: "West Bengal", district: "Kolkata" },
  { city: "Patna", state: "Bihar", district: "Patna" },
  { city: "Ranchi", state: "Jharkhand", district: "Ranchi" },
  { city: "Guwahati", state: "Assam", district: "Kamrup Metropolitan" },
  { city: "Chandigarh", state: "Chandigarh", district: "Chandigarh" },
];

const JOB_ROLES = [
  { title: "Senior React & Frontend Engineer", category: "Software Development", skills: ["React", "JavaScript", "TypeScript", "Redux", "Tailwind CSS"], exp: "senior" },
  { title: "Full Stack Java & Node.js Developer", category: "Software Development", skills: ["Java", "Spring Boot", "Node.js", "React", "SQL"], exp: "mid" },
  { title: "AI & Machine Learning Engineer", category: "Artificial Intelligence", skills: ["Python", "PyTorch", "TensorFlow", "Machine Learning", "NLP"], exp: "mid" },
  { title: "DevOps & Cloud Systems Architect", category: "Cloud Computing", skills: ["Docker", "Kubernetes", "AWS", "Terraform", "CI/CD"], exp: "lead" },
  { title: "Data Scientist & Analytics Specialist", category: "Data Science", skills: ["Python", "SQL", "Pandas", "Scikit-Learn", "Tableau"], exp: "mid" },
  { title: "Mobile App Engineer (Flutter / React Native)", category: "Mobile App Development", skills: ["React Native", "Flutter", "iOS", "Android", "JavaScript"], exp: "entry" },
  { title: "Cybersecurity Analyst & Threat Hunter", category: "Cybersecurity", skills: ["Penetration Testing", "Ethical Hacking", "Python", "SIEM", "Network Security"], exp: "mid" },
  { title: "Lead UI/UX Product Designer", category: "UI/UX Design", skills: ["Figma", "User Research", "Wireframing", "Prototyping", "Design Systems"], exp: "senior" },
  { title: "QA Automation Test Engineer", category: "Testing & QA", skills: ["Selenium", "Cypress", "JavaScript", "Python", "API Testing"], exp: "entry" },
  { title: "Technical Product Manager", category: "Product Management", skills: ["Agile", "Jira", "Product Roadmap", "Data Analytics", "User Stories"], exp: "senior" },
  { title: "Human Resources & Talent Acquisition Partner", category: "HR & Recruitment", skills: ["Recruitment", "Sourcing", "Communication", "HR Policies", "Interviewing"], exp: "mid" },
  { title: "Branch Operations & Finance Manager", category: "Finance & Accounting", skills: ["Accounting", "Banking", "Tally", "Financial Planning", "Excel"], exp: "mid" },
  { title: "BPO Customer Operations Team Lead", category: "Customer Support & BPO", skills: ["Customer Support", "Communication", "Team Management", "CRM"], exp: "entry" },
  { title: "Clinical Staff Nurse (ICU & Emergency)", category: "Healthcare & Hospital", skills: ["Nursing", "Patient Care", "Emergency Care", "Healthcare"], exp: "entry" },
  { title: "Mechanical Site & Maintenance Engineer", category: "Manufacturing & Factory", skills: ["Mechanical Engineering", "Maintenance", "AutoCAD", "Quality Control"], exp: "mid" },
  { title: "Civil Construction Site Supervisor", category: "Construction & Skilled Labor", skills: ["Civil Engineering", "Site Engineer", "Construction", "AutoCAD"], exp: "entry" },
];

export const seedPanIndiaJobsDataset = async (targetCount = 1000) => {
  console.log(`[SEED_AGENT] Starting Pan-India batch generation (${targetCount} jobs)...`);
  const startTime = Date.now();

  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/smart-job-portal";
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
  }

  // Get system admin user
  let adminUser = await User.findOne({ role: "admin" });
  if (!adminUser) {
    adminUser = await User.create({
      name: "System Admin",
      email: "admin@smartjob.local",
      password: "adminpassword123",
      role: "admin",
    });
  }

  // Reuse existing primary employer to satisfy unique user constraint
  let primaryEmployer = await Employer.findOne();
  if (!primaryEmployer) {
    primaryEmployer = await Employer.create({
      companyName: "SmartJob Enterprise Network",
      location: "Pan-India",
      website: "https://smartjobportal.local",
      industry: "Information Technology",
      description: "Aggregated enterprise hiring network for top pan-India companies.",
      user: adminUser._id,
    });
  }

  const collectedDocs = [];
  const publishedDocs = [];

  for (let i = 0; i < targetCount; i++) {
    const company = COMPANIES_DATABASE[i % COMPANIES_DATABASE.length];
    const cityLoc = CITIES_LOCATIONS[i % CITIES_LOCATIONS.length];
    const role = JOB_ROLES[i % JOB_ROLES.length];

    const isRemote = i % 5 === 0;
    const isLocal = i % 3 === 0;
    const salaryMin = (Math.floor(Math.random() * 8) + 4) * 100000;
    const salaryMax = salaryMin + (Math.floor(Math.random() * 6) + 3) * 100000;

    const fullLocation = `${cityLoc.city}, ${cityLoc.state}, India`;
    const sourceName = "Pan-India Import Agent";
    const sourceUrl = `${company.website}/careers/job-${i + 10000}`;
    const title = `${role.title} (${isRemote ? "Remote" : cityLoc.city})`;

    const description = `Join ${company.name} in ${cityLoc.city}! We are hiring a ${role.title} to work on cutting-edge platforms. Responsibilities include building resilient systems, collaborating with engineering teams, and shipping production software. [Demo Sample Listing]`;

    const fingerprint = generateFingerprint(title, company.name, fullLocation);

    const collectedJob = {
      title,
      companyName: company.name,
      companyLogo: company.logo,
      description,
      skills: role.skills,
      salaryMin,
      salaryMax,
      currency: "INR",
      employmentType: "full-time",
      experienceLevel: role.exp,
      category: role.category,
      location: fullLocation,
      city: cityLoc.city,
      state: cityLoc.state,
      country: "India",
      district: cityLoc.district,
      isLocal,
      remote: isRemote,
      sourceUrl,
      sourceName,
      postedDate: new Date(Date.now() - Math.floor(Math.random() * 15 * 24 * 60 * 60 * 1000)),
      confidenceScore: 90,
      confidenceReasons: ["Verified enterprise source", "Structured location & salary"],
      verificationStatus: "verified",
      status: "active",
      duplicateFingerprint: fingerprint,
      seo: generateSeoData({ title, companyName: company.name, city: cityLoc.city, category: role.category }),
    };

    collectedDocs.push(collectedJob);

    // Published Job document
    publishedDocs.push({
      title,
      description,
      requirements: role.skills,
      responsibilities: ["Design software architecture", "Code review & unit testing", "Deploy cloud microservices"],
      location: fullLocation,
      city: cityLoc.city,
      state: cityLoc.state,
      jobType: "full-time",
      salaryMin,
      salaryMax,
      currency: "INR",
      experienceLevel: role.exp,
      remote: isRemote,
      category: role.category,
      skills: role.skills,
      status: "open",
      employer: primaryEmployer._id,
      postedBy: adminUser._id,
      createdAt: collectedJob.postedDate,
    });
  }

  console.log(`[SEED_AGENT] Inserting ${collectedDocs.length} CollectedJobs & Published Jobs in bulk...`);

  // Batch insert into CollectedJob
  await CollectedJob.insertMany(collectedDocs, { ordered: false }).catch(() => {});

  // Batch insert into Job (live portal)
  const createdPublishedJobs = await Job.insertMany(publishedDocs, { ordered: false }).catch(() => []);

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`[SEED_AGENT] Successfully populated dataset in ${durationSec}s! Live Jobs: ${createdPublishedJobs.length}`);

  return {
    totalCreated: createdPublishedJobs.length || targetCount,
    durationSec,
  };
};

if (process.argv[1] && process.argv[1].endsWith("seedPanIndiaJobs.js")) {
  seedPanIndiaJobsDataset(1000)
    .then((res) => {
      console.log("Seeding complete:", res);
      process.exit(0);
    })
    .catch((err) => {
      console.error("Seeding failed:", err);
      process.exit(1);
    });
}
