const INDIAN_STATES_AND_UTS = {
  // North India
  "Delhi": { region: "North India", cities: ["Delhi", "New Delhi", "Noida", "Greater Noida", "Gurugram", "Gurgaon", "Faridabad", "Ghaziabad"] },
  "Haryana": { region: "North India", cities: ["Gurugram", "Gurgaon", "Faridabad", "Panipat", "Ambala", "Karnal", "Hisar", "Rohtak", "Panchkula"] },
  "Punjab": { region: "North India", cities: ["Chandigarh", "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali"] },
  "Himachal Pradesh": { region: "North India", cities: ["Shimla", "Dharamshala", "Manali", "Solan", "Mandi", "Hamirpur", "Kullu"] },
  "Jammu & Kashmir": { region: "North India", cities: ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Udhampur"] },
  "Ladakh": { region: "North India", cities: ["Leh", "Kargil"] },
  "Uttarakhand": { region: "North India", cities: ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rishikesh", "Nainital"] },
  "Uttar Pradesh": { region: "North India", cities: ["Noida", "Greater Noida", "Ghaziabad", "Lucknow", "Kanpur", "Agra", "Varanasi", "Prayagraj", "Meerut", "Bareilly", "Aligarh", "Gorakhpur"] },
  "Chandigarh": { region: "North India", cities: ["Chandigarh"] },

  // South India
  "Andhra Pradesh": { region: "South India", cities: ["Visakhapatnam", "Vizag", "Vijayawada", "Guntur", "Tirupati", "Nellore", "Kakinada", "Rajahmundry", "Kurnool", "Anantapur", "Kadapa", "Eluru", "Ongole"] },
  "Telangana": { region: "South India", cities: ["Hyderabad", "Secunderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar", "Mahbubnagar", "Ramagundam"] },
  "Karnataka": { region: "South India", cities: ["Bengaluru", "Bangalore", "Mysuru", "Mysore", "Mangaluru", "Mangalore", "Hubballi", "Dharwad", "Belagavi", "Kalaburagi", "Shivamogga", "Ballari", "Tumakuru"] },
  "Tamil Nadu": { region: "South India", cities: ["Chennai", "Madras", "Coimbatore", "Madurai", "Tiruchirappalli", "Trichy", "Salem", "Tirunelveli", "Erode", "Vellore", "Thanjavur", "Tuticorin"] },
  "Kerala": { region: "South India", cities: ["Kochi", "Cochin", "Thiruvananthapuram", "Trivandrum", "Kozhikode", "Calicut", "Thrissur", "Kollam", "Kannur", "Kottayam", "Palakkad", "Alappuzha"] },
  "Puducherry": { region: "South India", cities: ["Puducherry", "Pondicherry", "Karaikal", "Mahe", "Yanam"] },

  // West India
  "Maharashtra": { region: "West India", cities: ["Mumbai", "Bombay", "Pune", "Nagpur", "Nashik", "Thane", "Navi Mumbai", "Aurangabad", "Chhatrapati Sambhajinagar", "Solapur", "Kolhapur", "Amravati", "Nanded"] },
  "Gujarat": { region: "West India", cities: ["Ahmedabad", "Surat", "Vadodara", "Baroda", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Junagadh", "Anand"] },
  "Goa": { region: "West India", cities: ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"] },
  "Rajasthan": { region: "West India", cities: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner", "Bhilwara", "Alwar", "Sikar"] },
  "Dadra & Nagar Haveli and Daman & Diu": { region: "West India", cities: ["Daman", "Diu", "Silvassa"] },

  // East India
  "West Bengal": { region: "East India", cities: ["Kolkata", "Calcutta", "Howrah", "Durgapur", "Asansol", "Siliguri", "Kharagpur", "Bardhaman", "Haldia"] },
  "Odisha": { region: "East India", cities: ["Bhubaneswar", "Cuttack", "Rourkela", "Sambalpur", "Puri", "Berhampur", "Balasore"] },
  "Bihar": { region: "East India", cities: ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Bihar Sharif", "Arrah"] },
  "Jharkhand": { region: "East India", cities: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh", "Deoghar"] },

  // Central India
  "Madhya Pradesh": { region: "Central India", cities: ["Indore", "Bhopal", "Gwalior", "Jabalpur", "Ujjain", "Sagar", "Rewa", "Satna"] },
  "Chhattisgarh": { region: "Central India", cities: ["Raipur", "Bhilai", "Bilaspur", "Korba", "Rajnandgaon", "Jagdalpur"] },

  // North-East India
  "Assam": { region: "North-East India", cities: ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur"] },
  "Arunachal Pradesh": { region: "North-East India", cities: ["Itanagar", "Naharlagun", "Pasighat", "Tawang"] },
  "Meghalaya": { region: "North-East India", cities: ["Shillong", "Tura", "Jowai"] },
  "Manipur": { region: "North-East India", cities: ["Imphal", "Churachandpur", "Thoubal"] },
  "Mizoram": { region: "North-East India", cities: ["Aizawl", "Lunglei", "Champhai"] },
  "Nagaland": { region: "North-East India", cities: ["Kohima", "Dimapur", "Mokokchung"] },
  "Tripura": { region: "North-East India", cities: ["Agartala", "Udaipur", "Dharmanagar"] },
  "Sikkim": { region: "North-East India", cities: ["Gangtok", "Namchi", "Geyzing"] },

  // Islands
  "Andaman & Nicobar Islands": { region: "Union Territory", cities: ["Port Blair"] },
  "Lakshadweep": { region: "Union Territory", cities: ["Kavaratti"] },
};

const NEARBY_CITY_CLUSTERS = {
  hyderabad: ["hyderabad", "secunderabad", "gachibowli", "hitech city", "kondapur", "kukatpally", "madhapur", "telangana"],
  secunderabad: ["secunderabad", "hyderabad", "gachibowli", "hitech city", "kondapur", "kukatpally", "madhapur", "telangana"],
  bengaluru: ["bengaluru", "bangalore", "electronic city", "whitefield", "koramangala", "indiranagar", "btm layout", "marathahalli", "karnataka"],
  bangalore: ["bangalore", "bengaluru", "electronic city", "whitefield", "koramangala", "indiranagar", "btm layout", "marathahalli", "karnataka"],
  delhi: ["delhi", "new delhi", "noida", "greater noida", "gurugram", "gurgaon", "faridabad", "ghaziabad", "ncr"],
  "new delhi": ["new delhi", "delhi", "noida", "gurugram", "gurgaon", "faridabad", "ghaziabad", "ncr"],
  noida: ["noida", "greater noida", "delhi", "new delhi", "ghaziabad", "gurugram", "uttar pradesh", "ncr"],
  gurugram: ["gurugram", "gurgaon", "delhi", "new delhi", "noida", "faridabad", "haryana", "ncr"],
  gurgaon: ["gurgaon", "gurugram", "delhi", "new delhi", "noida", "faridabad", "haryana", "ncr"],
  mumbai: ["mumbai", "bombay", "navi mumbai", "thane", "andheri", "bkc", "powai", "maharashtra"],
  bombay: ["bombay", "mumbai", "navi mumbai", "thane", "andheri", "bkc", "powai", "maharashtra"],
  pune: ["pune", "poona", "hinjewadi", "kharadi", "baner", "vimannagar", "wakad", "pimpri", "chinchwad", "maharashtra"],
  chennai: ["chennai", "madras", "omr", "velachery", "t.nagar", "porur", "guindy", "tamil nadu"],
  kolkata: ["kolkata", "calcutta", "salt lake", "new town", "howrah", "west bengal"],
  ahmedabad: ["ahmedabad", "gandhinagar", "sg highway", "gujarat"],
  jaipur: ["jaipur", "malviya nagar", "vaishali nagar", "rajasthan"],
  lucknow: ["lucknow", "gomti nagar", "hazratganj", "uttar pradesh"],
  indore: ["indore", "vijay nagar", "madhya pradesh"],
  bhopal: ["bhopal", "mp nagar", "madhya pradesh"],
  vijayawada: ["vijayawada", "guntur", "amaravati", "andhra pradesh"],
  visakhapatnam: ["visakhapatnam", "vizag", "gajuwaka", "andhra pradesh"],
  kochi: ["kochi", "cochin", "kakkanad", "infopark", "kerala"],
  thiruvananthapuram: ["thiruvananthapuram", "trivandrum", "technopark", "kerala"],
};

const LOCATION_ALIASES = {
  bangalore: ["bangalore", "bengaluru", "karnataka", "blr"],
  bengaluru: ["bengaluru", "bangalore", "karnataka", "blr"],
  gurgaon: ["gurgaon", "gurugram", "haryana", "ncr"],
  gurugram: ["gurugram", "gurgaon", "haryana", "ncr"],
  mumbai: ["mumbai", "bombay", "maharashtra"],
  bombay: ["bombay", "mumbai", "maharashtra"],
  chennai: ["chennai", "madras", "tamil nadu", "tn"],
  madras: ["madras", "chennai", "tamil nadu", "tn"],
  kolkata: ["kolkata", "calcutta", "west bengal", "wb"],
  calcutta: ["calcutta", "kolkata", "west bengal", "wb"],
  hyderabad: ["hyderabad", "secunderabad", "telangana", "hyd"],
  secunderabad: ["secunderabad", "hyderabad", "telangana", "hyd"],
  pune: ["pune", "poona", "maharashtra"],
  poona: ["poona", "pune", "maharashtra"],
  delhi: ["delhi", "new delhi", "ncr"],
  "new delhi": ["new delhi", "delhi", "ncr"],
  ncr: ["ncr", "delhi", "new delhi", "gurgaon", "gurugram", "noida", "ghaziabad", "faridabad"],
  noida: ["noida", "greater noida", "uttar pradesh", "ncr"],
  kochi: ["kochi", "cochin", "kerala"],
  cochin: ["cochin", "kochi", "kerala"],
  thiruvananthapuram: ["thiruvananthapuram", "trivandrum", "kerala"],
  trivandrum: ["trivandrum", "thiruvananthapuram", "kerala"],
  visakhapatnam: ["visakhapatnam", "vizag", "andhra pradesh", "ap"],
  vizag: ["vizag", "visakhapatnam", "andhra pradesh", "ap"],
  vijayawada: ["vijayawada", "andhra pradesh", "ap"],
  puducherry: ["puducherry", "pondicherry"],
  pondicherry: ["pondicherry", "puducherry"],
  ahmedabad: ["ahmedabad", "gujarat"],
  jaipur: ["jaipur", "rajasthan"],
  lucknow: ["lucknow", "uttar pradesh"],
  indore: ["indore", "madhya pradesh"],
  bhopal: ["bhopal", "madhya pradesh"],
  bhubaneswar: ["bhubaneswar", "odisha"],
  patna: ["patna", "bihar"],
  ranchi: ["ranchi", "jharkhand"],
  guwahati: ["guwahati", "assam"],
  chandigarh: ["chandigarh", "punjab", "haryana"],
};

const escapeRegex = (str = "") => String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const inferStateAndRegionFromCity = (cityOrLoc = "") => {
  const norm = String(cityOrLoc).toLowerCase().trim();
  if (!norm) return { state: "", region: "" };

  for (const [state, info] of Object.entries(INDIAN_STATES_AND_UTS)) {
    if (state.toLowerCase() === norm) {
      return { state, region: info.region };
    }
    for (const city of info.cities) {
      if (norm.includes(city.toLowerCase()) || city.toLowerCase().includes(norm)) {
        return { state, region: info.region };
      }
    }
  }

  return { state: "", region: "" };
};

const getLocationVariants = (rawLocation = "") => {
  const norm = String(rawLocation).toLowerCase().trim();
  if (!norm) return [];

  const variants = new Set([norm]);

  // Check cluster entries first
  for (const [key, clusterList] of Object.entries(NEARBY_CITY_CLUSTERS)) {
    if (norm.includes(key) || key.includes(norm)) {
      for (const item of clusterList) {
        variants.add(item);
      }
    }
  }

  // Check alias list
  for (const [key, aliasList] of Object.entries(LOCATION_ALIASES)) {
    if (norm.includes(key) || key.includes(norm)) {
      for (const alias of aliasList) {
        variants.add(alias);
      }
    }
  }

  return Array.from(variants);
};

const buildLocationQueryFilter = (locationInput = "", stateInput = "") => {
  if (!locationInput && !stateInput) return null;

  const conditions = [];

  if (stateInput) {
    conditions.push({ state: { $regex: escapeRegex(stateInput), $options: "i" } });
  }

  if (locationInput) {
    const variants = getLocationVariants(locationInput);
    const locConditions = variants.flatMap((v) => [
      { location: { $regex: escapeRegex(v), $options: "i" } },
      { city: { $regex: escapeRegex(v), $options: "i" } },
      { state: { $regex: escapeRegex(v), $options: "i" } },
      { pincode: { $regex: escapeRegex(v), $options: "i" } },
    ]);
    conditions.push({ $or: locConditions });
  }

  if (conditions.length === 1) return conditions[0];
  return { $and: conditions };
};

const matchesLocationQuery = (jobLocationStr = "", queryStr = "") => {
  if (!queryStr) return true;
  const variants = getLocationVariants(queryStr);
  const haystack = String(jobLocationStr).toLowerCase();

  return variants.some((variant) => haystack.includes(variant));
};

export {
  INDIAN_STATES_AND_UTS,
  NEARBY_CITY_CLUSTERS,
  LOCATION_ALIASES,
  inferStateAndRegionFromCity,
  getLocationVariants,
  buildLocationQueryFilter,
  matchesLocationQuery,
  escapeRegex,
};
