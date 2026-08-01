const generateSlug = (title, companyName, city = "") => {
  const raw = `${title} ${companyName} ${city}`
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return raw || `job-${Date.now()}`;
};

const generateSeoData = (job) => {
  const title = job.title || "Job Opening";
  const company = job.companyName || "Company";
  const location = job.city ? `${job.city}, ${job.country || "India"}` : job.location || "Remote";
  const slug = generateSlug(title, company, job.city);

  const metaTitle = `${title} at ${company} - ${location} | Smart Job Portal`;
  const metaDescription = `Apply for ${title} vacancy at ${company} in ${location}. ${
    job.description ? job.description.slice(0, 140) : "Find your next career opportunity."
  }...`;

  const keywords = Array.from(
    new Set([
      title.toLowerCase(),
      company.toLowerCase(),
      job.category ? job.category.toLowerCase() : "jobs",
      job.city ? job.city.toLowerCase() : "remote",
      ...(job.skills || []).map((s) => s.toLowerCase()),
      "hiring",
      "vacancy",
      "careers",
    ])
  ).filter(Boolean);

  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title,
    description: job.description || title,
    identifier: {
      "@type": "PropertyValue",
      name: company,
      value: job.duplicateFingerprint || slug,
    },
    datePosted: (job.postedDate || new Date()).toISOString(),
    validThrough: job.deadline ? new Date(job.deadline).toISOString() : undefined,
    employmentType: (job.employmentType || "FULL_TIME").toUpperCase().replace("-", "_"),
    hiringOrganization: {
      "@type": "Organization",
      name: company,
      logo: job.companyLogo || undefined,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.city || location,
        addressRegion: job.state || "",
        addressCountry: job.country || "IN",
        postalCode: job.pincode || undefined,
      },
    },
    baseSalary:
      job.salaryMin || job.salaryMax
        ? {
            "@type": "MonetaryAmount",
            currency: job.currency || "INR",
            value: {
              "@type": "QuantitativeValue",
              minValue: job.salaryMin || 0,
              maxValue: job.salaryMax || job.salaryMin || 0,
              unitText: "YEAR",
            },
          }
        : undefined,
  };

  return {
    slug,
    metaTitle,
    metaDescription,
    keywords,
    structuredData,
  };
};

export { generateSeoData, generateSlug };
