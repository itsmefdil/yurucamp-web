import { db } from '../db';
import { users } from '../db/schema';
import { eq, sql } from 'drizzle-orm';

// Level names based on EXP
const LEVEL_NAMES: Record<number, string> = {
    1: 'Camper Pemula',
    2: 'Camper Muda',
    3: 'Camper Berpengalaman',
    4: 'Camper Ahli',
    5: 'Master Camper',
};

/**
 * Calculate level from total EXP (every 5 EXP = 1 level up)
 */
export function calculateLevel(exp: number): number {
    return Math.floor(exp / 5) + 1;
}

/**
 * Get level name based on level number
 */
export function getLevelName(level: number): string {
    if (level >= 6) return 'Legend Camper';
    return LEVEL_NAMES[level] || 'Camper Pemula';
}

/**
 * Award EXP to user and update level if needed
 */
export async function awardExp(userId: string, amount: number = 1): Promise<{ exp: number; level: number; levelName: string; leveledUp: boolean }> {
    // Get current user exp
    const [user] = await db.select({ exp: users.exp, level: users.level })
        .from(users)
        .where(eq(users.id, userId));

    if (!user) {
        throw new Error('User not found');
    }

    const newExp = user.exp + amount;
    const newLevel = calculateLevel(newExp);
    const leveledUp = newLevel > user.level;

    // Update user exp and level
    await db.update(users)
        .set({
            exp: newExp,
            level: newLevel,
            updatedAt: new Date().toISOString()
        })
        .where(eq(users.id, userId));

    return {
        exp: newExp,
        level: newLevel,
        levelName: getLevelName(newLevel),
        leveledUp
    };
}

/**
 * Get user's EXP info
 */
export async function getUserExpInfo(userId: string): Promise<{ exp: number; level: number; levelName: string; expToNextLevel: number }> {
    const [user] = await db.select({ exp: users.exp, level: users.level })
        .from(users)
        .where(eq(users.id, userId));

    if (!user) {
        return { exp: 0, level: 1, levelName: 'Camper Pemula', expToNextLevel: 5 };
    }

    const expToNextLevel = (user.level * 5) - user.exp;

    return {
        exp: user.exp,
        level: user.level,
        levelName: getLevelName(user.level),
        expToNextLevel: Math.max(0, expToNextLevel)
    };
}
