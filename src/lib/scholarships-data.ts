import { ScholarshipItem } from '@/types';

export const SCHOLARSHIPS_DATA: ScholarshipItem[] = [
  {
    id: 'sch_nsp_central_sector',
    title: 'Central Sector Scheme of Scholarship for College and University Students',
    provider: 'Department of Higher Education, Ministry of Education, Govt. of India',
    type: 'Government',
    amountText: '₹12,000 / year (UG) to ₹20,000 / year (PG)',
    amountNumeric: 12000,
    educationLevel: 'Undergraduate',
    eligibleCourses: ['B.Tech', 'B.Sc', 'B.Com', 'B.A', 'MBBS', 'All Regular Degree Courses'],
    eligibilityCriteria: [
      'Above 80th percentile in relevant stream in Class 12 board examination',
      'Pursuing regular (non-correspondence) degree course in recognized institution',
      'Gross parental / family annual income below ₹4,50,000',
      'Not receiving any other government scholarship'
    ],
    location: 'All India',
    deadline: '2026-12-31',
    officialUrl: 'https://scholarships.gov.in',
    isVerified: true,
    description: 'Premier national government scholarship providing direct maintenance allowance into Aadhaar-seeded student bank accounts to cover college expenses and books.',
    tags: ['National Portal', 'Government', 'Merit-cum-Means', 'Aadhaar Seeded']
  },
  {
    id: 'sch_reliance_foundation',
    title: 'Reliance Foundation Undergraduate Scholarship',
    provider: 'Reliance Foundation',
    type: 'Private',
    amountText: 'Up to ₹2,00,000 across entire degree duration',
    amountNumeric: 50000,
    educationLevel: 'Undergraduate',
    eligibleCourses: ['B.Tech', 'B.E', 'B.Sc', 'B.Com', 'All Full-Time 1st Year UG Degrees'],
    eligibilityCriteria: [
      'First-year student enrolled in full-time regular undergraduate degree program',
      'Passed Class 12 with minimum 60% aggregate score',
      'Household annual income up to ₹15,00,000 (preference to income < ₹2,50,000)',
      'Mandatory online aptitude assessment test'
    ],
    location: 'All India',
    deadline: '2026-10-15',
    officialUrl: 'https://www.reliancefoundation.org',
    isVerified: true,
    description: 'Competitive private scholarship supporting meritorious first-year students with generous grant funding, leadership development, and alumni mentorship.',
    tags: ['Private Grant', 'First-Year', 'Mentorship', 'Leadership']
  },
  {
    id: 'sch_aicte_pragati',
    title: 'AICTE Pragati Scholarship Scheme for Girl Students',
    provider: 'All India Council for Technical Education (AICTE)',
    type: 'Government',
    amountText: '₹50,000 per year of study',
    amountNumeric: 50000,
    educationLevel: 'Undergraduate',
    eligibleCourses: ['B.Tech', 'B.E', 'B.Pharm', 'B.Arch', 'Diploma in Engineering'],
    eligibilityCriteria: [
      'Exclusively for female students admitted to 1st year of Degree/Diploma in AICTE-approved institution',
      'Maximum two girl children per family eligible',
      'Family annual income must not exceed ₹8,00,000 per annum',
      'Selection based strictly on merit in qualifying examination'
    ],
    location: 'All India',
    deadline: '2026-11-30',
    officialUrl: 'https://www.aicte-india.org',
    isVerified: true,
    description: 'Flagship initiative by AICTE to empower young women pursuing technical and engineering education across India with annual tuition and device grants.',
    tags: ['AICTE', 'Women in STEM', 'Technical Education', 'Government']
  },
  {
    id: 'sch_karnataka_ssp',
    title: 'Post-Matric Scholarship Scheme (State Scholarship Portal)',
    provider: 'Social Welfare & Backward Classes Welfare Dept, Govt. of Karnataka',
    type: 'Government',
    amountText: '100% Fee Reimbursement (Up to ₹50,000) + Monthly Allowance',
    amountNumeric: 25000,
    educationLevel: 'Undergraduate',
    eligibleCourses: ['B.Tech', 'Degree', 'Polytechnic', 'Medical', 'Postgraduate'],
    eligibilityCriteria: [
      'Permanent resident / domicile of Karnataka state',
      'Admitted through CET/KEA or merit quota in recognized college',
      'Income limit as per category guidelines (SC/ST: ₹2.5 Lakhs; OBC/EWS: ₹1.0 - ₹2.5 Lakhs)',
      'Aadhaar-seeded bank account linked with SSP ID'
    ],
    location: 'Karnataka',
    deadline: '2026-12-20',
    officialUrl: 'https://ssp.postmatric.karnataka.gov.in',
    isVerified: true,
    description: 'Direct government scholarship covering institutional course fees, examination fees, and hostel maintenance allowances for students studying in Karnataka.',
    tags: ['State Government', 'Fee Reimbursement', 'Hostel Allowance', 'Karnataka']
  },
  {
    id: 'sch_tata_trusts',
    title: 'Tata Trusts Medical and Healthcare Scholarship',
    provider: 'Tata Trusts',
    type: 'Private',
    amountText: '30% to 80% Tuition Waiver (Up to ₹75,000 / year)',
    amountNumeric: 60000,
    educationLevel: 'Undergraduate',
    eligibleCourses: ['MBBS', 'BDS', 'B.Sc Nursing', 'B.Pharm', 'Allied Health Sciences'],
    eligibilityCriteria: [
      'Enrolled in recognized government or private medical college in India',
      'Academic track record with minimum 60% in previous professional examination',
      'Demonstrated financial need assessed by Tata Trusts evaluation panel',
      'Submission of institutional fee structure and family income certificates'
    ],
    location: 'All India',
    deadline: '2026-12-15',
    officialUrl: 'https://www.tatatrusts.org',
    isVerified: true,
    description: 'Philanthropic support by Tata Trusts designed to relieve the heavy tuition burden on deserving healthcare and medical sciences undergraduates.',
    tags: ['Medical', 'Healthcare', 'Tuition Waiver', 'Tata Trusts']
  },
  {
    id: 'sch_kotak_kanya',
    title: 'Kotak Kanya Scholarship for Higher Education',
    provider: 'Kotak Education Foundation',
    type: 'Private',
    amountText: 'Up to ₹1,50,000 per year until course completion',
    amountNumeric: 150000,
    educationLevel: 'Undergraduate',
    eligibleCourses: ['Engineering', 'MBBS', 'Integrated LLB', 'Architecture', 'Design'],
    eligibilityCriteria: [
      'Meritorious girl students who scored 85% or more in Class 12 board examination',
      'Admitted to 1st year of professional graduation in NAAC/NIRF accredited institution',
      'Annual family income less than or equal to ₹6,00,000',
      'Open to applicants across all Indian states'
    ],
    location: 'All India',
    deadline: '2026-11-25',
    officialUrl: 'https://kotakeducation.org',
    isVerified: true,
    description: 'High-impact corporate foundation grant covering college tuition, hostel fees, laptop, and academic books for women pursuing professional degrees.',
    tags: ['Corporate Grant', 'Women Empowerment', 'Professional Degrees', 'High Grant']
  },
  {
    id: 'sch_ongc_merit',
    title: 'ONGC Foundation Merit Scholarship for Undergraduates',
    provider: 'Oil and Natural Gas Corporation (ONGC Foundation)',
    type: 'Government',
    amountText: '₹48,000 per year (₹4,000 / month)',
    amountNumeric: 48000,
    educationLevel: 'Undergraduate',
    eligibleCourses: ['B.Tech / B.E in Engineering', 'MBBS', 'MBA', 'Geology / Geophysics'],
    eligibilityCriteria: [
      'Regular full-time students in 1st year of Engineering or Medical program',
      'Minimum 60% marks in Class 12 board exams',
      'Annual family income from all sources not exceeding ₹2,00,000',
      'Age limit up to 30 years as of application date'
    ],
    location: 'All India',
    deadline: '2026-12-18',
    officialUrl: 'https://ongcscholar.org',
    isVerified: true,
    description: 'Government PSU scholarship aimed at providing financial security to economically weaker students pursuing technical, engineering, and medical degrees.',
    tags: ['PSU Scholarship', 'Engineering', 'Medical', 'Monthly Stipend']
  },
  {
    id: 'sch_aditya_birla',
    title: 'Aditya Birla Capital Foundation Scholarship',
    provider: 'Aditya Birla Capital Foundation',
    type: 'Private',
    amountText: 'Up to ₹60,000 (One-time academic grant)',
    amountNumeric: 60000,
    educationLevel: 'Undergraduate',
    eligibleCourses: ['B.A', 'B.Sc', 'B.Com', 'BBA', 'BCA', 'Vocational Degrees'],
    eligibilityCriteria: [
      'Enrolled in recognized Indian undergraduate degree or diploma course',
      'Minimum 60% marks in previous academic year',
      'Family income less than ₹6,00,000 per annum',
      'Preference to students experiencing severe economic distress or loss of breadwinner'
    ],
    location: 'All India',
    deadline: '2026-12-10',
    officialUrl: 'https://adityabirlacapital.com',
    isVerified: true,
    description: 'Targeted welfare scholarship ensuring college students do not drop out due to unexpected financial hardships during degree study.',
    tags: ['Crisis Support', 'General Degrees', 'One-Time Grant', 'Aditya Birla']
  }
];
