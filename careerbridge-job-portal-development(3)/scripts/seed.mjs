/**
 * CareerBridge demo data seeder.
 * Usage:  node scripts/seed.mjs   (needs DATABASE_URL or the local default)
 *
 * IMPORTANT: everything inserted here is demonstration data. Company names are
 * invented for a university project; no vacancy is a real job offer.
 */
import pg from "pg";
import bcrypt from "bcryptjs";

const DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/app_db";

const daysAgo = (n) => new Date(Date.now() - n * 86_400_000);
const inDays = (n) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);
const quote = (c) => `"${c}"`;

async function insert(client, table, rows, casts = {}) {
  if (!rows.length) return 0;
  const cols = [...new Set(rows.flatMap((r) => Object.keys(r)))];
  const params = [];
  const tuples = rows.map((r) => {
    const parts = cols.map((c) => {
      const raw = c in r ? r[c] : null;
      params.push(casts[c] === "jsonb" && raw !== null ? JSON.stringify(raw) : raw);
      return casts[c] ? `$${params.length}::${casts[c]}` : `$${params.length}`;
    });
    return `(${parts.join(", ")})`;
  });
  const res = await client.query(
    `insert into ${table} (${cols.map(quote).join(", ")}) values ${tuples.join(", ")}`,
    params,
  );
  return res.rowCount ?? 0;
}

const categories = [
  { slug: "retail-shop", name: "Retail & Shop Assistant", icon: "Store", group: "local", description: "Sales counter, stocking, billing and customer help in shops and boutiques." },
  { slug: "cafe-restaurant", name: "Café & Restaurant", icon: "Coffee", group: "local", description: "Barista, service, kitchen helper and cleaning shifts." },
  { slug: "coaching", name: "Coaching & Tutoring", icon: "BookOpen", group: "local", description: "Coaching centres, tuition, school assistants and skill trainers." },
  { slug: "supermarket", name: "Supermarket & Grocery", icon: "ShoppingCart", group: "local", description: "Cash counter, shelf stocking, inventory counting and evening packs." },
  { slug: "delivery-logistics", name: "Delivery & Logistics", icon: "Truck", group: "local", description: "Riders, packing, sorting and warehouse support roles." },
  { slug: "admin-office", name: "Admin & Office Support", icon: "Building2", group: "local", description: "Reception, filing, front desk and back-office assistance." },
  { slug: "web-development", name: "Web Development", icon: "Code2", group: "remote", description: "Frontend, WordPress and full stack website work." },
  { slug: "software-engineering", name: "Software Engineering", icon: "Laptop", group: "remote", description: "Backend, QA and product engineering roles." },
  { slug: "design", name: "UI/UX & Graphic Design", icon: "Palette", group: "remote", description: "Product design, branding, social creatives and video editing." },
  { slug: "digital-marketing", name: "Digital Marketing", icon: "Megaphone", group: "remote", description: "SEO, content, social media and campaign roles." },
  { slug: "it-support", name: "IT Support & Networking", icon: "Headset", group: "remote", description: "Helpdesk, hardware, networking and security support." },
  { slug: "data-entry", name: "Data Entry & Back Office", icon: "BookOpen", group: "general", description: "Typing, transcription, record keeping and form processing." },
];

const companies = [
  { key: "brew", name: "Dhaka Brew House", industry: "Café & Bakery", size: "11–50 staff", district: "Dhaka", division: "Dhaka", address: "Shop 12, Road 27, Dhanmondi, Dhaka 1209", about: "A neighbourhood café with two outlets in Dhanmondi and Mohakhali, running morning and evening shifts.", acc: "Both outlets are step-free from the street, with an accessible toilet on the ground floor." },
  { key: "mart", name: "Mirpur Fresh Mart", industry: "Retail supermarket", size: "51–200 staff", district: "Dhaka", division: "Dhaka", address: "Section 10, Mirpur, Dhaka", about: "Family-run supermarket stocking daily groceries for the surrounding residential blocks.", acc: "" },
  { key: "coaching", name: "Score Coaching School", industry: "Education", size: "11–50 staff", district: "Dhaka", division: "Dhaka", address: "Uttara Sector 4, Dhaka", about: "After-school coaching centre for grades 4–10 with weekend batches.", acc: "" },
  { key: "courier", name: "Padma Couriers", industry: "Logistics", size: "201–500 staff", district: "Dhaka", division: "Dhaka", address: "Motijheel Commercial Area, Dhaka", about: "Parcel and food delivery network operating across old Dhaka and Motijheel.", acc: "" },
  { key: "food", name: "Chatkhari Food Court", industry: "Restaurant", size: "51–200 staff", district: "Chattogram", division: "Chattogram", address: "Panchlaish, Chattogram", about: "Late-hours food court with nine kitchens and a weekend-heavy crowd.", acc: "" },
  { key: "boutique", name: "Silver Line Boutique", industry: "Apparel retail", size: "11–50 staff", district: "Dhaka", division: "Dhaka", address: "Gulshan Avenue, Dhaka", about: "Boutique selling ready-made sarees and panjabis with a small tailoring unit.", acc: "" },
  { key: "pharmacy", name: "Green Crescent Pharmacy", industry: "Pharmacy", size: "11–50 staff", district: "Dhaka", division: "Dhaka", address: "Uttara Sector 7, Dhaka", about: "Licensed pharmacy with morning and evening counter shifts.", acc: "" },
  { key: "books", name: "Khulna Book Bazaar", industry: "Retail books", size: "11–50 staff", district: "Khulna", division: "Khulna", address: "Sonadanga, Khulna", about: "Textbook and stationery shop with high weekend footfall.", acc: "" },
  { key: "nexa", name: "Nexa Software Labs", industry: "Software development", size: "51–200 staff", district: "Dhaka", division: "Dhaka", address: "Bashundhara Residential Area, Dhaka", about: "Product studio building web applications for Bangladeshi and overseas clients. Remote friendly since 2021.", acc: "Remote-first team; assistive software is installed on every work machine on request." },
  { key: "arkatech", name: "Arkatech Solutions", industry: "IT services", size: "51–200 staff", district: "Chattogram", division: "Chattogram", address: "Agrabad C/A, Chattogram", about: "Software and support services for ports, textiles and NGO clients.", acc: "Office has a lift and a quiet interview room; extra time is available for any test." },
  { key: "pixel", name: "Pixel & Ink Studio", industry: "Design agency", size: "11–50 staff", district: "Dhaka", division: "Dhaka", address: "Remote-first · Dhaka & Sylhet", about: "Brand and product design studio with a fully distributed team.", acc: "" },
  { key: "marketera", name: "Marketera Digital", industry: "Marketing", size: "11–50 staff", district: "Dhaka", division: "Dhaka", address: "Banani, Dhaka", about: "Performance marketing team for local e-commerce brands.", acc: "" },
  { key: "cloudroute", name: "CloudRoute IT", industry: "Managed IT", size: "11–50 staff", district: "Chattogram", division: "Chattogram", address: "Halishahar, Chattogram", about: "Managed IT support for schools and clinics, with a remote helpdesk.", acc: "The Halishahar office has a lift and a written interview option; helpdesk work can be fully remote with equipment provided." },
  { key: "bandhan", name: "Bandhan Creative Studio", industry: "Media", size: "11–50 staff", district: "Dhaka", division: "Dhaka", address: "Shyamoli, Dhaka", about: "Video and social content production for local brands.", acc: "" },
  { key: "shomokal", name: "Shomokal Transcription", industry: "Language services", size: "51–200 staff", district: "Sylhet", division: "Sylhet", address: "Zindabazar, Sylhet (remote team)", about: "Bangla transcription and captioning service with a fully remote workforce.", acc: "All assessment is written and asynchronous; dictation equipment can be provided." },
  { key: "anondo", name: "Anondo Foods Ltd", industry: "Food processing", size: "201–500 staff", district: "Gazipur", division: "Dhaka", address: "Kaliakair, Gazipur", about: "Packaged foods factory running a supported-employment programme on the packing floor.", acc: "Ramped entrance at the staff gate, accessible toilet on the ground floor, a quiet rest room, and a job coach available on request." },
  { key: "library", name: "Rangpur Community Library Trust", industry: "Non-profit", size: "11–50 staff", district: "Rangpur", division: "Rangpur", address: "Jahaj Road, Rangpur", about: "Public library running reading programmes and a part-time catalogue desk.", acc: "Ramp and lift access, accessible ground-floor toilet, written interview on request." },
  { key: "shapla", name: "Shapla Kindergarten", industry: "Education", size: "11–50 staff", district: "Gazipur", division: "Dhaka", address: "Tongi, Gazipur", about: "Small English-version kindergarten with morning shifts.", acc: "" },
];

const J = [
  { ref: "CB-2026-L001", co: "brew", cat: "cafe-restaurant", title: "Café Barista (Part-time, Evening)", etype: "part-time", exp: "fresher", edu: "hsc", min: 9000, max: 12000, hours: "4–5 hours a day", shift: "5:00 PM – 10:00 PM", dist: "Dhaka", div: "Dhaka", upa: "Dhanmondi",
    skills: ["Customer service", "Hygiene basics", "Cash handling", "Bangla & English reading"], preferred: ["Espresso machine experience", "POS billing"],
    access: ["step-free-access", "flexible-hours"], flex: true, due: 24, ago: 3,
    sum: "Evening barista shifts at a two-outlet Dhanmondi café — suited to students who finish classes by 4 PM.",
    desc: "You will run the counter during the evening rush: taking orders, preparing cold and espresso-based drinks, keeping the bar clean and closing the till.\n\nNew baristas are trained on our machine for the first two weeks, so previous café experience is welcome but not required.",
    resp: "Take counter and takeaway orders\nPrepare coffee, tea, shakes and cold drinks\nWipe down the bar, refill syrups and milk\nClose the till and hand over the daily sales note",
    req: "HSC or currently studying\nAvailable 4–5 hours every evening, including one weekend day\nComfortable standing for a full shift\nBasic English to read recipe cards",
    instr: "Apply through CareerBridge with a short note about which days you can work. We reply within a week and invite shortlisted candidates for a 20-minute trial shift.",
    ben: "Free staff meal during shift · one day off per week · festival bonus after 6 months" },
  { ref: "CB-2026-L002", co: "mart", cat: "supermarket", title: "Shelf Stock & Inventory Assistant", etype: "part-time", exp: "any", edu: "ssc", min: 10000, max: 12000, hours: "About 6 hours a day", shift: "Morning or evening", dist: "Dhaka", div: "Dhaka", upa: "Mirpur",
    skills: ["Stock arrangement", "Basic maths", "Inventory counting"], preferred: ["Google Sheets"], flex: true, due: 18, ago: 6,
    sum: "Morning and evening shelf restocking for a neighbourhood supermarket in Section 10.",
    desc: "Keep shelves full and correctly priced, check expiry dates, and count weekly stock with the store keeper. Rotating shifts are available so you can pick a fixed slot.",
    resp: "Unload supplier cartons and arrange shelves\nUpdate price labels and check expiry dates\nCount stock for the weekly sheet\nHelp customers find items",
    req: "SSC or equivalent\nComfortable lifting 10–15 kg cartons\nPunctual for a fixed shift slot",
    instr: "Mention your preferred shift (morning or evening) in the application note.",
    ben: "Two paid weekly off days · Eid bonus" },
  { ref: "CB-2026-L003", co: "coaching", cat: "coaching", title: "Primary Mathematics Tutor (Grade 4–6)", etype: "part-time", exp: "entry", edu: "bachelor", min: 11000, max: 15000, hours: "3 hrs/day", shift: "After classes, 4–7 PM", dist: "Dhaka", div: "Dhaka", upa: "Uttara",
    skills: ["Mathematics", "Classroom management", "Bangla explanation"], preferred: ["Prior tuition experience"], access: ["flexible-hours"], due: 14, ago: 2,
    sum: "Small-batch maths teaching for primary students at a Uttara coaching centre.",
    desc: "Teach a batch of 12 students in arithmetic, fractions and word problems, correct notebooks and share weekly progress with the academic head.",
    resp: "Deliver three daily classes for grades 4–6\nCorrect notebooks and prepare weekly tests\nAttend one parent meeting per month",
    req: "Ongoing or completed Bachelor's degree\nStrong SSC-level mathematics\nPatient, clear Bangla communication",
    instr: "Shortlisted candidates take a 15-minute subject test and then teach one demo class.",
    ben: "Free coaching for one sibling · transport allowance on evening batches" },
  { ref: "CB-2026-L004", co: "boutique", cat: "retail-shop", title: "Clothing Sales Associate (Weekends)", etype: "part-time", exp: "fresher", edu: "hsc", min: 600, max: 900, period: "day", hours: "Weekends only", shift: "11 AM – 9 PM", dist: "Dhaka", div: "Dhaka", upa: "Gulshan",
    skills: ["Customer handling", "Communication", "Billing"], preferred: ["Folding & display"], due: 20, ago: 8,
    sum: "Saturday–Sunday counter and floor support for a Gulshan boutique.",
    desc: "Greet customers, explain fabric and size, arrange folding displays and support the billing counter during peak hours.",
    resp: "Assist 15–25 customers daily\nMaintain folding and display standards\nSupport the cash counter and packing",
    req: "HSC or ongoing studies\nComfortable standing for long hours\nPolite, confident communication",
    instr: "Pay is Tk 600–900 per day depending on hours worked; salary is settled every second Saturday.",
    ben: "Staff discount on unsold stock" },
  { ref: "CB-2026-L005", co: "courier", cat: "delivery-logistics", title: "Evening Delivery Rider", etype: "part-time", exp: "any", edu: "ssc", min: 800, max: 1200, period: "day", hours: "2–3 hrs/day", shift: "7 PM – 11 PM", dist: "Dhaka", div: "Dhaka", upa: "Motijheel",
    skills: ["Navigation apps", "Time management", "Politeness"], preferred: ["Own bicycle or motorbike", "Local road knowledge"], access: ["flexible-hours"], flex: true, due: 10, ago: 1,
    sum: "Short-radius parcel delivery in Motijheel and surrounding blocks, paid per working day.",
    desc: "Collect parcels from the hub in the evening and deliver within a fixed radius. You choose how many nights per week you ride.",
    resp: "Pick up assigned parcels at the hub\nDeliver and capture digital proof\nReturn undelivered parcels before 11:30 PM",
    req: "Own bicycle or motorbike\nSmartphone with mobile data\nValid driving licence if using a motorbike",
    instr: "State your vehicle type and how many nights per week you can ride.",
    ben: "Weekly payout · rain and night allowance" },
  { ref: "CB-2026-L006", co: "food", cat: "cafe-restaurant", title: "Kitchen Helper (Night Shift)", etype: "shift", exp: "any", edu: "ssc", min: 13000, max: 16000, hours: "Full day", shift: "6 PM – 2 AM", dist: "Chattogram", div: "Chattogram", upa: "Panchlaish",
    skills: ["Kitchen hygiene", "Speed", "Teamwork"], preferred: ["Grease station experience"], due: 16, ago: 5,
    sum: "Night kitchen support at a busy Chattogram food court — chopping, washing and station prep.",
    desc: "Support three kitchens during the evening and night rush with prep, washing and waste separation. Fixed weekly off.",
    resp: "Vegetable prep and washing\nKeep stations stocked during service\nClean and separate waste at close",
    req: "Comfortable with night shifts\nStamina for a seven-hour standing shift\nBasic kitchen hygiene knowledge",
    instr: "Bring one photo ID copy on the trial day.",
    ben: "Night shift allowance · staff dinner" },
  { ref: "CB-2026-L007", co: "pharmacy", cat: "retail-shop", title: "Pharmacy Counter Assistant", etype: "part-time", exp: "entry", edu: "diploma", min: 13000, max: 16000, hours: "About 6 hours a day", shift: "Rotating", dist: "Dhaka", div: "Dhaka", upa: "Uttara",
    skills: ["Record keeping", "Medicine handling basics", "Honesty"], preferred: ["Diploma in pharmacy"], due: 21, ago: 12,
    sum: "Counter service and stock records for an Uttara pharmacy under a licensed pharmacist.",
    desc: "Hand over medicines as directed by the pharmacist, record sales, check expiry racks weekly and keep the counter organised.",
    resp: "Counter service and billing\nDaily sales register\nExpiry and cold-chain checks",
    req: "Diploma (pharmacy preferred) or HSC with a science background\nCareful handwriting and accuracy",
    instr: "Only candidates who can present a valid ID on the trial day are shortlisted.",
    ben: "Annual health check-up" },
  { ref: "CB-2026-L008", co: "books", cat: "retail-shop", title: "Weekend Bookstore Counter Staff", etype: "part-time", exp: "fresher", edu: "hsc", min: 500, max: 700, period: "day", hours: "Weekends only", dist: "Khulna", div: "Khulna", upa: "Sonadanga",
    skills: ["Billing", "Inventory counting", "Catalogue search"], preferred: [], due: 9, ago: 4,
    sum: "Saturday and Sunday counter duty at a Sonadanga textbook shop during the admission season.",
    desc: "Handle the counter, find titles from the shelf list, pack stationery gifts and record daily sales.",
    resp: "Counter billing and packing\nShelf tidy and stock count\nCustomer title search",
    req: "HSC or ongoing studies\nComfortable with a manual cash register",
    instr: "Apply with your weekend availability.",
    ben: "Free copy of one textbook per season" },
  { ref: "CB-2026-L009", co: "arkatech", cat: "it-support", title: "Computer Lab Assistant (Part-time)", etype: "part-time", exp: "entry", edu: "diploma", min: 9000, max: 12000, hours: "4–5 hours a day", dist: "Rajshahi", div: "Rajshahi", upa: "Boalia", mode: "hybrid",
    skills: ["Windows setup", "Hardware troubleshooting", "Student support"], preferred: ["Basic networking"], access: ["flexible-hours", "extra-time"], due: 19, ago: 7,
    sum: "Keep a 40-machine training lab running and help students with setup issues.",
    desc: "Prepare the lab before each class, fix printer and login issues, install software and log maintenance needs with the IT team.",
    resp: "Daily lab readiness check\nFirst-line help for students and trainers\nSoftware installation and updates",
    req: "Diploma in CSE or equivalent hands-on experience\nPatience explaining basics to beginners",
    instr: "Remote troubleshooting tasks can be done from home on days the lab is closed.",
    ben: "Free access to Arkatech training videos" },
  { ref: "CB-2026-L010", co: "boutique", cat: "admin-office", title: "Tailoring & Cutting Assistant", etype: "part-time", exp: "any", edu: "hsc", min: 11000, max: 14000, hours: "About 6 hours a day", dist: "Dhaka", div: "Dhaka", upa: "Uttara",
    skills: ["Sewing machine", "Fabric cutting", "Measurement"], preferred: ["Hand finishing"], due: 26, ago: 15,
    sum: "Support the tailoring unit of a boutique with cutting, threading and finishing.",
    desc: "Work beside the master tailor: prepare fabric, run straight seams, thread machines, press finished pieces and log pickup dates.",
    resp: "Cutting as per the measurement sheet\nMachine threading and basic seams\nPressing and packing finished garments",
    req: "Prior machine experience preferred, but trainees are considered\nSteady hands and care with fabric",
    instr: "Add a short note about any tailoring training you have completed.",
    ben: "Two festival bonuses · lunch provided" },
  { ref: "CB-2026-L011", co: "brew", cat: "admin-office", title: "Event Registration Crew (Temporary)", etype: "temporary", exp: "fresher", edu: "hsc", min: 1500, max: 1800, period: "day", hours: "Full day", dist: "Dhaka", div: "Dhaka", upa: "Bashundhara",
    skills: ["Communication", "Guest handling", "English reading"], preferred: ["Event experience"],
    access: ["step-free-access", "companion-allowed", "flexible-hours"], flex: true, due: 12, ago: 2,
    sum: "Three-day contract for a conference at Bashundhara — desk setup, badges and seat guidance.",
    desc: "Staff the registration desk for a three-day education conference. Paid per working day, with a shared team lunch.",
    resp: "Set up and run the registration desk\nVerify guest lists and hand out badges\nGuide attendees to halls",
    req: "Available all three days\nClear, friendly communication in Bangla and basic English",
    instr: "Contract dates are confirmed after shortlisting; apply even if your schedule is not final yet.",
    ben: "Paid daily · team lunch and transport support" },
  { ref: "CB-2026-L012", co: "nexa", cat: "data-entry", title: "Evening Data Entry Operator (Remote)", etype: "part-time", exp: "fresher", edu: "hsc", min: 11000, max: 13000, hours: "3 hrs/day", dist: "Sylhet", div: "Sylhet", upa: "Zindabazar", mode: "remote",
    skills: ["Typing speed (English 30 wpm)", "Google Sheets", "Accuracy"], preferred: ["Bangla typing"],
    access: ["remote-work", "flexible-hours", "extra-time"], flex: true, due: 22, ago: 9,
    sum: "Remote evening data entry for a Dhaka product studio's internal records.",
    desc: "Enter and check support ticket records into shared sheets. Choose your own three-hour slot between 6 PM and midnight.",
    resp: "Enter tickets into the tracker\nFlag duplicate or missing rows\nComplete a short weekly accuracy check",
    req: "Typing speed of at least 30 wpm in English\nA laptop or desktop with stable internet\nHSC or equivalent",
    instr: "A 10-minute typing check link is sent after you apply.",
    ben: "Fully remote · flexible slot · weekly feedback" },

  { ref: "CB-2026-R001", co: "nexa", cat: "web-development", title: "Junior Frontend Developer (React)", etype: "full-time", exp: "junior", edu: "bachelor", min: 40000, max: 60000, mode: "remote", hours: "Full day",
    skills: ["JavaScript", "React", "Tailwind CSS", "Git"], preferred: ["TypeScript", "Testing Library", "Accessibility basics"],
    access: ["remote-work", "flexible-hours", "assistive-software"], due: 30, ago: 4,
    sum: "Remote junior frontend role building customer dashboards with React and Tailwind.",
    desc: "Join a five-person product team maintaining a logistics dashboard used by 40 Bangladeshi SMEs. You will own small feature cards end to end — markup, state, tests and review.",
    resp: "Implement UI cards from Figma\nWrite and maintain component tests\nFix accessibility issues found in audits\nJoin code review as a reviewer once comfortable",
    req: "1–2 years of React experience (deployed personal projects count)\nSolid JavaScript and CSS fundamentals\nComfortable with Git branches and pull requests",
    instr: "Send a GitHub or portfolio link in your application note. The take-home task is capped at 3 hours and is paid.",
    ben: "Full remote · year-end performance bonus · learning budget of Tk 25,000" },
  { ref: "CB-2026-R002", co: "pixel", cat: "web-development", title: "WordPress Site Maintainer (Project based)", etype: "freelance", exp: "entry", edu: "any", min: 15000, max: 25000, period: "project", mode: "remote",
    skills: ["WordPress", "Elementor", "Page speed basics", "Plugin updates"], preferred: ["PHP basics"], due: 15, ago: 11,
    sum: "Remote project work keeping six small business sites updated, backed up and fast.",
    desc: "Monthly maintenance of client WordPress sites: plugin updates, backups, broken links, small content changes and a short report.",
    resp: "Apply updates on a staging copy first\nFix layout breaks after updates\nWrite a one-page monthly report",
    req: "You have maintained at least one real WordPress site\nCan follow a checklist without supervision",
    instr: "Share one site you have worked on and what you changed.",
    ben: "Fixed monthly project fee · work from anywhere" },
  { ref: "CB-2026-R003", co: "arkatech", cat: "software-engineering", title: "Backend Intern (Node.js)", etype: "internship", exp: "fresher", edu: "bachelor", min: 9000, max: 11000, mode: "remote", hours: "About 6 hours a day",
    skills: ["Node.js", "REST APIs", "PostgreSQL basics"], preferred: ["Docker basics", "Git"],
    access: ["remote-work", "flexible-hours", "extra-time", "written-interview"], due: 27, ago: 6,
    sum: "Six-month paid internship on the API team with a real project and a mentor.",
    desc: "Work alongside two senior engineers building inventory APIs for warehouse clients. Interns own one internal tool by the end of the internship.",
    resp: "Write and test API endpoints\nAdd validation and error messages\nDocument endpoints in the wiki",
    req: "Final-year or recent graduate in CSE or a related field\nCan commit 30 hours a week\nUnderstands HTTP, JSON and SQL basics",
    instr: "Internship offers include a two-page technical brief so you know exactly what will be tested.",
    ben: "Paid internship · laptop allowance · possible conversion to junior role" },
  { ref: "CB-2026-R004", co: "pixel", cat: "design", title: "UI/UX Designer", etype: "full-time", exp: "mid", edu: "bachelor", min: 60000, max: 85000, mode: "hybrid", dist: "Dhaka", div: "Dhaka", upa: "Gulshan",
    skills: ["Figma", "Design systems", "Usability testing", "Accessibility awareness"], preferred: ["Motion design", "Frontend basics"],
    access: ["lift-access", "quiet-space", "flexible-hours"], due: 25, ago: 8,
    sum: "Product design role for fintech and education clients; two office days a week in Gulshan.",
    desc: "You will design flows and interfaces for two client products, run short usability sessions, and hand over documented components to developers.",
    resp: "Discovery calls and flow mapping\nHigh fidelity screens in Figma\nComponent library upkeep\nUsability testing with five participants per round",
    req: "3+ years of product design experience\nPortfolio with at least two shipped products\nComfortable defending design decisions in review",
    instr: "Portfolio link required; a paid design task follows for shortlisted candidates.",
    ben: "Hybrid schedule · design conference budget · health cover" },
  { ref: "CB-2026-R005", co: "marketera", cat: "digital-marketing", title: "Social Media & Content Executive", etype: "full-time", exp: "entry", edu: "bachelor", min: 26000, max: 36000, mode: "hybrid", dist: "Dhaka", div: "Dhaka",
    skills: ["Bangla copywriting", "Meta Business Suite", "Canva", "Basic analytics"], preferred: ["Paid ads experience", "Video editing"], due: 17, ago: 5,
    sum: "Content planning and publishing for four e-commerce brands, hybrid from Banani.",
    desc: "Write Bangla and English captions, schedule posts, coordinate with the designer and report weekly on reach and sales clicks.",
    resp: "Monthly content calendar per brand\n12–18 posts a week published\nWeekly performance note\nCommunity replies within four working hours",
    req: "Writing samples in Bangla and English\nComfortable owning a content calendar\nOrganised with deadlines",
    instr: "Attach two captions or posts you have written earlier, on any platform.",
    ben: "Lunch subsidy · mobile bill support" },
  { ref: "CB-2026-R006", co: "marketera", cat: "digital-marketing", title: "SEO Analyst (Remote, Part-time)", etype: "part-time", exp: "mid", edu: "any", min: 22000, max: 30000, mode: "remote", hours: "20 hrs/week",
    skills: ["Search Console", "Keyword research", "On-page optimisation", "Ahrefs or Semrush"], preferred: ["Technical SEO audits", "Content briefs"],
    access: ["remote-work", "flexible-hours"], flex: true, due: 20, ago: 13,
    sum: "Remote part-time SEO for a small team of client sites.",
    desc: "Audit on-page issues, build keyword clusters and brief writers. You will report to the growth lead once a week.",
    resp: "Monthly audit and priority list\nKeyword clusters and writer briefs\nTrack rankings and traffic in Looker Studio",
    req: "2+ years of hands-on SEO for real sites\nEvidence of a ranking improvement you owned",
    instr: "Share two sites you have worked on with approximate results.",
    ben: "Remote · choose your own 20 hours" },
  { ref: "CB-2026-R007", co: "cloudroute", cat: "it-support", title: "IT Support Officer (Helpdesk)", etype: "full-time", exp: "entry", edu: "diploma", min: 24000, max: 30000, mode: "onsite", dist: "Chattogram", div: "Chattogram", upa: "Halishahar",
    skills: ["Windows & Linux basics", "Networking fundamentals", "Ticketing tools", "Printer and router setup"], preferred: ["CCNA or equivalent study"], due: 23, ago: 10,
    sum: "First-line IT support for school and clinic clients in Chattogram.",
    desc: "Answer helpdesk tickets, walk non-technical staff through fixes, visit two client sites a week and log everything in the ticket tool.",
    resp: "Ticket triage and resolution\nOn-site visits for hardware and network faults\nSimple asset register upkeep",
    req: "Diploma in CSE or equivalent\nComfortable talking to non-technical users",
    instr: "A 20-minute practical troubleshooting test is part of the interview.",
    ben: "Transport allowance · certifications supported after one year" },
  { ref: "CB-2026-R008", co: "arkatech", cat: "software-engineering", title: "QA Tester (Manual with automation path)", etype: "full-time", exp: "entry", edu: "bachelor", min: 32000, max: 42000, mode: "remote",
    skills: ["Test case writing", "Bug reporting", "Jira or Trello"], preferred: ["Selenium", "Postman", "SQL basics"],
    access: ["remote-work", "written-interview", "extra-time"], due: 28, ago: 3,
    sum: "Remote QA role on two product teams, with paid training toward automation.",
    desc: "Write and run test cases for a field-data app, log clear bug reports, and gradually take on automation scripts with a mentor's help.",
    resp: "Plan regression for each release\nWrite reproducible bug reports\nVerify fixes with the developer\nGradually add automated checks",
    req: "Methodical and patient with detail\nGood written English for bug reports\nBasic SQL helps but is not required",
    instr: "You will be asked to test a small demo app and report five issues.",
    ben: "Automation training paid by the company · full remote" },
  { ref: "CB-2026-R009", co: "bandhan", cat: "design", title: "Graphic Designer (Evening, Remote)", etype: "part-time", exp: "fresher", edu: "any", min: 12000, max: 18000, mode: "remote", hours: "4–5 hours a day",
    skills: ["Adobe Illustrator", "Photoshop", "Social media creatives"], preferred: ["Figma", "After Effects basics"],
    access: ["remote-work", "flexible-hours", "quiet-space"], flex: true, due: 13, ago: 7,
    sum: "Evening creative design for local brand campaigns — remote and part-time.",
    desc: "Produce static and simple motion social creatives from a brief. Five to eight deliverables a week, feedback over chat.",
    resp: "Design post templates and story frames\nPrepare brand-size exports\nApply feedback within one working day",
    req: "A portfolio of six or more designs (class work is fine)\nOwn laptop with Adobe access",
    instr: "Portfolio link is mandatory. A paid trial task of two creatives follows for shortlisted candidates.",
    ben: "Flexible evening hours · software licence provided" },
  { ref: "CB-2026-R010", co: "nexa", cat: "software-engineering", title: "Full-stack Developer (Next.js)", etype: "full-time", exp: "senior", edu: "bachelor", min: 85000, max: 130000, mode: "remote",
    skills: ["Next.js", "TypeScript", "PostgreSQL", "Drizzle or Prisma", "Testing"], preferred: ["tRPC", "Deployment pipelines", "Mentoring"],
    access: ["remote-work", "assistive-software", "flexible-hours"], due: 32, ago: 1,
    sum: "Lead engineer for two client products; remote with flexible hours.",
    desc: "You will architect and build features across the stack, review other engineers' code, and talk directly with clients about scope each week.",
    resp: "Design database schema and API routes\nShip full features including the UI\nCode review and mentoring for two juniors\nWeekly client demo",
    req: "4+ years production experience in the Node and React ecosystems\nExperience owning a deployment pipeline\nClear written and spoken English for client calls",
    instr: "An architecture take-home (4 hours maximum, paid) follows the first conversation.",
    ben: "Remote-first · profit share after year one · conference budget" },
  { ref: "CB-2026-R011", co: "shomokal", cat: "data-entry", title: "Remote Bangla Transcription Assistants (20 posts)", etype: "temporary", exp: "fresher", edu: "hsc", min: 10000, max: 16000, mode: "remote", hours: "2–3 hrs/day",
    skills: ["Bangla typing", "Listening accuracy", "Google Docs"], preferred: ["KoboToolbox", "Captioning tools"],
    access: ["remote-work", "flexible-hours", "extra-time", "assistive-software", "written-interview"], flex: true, due: 29, ago: 2,
    sum: "Paid remote transcription of Bangla interview audio for a research project.",
    desc: "Transcribe 30–45 minutes of audio per day into a provided template, mark unclear words and follow the style guide.",
    resp: "Transcribe assigned files\nFollow the punctuation style guide\nComplete a short weekly quality check",
    req: "Bangla typing at 25 wpm or better\nHeadphones and a quiet space\nHSC or equivalent",
    instr: "A five-minute sample audio is sent after you apply; return it within 48 hours.",
    ben: "Fully remote · weekly payment · choose your hours" },
  { ref: "CB-2026-R012", co: "cloudroute", cat: "it-support", title: "Security Trainee → Junior SOC Analyst", etype: "internship", exp: "entry", edu: "bachelor", min: 15000, max: 18000, mode: "hybrid", dist: "Chattogram", div: "Chattogram",
    skills: ["Linux command line", "Networking basics", "Log reading"], preferred: ["SIEM exposure", "Security+ study"], due: 26, ago: 16,
    sum: "Four-month paid traineeship with a junior analyst path for the right candidate.",
    desc: "Learn to triage security alerts on the team's SIEM, write short incident notes and shadow the on-call analyst at night.",
    resp: "Alert triage during the day shift\nWrite incident summaries\nMaintain the false-positive list",
    req: "BSc in CSE or ETE, or equivalent demonstrated interest\nWilling to learn from documentation\nCan attend the office twice a week",
    instr: "The training plan and evaluation criteria are shared on day one.",
    ben: "Paid traineeship · mentorship · permanent role possible" },

  { ref: "CB-2026-F001", co: "marketera", cat: "admin-office", title: "Graduate Trainee — Operations Support", etype: "full-time", exp: "fresher", edu: "bachelor", min: 22000, max: 26000, mode: "onsite", dist: "Dhaka", div: "Dhaka",
    skills: ["Google Sheets", "Filing", "Written communication"], preferred: ["Basic design"], due: 24, ago: 9,
    sum: "Structured six-month traineeship for fresh graduates in a Banani marketing team.",
    desc: "Rotate through campaign operations, invoicing and client reporting with a mentor in each area, then settle into the team that suits you.",
    resp: "Prepare weekly reports\nMaintain the client asset folder\nSupport invoicing and vendor follow-up",
    req: "Graduated within the last 18 months\nOrganised and comfortable with numbers",
    instr: "Applications are reviewed in batches every fortnight.",
    ben: "Mentor programme · performance review at six months" },
  { ref: "CB-2026-F002", co: "bandhan", cat: "design", title: "Junior Video Editor", etype: "full-time", exp: "fresher", edu: "any", min: 18000, max: 26000, mode: "hybrid", dist: "Dhaka", div: "Dhaka", upa: "Shyamoli",
    skills: ["Premiere Pro", "CapCut", "Subtitling"], preferred: ["After Effects", "Sound mixing basics"], access: ["written-interview", "flexible-hours"], due: 18, ago: 4,
    sum: "Edit short-form video for local brands; a test edit is part of the process.",
    desc: "Cut 15–60 second reels and 5–8 minute YouTube videos from raw footage, with subtitles in Bangla and English.",
    resp: "Edit and deliver to the brief\nAdd captions and level the sound\nOrganise project files in the shared drive",
    req: "Showreel or three sample edits\nOwn editing machine\nCan meet weekly delivery dates",
    instr: "Footage for a 60-second test edit is provided; return it within two days.",
    ben: "Hybrid work · gear rental support" },
  { ref: "CB-2026-F003", co: "shapla", cat: "coaching", title: "Teaching Assistant (English, Morning)", etype: "full-time", exp: "fresher", edu: "bachelor", min: 18000, max: 22000, mode: "onsite", dist: "Gazipur", div: "Dhaka", upa: "Tongi",
    skills: ["English speaking", "Classroom help", "Patience"], preferred: ["Early childhood experience"], access: ["step-free-access", "extra-time"], due: 21, ago: 14,
    sum: "Assist the lead teacher in a Tongi kindergarten; mornings only, so you can study afternoons.",
    desc: "Support phonics and storytelling sessions for four to six year olds, prepare craft materials, and supervise snack and play time.",
    resp: "Classroom support during lessons\nMaterial preparation\nSupervise play and snack time",
    req: "Bachelor's degree in any subject\nClear spoken English\nComfortable with young children",
    instr: "The interview includes a 10-minute storytelling trial with children present.",
    ben: "Paid winter and summer break · weekends off" },
  { ref: "CB-2026-F004", co: "marketera", cat: "digital-marketing", title: "Freelance Bangla Content Writer", etype: "freelance", exp: "fresher", edu: "any", min: 8000, max: 14000, mode: "remote",
    skills: ["Bangla writing", "Research", "SEO basics"], preferred: ["Product description writing"], access: ["remote-work", "flexible-hours"], flex: true, due: 15, ago: 6,
    sum: "Per-article freelance writing for e-commerce product pages and blogs.",
    desc: "Write 500–800 word Bangla articles and product descriptions from a brief. Paid Tk 600–1200 per approved article.",
    resp: "Two to four pieces per week\nOne revision round per piece\nFact-check claims before submitting",
    req: "Three writing samples in Bangla\nAble to meet a fixed weekly delivery day",
    instr: "Send samples and your per-article rate expectation.",
    ben: "Choose your hours · monthly payout" },
  { ref: "CB-2026-F005", co: "arkatech", cat: "admin-office", title: "Business Development Intern", etype: "internship", exp: "fresher", edu: "bachelor", min: 8000, max: 10000, mode: "hybrid", dist: "Rajshahi", div: "Rajshahi",
    skills: ["Follow-up calls", "Excel", "Note taking"], preferred: ["CRM exposure"], access: ["lift-access", "written-interview", "extra-time"], due: 20, ago: 17,
    sum: "Three-month internship supporting client research and follow-up.",
    desc: "Build prospect lists, log follow-ups, prepare short company notes and attend two client calls as a notetaker.",
    resp: "Prospect list building\nCall follow-up logging\nWeekly pipeline sheet update",
    req: "Final-year or recent graduate\nConfident on the phone in Bangla, basic English email",
    instr: "An internship certificate and evaluation letter are issued at the end.",
    ben: "Stipend · travel cost for two client visits per month" },

  { ref: "CB-2026-A001", co: "cloudroute", cat: "it-support", title: "Accessible Customer Care Associate (Work from home)", etype: "full-time", exp: "entry", edu: "hsc", min: 21000, max: 27000, mode: "remote", hours: "6 hrs/day",
    skills: ["Written support replies", "Typing", "Product explanation"], preferred: ["Screen reader familiarity"],
    access: ["remote-work", "flexible-hours", "quiet-space", "assistive-software", "extra-time", "written-interview"],
    accNote: "Written interview available on request. Screen-reader-friendly tools are provided on the work machine. Extra time for any assessment. A support companion may join the first conversation.",
    due: 30, ago: 2,
    sum: "Remote chat and email support with documented accommodations and assistive software provided.",
    desc: "Handle chat and email support for clinic clients. All interviews can be conducted in writing, and the team provides licensed screen reader and dictation software on the work machine.",
    resp: "Answer chat and email tickets within service hours\nEscalate billing issues with clear notes\nUpdate the shared FAQ page",
    req: "HSC or equivalent\nComfortable writing in Bangla and simple English\nAble to work a fixed six-hour block",
    instr: "Tell us in your application which accommodation would help you most — it is optional and is only shared with the hiring team.",
    ben: "Assistive software licence · work-from-home stipend · flexible block timing" },
  { ref: "CB-2026-A002", co: "library", cat: "data-entry", title: "Library Catalogue Assistant", etype: "part-time", exp: "any", edu: "diploma", min: 9000, max: 11000, hours: "4–5 hours a day", dist: "Rangpur", div: "Rangpur", upa: "Jahaj Road",
    skills: ["Cataloguing basics", "Record keeping", "Carefulness"], preferred: ["Library science study"],
    access: ["step-free-access", "lift-access", "accessible-toilet", "written-interview", "companion-allowed", "flexible-hours"],
    accNote: "Ground and first floor both reachable by ramp and lift; accessible toilet on the ground floor. Written interview and a companion at interview are both available.",
    due: 27, ago: 5,
    sum: "Part-time catalogue desk at a community library with step-free access throughout.",
    desc: "Enter new titles into the catalogue, update borrower records and help the reading programme volunteers.",
    resp: "Catalogue new arrivals\nUpdate the borrower register\nWeekly shelf-list check",
    req: "Diploma or any qualification with careful handwriting\nAble to follow a fixed catalogue format",
    instr: "Applications are read in the order they arrive; there is no online test.",
    ben: "Weekends off · free library membership" },
  { ref: "CB-2026-A003", co: "anondo", cat: "delivery-logistics", title: "Packing & Sorting Associate (Supported work)", etype: "part-time", exp: "any", edu: "ssc", min: 12000, max: 14000, hours: "About 6 hours a day", dist: "Gazipur", div: "Dhaka",
    skills: ["Packing routine", "Labelling", "Teamwork"], preferred: [],
    access: ["step-free-access", "accessible-toilet", "quiet-space", "companion-allowed", "flexible-hours", "extra-time"],
    accNote: "A job coach is available for the first eight weeks. The packing area has a low-stimulation corner and a written task-card system. Shifts can start 30–90 minutes later by arrangement.",
    due: 31, ago: 3,
    sum: "Factory packing line role with a job coach, written task cards and a quiet work corner.",
    desc: "Pack and label retail cartons on a supported line of ten people. Tasks are shown as written cards with photos, and a job coach is present during the training period.",
    resp: "Fill and seal cartons\nApply labels correctly\nPlace finished cartons on the trolley",
    req: "Able to follow a written task sequence\nSSC or equivalent is preferred, not required — motivated applicants are trained",
    instr: "Factory visits are welcome before applying; ask through the note field on the application form.",
    ben: "Job coach · canteen meal at Tk 20 · festival bonus" },
  { ref: "CB-2026-A004", co: "shomokal", cat: "data-entry", title: "Remote Transcription Reviewer (Bangla)", etype: "part-time", exp: "entry", edu: "any", min: 14000, max: 18000, mode: "remote", hours: "3 hrs/day",
    skills: ["Bangla proofreading", "Google Docs comments", "Concentration"], preferred: ["Caption formats"],
    access: ["remote-work", "flexible-hours", "extra-time", "assistive-software", "written-interview"],
    accNote: "All assessment is written and asynchronous. Dictation and noise-cancelling equipment can be provided on request.",
    due: 24, ago: 10,
    sum: "Check transcribed Bangla text for accuracy, from home, on your own hours.",
    desc: "Read transcripts against the original audio, fix spelling and punctuation, and leave a short quality note for the transcriber.",
    resp: "Review six to eight transcripts daily\nCorrect and annotate errors\nFlag repeated issues to the coordinator",
    req: "Excellent written Bangla\nPatience for detail work\nReliable internet for audio files",
    instr: "A written sample review of one transcript is sent after applying.",
    ben: "Fully remote · equipment support · weekly pay" },
  { ref: "CB-2026-A005", co: "brew", cat: "cafe-restaurant", title: "Barista Trainee (Inclusive programme)", etype: "internship", exp: "fresher", edu: "any", min: 8000, max: 9000, mode: "onsite", hours: "4–5 hours a day", dist: "Dhaka", div: "Dhaka", upa: "Mohakhali",
    skills: ["Following a routine", "Hygiene", "Simple customer talk"], preferred: [],
    access: ["step-free-access", "accessible-toilet", "quiet-space", "written-interview", "companion-allowed", "extra-time", "flexible-hours"],
    accNote: "Six-week paid barista training with a named mentor, visual recipe cards and a written interview. A companion may attend training days and the first customer shifts.",
    due: 34, ago: 1,
    sum: "Paid six-week barista training with a mentor and visual recipe cards, leading to a shift role.",
    desc: "Learn espresso, milk and counter basics in a supported environment. Successful trainees are offered a regular evening shift at the same outlet.",
    resp: "Attend the training block four days a week\nPractise drink steps with visual cards\nShadow one shift per week in month two",
    req: "No prior experience needed\nComfortable being at a counter with guidance\nAble to follow a written routine",
    instr: "Apply with any note about what support would help you learn best.",
    ben: "Paid training · mentor · guaranteed trial shift" },
];

const guidance = [
  {
    slug: "frontend-roadmap-0-to-first-job", title: "Frontend developer: from zero to your first paid role", track: "remote-it", level: "beginner", minutes: 14,
    summary: "A six month, skills-first route to a junior frontend role in Bangladesh — what to learn, what to build, and what to send with your application.",
    roleSkills: ["HTML", "CSS", "JavaScript", "React", "Git", "Basic accessibility"],
    sections: [
      { heading: "Month 1 — the page itself", body: "Learn HTML elements, then layout with Flexbox and Grid. Build three static pages from screenshots you like. Do not use a framework yet.", bullets: ["One project per week, deployed on any free host", "Write the HTML by hand before watching a tutorial", "Check your page on a phone, not only on a laptop"] },
      { heading: "Month 2 — JavaScript without magic", body: "Variables, functions, arrays, objects, then the DOM. Solve five small problems a week; typing the solution yourself matters more than watching ten videos.", bullets: ["Make a filterable list, a form validator and a notes app that saves locally", "Keep a bug journal: what broke, how you found it"] },
      { heading: "Month 3 — React and real data", body: "Components, props, state, effects, then fetching from a public API. Rebuild one of your month-1 pages in React.", bullets: ["Read the official React tutorial end to end", "Learn loading, empty and error states — employers care about all three"] },
      { heading: "Month 4 — Git, deploy and a portfolio of three", body: "Repositories, branches, pull requests, and a live URL for everything you build. Three finished projects is enough for a junior application.", bullets: ["Write a README with screenshots for each project", "Deploy with any free host and keep the URL alive"] },
      { heading: "Month 5 — job readiness", body: "Tailor your CV to the vacancies you actually want, practise explaining your three projects in three minutes, and prepare answers for 'what was hardest'.", bullets: ["Apply to five roles a week rather than fifty in one day", "After a rejection, ask one specific question about what was missing"] },
      { heading: "Month 6 — interviews and honest pay", body: "Expect a small take-home task or a live edit. Check the pay range against local junior ranges before you accept.", bullets: ["Ask how code review and feedback work on the team", "Never work unpaid beyond a clearly capped trial task"] },
    ],
  },
  {
    slug: "first-part-time-job-near-home", title: "Getting your first part-time job near home", track: "local-part-time", level: "beginner", minutes: 9,
    summary: "A practical checklist for students: what to prepare, how to write the short application note, and how to check the shift really fits your class schedule.",
    roleSkills: ["Punctuality", "Customer service basics", "Cash handling", "Polite communication"],
    sections: [
      { heading: "Start with your real availability", body: "Write down the days and hours you can work every week, including travel time to the shop or café. Employers care more about a schedule you can keep than a long list of skills.", bullets: ["Mark exam weeks you cannot work", "Know the last bus or rickshaw time for a night shift"] },
      { heading: "One page, no decoration", body: "A fresher CV needs: contact details, a two-line objective naming the job, education, any experience, skills and one reference.", bullets: ["Save as PDF and name it clearly, e.g. Rifat_CV.pdf", "Do not print your National ID number on a CV"] },
      { heading: "Write a four-line note, not a letter", body: "Say who you are, what you can do, when you can work, and ask for a trial shift.", bullets: ["“I am a 3rd year student at Dhaka College, available 5–10 PM daily except Thursday, comfortable with the cash counter. I would like a trial shift this week.”"] },
      { heading: "Before you accept", body: "Ask the three questions that protect you: exact pay and pay day, working hours per week, and what happens if you are ill.", bullets: ["Get the pay and shift written in a message you can keep", "Never pay money for a 'uniform fee' to get a job"] },
      { heading: "Your first two weeks", body: "Arrive ten minutes early, carry a small notebook, ask how the person next to you prefers to be helped, and learn the closing routine fast.", bullets: ["Reliability in month one is what turns a part-time shift into a reference"] },
    ],
  },
  {
    slug: "interview-preparation-for-freshers", title: "Interview preparation when you have no experience", track: "fresher", level: "beginner", minutes: 10,
    summary: "The questions fresher applicants actually get, with simple ways to answer using class projects, club work and part-time shifts.",
    roleSkills: ["Self introduction", "Storytelling", "Honest answers", "Questions for the employer"],
    sections: [
      { heading: "The 60-second introduction", body: "Name, what you studied, one thing you built or organised, and what you are looking for. Rehearse it out loud three times.", bullets: ["Do not apologise for being a fresher — say what you can do now"] },
      { heading: "Questions about gaps in experience", body: "Answer with what you have done instead: a class project, a festival stall, helping in a family shop, volunteering.", bullets: ["“I have not worked in a café, but I ran the refreshment stall for our department fest — 200 customers over two days, and I handled the cash box.”"] },
      { heading: "Situational questions", body: "Use: what happened, what you did, what the result was. Keep each answer under 90 seconds.", bullets: ["Angry customer → listen, apologise once, fix or escalate", "A mistake you made → own it, explain the fix, name what changed"] },
      { heading: "Salary and shift questions", body: "Give a range if you know the local rate, and always ask how pay days and overtime are handled.", bullets: ["“For similar roles in this area I was expecting Tk 9,000–12,000, and I am flexible depending on the shift pattern.”"] },
      { heading: "Two questions to ask them", body: "“What does a good first month look like in this role?” and “How will I get feedback while I am learning?”", bullets: ["Interviewers remember applicants who ask sensible questions"] },
      { heading: "After the interview", body: "Send one short thank-you message naming something specific you discussed. Follow up once after 7–10 days, then move on.", bullets: ["Track every application in your tracker so follow-ups never overlap"] },
    ],
  },
  {
    slug: "cv-writing-tips-freshers", title: "CV writing tips that actually get read", track: "fresher", level: "beginner", minutes: 7,
    summary: "How to write a fresher CV that survives a 40 second scan, what to cut, and how to use the CareerBridge editor for it.",
    roleSkills: ["Clear formatting", "Action verbs", "Numbers", "Consistent dates"],
    sections: [
      { heading: "Order matters more than design", body: "For local part-time work put: objective, education, skills, any experience, availability. For IT roles put projects above education.", bullets: ["The top third of page one must contain your most relevant fact"] },
      { heading: "Turn duties into results", body: "Any line starting with 'Responsible for' can be rewritten with a verb and a number.", bullets: ["Responsible for stock → Counted stock on three shelves weekly, keeping records accurate to 98%"] },
      { heading: "Fill an empty experience section honestly", body: "Volunteering, fest committees, family business help, tutoring a cousin and class projects all count.", bullets: ["Never invent an employer — one false claim ends the process and your reputation"] },
      { heading: "Two minutes of formatting", body: "One font, one body size (10.5–11pt), consistent date format and margins of at least 1.5 cm so a printed page keeps its edge.", bullets: ["Classic Navy and Minimal Grey in the CV hub are the safest, most readable choices"] },
      { heading: "Final check before sending", body: "Read it aloud once for typos, export as PDF, open the PDF and check page breaks, then rename the file.", bullets: ["Send a file named for the vacancy, not 'CV final final(2).pdf'"] },
    ],
  },
  {
    slug: "cafe-restaurant-skills", title: "Skills for café, restaurant and supermarket shifts", track: "local-part-time", level: "beginner", minutes: 6,
    summary: "What managers look for in a counter or kitchen helper, and how to show you have it even in your first week.",
    roleSkills: ["Hygiene", "Speed", "POS basics", "Teamwork", "Handling complaints"],
    sections: [
      { heading: "The four things managers test first", body: "Clean hands and nails, on-time arrival, willingness to repeat a task, and a polite no when something is wrong.", bullets: ["Arrive early for three days straight — it is noticed", "Ask 'should I do this now or after the rush?' — it shows judgement"] },
      { heading: "Cash and POS", body: "You will be taught the machine, but showing you can count and re-check without embarrassment speeds it up.", bullets: ["Practise counting notes and giving change at home before the trial shift"] },
      { heading: "Customer complaints in four steps", body: "Listen fully once, repeat the problem, fix what you can, hand over what you cannot with a clear explanation.", bullets: ["Never argue about policy — call the person who owns the policy"] },
      { heading: "Food safety basics", body: "Separate raw and cooked, wash for 20 seconds, keep hot food hot and cold food cold, and stay out of service when you are ill.", bullets: ["Asking one hygiene question in the interview makes a strong impression"] },
    ],
  },
  {
    slug: "digital-marketing-entry-path", title: "Digital marketing: an entry route without a degree in it", track: "remote-it", level: "beginner", minutes: 11,
    summary: "The three realistic starting roles in Bangladesh — content executive, ads assistant and SEO junior — with free tools to practise on.",
    roleSkills: ["Copywriting", "Meta Business Suite", "Canva", "Analytics reading", "Spreadsheet reporting"],
    sections: [
      { heading: "Pick one lane first", body: "Content, paid ads, or SEO. A CV claiming all three reads as a beginner; one lane plus awareness of the others reads as employable.", bullets: ["Content is the most common entry point in Dhaka agencies"] },
      { heading: "Practise on something real", body: "Run a page for a small shop, a club or your own portfolio. Two months of consistent posting is a portfolio piece.", bullets: ["Screenshot results before and after — numbers belong in your CV", "Try one campaign with a Tk 500 budget to learn the interface and reporting"] },
      { heading: "Learn the reporting language", body: "Reach, engagement rate, click-through rate, cost per lead, conversion. Know what each means and what a normal local number looks like.", bullets: ["Build one reporting sheet that updates weekly — that sheet is an interview exhibit"] },
      { heading: "Build a small proof pack", body: "Six captions, two creatives, one report, one short written case study.", bullets: ["Write the case study as: problem, what you did, result, what you would change"] },
      { heading: "What to expect in the job test", body: "A brief with a product and a budget: write five captions, plan a week calendar, explain one metric.", bullets: ["Always ask who the customer is before writing a single line"] },
    ],
  },
  {
    slug: "it-support-networking-path", title: "IT support and networking: a steady, hands-on path", track: "remote-it", level: "beginner", minutes: 10,
    summary: "Helpdesk is one of the most accessible technology jobs in Bangladesh. The skill list, the free practice and how to move up.",
    roleSkills: ["Windows & Linux basics", "Printer and router setup", "Ticketing", "Patient explanation", "Documentation"],
    sections: [
      { heading: "Core skills in month 1–2", body: "Installing and updating an OS, user accounts, printer queues, shared folders, Wi-Fi channels and basic IP settings.", bullets: ["Fix something at home or for a relative and write the ticket you would have logged"] },
      { heading: "Learn one ticketing tool properly", body: "Any tool — the habit is what counts: categorise, reproduce, document, resolve, follow up.", bullets: ["Write resolutions so a colleague can repeat them without asking you"] },
      { heading: "Networking without a lab", body: "Use a simulator or your home router to learn DHCP, DNS, NAT, static IP, and how to read a client-side error.", bullets: ["Practice: a user says 'the internet is slow' — write the six questions you would ask"] },
      { heading: "Move up in year 2", body: "Add PowerShell or bash, a little scripting and one security topic. That is the difference between helpdesk and junior sysadmin pay.", bullets: ["Small certificates help you get interviews; the hands-on work keeps the job"] },
    ],
  },
  {
    slug: "asking-for-workplace-accommodations", title: "Asking for accommodations at work — a plain-language guide", track: "inclusive", level: "any", minutes: 8,
    summary: "What to request, when to ask and how to write it, using the accessibility information employers publish on CareerBridge.",
    roleSkills: ["Self-advocacy", "Written requests", "Knowing your needs"],
    sections: [
      { heading: "Start from what the employer published", body: "Every inclusive listing shows which facilities the employer confirmed — ramp, lift, accessible toilet, remote work, written interview, extra time. Look there before you ask.", bullets: ["If a facility is not listed, ask — missing information is not a refusal"] },
      { heading: "You do not have to explain a diagnosis", body: "Request the change you need, not your medical history. 'I need written instructions rather than verbal ones' is a complete reason.", bullets: ["Keep medical documentation private; share only if you choose to"] },
      { heading: "Ask in three sentences", body: "What you need, why it helps, and how small the change is.", bullets: ["“I read and write faster than I follow spoken instructions. Written task notes make my work more accurate. It does not change anyone else's workflow.”"] },
      { heading: "Adjustments most employers can make", body: "Written task cards, a quiet workspace, a start time 30–90 minutes later, 25% extra time for tests, a companion at interview, captioned training videos.", bullets: ["Many cost nothing — say so in the request"] },
      { heading: "If the answer is no", body: "Ask what would change the answer, and get the decision in writing. Then decide whether the job is a good fit.", bullets: ["Your private application notes are a good place to record what was agreed"] },
    ],
  },
  {
    slug: "balancing-study-and-work", title: "Studying and working at the same time", track: "local-part-time", level: "any", minutes: 6,
    summary: "How many hours are realistic, how to tell your employer about exam weeks early, and what to give up first.",
    roleSkills: ["Time blocking", "Communicating with your employer", "Study planning"],
    sections: [
      { heading: "A realistic ceiling", body: "For most students 12–18 working hours a week is the range that does not damage results. Above 20, something has to give.", bullets: ["Count travel time as part of the shift, not as free time"] },
      { heading: "Plan the semester against the roster", body: "Put every submission date and exam on one sheet before you accept a shift pattern.", bullets: ["Tell your supervisor about exam weeks at least two weeks ahead, in writing"] },
      { heading: "Protect two things", body: "Sleep and one full free day. Cut social media and optional club commitments before you cut either.", bullets: ["A part-time job that leaves you unable to sit an exam is a bad deal, whatever it pays"] },
      { heading: "Use work as evidence", body: "Six months of a steady shift is a stronger CV line than a workshop certificate. Write down what you were trusted with.", bullets: ["Ask your manager for a short reference note when your last shift ends"] },
    ],
  },
  {
    slug: "remote-work-on-a-low-budget", title: "Working remotely from Bangladesh on a low budget", track: "remote-it", level: "any", minutes: 8,
    summary: "Practical setup for unreliable power and internet, plus how to be trusted as a remote worker in your first role.",
    roleSkills: ["Async communication", "Time discipline", "Backup connectivity", "Written clarity"],
    sections: [
      { heading: "Minimum reliable setup", body: "One laptop, a 10,000 mAh power bank, mobile data as backup, and earphones with a microphone.", bullets: ["Test a 10-minute call on your backup connection before you need it"] },
      { heading: "Write so it survives a delay", body: "One message with context, question, options and a deadline beats four messages across a day.", bullets: ["End with the decision you need, and by when"] },
      { heading: "Make your work visible", body: "A short daily or weekly note of what you finished and what is next. It is also your evidence at review time.", bullets: ["Keep the note factual — 'completed 3 tickets, one blocked pending client reply'"] },
      { heading: "Payment and paperwork", body: "Have a bank or mobile banking account in your own name, and keep an invoice with dates, hours and the agreed rate.", bullets: ["For local contracts, get the pay day written down like any other job"] },
    ],
  },
];

const demoCv = {
  personal: {
    fullName: "Rifat Chowdhury",
    jobTitle: "BBA graduate · Part-time and evening availability",
    email: "seeker@careerbridge.dev",
    phone: "+880 1711 234567",
    address: "Section 10, Mirpur, Dhaka 1216",
    website: "",
    linkedin: "linkedin.com/in/example-rifat",
  },
  objective:
    "Final year BBA student at Dhaka College with two years of counter and stock experience in a family grocery shop. Looking for a part-time evening role in Mirpur where accuracy with cash and records matters. Available after 4 PM on weekdays and all day Friday–Saturday.",
  education: [
    { id: "e1", degree: "BBA in Management (Honours, 3rd year)", institution: "Dhaka College", location: "Dhaka", year: "2022 – 2026", result: "CGPA 3.31 / 4.00 (up to 5th semester)", details: "Coursework: financial accounting, business statistics, organisational behaviour." },
    { id: "e2", degree: "Higher Secondary Certificate (Business Studies)", institution: "Dhaka City College", location: "Dhaka", year: "2020", result: "GPA 5.00", details: "" },
  ],
  experience: [
    { id: "x1", role: "Counter & Stock Assistant (family shop)", company: "Chowdhury Grocery, Mirpur", location: "Dhaka", period: "Nov 2023 – Present", bullets: "Handled the cash counter for 4–6 hours on evenings and weekends\nCounted weekly stock for around 350 items and reported shortages\nKept a credit (khata) record for 40 regular customers, updated daily"},
    { id: "x2", role: "Volunteer — Registration Desk", company: "Dhaka College Business Fest", location: "Dhaka", period: "Feb 2025", bullets: "Registered 180+ participants over two days\nSorted and issued 12 kit bags per hour without record errors"},
  ],
  skills: [
    { id: "s1", name: "Cash handling and change accuracy", level: "Advanced" },
    { id: "s2", name: "Google Sheets (basic formulas, lists)", level: "Intermediate" },
    { id: "s3", name: "Inventory counting", level: "Intermediate" },
    { id: "s4", name: "Bangla and English written communication", level: "Intermediate" },
  ],
  projects: [
    { id: "p1", name: "Small shop sales record (course project)", link: "", tech: "Google Sheets", description: "Collected three weeks of sales data from two Mirpur shops and prepared a weekly trend summary for the class presentation." },
  ],
  training: [
    { id: "t1", title: "Basic Office & Internet Skills", institute: "a2i Digital Centre, Mirpur", year: "2024" },
  ],
  references: [
    { id: "r1", name: "Shop owner reference available", position: "Owner, Chowdhury Grocery", organization: "Mirpur Section 10", contact: "Available on request" },
  ],
  layout: { template: "classic", density: "regular", accent: "#14202b", uppercaseHeadings: true, sectionOrder: ["objective", "education", "experience", "skills", "projects", "training", "references"], hidden: [] },
};

async function main() {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  await client.query("begin");
  await client.query(
    `truncate table applications, saved_jobs, cv_documents, seeker_profiles, jobs, companies, job_categories, guidance_resources, users restart identity cascade`,
  );

  await insert(client, "job_categories", categories.map((c) => ({ ...c, open_demo_roles: 0 })));
  const catRows = await client.query(`select id, slug from job_categories`);
  const catId = new Map(catRows.rows.map((r) => [r.slug, r.id]));

  const empHash = await bcrypt.hash("Employer123", 8);
  const seekerHash = await bcrypt.hash("Seeker1234", 8);

  await insert(client, "users", [
    { name: "Rifat Chowdhury", email: "seeker@careerbridge.dev", password_hash: seekerHash, role: "jobseeker", created_at: daysAgo(40) },
    { name: "Nusrat Jahan", email: "hr@nexa.dev", password_hash: empHash, role: "employer", created_at: daysAgo(60) },
    { name: "Tanvir Ahmed", email: "tanvir@example.com", password_hash: empHash, role: "jobseeker", created_at: daysAgo(22) },
    { name: "Sadia Islam", email: "sadia@example.com", password_hash: empHash, role: "jobseeker", created_at: daysAgo(18) },
  ]);
  const userRows = await client.query(`select id, email from users`);
  const uid = new Map(userRows.rows.map((r) => [r.email, r.id]));
  const seekerId = uid.get("seeker@careerbridge.dev");
  const employerId = uid.get("hr@nexa.dev");

  await insert(client, "seeker_profiles", [
    {
      user_id: seekerId,
      headline: "BBA graduate · looking for part-time evening work",
      bio: "Final year BBA student at Dhaka College. I have helped at my uncle's grocery counter since 2023 and I am comfortable with cash, stock counting and Google Sheets.",
      phone: "+880 1711 234567",
      division: "Dhaka", district: "Dhaka", upazila: "Mirpur",
      education_level: "bachelor", institution: "Dhaka College", field_of_study: "Business Administration", graduation_year: 2026,
      experience_level: "fresher", availability: "Evenings after 4 PM, full weekends",
      work_mode: "onsite", salary_expectation: 11000, needs_accommodation: false, updated_at: daysAgo(3),
      skills: ["Customer service", "Cash handling", "Google Sheets", "Inventory counting", "Communication"],
      preferred_categories: ["supermarket", "retail-shop", "admin-office", "data-entry"],
      preferred_locations: ["Dhaka", "Mirpur"],
      preferred_employment_types: ["part-time", "temporary"],
      accessibility_needs: [],
    },
    {
      user_id: uid.get("tanvir@example.com"),
      headline: "React developer, 3 years agency work",
      bio: "Agency frontend developer moving to product work. Available for remote roles.",
      division: "Dhaka", district: "Dhaka", experience_level: "junior", education_level: "bachelor",
      skills: ["React", "TypeScript", "Tailwind CSS", "Git", "Testing"],
      preferred_categories: ["web-development", "software-engineering"],
      preferred_locations: ["Dhaka"], preferred_employment_types: ["full-time"], work_mode: "remote",
      salary_expectation: 45000, updated_at: daysAgo(6),
      accessibility_needs: ["quiet-space"], needs_accommodation: false,
      institution: "Independent University", field_of_study: "CSE", graduation_year: 2022,
      phone: "+880 1811 000001", upazila: "", availability: "Immediate",
    },
  ], { skills: "jsonb", preferred_categories: "jsonb", preferred_locations: "jsonb", preferred_employment_types: "jsonb", accessibility_needs: "jsonb" });

  await insert(client, "companies", companies.map((c, i) => ({
    name: c.name, slug: c.key, industry: c.industry, size: c.size, district: c.district, division: c.division,
    address: c.address, about: c.about, accessibility_info: c.acc ?? "", contact_email: `${c.key}@example.com`,
    phone: "+880 2 9XXXXXX", website: "", is_demo: true,
    owner_id: c.key === "nexa" ? employerId : null, created_at: daysAgo(60 - i),
  })));
  const compRows = await client.query(`select id, slug from companies`);
  const compId = new Map(compRows.rows.map((r) => [r.slug, r.id]));

  const jobRows = J.map((o) => ({
    reference: o.ref,
    employer_id: o.co === "nexa" ? employerId : null,
    company_id: compId.get(o.co),
    category_id: catId.get(o.cat),
    title: o.title, summary: o.sum ?? "", description: o.desc ?? "", responsibilities: o.resp ?? "",
    requirements: o.req ?? "", application_instructions:
      o.instr ?? "Apply through CareerBridge with a short note about your availability.",
    benefits: o.ben ?? "",
    employment_type: o.etype ?? "part-time", work_mode: o.mode ?? "onsite",
    experience_level: o.exp ?? "any", education_level: o.edu ?? "",
    working_hours: o.hours ?? "", shift: o.shift ?? "",
    division: o.div ?? "", district: o.dist ?? "", upazila: o.upa ?? "",
    salary_min: o.min ?? null, salary_max: o.max ?? null, salary_period: o.period ?? "month", pay_rate: "",
    required_skills: o.skills ?? [], preferred_skills: o.preferred ?? [],
    accessibility_facilities: o.access ?? [], interview_accommodations: o.accNote ?? "",
    flexible_hours: o.flex ?? false, deadline: o.due ? inDays(o.due) : null,
    status: "published", is_demo: true, posted_at: daysAgo(o.ago ?? 7), updated_at: daysAgo(o.ago ?? 7),
  }));
  await insert(client, "jobs", jobRows, { required_skills: "jsonb", preferred_skills: "jsonb", accessibility_facilities: "jsonb" });
  const jobRefRows = await client.query(`select id, reference from jobs`);
  const jobId = new Map(jobRefRows.rows.map((r) => [r.reference, r.id]));

  await insert(client, "guidance_resources", guidance.map((g) => ({
    slug: g.slug, title: g.title, track: g.track, level: g.level, minutes: g.minutes, summary: g.summary,
    role_skills: g.roleSkills, sections: g.sections, is_demo: true,
  })), { role_skills: "jsonb", sections: "jsonb" });

  await insert(client, "saved_jobs", [
    { user_id: seekerId, job_id: jobId.get("CB-2026-L002"), created_at: daysAgo(5) },
    { user_id: seekerId, job_id: jobId.get("CB-2026-L012"), created_at: daysAgo(4) },
    { user_id: seekerId, job_id: jobId.get("CB-2026-R009"), created_at: daysAgo(2) },
  ]);

  await insert(client, "applications", [
    {
      user_id: seekerId, job_id: jobId.get("CB-2026-L002"), employer_id: null,
      job_title: "Shelf Stock & Inventory Assistant", company_name: "Mirpur Fresh Mart", job_reference: "CB-2026-L002",
      contact_name: "Rifat Chowdhury", contact_email: "seeker@careerbridge.dev", contact_phone: "+880 1711 234567",
      cover_note: "I can start immediately and I am available for the morning block five days a week. I have handled stock at my uncle's grocery shop for two years.",
      status: "interview", private_notes: "Phone screening done.\nInterview Thursday 11 AM at Section 10 — bring two IDs.",
      interview_at: daysAgo(-3), interview_mode: "In person at the store", applied_at: daysAgo(9), updated_at: daysAgo(2),
    },
    {
      user_id: seekerId, job_id: jobId.get("CB-2026-L012"), employer_id: employerId,
      job_title: "Evening Data Entry Operator (Remote)", company_name: "Nexa Software Labs", job_reference: "CB-2026-L012",
      contact_name: "Rifat Chowdhury", contact_email: "seeker@careerbridge.dev", contact_phone: "+880 1711 234567",
      cover_note: "Typing speed is 34 wpm in English. I can commit to three hours every evening this month.",
      status: "under-review", private_notes: "", employer_notes: "Check typing test result before shortlisting.",
      applied_at: daysAgo(6), updated_at: daysAgo(6),
    },
    {
      user_id: seekerId, job_id: jobId.get("CB-2026-L004"), employer_id: null,
      job_title: "Clothing Sales Associate (Weekends)", company_name: "Silver Line Boutique", job_reference: "CB-2026-L004",
      contact_name: "Rifat Chowdhury", contact_email: "seeker@careerbridge.dev", contact_phone: "",
      cover_note: "Weekends only fits around my class schedule.",
      status: "no-response", private_notes: "Called the shop on Monday — they said they are still interviewing.",
      applied_at: daysAgo(16), updated_at: daysAgo(16),
    },
    {
      user_id: seekerId, job_id: jobId.get("CB-2026-R001"), employer_id: employerId,
      job_title: "Junior Frontend Developer (React)", company_name: "Nexa Software Labs", job_reference: "CB-2026-R001",
      contact_name: "Rifat Chowdhury", contact_email: "seeker@careerbridge.dev", contact_phone: "+880 1711 234567",
      cover_note: "I have two deployed React projects. I am looking for evening work while I finish my degree.",
      status: "rejected", private_notes: "They wanted 1 year of production experience. Re-apply after June.",
      employer_notes: "Strong basics, but the role needs someone who can join full-time.",
      applied_at: daysAgo(20), updated_at: daysAgo(14),
    },
    {
      user_id: uid.get("tanvir@example.com"), job_id: jobId.get("CB-2026-R001"), employer_id: employerId,
      job_title: "Junior Frontend Developer (React)", company_name: "Nexa Software Labs", job_reference: "CB-2026-R001",
      contact_name: "Tanvir Ahmed", contact_email: "tanvir@example.com", contact_phone: "+880 1811 000001",
      cover_note: "Three years in React for two agencies. Portfolio link in my CV.",
      status: "interview", employer_notes: "Second round with the product lead.",
      interview_at: daysAgo(-2), interview_mode: "Google Meet", applied_at: daysAgo(3), updated_at: daysAgo(1),
    },
    {
      user_id: uid.get("sadia@example.com"), job_id: jobId.get("CB-2026-R001"), employer_id: employerId,
      job_title: "Junior Frontend Developer (React)", company_name: "Nexa Software Labs", job_reference: "CB-2026-R001",
      contact_name: "Sadia Islam", contact_email: "sadia@example.com", contact_phone: "+880 1811 000002",
      cover_note: "Self taught, six months of internship at a startup in Banani.",
      status: "applied", applied_at: daysAgo(2), updated_at: daysAgo(2),
    },
    {
      user_id: uid.get("tanvir@example.com"), job_id: jobId.get("CB-2026-L012"), employer_id: employerId,
      job_title: "Evening Data Entry Operator (Remote)", company_name: "Nexa Software Labs", job_reference: "CB-2026-L012",
      contact_name: "Tanvir Ahmed", contact_email: "tanvir@example.com", contact_phone: "",
      cover_note: "Available 6 PM to 10 PM daily.", status: "shortlisted", applied_at: daysAgo(4), updated_at: daysAgo(1),
    },
  ]);

  await insert(client, "cv_documents", [
    { user_id: seekerId, title: "Rifat Chowdhury CV", template: "classic", content: demoCv, updated_at: daysAgo(1) },
  ], { content: "jsonb" });

  await client.query(
    `update job_categories set open_demo_roles = (
       select count(*) from jobs where jobs.category_id = job_categories.id and jobs.status = 'published'
     )`,
  );
  await client.query("commit");

  const counts = {};
  for (const t of ["users", "companies", "jobs", "job_categories", "applications", "saved_jobs", "cv_documents", "guidance_resources"]) {
    const { rows } = await client.query(`select count(*)::int as n from ${t}`);
    counts[t] = rows[0].n;
  }
  console.log("Seeded CareerBridge demo data:", counts);
  console.log("Demo accounts → seeker@careerbridge.dev / Seeker1234  ·  hr@nexa.dev / Employer123");
  await client.end();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
