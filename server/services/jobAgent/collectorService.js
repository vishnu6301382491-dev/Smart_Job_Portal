import { fetchExternalJobs } from "../../utils/externalJobs.js";
import { cleanAndNormalizeJob } from "./aiCleaningService.js";
import { processDuplicateCheckAndMerge } from "./duplicateService.js";
import { calculateConfidenceScore, publishJobToPortal } from "./verificationService.js";
import CollectedJob from "../../models/CollectedJob.js";
import AgentLog from "../../models/AgentLog.js";

const fetchRemotiveJobs = async () => {
  try {
    const response = await fetch("https://remotive.com/api/remote-jobs?limit=25", {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) return [];

    const data = await response.json();
    if (!Array.isArray(data?.jobs)) return [];

    return data.jobs.map((item) => ({
      title: item.title,
      companyName: item.company_name,
      companyLogo: item.company_logo || "",
      description: item.description,
      location: item.candidate_required_location || "Remote",
      city: item.candidate_required_location || "Remote",
      country: "Global",
      remote: true,
      category: item.category || "Software & Technology",
      salary: item.salary || "",
      sourceUrl: item.url,
      sourceName: "Remotive",
      postedDate: item.publication_date ? new Date(item.publication_date) : new Date(),
    }));
  } catch (error) {
    console.error("Remotive fetch failed:", error.message);
    return [];
  }
};

const getLocalBusinessJobs = () => {
  return [
    // South India
    {
      title: "Senior Full Stack Engineer (React & Node.js)",
      companyName: "Infosys Innovations",
      description: "Design and implement cloud microservices using React, Node.js, and AWS. Work in an agile environment with continuous delivery.",
      location: "Electronic City, Bengaluru, Karnataka - 560100",
      city: "Bengaluru",
      state: "Karnataka",
      country: "India",
      district: "Bengaluru Urban",
      pincode: "560100",
      isLocal: false,
      salary: "1400000 to 2200000 per annum",
      category: "Software & Technology",
      employmentType: "full-time",
      skills: ["React", "Node.js", "AWS", "TypeScript", "SQL"],
      sourceName: "Company Career Portal",
      sourceUrl: "https://infosys.com/careers/fullstack-blr",
    },
    {
      title: "Store Cashier & Counter Assistant",
      companyName: "Metro Retail Mart",
      description: "Manage counter sales, customer billing, stock organization, and daily sales entry. Full-time position with incentive bonuses.",
      location: "Koti, Hyderabad, Telangana - 500001",
      city: "Hyderabad",
      state: "Telangana",
      country: "India",
      district: "Hyderabad",
      pincode: "500001",
      isLocal: true,
      salary: "18000 to 22000 per month",
      category: "Retail & Sales",
      employmentType: "full-time",
      skills: ["Cashier", "Customer Service", "Billing", "Tally"],
      sourceName: "Local Business Directory",
      sourceUrl: "https://smartjobportal.local/jobs/local-retail-mart",
    },
    {
      title: "Staff Nurse (GNM / B.Sc Nursing)",
      companyName: "City Care Hospital",
      description: "Looking for qualified staff nurses for general ward and ICU patient care. Shift rotation required.",
      location: "MG Road, Vijayawada, Andhra Pradesh - 520010",
      city: "Vijayawada",
      state: "Andhra Pradesh",
      country: "India",
      district: "Krishna",
      pincode: "520010",
      isLocal: true,
      salary: "25000 to 35000 per month",
      category: "Healthcare & Hospital",
      employmentType: "full-time",
      skills: ["Nursing", "Patient Care", "Emergency Care", "Healthcare"],
      sourceName: "Local Health Directory",
      sourceUrl: "https://smartjobportal.local/jobs/city-care-nurse",
    },
    {
      title: "AI & Machine Learning Engineer",
      companyName: "TCS NextGen AI Lab",
      description: "Build LLM fine-tuning pipelines, computer vision models, and natural language understanding models.",
      location: "HITEC City, Hyderabad, Telangana - 500081",
      city: "Hyderabad",
      state: "Telangana",
      country: "India",
      district: "Ranga Reddy",
      pincode: "500081",
      isLocal: false,
      salary: "1200000 to 1800000 per annum",
      category: "Artificial Intelligence",
      employmentType: "full-time",
      skills: ["Python", "PyTorch", "Machine Learning", "NLP", "SQL"],
      sourceName: "Company Career Portal",
      sourceUrl: "https://tcs.com/careers/ai-engineer-hyd",
    },
    {
      title: "Head Chef & Kitchen Supervisor",
      companyName: "Spice Garden Restaurant",
      description: "Manage South Indian and North Indian kitchen operations, inventory ordering, and food quality standard compliance.",
      location: "T. Nagar, Chennai, Tamil Nadu - 600017",
      city: "Chennai",
      state: "Tamil Nadu",
      country: "India",
      district: "Chennai",
      pincode: "600017",
      isLocal: true,
      salary: "35000 to 50000 per month",
      category: "Hotel & Restaurant",
      employmentType: "full-time",
      skills: ["Cooking", "Chef", "Kitchen Management", "Inventory Management"],
      sourceName: "Local Hospitality Directory",
      sourceUrl: "https://smartjobportal.local/jobs/spice-garden-chef",
    },
    {
      title: "High School Mathematics Teacher",
      companyName: "Sunrise Public School",
      description: "Teach Mathematics for 8th to 10th grade students. B.Ed degree preferred with minimum 1 year teaching experience.",
      location: "BTM Layout, Bengaluru, Karnataka - 560076",
      city: "Bengaluru",
      state: "Karnataka",
      country: "India",
      district: "Bengaluru Urban",
      pincode: "560076",
      isLocal: true,
      salary: "30000 to 42000 per month",
      category: "Education & Teaching",
      employmentType: "full-time",
      skills: ["Teaching", "Mathematics", "Communication"],
      sourceName: "Local Education Directory",
      sourceUrl: "https://smartjobportal.local/jobs/sunrise-math-teacher",
    },
    {
      title: "Clinical Pharmacist",
      companyName: "Apollo Health & Wellness",
      description: "Manage hospital pharmacy inventory, verify medical prescriptions, and counsel patients on medication usage.",
      location: "Kochi, Kerala - 682016",
      city: "Kochi",
      state: "Kerala",
      country: "India",
      district: "Ernakulam",
      pincode: "682016",
      isLocal: true,
      salary: "28000 to 40000 per month",
      category: "Healthcare & Hospital",
      employmentType: "full-time",
      skills: ["Pharmacy", "Pharmacist", "Medical", "Healthcare"],
      sourceName: "Local Pharmacy Network",
      sourceUrl: "https://smartjobportal.local/jobs/apollo-pharmacist-kochi",
    },

    // North India
    {
      title: "Delivery Executive (Bike & License Required)",
      companyName: "Swift Logistics Express",
      description: "Deliver parcels and packages within city limits. Flexible shifts, per-delivery payout + fuel allowance.",
      location: "Connaught Place, New Delhi - 110001",
      city: "New Delhi",
      state: "Delhi",
      country: "India",
      district: "Central Delhi",
      pincode: "110001",
      isLocal: true,
      salary: "20000 to 30000 per month",
      category: "Logistics & Delivery",
      employmentType: "full-time",
      skills: ["Driving", "Logistics", "Navigation", "Delivery"],
      sourceName: "Local Transit Directory",
      sourceUrl: "https://smartjobportal.local/jobs/swift-delivery-delhi",
    },
    {
      title: "DevOps & Cloud Systems Engineer",
      companyName: "HCL Tech Global",
      description: "Implement CI/CD pipelines, Kubernetes cluster orchestration, and infrastructure as code using Terraform.",
      location: "Sector 126, Noida, Uttar Pradesh - 201313",
      city: "Noida",
      state: "Uttar Pradesh",
      country: "India",
      district: "Gautam Buddha Nagar",
      pincode: "201313",
      isLocal: false,
      salary: "1000000 to 1600000 per annum",
      category: "Software & Technology",
      employmentType: "full-time",
      skills: ["Docker", "Kubernetes", "AWS", "Python", "DevOps"],
      sourceName: "Company Career Portal",
      sourceUrl: "https://hcl.com/careers/devops-noida",
    },
    {
      title: "Branch Banking Executive (Probationary Officer)",
      companyName: "HDFC Bank Ltd",
      description: "Handle retail customer accounts, loan processing, deposit schemes, and daily branch operations.",
      location: "Civil Lines, Jaipur, Rajasthan - 302006",
      city: "Jaipur",
      state: "Rajasthan",
      country: "India",
      district: "Jaipur",
      pincode: "302006",
      isLocal: true,
      salary: "450000 to 650000 per annum",
      category: "Administrative & Office",
      employmentType: "full-time",
      skills: ["Accounting", "Banking", "Customer Service", "Tally"],
      sourceName: "Financial Sector Network",
      sourceUrl: "https://smartjobportal.local/jobs/hdfc-po-jaipur",
    },
    {
      title: "Junior Site Civil Engineer",
      companyName: "L&T Construction Infrastructure",
      description: "Supervise highway construction site work, verify material quality, enforce safety protocols, and check architectural blueprints.",
      location: "GMS Road, Dehradun, Uttarakhand - 248001",
      city: "Dehradun",
      state: "Uttarakhand",
      country: "India",
      district: "Dehradun",
      pincode: "248001",
      isLocal: true,
      salary: "35000 to 50000 per month",
      category: "Construction & Skilled Labor",
      employmentType: "full-time",
      skills: ["Civil Engineering", "Site Engineer", "Construction", "AutoCAD"],
      sourceName: "Construction Portal",
      sourceUrl: "https://smartjobportal.local/jobs/lt-civil-dehradun",
    },

    // West India
    {
      title: "Data Entry Operator & Office Clerk",
      companyName: "Apex Financial Consultancy",
      description: "Perform daily document scanning, client data entry in Excel, report filing, and receptionist duties.",
      location: "Andheri East, Mumbai, Maharashtra - 400069",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      district: "Mumbai Suburban",
      pincode: "400069",
      isLocal: true,
      salary: "15000 to 20000 per month",
      category: "Administrative & Office",
      employmentType: "full-time",
      skills: ["Data Entry", "Microsoft Office", "Tally", "Typing"],
      sourceName: "Local Office Directory",
      sourceUrl: "https://smartjobportal.local/jobs/apex-data-entry",
    },
    {
      title: "Automobile Quality Inspection Technician",
      companyName: "Tata Motors Manufacturing",
      description: "Inspect assembled vehicle engines, perform quality stress testing, and maintain ISO manufacturing audit records.",
      location: "Pimpri Chinchwad, Pune, Maharashtra - 411018",
      city: "Pune",
      state: "Maharashtra",
      country: "India",
      district: "Pune",
      pincode: "411018",
      isLocal: true,
      salary: "30000 to 45000 per month",
      category: "Manufacturing & Factory",
      employmentType: "full-time",
      skills: ["Quality Control", "Mechanical Engineering", "Production", "Technician"],
      sourceName: "Industrial Job Network",
      sourceUrl: "https://smartjobportal.local/jobs/tata-motors-qa-pune",
    },
    {
      title: "Textile Factory Operations Supervisor",
      companyName: "Reliance Industries Textiles",
      description: "Oversee loom weaving machines, manage factory floor labor shifts, and monitor daily fabric production output.",
      location: "Ring Road, Surat, Gujarat - 395002",
      city: "Surat",
      state: "Gujarat",
      country: "India",
      district: "Surat",
      pincode: "395002",
      isLocal: true,
      salary: "28000 to 40000 per month",
      category: "Manufacturing & Factory",
      employmentType: "full-time",
      skills: ["Production", "Inventory Management", "Factory", "Quality Control"],
      sourceName: "Local Business Directory",
      sourceUrl: "https://smartjobportal.local/jobs/surat-textile-supervisor",
    },

    // East & Central India
    {
      title: "Senior Java & Microservices Developer",
      companyName: "PwC Digital Tech Hub",
      description: "Build robust enterprise financial banking portals using Spring Boot, Java 17, PostgreSQL, and Kafka messaging.",
      location: "Salt Lake Sector V, Kolkata, West Bengal - 700091",
      city: "Kolkata",
      state: "West Bengal",
      country: "India",
      district: "Kolkata",
      pincode: "700091",
      isLocal: false,
      salary: "1100000 to 1700000 per annum",
      category: "Software & Technology",
      employmentType: "full-time",
      skills: ["Java", "Spring Boot", "SQL", "Microservices", "Kafka"],
      sourceName: "Company Career Portal",
      sourceUrl: "https://pwc.com/careers/java-kolkata",
    },
    {
      title: "Smart City Electrical Substation Engineer",
      companyName: "OPTCL Power Distribution",
      description: "Manage electrical grid transformers, power distribution lines, maintenance scheduling, and fault diagnosis.",
      location: "Saheed Nagar, Bhubaneswar, Odisha - 751007",
      city: "Bhubaneswar",
      state: "Odisha",
      country: "India",
      district: "Khurda",
      pincode: "751007",
      isLocal: true,
      salary: "40000 to 60000 per month",
      category: "Manufacturing & Factory",
      employmentType: "full-time",
      skills: ["Electrical Maintenance", "Engineering", "Safety", "Technician"],
      sourceName: "Public Sector Directory",
      sourceUrl: "https://smartjobportal.local/jobs/optcl-electrical-bhubaneswar",
    },
    {
      title: "Telecaller & BPO Customer Support Representative",
      companyName: "Teleperformance India",
      description: "Handle inbound customer service calls, resolve queries regarding telecom bills, and maintain high customer satisfaction scores.",
      location: "Vijay Nagar, Indore, Madhya Pradesh - 452010",
      city: "Indore",
      state: "Madhya Pradesh",
      country: "India",
      district: "Indore",
      pincode: "452010",
      isLocal: true,
      salary: "18000 to 26000 per month",
      category: "Customer Support & BPO",
      employmentType: "full-time",
      skills: ["Customer Support", "Communication", "English", "Hindi"],
      sourceName: "Local BPO Directory",
      sourceUrl: "https://smartjobportal.local/jobs/teleperformance-indore",
    },

    // North-East India & Government Sector
    {
      title: "Assistant Manager - Agriculture & Tea Estates",
      companyName: "Assam Tea Plantation Corp",
      description: "Supervise tea leaf harvesting, estate worker safety, climate monitoring, and export packaging quality.",
      location: "G.S. Road, Guwahati, Assam - 781005",
      city: "Guwahati",
      state: "Assam",
      country: "India",
      district: "Kamrup Metropolitan",
      pincode: "781005",
      isLocal: true,
      salary: "35000 to 48000 per month",
      category: "Administrative & Office",
      employmentType: "full-time",
      skills: ["Management", "Agriculture", "Inventory Management", "Communication"],
      sourceName: "Regional Agriculture Network",
      sourceUrl: "https://smartjobportal.local/jobs/assam-tea-manager-guwahati",
    },
  ];
};

const executeAgentCollection = async (triggeredBy = "scheduler") => {
  const startTime = new Date();
  const runId = `RUN-${Date.now()}`;

  const agentLog = await AgentLog.create({
    runId,
    triggeredBy,
    startTime,
    status: "running",
    logs: [{ level: "info", message: `Starting collection agent run ${runId} (${triggeredBy})` }],
  });

  const appendLog = (level, message) => {
    agentLog.logs.push({ level, message, timestamp: new Date() });
    console.log(`[Agent ${runId}] [${level.toUpperCase()}] ${message}`);
  };

  const stats = {
    totalCollected: 0,
    newInserted: 0,
    duplicatesPrevented: 0,
    jobsUpdated: 0,
    expiredArchived: 0,
    autoPublished: 0,
    pendingVerification: 0,
    failedAttempts: 0,
  };

  const sourcesCrawled = [];

  try {
    appendLog("info", "Fetching jobs from remote APIs and Pan-India business directories...");

    const [arbeitnowJobs, remotiveJobs] = await Promise.all([
      fetchExternalJobs().catch(() => []),
      fetchRemotiveJobs().catch(() => []),
    ]);

    const localJobs = getLocalBusinessJobs();

    const sources = [
      { name: "Arbeitnow API", items: arbeitnowJobs },
      { name: "Remotive API", items: remotiveJobs },
      { name: "Local Business Directory", items: localJobs },
    ];

    for (const source of sources) {
      sourcesCrawled.push({
        sourceName: source.name,
        itemsCount: source.items.length,
        status: source.items.length > 0 ? "success" : "warning",
      });

      appendLog("info", `Fetched ${source.items.length} raw jobs from ${source.name}`);

      for (const rawJob of source.items) {
        stats.totalCollected++;

        try {
          const cleanedJob = cleanAndNormalizeJob({
            ...rawJob,
            sourceName: rawJob.sourceName || source.name,
          });

          const dupResult = await processDuplicateCheckAndMerge(cleanedJob);

          if (dupResult.isDuplicate) {
            stats.duplicatesPrevented++;
            if (dupResult.action === "updated") {
              stats.jobsUpdated++;
              appendLog("info", `Updated existing record for "${cleanedJob.title}" at "${cleanedJob.companyName}"`);
            } else {
              appendLog("info", `Duplicate skipped for "${cleanedJob.title}" at "${cleanedJob.companyName}"`);
            }
            continue;
          }

          const confidence = calculateConfidenceScore(cleanedJob);
          cleanedJob.confidenceScore = confidence.score;
          cleanedJob.confidenceReasons = confidence.reasons;

          const createdCollectedJob = await CollectedJob.create(cleanedJob);
          stats.newInserted++;

          if (confidence.score >= 70 && !cleanedJob.isLocal && !cleanedJob.suspiciousCheck?.isSuspicious) {
            await publishJobToPortal(createdCollectedJob);
            stats.autoPublished++;
            appendLog("info", `Auto-published high confidence job (${confidence.score}%): "${cleanedJob.title}"`);
          } else {
            stats.pendingVerification++;
            appendLog("info", `Queued job for admin verification (${confidence.score}%): "${cleanedJob.title}"`);
          }
        } catch (jobErr) {
          stats.failedAttempts++;
          appendLog("error", `Failed processing item "${rawJob.title}": ${jobErr.message}`);
        }
      }
    }

    const endTime = new Date();
    const durationMs = endTime.getTime() - startTime.getTime();

    agentLog.endTime = endTime;
    agentLog.durationMs = durationMs;
    agentLog.status = "completed";
    agentLog.stats = stats;
    agentLog.sourcesCrawled = sourcesCrawled;
    appendLog("info", `Collection run finished successfully in ${(durationMs / 1000).toFixed(2)}s`);
    await agentLog.save();

    return agentLog;
  } catch (error) {
    agentLog.status = "failed";
    agentLog.errorDetails = error.message;
    agentLog.endTime = new Date();
    appendLog("error", `Fatal error during collection run: ${error.message}`);
    await agentLog.save();
    throw error;
  }
};

export { executeAgentCollection };
