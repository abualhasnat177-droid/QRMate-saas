/**
 * Plan Guard Middleware
 * Feature gating based on user plan.
 */

type Plan = 'FREE' | 'PRO' | 'BUSINESS';

const PLAN_HIERARCHY: Record<Plan, number> = {
  FREE: 0,
  PRO: 1,
  BUSINESS: 2,
};

export interface PlanLimits {
  dynamicQRLimit: number;       // -1 = unlimited
  bulkRowLimit: number;         // 0 = no access, -1 = unlimited
  apiCallsPerMonth: number;     // 0 = no access
  analyticsAccess: 'count_only' | 'full' | 'full_export';
  exportFormats: string[];
  canWhiteLabel: boolean;
  teamSeats: number;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  FREE: {
    dynamicQRLimit: 5,
    bulkRowLimit: 0,
    apiCallsPerMonth: 0,
    analyticsAccess: 'count_only',
    exportFormats: ['png'],
    canWhiteLabel: false,
    teamSeats: 1,
  },
  PRO: {
    dynamicQRLimit: -1,
    bulkRowLimit: 100,
    apiCallsPerMonth: 1000,
    analyticsAccess: 'full',
    exportFormats: ['png', 'svg', 'pdf'],
    canWhiteLabel: false,
    teamSeats: 1,
  },
  BUSINESS: {
    dynamicQRLimit: -1,
    bulkRowLimit: -1,
    apiCallsPerMonth: 50000,
    analyticsAccess: 'full_export',
    exportFormats: ['png', 'svg', 'pdf'],
    canWhiteLabel: true,
    teamSeats: 5,
  },
};

/**
 * Check if the user's plan meets or exceeds the required plan level.
 */
export function hasPlanAccess(userPlan: string, requiredPlan: Plan): boolean {
  const userLevel = PLAN_HIERARCHY[userPlan as Plan] ?? 0;
  const requiredLevel = PLAN_HIERARCHY[requiredPlan] ?? 0;
  return userLevel >= requiredLevel;
}

/**
 * Get limits for a given plan.
 */
export function getPlanLimits(plan: string): PlanLimits {
  return PLAN_LIMITS[plan as Plan] || PLAN_LIMITS.FREE;
}

/**
 * Fastify preHandler factory — blocks request if plan is insufficient.
 * Usage: { preValidation: [authenticate, requirePlan('PRO')] }
 */
export function requirePlan(requiredPlan: Plan) {
  return async (request: any, reply: any) => {
    const userPlan = request.user?.plan || 'FREE';
    if (!hasPlanAccess(userPlan, requiredPlan)) {
      return reply.status(403).send({
        error: 'Plan upgrade required',
        requiredPlan,
        currentPlan: userPlan,
        message: `This feature requires a ${requiredPlan} plan or higher. Upgrade at /billing.`,
      });
    }
  };
}
