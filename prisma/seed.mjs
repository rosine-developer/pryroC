import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

const regulations = [
  {
    name: 'ISO/IEC 27001:2022',
    description: 'International standard for information security management systems (ISMS). Provides requirements for establishing, implementing, maintaining and continually improving an ISMS.',
    authority: 'ISO/IEC',
    country: 'International',
    region: 'Global',
    category: 'INFORMATION_SECURITY',
    version: '2022',
    effectiveDate: new Date('2022-10-25'),
    externalUrl: 'https://www.iso.org/standard/27001',
    status: 'ACTIVE',
    requirements: [
      { id: 'ISO27-4.1', title: 'Understanding the Organization and its Context', type: 'MANDATORY', priority: 'HIGH', desc: 'Determine external and internal issues relevant to the organization\'s purpose that affect its ability to achieve the intended outcomes of its ISMS.' },
      { id: 'ISO27-5.1', title: 'Leadership and Commitment', type: 'MANDATORY', priority: 'CRITICAL', desc: 'Top management must demonstrate leadership and commitment with respect to the ISMS.' },
      { id: 'ISO27-6.1', title: 'Risk Assessment and Treatment', type: 'MANDATORY', priority: 'CRITICAL', desc: 'Plan actions to address information security risks and opportunities including risk assessment and treatment.' },
      { id: 'ISO27-8.1', title: 'Operational Planning and Control', type: 'MANDATORY', priority: 'HIGH', desc: 'Plan, implement, control, monitor and review processes needed to meet information security requirements.' },
      { id: 'ISO27-9.2', title: 'Internal Audit', type: 'MANDATORY', priority: 'CRITICAL', desc: 'Conduct internal audits at planned intervals to provide information on whether the ISMS conforms to requirements.' },
      { id: 'ISO27-10.1', title: 'Continual Improvement', type: 'MANDATORY', priority: 'MEDIUM', desc: 'Continually improve the suitability, adequacy and effectiveness of the ISMS.' },
      { id: 'ISO27-A5', title: 'Organizational Controls (Annex A)', type: 'MANDATORY', priority: 'HIGH', desc: 'Policies for information security, roles and responsibilities, segregation of duties, contact with authorities.' },
      { id: 'ISO27-A8', title: 'Asset Management Controls', type: 'MANDATORY', priority: 'HIGH', desc: 'Inventory of assets, ownership, acceptable use, return of assets, classification, and handling of information.' },
    ],
  },
  {
    name: 'GDPR',
    description: 'General Data Protection Regulation — EU regulation on data protection and privacy for all individuals within the EU and EEA.',
    authority: 'European Parliament',
    country: 'European Union',
    region: 'Europe',
    category: 'DATA_PRIVACY',
    version: '2016/679',
    effectiveDate: new Date('2018-05-25'),
    externalUrl: 'https://gdpr.eu',
    status: 'ACTIVE',
    requirements: [
      { id: 'GDPR-5', title: 'Principles of Personal Data Processing', type: 'MANDATORY', priority: 'CRITICAL', desc: 'Lawfulness, fairness, transparency, purpose limitation, data minimisation, accuracy, storage limitation, integrity and confidentiality.' },
      { id: 'GDPR-6', title: 'Lawful Basis for Processing', type: 'MANDATORY', priority: 'CRITICAL', desc: 'Processing shall be lawful only if a valid legal basis applies including consent, contract, or legal obligation.' },
      { id: 'GDPR-17', title: 'Right to Erasure', type: 'MANDATORY', priority: 'HIGH', desc: 'Data subject has the right to obtain erasure of personal data without undue delay.' },
      { id: 'GDPR-25', title: 'Data Protection by Design and Default', type: 'MANDATORY', priority: 'HIGH', desc: 'Implement data protection principles and integrate safeguards into processing activities.' },
      { id: 'GDPR-32', title: 'Security of Processing', type: 'MANDATORY', priority: 'CRITICAL', desc: 'Implement appropriate technical and organisational measures to ensure a level of security appropriate to the risk.' },
      { id: 'GDPR-33', title: 'Data Breach Notification (72h)', type: 'MANDATORY', priority: 'CRITICAL', desc: 'Notify supervisory authority of a personal data breach within 72 hours of becoming aware of it.' },
      { id: 'GDPR-35', title: 'Data Protection Impact Assessment', type: 'MANDATORY', priority: 'HIGH', desc: 'Carry out DPIA where processing is likely to result in high risk to rights and freedoms of natural persons.' },
      { id: 'GDPR-37', title: 'Appointment of Data Protection Officer', type: 'MANDATORY', priority: 'MEDIUM', desc: 'Designate a DPO where required based on the nature, scope, context and purposes of processing.' },
    ],
  },
  {
    name: 'SOX (Sarbanes-Oxley Act)',
    description: 'US federal law setting requirements for US public company boards, management and public accounting firms regarding financial reporting and internal controls.',
    authority: 'U.S. Congress / SEC',
    country: 'United States',
    region: 'North America',
    category: 'FINANCIAL',
    version: '2002',
    effectiveDate: new Date('2002-07-30'),
    externalUrl: 'https://www.sec.gov/spotlight/sarbanes-oxley.htm',
    status: 'ACTIVE',
    requirements: [
      { id: 'SOX-302', title: 'CEO/CFO Certification of Financial Reports', type: 'MANDATORY', priority: 'CRITICAL', desc: 'CEO and CFO must certify the accuracy of financial statements and effectiveness of internal controls.' },
      { id: 'SOX-404', title: 'Management Assessment of Internal Controls', type: 'MANDATORY', priority: 'CRITICAL', desc: 'Annual report must contain internal control report stating responsibility for establishing adequate internal control structure.' },
      { id: 'SOX-409', title: 'Real-Time Material Change Disclosures', type: 'MANDATORY', priority: 'HIGH', desc: 'Disclose on a rapid and current basis information concerning material changes in financial condition or operations.' },
      { id: 'SOX-802', title: 'Document Retention and Anti-Tampering', type: 'MANDATORY', priority: 'CRITICAL', desc: 'Prohibits knowingly altering, destroying, or falsifying records with intent to obstruct an investigation.' },
    ],
  },
  {
    name: 'HIPAA',
    description: 'Health Insurance Portability and Accountability Act — US law establishing standards for the protection of sensitive patient health information.',
    authority: 'U.S. Department of Health and Human Services',
    country: 'United States',
    region: 'North America',
    category: 'DATA_PRIVACY',
    version: '1996',
    effectiveDate: new Date('1996-08-21'),
    externalUrl: 'https://www.hhs.gov/hipaa',
    status: 'ACTIVE',
    requirements: [
      { id: 'HIPAA-164.308', title: 'Administrative Safeguards', type: 'MANDATORY', priority: 'CRITICAL', desc: 'Implement policies and procedures to prevent, detect, contain, and correct security violations for ePHI.' },
      { id: 'HIPAA-164.310', title: 'Physical Safeguards', type: 'MANDATORY', priority: 'HIGH', desc: 'Physical measures, policies, and procedures to protect electronic information systems and related buildings from unauthorized intrusion.' },
      { id: 'HIPAA-164.312', title: 'Technical Safeguards', type: 'MANDATORY', priority: 'CRITICAL', desc: 'Technology and related policies to protect ePHI and control access to it, including access controls and audit controls.' },
      { id: 'HIPAA-164.314', title: 'Business Associate Contracts', type: 'MANDATORY', priority: 'HIGH', desc: 'Obtain satisfactory assurances that business associates will appropriately safeguard PHI.' },
      { id: 'HIPAA-164.400', title: 'Breach Notification Rule', type: 'MANDATORY', priority: 'CRITICAL', desc: 'Notify affected individuals, HHS, and media (if applicable) following a breach of unsecured PHI.' },
    ],
  },
  {
    name: 'PCI DSS v4.0',
    description: 'Payment Card Industry Data Security Standard — global standard for organizations that handle cardholder data to protect against payment card fraud.',
    authority: 'PCI Security Standards Council',
    country: 'International',
    region: 'Global',
    category: 'FINANCIAL',
    version: '4.0',
    effectiveDate: new Date('2022-03-31'),
    externalUrl: 'https://www.pcisecuritystandards.org',
    status: 'ACTIVE',
    requirements: [
      { id: 'PCI-1', title: 'Install and Maintain Network Security Controls', type: 'MANDATORY', priority: 'CRITICAL', desc: 'Network security controls (NSCs) are implemented to restrict inbound and outbound network traffic to only that which is necessary.' },
      { id: 'PCI-2', title: 'Apply Secure Configurations', type: 'MANDATORY', priority: 'HIGH', desc: 'Malicious individuals use security weaknesses. Do not use vendor-supplied defaults for system passwords and other security parameters.' },
      { id: 'PCI-3', title: 'Protect Stored Account Data', type: 'MANDATORY', priority: 'CRITICAL', desc: 'Protection methods such as encryption, truncation, masking, and hashing are critical components of cardholder data protection.' },
      { id: 'PCI-4', title: 'Protect Cardholder Data in Transit', type: 'MANDATORY', priority: 'CRITICAL', desc: 'Use strong cryptography to safeguard sensitive cardholder data during transmission over open, public networks.' },
      { id: 'PCI-6', title: 'Develop and Maintain Secure Systems', type: 'MANDATORY', priority: 'HIGH', desc: 'Unscrupulous individuals use security vulnerabilities to gain privileged access to systems. Security patches must be applied promptly.' },
      { id: 'PCI-8', title: 'Identify Users and Authenticate Access', type: 'MANDATORY', priority: 'HIGH', desc: 'Assign unique ID to each person with computer access. Use multi-factor authentication for all access into the cardholder data environment.' },
      { id: 'PCI-10', title: 'Log and Monitor All Access', type: 'MANDATORY', priority: 'HIGH', desc: 'Logging mechanisms and the ability to track user activities are critical for effective forensics and vulnerability management.' },
      { id: 'PCI-12', title: 'Support Information Security with Organizational Policies', type: 'MANDATORY', priority: 'MEDIUM', desc: 'A strong security policy sets the security tone for the whole entity and informs employees what is expected of them.' },
    ],
  },
  {
    name: 'ISO 9001:2015',
    description: 'International standard specifying requirements for a quality management system (QMS) to consistently provide products and services that meet customer and regulatory requirements.',
    authority: 'ISO',
    country: 'International',
    region: 'Global',
    category: 'QUALITY',
    version: '2015',
    effectiveDate: new Date('2015-09-15'),
    externalUrl: 'https://www.iso.org/iso-9001-quality-management.html',
    status: 'ACTIVE',
    requirements: [
      { id: 'ISO9-4.1', title: 'Understanding the Organization and its Context', type: 'MANDATORY', priority: 'HIGH', desc: 'Determine external and internal issues that are relevant to the organization\'s purpose and strategic direction.' },
      { id: 'ISO9-5.1', title: 'Leadership and Commitment to QMS', type: 'MANDATORY', priority: 'CRITICAL', desc: 'Top management shall demonstrate leadership and commitment with respect to the quality management system.' },
      { id: 'ISO9-6.1', title: 'Actions to Address Risks and Opportunities', type: 'MANDATORY', priority: 'HIGH', desc: 'Determine risks and opportunities that need to be addressed to ensure the QMS can achieve its intended results.' },
      { id: 'ISO9-8.1', title: 'Operational Planning and Control', type: 'MANDATORY', priority: 'HIGH', desc: 'Plan, implement, control, monitor, and review processes needed to meet product and service requirements.' },
      { id: 'ISO9-9.1', title: 'Monitoring, Measurement, Analysis and Evaluation', type: 'MANDATORY', priority: 'HIGH', desc: 'Determine what needs to be monitored and measured, methods, when analysis and evaluation shall occur.' },
      { id: 'ISO9-9.3', title: 'Management Review', type: 'MANDATORY', priority: 'MEDIUM', desc: 'Top management shall review the organization\'s QMS at planned intervals to ensure its continuing suitability, adequacy and effectiveness.' },
    ],
  },
  {
    name: 'NIST Cybersecurity Framework (CSF) 2.0',
    description: 'Voluntary framework providing standards, guidelines, and best practices to manage cybersecurity risk for organizations of any size and sector.',
    authority: 'National Institute of Standards and Technology (NIST)',
    country: 'United States',
    region: 'Global',
    category: 'INFORMATION_SECURITY',
    version: '2.0',
    effectiveDate: new Date('2024-02-26'),
    externalUrl: 'https://www.nist.gov/cyberframework',
    status: 'ACTIVE',
    requirements: [
      { id: 'NIST-GV', title: 'Govern — Cybersecurity Risk Management Strategy', type: 'RECOMMENDED', priority: 'HIGH', desc: 'Establish and monitor the organization\'s cybersecurity risk management strategy, expectations, and policy.' },
      { id: 'NIST-ID', title: 'Identify — Asset and Risk Management', type: 'RECOMMENDED', priority: 'HIGH', desc: 'Develop an organizational understanding to manage cybersecurity risk to systems, assets, data, and capabilities.' },
      { id: 'NIST-PR', title: 'Protect — Safeguards and Controls', type: 'RECOMMENDED', priority: 'HIGH', desc: 'Develop and implement appropriate safeguards to ensure delivery of critical infrastructure services.' },
      { id: 'NIST-DE', title: 'Detect — Anomaly and Event Detection', type: 'RECOMMENDED', priority: 'HIGH', desc: 'Develop and implement appropriate activities to identify the occurrence of a cybersecurity event.' },
      { id: 'NIST-RS', title: 'Respond — Incident Response Planning', type: 'RECOMMENDED', priority: 'HIGH', desc: 'Develop and implement appropriate activities to take action regarding a detected cybersecurity incident.' },
      { id: 'NIST-RC', title: 'Recover — Recovery Planning and Improvement', type: 'RECOMMENDED', priority: 'MEDIUM', desc: 'Develop and implement appropriate activities to maintain plans for resilience and restore capabilities impaired by a cybersecurity incident.' },
    ],
  },
  {
    name: 'ISO 14001:2015',
    description: 'International standard for environmental management systems (EMS), helping organizations improve environmental performance through more efficient use of resources and reduction of waste.',
    authority: 'ISO',
    country: 'International',
    region: 'Global',
    category: 'ENVIRONMENTAL',
    version: '2015',
    effectiveDate: new Date('2015-09-15'),
    externalUrl: 'https://www.iso.org/iso-14001-environmental-management.html',
    status: 'ACTIVE',
    requirements: [
      { id: 'ISO14-4.1', title: 'Understanding Organization Context and Environmental Conditions', type: 'MANDATORY', priority: 'HIGH', desc: 'Determine external and internal issues relevant to the organization\'s purpose that affect its ability to achieve intended EMS outcomes.' },
      { id: 'ISO14-6.1', title: 'Environmental Aspects and Impacts Assessment', type: 'MANDATORY', priority: 'CRITICAL', desc: 'Determine environmental aspects of activities, products, and services and their associated environmental impacts.' },
      { id: 'ISO14-6.2', title: 'Environmental Objectives and Planning', type: 'MANDATORY', priority: 'HIGH', desc: 'Establish environmental objectives at relevant functions, levels and processes.' },
      { id: 'ISO14-8.1', title: 'Operational Control and Life Cycle Perspective', type: 'MANDATORY', priority: 'HIGH', desc: 'Establish controls and processes necessary to meet environmental management system requirements.' },
      { id: 'ISO14-9.1', title: 'Environmental Performance Monitoring', type: 'MANDATORY', priority: 'HIGH', desc: 'Monitor, measure, analyze and evaluate environmental performance.' },
    ],
  },
  {
    name: 'SOC 2 Type II',
    description: 'AICPA auditing standard for service organizations covering security, availability, processing integrity, confidentiality, and privacy of customer data.',
    authority: 'American Institute of CPAs (AICPA)',
    country: 'United States',
    region: 'Global',
    category: 'INFORMATION_SECURITY',
    version: 'Trust Services Criteria 2017',
    effectiveDate: new Date('2018-12-15'),
    externalUrl: 'https://www.aicpa.org/interestareas/frc/assuranceadvisoryservices/sorhome.html',
    status: 'ACTIVE',
    requirements: [
      { id: 'SOC2-CC1', title: 'Control Environment', type: 'MANDATORY', priority: 'CRITICAL', desc: 'Organization demonstrates commitment to integrity and ethical values, independence, oversight structure, and competence.' },
      { id: 'SOC2-CC6', title: 'Logical and Physical Access Controls', type: 'MANDATORY', priority: 'CRITICAL', desc: 'Implement logical access security software, infrastructure, and architectures to protect against unauthorized access.' },
      { id: 'SOC2-CC7', title: 'System Operations and Anomaly Detection', type: 'MANDATORY', priority: 'HIGH', desc: 'Detect and monitor for new vulnerabilities, evaluate security events, and implement incident management processes.' },
      { id: 'SOC2-CC8', title: 'Change Management', type: 'MANDATORY', priority: 'HIGH', desc: 'Implement a change management process that includes authorization, testing, and documentation of system changes.' },
      { id: 'SOC2-A1', title: 'Availability — Performance Monitoring', type: 'MANDATORY', priority: 'HIGH', desc: 'Current processing capacity is sufficient to meet commitments. Environmental, regulatory, and technological changes are monitored.' },
    ],
  },
  {
    name: 'CCPA (California Consumer Privacy Act)',
    description: 'California state law enhancing privacy rights and consumer protection for residents of California, granting consumers rights over their personal information.',
    authority: 'California State Legislature',
    country: 'United States',
    region: 'North America',
    category: 'DATA_PRIVACY',
    version: '2020 (CPRA Amended)',
    effectiveDate: new Date('2020-01-01'),
    externalUrl: 'https://oag.ca.gov/privacy/ccpa',
    status: 'ACTIVE',
    requirements: [
      { id: 'CCPA-1798.100', title: 'Right to Know About Personal Information', type: 'MANDATORY', priority: 'HIGH', desc: 'Consumers have the right to request disclosure of personal information collected, used, disclosed, or sold.' },
      { id: 'CCPA-1798.105', title: 'Right to Delete Personal Information', type: 'MANDATORY', priority: 'HIGH', desc: 'Consumers have the right to request deletion of personal information collected from them.' },
      { id: 'CCPA-1798.120', title: 'Right to Opt-Out of Sale', type: 'MANDATORY', priority: 'HIGH', desc: 'Consumers have the right to opt-out of the sale of their personal information to third parties.' },
      { id: 'CCPA-1798.150', title: 'Private Right of Action for Data Breaches', type: 'MANDATORY', priority: 'CRITICAL', desc: 'Consumers may bring civil action if personal information is subject to unauthorized access due to failure to maintain reasonable security.' },
    ],
  },
  {
    name: 'BASEL III',
    description: 'International regulatory framework for banks, developed by the Basel Committee on Banking Supervision to strengthen regulation, supervision and risk management.',
    authority: 'Basel Committee on Banking Supervision (BIS)',
    country: 'International',
    region: 'Global',
    category: 'FINANCIAL',
    version: 'III (2023 finalized)',
    effectiveDate: new Date('2023-01-01'),
    externalUrl: 'https://www.bis.org/bcbs/basel3.htm',
    status: 'ACTIVE',
    requirements: [
      { id: 'BASEL3-CAR', title: 'Capital Adequacy Requirements', type: 'MANDATORY', priority: 'CRITICAL', desc: 'Banks must maintain minimum capital ratios: CET1 of 4.5%, Tier 1 of 6%, and Total Capital of 8% of risk-weighted assets.' },
      { id: 'BASEL3-LCR', title: 'Liquidity Coverage Ratio', type: 'MANDATORY', priority: 'CRITICAL', desc: 'Banks must hold sufficient high-quality liquid assets to survive a 30-day stressed funding scenario (LCR ≥ 100%).' },
      { id: 'BASEL3-NSFR', title: 'Net Stable Funding Ratio', type: 'MANDATORY', priority: 'HIGH', desc: 'Banks must maintain a stable funding profile in relation to the composition of assets and off-balance sheet activities.' },
      { id: 'BASEL3-LEV', title: 'Leverage Ratio', type: 'MANDATORY', priority: 'HIGH', desc: 'Non-risk-based leverage ratio of at least 3% to serve as a backstop to the risk-based capital requirements.' },
    ],
  },
  {
    name: 'ILO Core Labour Standards',
    description: 'International Labour Organization fundamental conventions establishing core labour rights globally, covering freedom of association, forced labour, child labour, and discrimination.',
    authority: 'International Labour Organization (ILO)',
    country: 'International',
    region: 'Global',
    category: 'LABOR',
    version: '2022 (Updated)',
    effectiveDate: new Date('1998-06-18'),
    externalUrl: 'https://www.ilo.org/declaration',
    status: 'ACTIVE',
    requirements: [
      { id: 'ILO-87', title: 'Freedom of Association and Right to Organise', type: 'MANDATORY', priority: 'CRITICAL', desc: 'Workers and employers have the right to establish and join organizations of their own choosing without prior authorization.' },
      { id: 'ILO-29', title: 'Forced and Compulsory Labour Elimination', type: 'MANDATORY', priority: 'CRITICAL', desc: 'Suppression of forced or compulsory labour in all its forms, including debt bondage and human trafficking.' },
      { id: 'ILO-138', title: 'Minimum Age for Employment', type: 'MANDATORY', priority: 'CRITICAL', desc: 'Minimum age for admission to employment shall not be less than the age of completion of compulsory schooling.' },
      { id: 'ILO-100', title: 'Equal Remuneration for Work of Equal Value', type: 'MANDATORY', priority: 'HIGH', desc: 'Promote the principle of equal remuneration for men and women workers for work of equal value.' },
      { id: 'ILO-111', title: 'Non-Discrimination in Employment and Occupation', type: 'MANDATORY', priority: 'HIGH', desc: 'Eliminate discrimination in respect of employment and occupation based on race, colour, sex, religion, political opinion, national extraction, or social origin.' },
    ],
  },
];

async function main() {
  console.log('🌱 Seeding database with global regulations...');

  // Create default admin user
  const passwordHash = await bcrypt.hash('Admin@123', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@pryrogrc.com' },
    update: {},
    create: {
      email: 'admin@pryrogrc.com',
      passwordHash,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'ADMINISTRATOR',
      department: 'IT',
    },
  });
  console.log(`✅ Admin user ready: ${adminUser.email}`);

  // Seed regulations and their requirements
  for (const reg of regulations) {
    const { requirements, ...regData } = reg;

    // Check if regulation already exists
    const existing = await prisma.regulation.findFirst({
      where: { name: regData.name },
    });

    let regulation;
    if (existing) {
      regulation = existing;
      console.log(`⏭️  Skipping (exists): ${regData.name}`);
    } else {
      regulation = await prisma.regulation.create({ data: regData });
      console.log(`✅ Created regulation: ${regData.name}`);
    }

    // Seed requirements for this regulation
    for (const req of requirements) {
      const existingReq = await prisma.requirement.findUnique({
        where: { requirementId: req.id },
      });
      if (!existingReq) {
        await prisma.requirement.create({
          data: {
            requirementId: req.id,
            title: req.title,
            description: req.desc,
            requirementType: req.type,
            priority: req.priority,
            status: 'PENDING_REVIEW',
            regulationId: regulation.id,
          },
        });
      }
    }
  }

  console.log('\n🎉 Seeding complete!');
  console.log('📋 Regulations seeded:', regulations.length);
  console.log('🔐 Admin login: admin@pryrogrc.com / Admin@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
