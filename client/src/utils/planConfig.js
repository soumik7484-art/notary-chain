/**
 * NotaryChain SaaS Plan Configuration
 * Defines subscription tiers, features, and pricing
 */

export const PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceLabel: '₹0',
    period: '/month',
    verificationLimit: 3,
    recommended: false,
    description: 'Perfect for individuals getting started with document verification.',
    features: [
      { label: '3 document verifications / 24 hours', included: true },
      { label: 'AI document analysis', included: true },
      { label: 'Risk detection', included: true },
      { label: 'SHA-256 verification', included: true },
      { label: 'Blockchain proof', included: true },
      { label: 'Public verification', included: true },
      { label: 'Downloadable reports', included: false },
      { label: 'QR verification codes', included: false },
      { label: 'Team workspace', included: false },
      { label: 'API access', included: false },
    ],
    cta: 'Current Plan',
    ctaVariant: 'secondary',
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    price: 499,
    priceLabel: '₹499',
    period: '/month',
    verificationLimit: 500,
    recommended: true,
    description: 'For professionals who need advanced verification and reporting.',
    features: [
      { label: '500 document verifications/month', included: true },
      { label: 'Advanced AI analysis', included: true },
      { label: 'Verification history', included: true },
      { label: 'Downloadable verification reports', included: true },
      { label: 'QR verification codes', included: true },
      { label: 'Advanced document insights', included: true },
      { label: 'Priority support', included: true },
      { label: 'Team workspace', included: false },
      { label: 'API access', included: false },
      { label: 'Organization analytics', included: false },
    ],
    cta: 'Upgrade to Pro',
    ctaVariant: 'primary',
  },
  BUSINESS: {
    id: 'business',
    name: 'Business',
    price: 2499,
    priceLabel: '₹2,499',
    period: '/month',
    verificationLimit: -1,
    recommended: false,
    description: 'For teams and organizations needing enterprise-grade verification.',
    features: [
      { label: 'Unlimited verifications', included: true },
      { label: 'Team workspace & multiple users', included: true },
      { label: 'Bulk verification', included: true },
      { label: 'Advanced audit logs', included: true },
      { label: 'API access', included: true },
      { label: 'Organization analytics', included: true },
      { label: 'Custom integrations', included: true },
      { label: 'Dedicated account manager', included: false },
      { label: 'SSO / SAML', included: false },
      { label: 'SLA guarantee', included: false },
    ],
    cta: 'Upgrade to Business',
    ctaVariant: 'primary',
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: null,
    priceLabel: 'Custom',
    period: '',
    verificationLimit: -1,
    recommended: false,
    description: 'Custom solutions for high-volume enterprise needs.',
    features: [
      { label: 'High-volume verification', included: true },
      { label: 'Enterprise integrations', included: true },
      { label: 'SSO / SAML authentication', included: true },
      { label: 'Advanced access control', included: true },
      { label: 'Dedicated support', included: true },
      { label: 'Custom SLA', included: true },
      { label: 'White-label options', included: true },
      { label: 'On-premise deployment', included: true },
      { label: 'Custom AI models', included: true },
      { label: 'Priority engineering support', included: true },
    ],
    cta: 'Contact Sales',
    ctaVariant: 'secondary',
  },
};

export const PLAN_ORDER = ['FREE', 'PRO', 'BUSINESS', 'ENTERPRISE'];

/**
 * Business model items for landing page
 */
export const BUSINESS_MODEL = [
  {
    title: 'SaaS Subscriptions',
    description: 'Tiered plans from Free to Enterprise with predictable monthly pricing.',
    icon: '📊',
  },
  {
    title: 'API Usage',
    description: 'Metered API access for developers integrating document verification.',
    icon: '⚡',
  },
  {
    title: 'Enterprise Contracts',
    description: 'Custom agreements for banks, law firms, and government institutions.',
    icon: '🏛️',
  },
  {
    title: 'Pay-per-Verification',
    description: 'Usage-based pricing for high-volume one-time verification needs.',
    icon: '📄',
  },
  {
    title: 'White-Label Infrastructure',
    description: 'Licensable verification platform for partners to embed in their products.',
    icon: '🏗️',
  },
];

/**
 * Trust score breakdown categories
 */
export const TRUST_SCORE_CATEGORIES = [
  { key: 'documentIntegrity', label: 'Document Integrity', maxScore: 25 },
  { key: 'identityVerification', label: 'Identity Verification', maxScore: 20 },
  { key: 'aiRiskAnalysis', label: 'AI Risk Analysis', maxScore: 20 },
  { key: 'blockchainProof', label: 'Blockchain Proof', maxScore: 20 },
  { key: 'verificationStatus', label: 'Verification Status', maxScore: 15 },
];
