export const PLAN_LIMITS = {
    free: {
        bios: 1,
        automationsPerBio: 0,
        emailTemplatesPerBio: 0,
        emailCollection: false,
        removeBranding: false,
        customDomain: false,
        seoSettings: false,
        storeFee: 0.025, // 2.5%
        analytics: 'basic', // basic or advanced
        integrations: 'limited'
    },
    standard: {
        bios: 3,
        automationsPerBio: 2,
        emailTemplatesPerBio: 2,
        emailCollection: true,
        removeBranding: true,
        customDomain: true,
        seoSettings: true,
        storeFee: 0.025, // 2.5%
        analytics: 'advanced', // Google and Facebook analytics
        integrations: 'full' // More customizations
    },
    pro: {
        bios: 6,
        automationsPerBio: 4,
        emailTemplatesPerBio: 4,
        emailCollection: true,
        removeBranding: true,
        customDomain: true,
        seoSettings: true, // Everything from standard
        storeFee: 0,
        analytics: 'advanced',
        integrations: 'full'
    }
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;
