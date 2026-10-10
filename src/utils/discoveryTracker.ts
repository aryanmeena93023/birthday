// Discovery Progress Tracker for The Archive
// In-Memory Runtime State ONLY - Resets on Browser Refresh

export type DiscoveryKey = 'letter' | 'memories' | 'audio' | 'raven' | 'drawer' | 'forbidden';

const LEGACY_STORAGE_KEY = 'archive_discoveries_v1';

// In-memory runtime state that survives route navigation but resets on page refresh
const inMemoryDiscoveredSet = new Set<DiscoveryKey>();

// Automatically clean up old persistent keys if present from previous builds
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // Ignore storage access errors
  }
}

export function getDiscoveredSet(): Set<DiscoveryKey> {
  return new Set(inMemoryDiscoveredSet);
}

export function isDiscovered(key: DiscoveryKey): boolean {
  return inMemoryDiscoveredSet.has(key);
}

export function markDiscovered(key: DiscoveryKey): number {
  inMemoryDiscoveredSet.add(key);
  return inMemoryDiscoveredSet.size;
}

export function getDiscoveredCount(): number {
  return inMemoryDiscoveredSet.size;
}

export function resetDiscoveries(): void {
  inMemoryDiscoveredSet.clear();
}

let owlMemory1Unlocked = false;
let owlMemory2Unlocked = false;

export function setOwlMemoryUnlocked(memoryNum: 1 | 2, unlocked = true): void {
  if (memoryNum === 1) {
    owlMemory1Unlocked = unlocked;
  } else if (memoryNum === 2) {
    if (unlocked) owlMemory1Unlocked = true;
    owlMemory2Unlocked = unlocked;
  }
}

export function getOwlMemoryUnlockedState(): { unlocked1: boolean; unlocked2: boolean } {
  return { unlocked1: owlMemory1Unlocked, unlocked2: owlMemory2Unlocked };
}

