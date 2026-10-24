// Discovery Progress Tracker for The Archive
// In-Memory Runtime State ONLY - Resets on Browser Refresh

export type DiscoveryKey = 'letter' | 'memories' | 'audio' | 'raven' | 'drawer' | 'forbidden';

const ARCHIVE_DISCOVERIES_KEY = 'birthdayWebsite_archive_discoveries';

function loadPersistedDiscoveries(): Set<DiscoveryKey> {
  const set = new Set<DiscoveryKey>();
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(ARCHIVE_DISCOVERIES_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          arr.forEach((k: string) => {
            if (['letter', 'memories', 'audio', 'raven', 'drawer', 'forbidden'].includes(k)) {
              set.add(k as DiscoveryKey);
            }
          });
        }
      }
      // Also check persistent chest unlock status
      if (localStorage.getItem('birthdayWebsite_chestUnlocked') === 'true') {
        set.add('forbidden');
      }
    } catch {
      // Ignore storage access errors
    }
  }
  return set;
}

const inMemoryDiscoveredSet = loadPersistedDiscoveries();

function persistDiscoveries(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(ARCHIVE_DISCOVERIES_KEY, JSON.stringify(Array.from(inMemoryDiscoveredSet)));
    } catch {
      // Ignore storage access errors
    }
  }
}

export function getDiscoveredSet(): Set<DiscoveryKey> {
  if (typeof window !== 'undefined') {
    if (localStorage.getItem('birthdayWebsite_chestUnlocked') === 'true') {
      inMemoryDiscoveredSet.add('forbidden');
    }
  }
  return new Set(inMemoryDiscoveredSet);
}

export function isDiscovered(key: DiscoveryKey): boolean {
  if (key === 'forbidden' && typeof window !== 'undefined') {
    if (localStorage.getItem('birthdayWebsite_chestUnlocked') === 'true') {
      inMemoryDiscoveredSet.add('forbidden');
    }
  }
  return inMemoryDiscoveredSet.has(key);
}

export function markDiscovered(key: DiscoveryKey): number {
  inMemoryDiscoveredSet.add(key);
  persistDiscoveries();
  return inMemoryDiscoveredSet.size;
}

export function getDiscoveredCount(): number {
  if (typeof window !== 'undefined') {
    if (localStorage.getItem('birthdayWebsite_chestUnlocked') === 'true') {
      inMemoryDiscoveredSet.add('forbidden');
    }
  }
  return inMemoryDiscoveredSet.size;
}

export function unmarkDiscovered(key: DiscoveryKey): void {
  inMemoryDiscoveredSet.delete(key);
  persistDiscoveries();
}

export function resetDiscoveries(): void {
  inMemoryDiscoveredSet.clear();
  owlMemory1Unlocked = false;
  owlMemory2Unlocked = false;
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(ARCHIVE_DISCOVERIES_KEY);
      localStorage.removeItem('birthdayWebsite_chestUnlocked');
      localStorage.removeItem('birthdayWebsite_keyAcquired');
    } catch {
      // Ignore storage errors
    }
  }
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

