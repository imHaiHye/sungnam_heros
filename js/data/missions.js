// Mission and badge catalogs. Display text lives in the locale files, keyed by id.

export const MISSION_TYPES = ['pink', 'green', 'yellow'];
export const LEVELS = ['easy', 'medium', 'hard'];

export const LEVEL_POINTS = { easy: 1000, medium: 2000, hard: 3000 };

export const TYPE_EMOJI = { pink: '💖', green: '💚', yellow: '💛' };

export const MISSIONS = MISSION_TYPES.flatMap((type) =>
    LEVELS.map((level) => ({
        id: `${type}.${level}`,
        type,
        level,
        points: LEVEL_POINTS[level],
    }))
);

export function findMission(id) {
    return MISSIONS.find((m) => m.id === id) ?? null;
}

// Sorted ascending by points; badgeProgress() relies on this order.
export const BADGES = [
    { level: 0, points: 0, icon: '🌱' },
    { level: 1, points: 1000, icon: '🌿' },
    { level: 2, points: 10000, icon: '🌷' },
    { level: 3, points: 30000, icon: '🌳' },
    { level: 4, points: 50000, icon: '🍎' },
    { level: 5, points: 100000, icon: '👑' },
];

export const KEYWORDS = ['love', 'thanks', 'pretty', 'best', 'happy', 'precious'];
export const MAX_KEYWORDS = 3;

export const REACTIONS = [
    { key: 'smile', emoji: '😊' },
    { key: 'happy', emoji: '🥰' },
    { key: 'surprised', emoji: '😳' },
    { key: 'shy', emoji: '☺️' },
    { key: 'soso', emoji: '😐' },
];

export const REPLIES = [
    { key: 'thanks', emoji: '🙏' },
    { key: 'metoo', emoji: '😄' },
    { key: 'again', emoji: '🤝' },
];
