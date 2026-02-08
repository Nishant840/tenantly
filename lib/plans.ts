export const PLAN_LIMITS = {
    FREE: {
        projects: 2,
    },
    PRO:{
        projects: 20,
    },
    ENTERPRISE:{
        projects: Infinity
    },
} as const;