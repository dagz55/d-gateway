/**
 * Constants for landing page strings to improve maintainability
 */

export const LANDING_STRINGS = {
  // Security Section
  SECURITY: {
    TITLE: "Security & Trust",
    SUBTITLE: "Your safety is our priority",
    FEATURES: [
      {
        title: "Secure Payment Processing",
        description: "All payments are processed through secure gateways to protect your financial information.",
      },
      {
        title: "Data Encryption",
        description: "Personal details are encrypted and never shared with third parties.",
      },
      {
        title: "Multi-Layer Security",
        description: "Including strong password encryption and optional 2FA.",
      },
      {
        title: "24/7 Monitoring",
        description: "Dedicated team regularly monitoring and moderating platform to protect Zignal members from scams or malicious activity.",
      },
      {
        title: "Transparent Trust",
        description: "Honest results, no hidden tricks because we prioritize building trust within our community.",
      },
    ],
  },

  // Features Section
  FEATURES: {
    TITLE: "Why Choose Zignals?",
    SUBTITLE: "Advanced trading tools designed for serious traders",
    ITEMS: [
      {
        title: "Real-Time Market Data",
        description: "Get live market updates and price alerts",
      },
      {
        title: "Advanced Analytics",
        description: "Comprehensive charts and technical analysis tools",
      },
      {
        title: "Expert Signals",
        description: "Professional trading signals from experienced traders",
      },
      {
        title: "Portfolio Management",
        description: "Track and manage your investments effectively",
      },
    ],
  },

  // CTA Section
  CTA: {
    TITLE: "Ready to Start Trading?",
    SUBTITLE: "Join thousands of successful traders on Zignals",
    PRIMARY_BUTTON: "Get Started",
    SECONDARY_BUTTON: "Learn More",
  },

  // Footer
  FOOTER: {
    COMPANY_NAME: "Zignals",
    TAGLINE: "Professional Trading Platform",
    COPYRIGHT: "© 2024 Zignals. All rights reserved.",
  },
} as const;
