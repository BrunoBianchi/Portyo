export const PLAN_LIMITS = {
    free: {
        bios: 1,
        qrcodesPerBio: 4,
        automationsPerBio: 0,
        emailTemplatesPerBio: 0,
        emailCollection: false,
        removeBranding: false,
        customDomain: false,
        seoSettings: false,
        scheduler: false,
        autoPost: false,
        autoPostPerMonth: 0,
        storeFee: 0.03, // 3%
        analytics: 'basic', // basic or advanced
        integrations: 'limited',
        formsPerBio: 1,
    },
    standard: {
        bios: 2,
        qrcodesPerBio: 8,
        automationsPerBio: 2,
        emailTemplatesPerBio: 2,
        emailCollection: true,
        removeBranding: true,
        customDomain: true,
        seoSettings: true,
        scheduler: false,
        autoPost: false,
        autoPostPerMonth: 0,
        storeFee: 0.01, // 1%
        analytics: 'advanced', // Google and Facebook analytics
        integrations: 'full', // More customizations
        formsPerBio: 2,
    },
    pro: {
        bios: 5,
        qrcodesPerBio: 12,
        automationsPerBio: 4,
        emailTemplatesPerBio: 4,
        emailCollection: true,
        removeBranding: true,
        customDomain: true,
        seoSettings: true, // Everything from standard
        scheduler: true,
        autoPost: true,
        autoPostPerMonth: 10,
        storeFee: 0,
        analytics: 'advanced',
        integrations: 'full',
        formsPerBio: 3,
    },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;
