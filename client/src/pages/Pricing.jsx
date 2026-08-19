import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Sparkles, Shield, Zap, Building2, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PLANS, PLAN_ORDER } from '../utils/planConfig';
import { usePlan } from '../context/PlanContext';

const PRICING_DATA = [
  {
    key: 'free',
    name: 'Free',
    monthlyPrice: '₹0',
    annualPrice: '₹0',
    annualSecondary: null,
    description: 'Perfect for individuals trying out digital notary.',
    features: [
      { text: '3 verifications per 24 hours', included: true },
      { text: 'Standard email support', included: true },
      { text: 'Basic document hash', included: true },
      { text: 'Advanced API access', included: false },
      { text: 'Custom branding', included: false },
    ],
    icon: Shield,
    buttonText: 'Current Plan',
  },
  {
    key: 'pro',
    name: 'Pro',
    monthlyPrice: '₹499',
    annualPrice: '₹4,790',
    annualSecondary: '≈ ₹399/month when billed annually',
    description: 'For professionals who need more volume and features.',
    features: [
      { text: '100 verifications per month', included: true },
      { text: 'Priority email support', included: true },
      { text: 'Advanced document hash', included: true },
      { text: 'Basic API access', included: true },
      { text: 'Custom branding', included: false },
    ],
    icon: Zap,
    buttonText: 'Upgrade to Pro',
    recommended: true,
  },
  {
    key: 'business',
    name: 'Business',
    monthlyPrice: '₹2,499',
    annualPrice: '₹23,990',
    annualSecondary: '≈ ₹1,999/month when billed annually',
    description: 'For teams and small businesses scaling trust.',
    features: [
      { text: 'Unlimited verifications', included: true },
      { text: '24/7 Phone & Email support', included: true },
      { text: 'Advanced document hash', included: true },
      { text: 'Full API access', included: true },
      { text: 'Custom branding', included: true },
    ],
    icon: Building2,
    buttonText: 'Upgrade to Business',
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 'Custom',
    annualPrice: 'Custom',
    annualSecondary: null,
    description: 'Custom solutions for large organizations.',
    features: [
      { text: 'Dedicated infrastructure', included: true },
      { text: 'Dedicated success manager', included: true },
      { text: 'SLA guarantees', included: true },
      { text: 'On-premise deployment', included: true },
      { text: 'Custom integrations', included: true },
    ],
    icon: Crown,
    buttonText: 'Contact Sales',
  }
];

const FAQS = [
  {
    question: "What exactly is a 'verification'?",
    answer: "A verification occurs every time you upload a document to be hashed and anchored to the blockchain through NotaryChain. Checking an existing document is always free and doesn't count against your quota."
  },
  {
    question: "Can I upgrade or downgrade my plan at any time?",
    answer: "Yes! You can change your plan at any time from your account settings. Upgrades take effect immediately, while downgrades take effect at the start of your next billing cycle."
  },
  {
    question: "How does the annual discount work?",
    answer: "When you choose annual billing, you pay upfront for the whole year and receive a 20% discount compared to the monthly price."
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a 14-day money-back guarantee for all paid plans. If you're not satisfied, just let us know and we'll issue a full refund."
  }
];

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);
  const { currentPlanKey } = usePlan();

  const handleUpgradeClick = (planKey) => {
    if (planKey === currentPlanKey) return;
    toast('Coming Soon!', { icon: '🚀' });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F4] py-20 px-4 sm:px-6 lg:px-8 font-sans text-[#2E2A26]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-6"
          >
            Simple, transparent pricing
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-[#55504B] mb-10"
          >
            NotaryChain provides the digital trust infrastructure for the modern web. 
            Choose the plan that fits your scale.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-4"
          >
            <span className={`text-sm font-medium ${!isAnnual ? 'text-[#2E2A26]' : 'text-[#7B746E]'}`}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:ring-offset-2"
              style={{ backgroundColor: isAnnual ? '#2D6A4F' : '#E8E2DA' }}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAnnual ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${isAnnual ? 'text-[#2E2A26]' : 'text-[#7B746E]'}`}>Annual</span>
              <span className="inline-flex items-center rounded-full bg-[#F0FAF5] px-2.5 py-0.5 text-xs font-semibold text-[#2D6A4F] border border-[#B3E4CC]">
                Save 20%
              </span>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {PRICING_DATA.map((plan, index) => {
            const Icon = plan.icon;
            const isCurrent = plan.key === currentPlanKey;
            
            return (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`relative flex flex-col rounded-2xl bg-white p-8 shadow-sm ring-1 ${plan.recommended ? 'ring-2 ring-[#2D6A4F] shadow-lg md:-translate-y-4' : 'ring-[#E8E2DA]'}`}
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#2D6A4F] px-3 py-1 text-xs font-semibold text-white shadow-sm">
                      <Sparkles className="h-3 w-3" />
                      Recommended
                    </span>
                  </div>
                )}
                
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${plan.recommended ? 'bg-[#F0FAF5] text-[#2D6A4F]' : 'bg-[#FAF8F4] text-[#55504B]'}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#2E2A26]">{plan.name}</h3>
                  </div>
                  <p className="text-sm text-[#55504B]">{plan.description}</p>
                </div>
                
                <div className="mb-8 min-h-[60px]">
                  <div className="flex items-baseline text-4xl font-bold text-[#2E2A26]">
                    {isAnnual ? plan.annualPrice : plan.monthlyPrice}
                    {plan.monthlyPrice !== 'Custom' && (
                      <span className="text-base font-medium text-[#7B746E] ml-1">
                        {isAnnual ? '/year' : '/mo'}
                      </span>
                    )}
                  </div>
                  {isAnnual && plan.annualSecondary && (
                    <p className="text-xs text-[#7B746E] mt-1.5 font-medium">
                      {plan.annualSecondary}
                    </p>
                  )}
                </div>
                
                <ul className="flex-1 space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      {feature.included ? (
                        <Check className="h-5 w-5 shrink-0 text-[#2D6A4F]" />
                      ) : (
                        <X className="h-5 w-5 shrink-0 text-[#E8E2DA]" />
                      )}
                      <span className={feature.included ? 'text-[#2E2A26]' : 'text-[#7B746E]'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => handleUpgradeClick(plan.key)}
                  disabled={isCurrent}
                  className={`w-full rounded-lg px-4 py-3 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2D6A4F] ${
                    isCurrent 
                      ? 'bg-[#F0FAF5] text-[#2D6A4F] border border-[#B3E4CC] cursor-default'
                      : plan.recommended
                        ? 'bg-[#2D6A4F] text-white hover:bg-[#1B4532]'
                        : 'bg-white text-[#2E2A26] ring-1 ring-inset ring-[#E8E2DA] hover:bg-[#FAF8F4]'
                  }`}
                >
                  {isCurrent ? 'Current Plan' : plan.buttonText}
                </button>
              </motion.div>
            );
          })}
        </div>
        
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-[#2E2A26]">Frequently asked questions</h2>
          </div>
          <div className="space-y-6">
            {FAQS.map((faq, index) => (
              <div key={index} className="rounded-2xl bg-white p-6 ring-1 ring-[#E8E2DA] shadow-sm">
                <h3 className="text-base font-semibold leading-7 text-[#2E2A26] mb-2">{faq.question}</h3>
                <p className="text-sm leading-6 text-[#55504B]">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
