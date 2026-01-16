// Plan limits configuration
export const PLAN_LIMITS = {
    free: {
        name: 'Plano Free',
        urls: 10,
        clicks_per_month: 1000,
        custom_slugs: false,
        premium_slugs: false,
        analytics: 'basic',
        support: 'email'
    },
    pro: {
        name: 'Plano Pro',
        urls: 100,
        clicks_per_month: 50000,
        custom_slugs: true,
        premium_slugs: false,
        analytics: 'advanced',
        support: 'priority'
    },
    business: {
        name: 'Plano Business',
        urls: Infinity,
        clicks_per_month: Infinity,
        custom_slugs: true,
        premium_slugs: true,
        analytics: 'complete',
        support: '24/7',
        api_access: true
    }
};

export const getPlanLimit = (plan: string) => {
    return PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;
};

export const getPlanName = (plan: string) => {
    const planConfig = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS];
    return planConfig?.name || 'Plano Free';
};

export const canCreateUrl = (currentCount: number, plan: string, customLimit?: number) => {
    // Admin override: se customLimit for definido, usa ele
    if (customLimit !== undefined && customLimit !== null) {
        return currentCount < customLimit;
    }

    const limit = getPlanLimit(plan).urls;
    if (limit === Infinity) return true;
    return currentCount < limit;
};

export const getUrlLimit = (plan: string, customLimit?: number) => {
    // Admin override
    if (customLimit !== undefined && customLimit !== null) {
        return customLimit;
    }

    return getPlanLimit(plan).urls;
};

export const formatLimit = (limit: number) => {
    if (limit === Infinity) return '∞';
    return limit.toString();
};
