/**
 * Sattolo's algorithm: a uniformly random *cyclic* permutation. A cycle of
 * length n has no fixed points, so in the role-swap game nobody is ever
 * assigned their own role. (A plain Fisher-Yates shuffle would allow that, and
 * rotating the list by a random offset only reaches n-1 of the (n-1)! cycles.)
 */
export function sattolo(items, rng = Math.random) {
    const a = [...items];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * i); // 0 <= j < i, never i itself
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/** Small seeded PRNG so shuffles are reproducible in tests. */
export function mulberry32(seed) {
    let s = seed >>> 0;
    return () => {
        s = (s + 0x6d2b79f5) >>> 0;
        let t = s;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
