'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';

const Scene = dynamic(
  () => import('@/components/Scene'),
  {
    ssr: false,
    loading: () => <div className="h-full w-full bg-slate-900" />,
  }
);

const DEFAULT_MAX_CAPACITY = 100;
const MIN_CAPACITY = 1;
const MAX_CAPACITY_LIMIT = 500;
const STORAGE_CHANGE_EVENT = 'marble-storage-change';

type StorageState = {
  marbles: number[];
  marbleIdCounter: number;
  maxCapacity: number;
};

const EMPTY_STORAGE_STATE: StorageState = {
  marbles: [],
  marbleIdCounter: 0,
  maxCapacity: DEFAULT_MAX_CAPACITY,
};

const EMPTY_STORAGE_SNAPSHOT = JSON.stringify(EMPTY_STORAGE_STATE);

function readStoredMarbles() {
  const saved = localStorage.getItem('marbles');

  if (!saved) {
    return [];
  }

  try {
    const parsed = JSON.parse(saved);

    if (Array.isArray(parsed) && parsed.every((id) => Number.isInteger(id))) {
      return parsed;
    }
  } catch {
    localStorage.removeItem('marbles');
  }

  return [];
}

function readStoredCounter(fallback: number) {
  const savedCounter = localStorage.getItem('marbleCounter');
  const parsedCounter = savedCounter ? Number.parseInt(savedCounter, 10) : NaN;

  return Number.isInteger(parsedCounter) && parsedCounter >= 0
    ? parsedCounter
    : fallback;
}

function readStoredCapacity() {
  const savedCapacity = localStorage.getItem('marbleMaxCapacity');
  const parsedCapacity = savedCapacity ? Number.parseInt(savedCapacity, 10) : NaN;

  if (!Number.isInteger(parsedCapacity)) {
    return DEFAULT_MAX_CAPACITY;
  }

  return Math.min(Math.max(parsedCapacity, MIN_CAPACITY), MAX_CAPACITY_LIMIT);
}

function readStorageState(): StorageState {
  const marbles = readStoredMarbles();
  const nextCounter = marbles.length > 0 ? Math.max(...marbles) + 1 : 0;

  return {
    marbles,
    marbleIdCounter: readStoredCounter(nextCounter),
    maxCapacity: readStoredCapacity(),
  };
}

function getStorageSnapshot() {
  return JSON.stringify(readStorageState());
}

function subscribeToStorage(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(STORAGE_CHANGE_EVENT, callback);

  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(STORAGE_CHANGE_EVENT, callback);
  };
}

function writeStorageState({ marbles, marbleIdCounter, maxCapacity }: StorageState) {
  localStorage.setItem('marbles', JSON.stringify(marbles));
  localStorage.setItem('marbleCounter', marbleIdCounter.toString());
  localStorage.setItem('marbleMaxCapacity', maxCapacity.toString());
  window.dispatchEvent(new Event(STORAGE_CHANGE_EVENT));
}

function isEditableTarget(target: EventTarget | null) {
  return target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLElement && target.isContentEditable;
}

export default function MarbleJarApp() {
  const storageSnapshot = useSyncExternalStore(
    subscribeToStorage,
    getStorageSnapshot,
    () => EMPTY_STORAGE_SNAPSHOT
  );
  const { marbles, marbleIdCounter, maxCapacity } = JSON.parse(storageSnapshot) as StorageState;
  const isFull = marbles.length >= maxCapacity;

  const addMarble = useCallback(() => {
    if (isFull) {
      return;
    }

    writeStorageState({
      marbles: [...marbles, marbleIdCounter],
      marbleIdCounter: marbleIdCounter + 1,
      maxCapacity,
    });
  }, [isFull, marbleIdCounter, marbles, maxCapacity]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || event.repeat || isEditableTarget(event.target)) {
        return;
      }

      event.preventDefault();
      addMarble();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [addMarble]);

  const clearMarbles = () => {
    writeStorageState({
      marbles: [],
      marbleIdCounter: 0,
      maxCapacity,
    });
  };

  const applyCapacity = (formData: FormData) => {
    const rawCapacity = formData.get('capacity');
    const parsedCapacity = Number.parseInt(String(rawCapacity), 10);
    const nextCapacity = Number.isInteger(parsedCapacity)
      ? Math.min(Math.max(parsedCapacity, MIN_CAPACITY), MAX_CAPACITY_LIMIT)
      : DEFAULT_MAX_CAPACITY;
    const nextMarbles = marbles.slice(0, nextCapacity);

    writeStorageState({
      marbles: nextMarbles,
      marbleIdCounter,
      maxCapacity: nextCapacity,
    });
  };

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-slate-900">
      <div className="absolute inset-0 z-0">
        <Scene key={maxCapacity} marbles={marbles} maxCapacity={maxCapacity} />
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-between p-8">
        <div className="pointer-events-auto text-center">
          <h1 className="mb-2 text-4xl font-bold text-white">Marble Jar</h1>
          <div className="flex flex-wrap items-center justify-center gap-3 text-lg text-cyan-400">
            <span>
              Marbles: <span className={isFull ? 'font-bold text-red-500' : ''}>{marbles.length}</span> / {maxCapacity}
            </span>
            <form
              key={maxCapacity}
              onSubmit={(event) => {
                event.preventDefault();
                applyCapacity(new FormData(event.currentTarget));
              }}
              className="flex items-center gap-2 text-sm text-cyan-100"
            >
              <label htmlFor="capacity">Capacity</label>
              <input
                id="capacity"
                name="capacity"
                type="number"
                min={MIN_CAPACITY}
                max={MAX_CAPACITY_LIMIT}
                defaultValue={maxCapacity}
                className="w-24 rounded-md border border-cyan-300/40 bg-slate-950/80 px-2 py-1 text-center text-cyan-50 outline-none focus:border-cyan-300"
              />
              <button
                type="submit"
                className="rounded-md bg-cyan-500 px-3 py-1 font-bold text-white transition hover:bg-cyan-600 active:scale-95"
              >
                Apply
              </button>
            </form>
          </div>
        </div>

        <div className="pointer-events-auto flex flex-col gap-4">
          <button
            onClick={addMarble}
            disabled={isFull}
            className={`rounded-lg px-8 py-3 text-lg font-bold transition-all ${
              isFull
                ? 'cursor-not-allowed bg-gray-500 text-gray-300'
                : 'bg-cyan-500 text-white hover:bg-cyan-600 active:scale-95'
            }`}
          >
            {isFull ? 'Jar is Full!' : 'Add Marble'}
          </button>
          <button
            onClick={clearMarbles}
            className="rounded-lg bg-slate-300 px-8 py-2 font-bold text-slate-900 transition-all hover:bg-slate-400 active:scale-95"
          >
            Clear
          </button>
        </div>
      </div>
    </main>
  );
}
