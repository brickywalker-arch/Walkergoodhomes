/**
 * Business-development content and enquiry schemas.
 *
 * The schemas here are the single source of truth for the partner forms: the
 * client renders from them and the API validates against them, so a field
 * cannot exist on screen without the server knowing what it is.
 *
 * On the copy: Walker Good Homes was established in 2024 and Hoyle Ing is its
 * development. Nothing below claims a council contract, a framework place, an
 * award, an accreditation or a completed scheme, because there are none to
 * claim. The language throughout is "we want to work with", "we are
 * interested in", "we welcome" — an invitation, not a track record.
 */

export type EnquiryKind = 'housing' | 'development' | 'trade' | 'supplier' | 'land' | 'professional';

export type FieldKind = 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'chips' | 'files';

export type FormField = {
  name: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  /** select and chips only. */
  options?: readonly string[];
  placeholder?: string;
  hint?: string;
  /** 2 makes the field span the full width of the two-column grid. */
  span?: 1 | 2;
  accept?: string;
};

export type EnquiryForm = {
  kind: EnquiryKind;
  /** Shown in the modal header and used as the email subject. */
  title: string;
  intro: string;
  fields: readonly FormField[];
  submitLabel: string;
};

/* ------------------------------------------------- 1. housing partnerships */

export const HOUSING_CARDS = [
  {
    num: '01',
    title: 'LOCAL AUTHORITIES',
    body: 'Housing delivery and development opportunities.',
  },
  {
    num: '02',
    title: 'HOUSING ASSOCIATIONS & REGISTERED PROVIDERS',
    body: 'Affordable and social housing delivery.',
  },
  {
    num: '03',
    title: 'PUBLIC-SECTOR LAND',
    body: 'Unlocking suitable land for residential development.',
  },
] as const;

export const HOUSING_OPPORTUNITY_TYPES = [
  'Land requiring development',
  'Identified housing requirement',
  'Seeking a development partner',
  'Affordable or social housing delivery',
  'Public-sector land disposal',
  'Something else',
] as const;

/* --------------------------------------------- 2. development partnerships */

export const PARTNERSHIP_STAGES = [
  {
    label: 'YOU MAY BRING',
    tone: 'partner',
    items: ['Capital', 'Land', 'Development opportunity'],
  },
  {
    label: 'WALKER GOOD HOMES BRINGS',
    tone: 'wgh',
    items: [
      'Construction expertise',
      'Procurement',
      'Trade network',
      'Site management',
      'Development coordination',
      'Residential delivery',
    ],
  },
  {
    label: 'TOGETHER',
    tone: 'together',
    items: ['NEW HOMES'],
  },
] as const;

export const DEVELOPMENT_OPPORTUNITY_TYPES = [
  'I have capital to deploy',
  'I own land',
  'I have a development opportunity',
  'Joint venture',
  'Exploring options',
] as const;

/* ------------------------------------------------ 3. build with us / supply */

export const TRADES = [
  'Bricklayers',
  'Groundworkers',
  'Joiners',
  'Roofers',
  'Plasterers',
  'Electricians',
  'Plumbers',
  'Decorators',
  'Tilers',
  'Landscapers',
  'Plant operators',
  'Other trades',
] as const;

export const SUPPLY_CATEGORIES = [
  'Brick',
  'Stone',
  'Blocks',
  'Timber',
  'Roofing',
  'Windows',
  'Doors',
  'Kitchens',
  'Bathrooms',
  'Insulation',
  'Flooring',
  'Landscaping',
  'Plant',
  'Other construction products',
] as const;

export const ENGAGEMENT_TYPES = ['Subcontract', 'Labour only', 'Daywork', 'A mix of these'] as const;

/* ------------------------------------------------------------ 4. land wanted */

export const LAND_TYPES = [
  'Land with planning',
  'Land without planning',
  'Brownfield sites',
  'Former commercial sites',
  'Residential infill',
  'Large gardens',
  'Redevelopment opportunities',
] as const;

export const PLANNING_STATUS = [
  'No planning history',
  'Pre-application discussions',
  'Application submitted',
  'Outline consent',
  'Full consent',
  'Lapsed consent',
  'Not sure',
] as const;

/* --------------------------------------------------- 5. professional partners */

export const PROFESSIONAL_DISCIPLINES = [
  'Architects',
  'Structural engineers',
  'Planning consultants',
  'Quantity surveyors',
  'Civil engineers',
  'Geo-environmental consultants',
  'Building control professionals',
  'Estate agents',
  'Solicitors',
  'Mortgage professionals',
  'Interior designers',
] as const;

/* ----------------------------------------------------------- shared fields */

const CONTACT_NAME: FormField = { name: 'contactName', label: 'Contact name', kind: 'text', required: true };
const EMAIL: FormField = { name: 'email', label: 'Email', kind: 'email', required: true };
const PHONE: FormField = { name: 'phone', label: 'Telephone', kind: 'tel' };
const MESSAGE: FormField = {
  name: 'message',
  label: 'Message',
  kind: 'textarea',
  span: 2,
  placeholder: 'Anything that would help us understand the opportunity.',
};

/** Attachments are optional everywhere; nothing is gated behind a file. */
const files = (label: string, hint: string, accept?: string): FormField => ({
  name: 'attachments',
  label,
  kind: 'files',
  span: 2,
  hint,
  accept,
});

const DOC_ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.webp,.heic';

/* --------------------------------------------------------------- the forms */

export const PARTNER_FORMS: Record<EnquiryKind, EnquiryForm> = {
  housing: {
    kind: 'housing',
    title: 'Discuss a housing opportunity',
    intro:
      'Tell us what you are working with and we will come back to you. Nothing here commits either of us to anything.',
    submitLabel: 'Send to Walker Good Homes',
    fields: [
      { name: 'organisation', label: 'Organisation', kind: 'text', required: true },
      CONTACT_NAME,
      EMAIL,
      PHONE,
      { name: 'location', label: 'Location or site', kind: 'text', placeholder: 'Town, district or site name' },
      {
        name: 'homes',
        label: 'Approximate number of homes',
        kind: 'text',
        placeholder: 'If known',
        hint: 'A range is fine. Leave it blank if it is too early to say.',
      },
      {
        name: 'opportunityType',
        label: 'Opportunity type',
        kind: 'select',
        options: HOUSING_OPPORTUNITY_TYPES,
        span: 2,
      },
      MESSAGE,
      files('Attachments', 'Site plans, a brief, a schedule of accommodation — whatever you already have.', DOC_ACCEPT),
    ],
  },

  development: {
    kind: 'development',
    title: 'Discuss a development partnership',
    intro:
      'A first conversation, not a proposal. We will tell you plainly whether a scheme looks deliverable and what it would take.',
    submitLabel: 'Send to Walker Good Homes',
    fields: [
      CONTACT_NAME,
      { name: 'organisation', label: 'Company', kind: 'text' },
      EMAIL,
      PHONE,
      {
        name: 'opportunityType',
        label: 'Type of opportunity',
        kind: 'select',
        options: DEVELOPMENT_OPPORTUNITY_TYPES,
      },
      {
        name: 'landAvailable',
        label: 'Land available?',
        kind: 'select',
        options: ['Yes — I own it', 'Yes — under offer or option', 'No', 'Looking for a site'],
      },
      {
        name: 'scale',
        label: 'Approximate scale',
        kind: 'text',
        placeholder: 'Number of homes, or the size of the opportunity',
        hint: 'However you think about it. We are not asking for figures you would rather discuss in person.',
        span: 2,
      },
      { name: 'location', label: 'Location', kind: 'text', span: 2, placeholder: 'Where in Yorkshire, or wider' },
      MESSAGE,
      files('Attachments', 'Site details, a title plan, a planning history — anything you already hold.', DOC_ACCEPT),
    ],
  },

  trade: {
    kind: 'trade',
    title: 'Join our supply chain — trades and subcontractors',
    intro: 'Tell us what you do and where you work. We keep details on file and come back when work suits you.',
    submitLabel: 'Send your details',
    fields: [
      CONTACT_NAME,
      { name: 'organisation', label: 'Company', kind: 'text' },
      { name: 'trade', label: 'Trade', kind: 'select', options: TRADES, required: true },
      { name: 'location', label: 'Based in', kind: 'text', placeholder: 'Town or postcode' },
      { name: 'coverage', label: 'Coverage area', kind: 'text', placeholder: 'How far you travel' },
      { name: 'operatives', label: 'Number of operatives', kind: 'text', placeholder: 'Including yourself' },
      EMAIL,
      PHONE,
      { name: 'engagement', label: 'How you work', kind: 'select', options: ENGAGEMENT_TYPES },
      { name: 'insurance', label: 'Insurance held', kind: 'text', placeholder: 'Public liability, employer’s liability' },
      {
        name: 'accreditations',
        label: 'Accreditations',
        kind: 'text',
        span: 2,
        placeholder: 'CSCS, Gas Safe, NICEIC, JIB, TrustMark — whatever applies',
      },
      MESSAGE,
      files('Rates, price list or portfolio', 'Optional. PDFs, spreadsheets or photographs of previous work.', DOC_ACCEPT),
    ],
  },

  supplier: {
    kind: 'supplier',
    title: 'Join our supply chain — materials and products',
    intro: 'Send us your range and terms. We would rather buy locally where the quality and the lead time work.',
    submitLabel: 'Send your details',
    fields: [
      { name: 'organisation', label: 'Company', kind: 'text', required: true },
      { name: 'category', label: 'Product category', kind: 'select', options: SUPPLY_CATEGORIES, required: true },
      CONTACT_NAME,
      EMAIL,
      PHONE,
      { name: 'coverage', label: 'Coverage', kind: 'text', placeholder: 'Areas you deliver to' },
      { name: 'leadTime', label: 'Typical lead time', kind: 'text', placeholder: 'From order to delivery' },
      { name: 'terms', label: 'Trade terms', kind: 'text', placeholder: 'Account terms, trade discount' },
      MESSAGE,
      files('Catalogue or price list', 'Optional. A PDF catalogue and a current price list are the most useful.', DOC_ACCEPT),
    ],
  },

  land: {
    kind: 'land',
    title: 'Tell us about your land',
    intro:
      'Send us what you have and we will tell you honestly whether it is something we could develop. No obligation, and no agency fee.',
    submitLabel: 'Send site details',
    fields: [
      { name: 'contactName', label: 'Owner or contact', kind: 'text', required: true },
      EMAIL,
      PHONE,
      { name: 'location', label: 'Location', kind: 'text', required: true, placeholder: 'Address or postcode' },
      { name: 'siteSize', label: 'Approximate site size', kind: 'text', placeholder: 'Acres, square metres or frontage' },
      { name: 'currentUse', label: 'Current use', kind: 'text', placeholder: 'Garden, yard, paddock, former works…' },
      { name: 'planningStatus', label: 'Planning status', kind: 'select', options: PLANNING_STATUS },
      { name: 'price', label: 'Asking price', kind: 'text', placeholder: 'If applicable' },
      { name: 'landType', label: 'What best describes it?', kind: 'chips', options: LAND_TYPES, span: 2 },
      MESSAGE,
      files(
        'Photographs, drawings or planning information',
        'Optional, and genuinely useful — even a phone photograph of the site tells us a lot.',
        DOC_ACCEPT,
      ),
    ],
  },

  professional: {
    kind: 'professional',
    title: 'Introduce your business',
    intro: 'We are building a list of local professionals we can call on. Tell us what you do and how you work.',
    submitLabel: 'Send an introduction',
    fields: [
      { name: 'organisation', label: 'Practice or company', kind: 'text', required: true },
      { name: 'discipline', label: 'Discipline', kind: 'select', options: PROFESSIONAL_DISCIPLINES, required: true },
      CONTACT_NAME,
      EMAIL,
      PHONE,
      { name: 'coverage', label: 'Areas covered', kind: 'text' },
      MESSAGE,
      files('Capability statement or portfolio', 'Optional.', DOC_ACCEPT),
    ],
  },
};

/* -------------------------------------------------------- audience router */

export const ROUTER_OPTIONS = [
  { label: 'FIND A HOME', href: '/#plots', note: 'Plots 1 & 2, Hoyle Ing' },
  { label: 'I HAVE LAND', href: '/land', note: 'Sites across Yorkshire' },
  { label: 'DEVELOP WITH US', href: '/partnerships/development', note: 'Capital, land, opportunities' },
  { label: 'HOUSING PARTNERSHIPS', href: '/partnerships/housing', note: 'Councils and providers' },
  { label: 'JOIN OUR SUPPLY CHAIN', href: '/supply-chain', note: 'Trades and suppliers' },
  { label: 'WORK WITH US', href: '/partnerships/professional', note: 'Professional partners' },
] as const;
