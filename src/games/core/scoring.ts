// Pure scoring rules shared by the session store and by scenes that draw their own "+points"
// text (Phaser). No state, no zustand: safe to import anywhere.

/** Streak lengths where the multiplier steps up: 3 → ×2, 6 → ×3, 10 → ×4. */
export const MULTIPLIER_STEPS = [3, 6, 10] as const;

export const multiplierFor = (streak: number) => 1 + MULTIPLIER_STEPS.filter((s) => streak >= s).length;

/** A streak milestone (celebrated with sound, burst and a line): each step, then every 5 after 10. */
export const isStreakMilestone = (streak: number) =>
  (MULTIPLIER_STEPS as readonly number[]).includes(streak) || (streak > 10 && streak % 5 === 0);
