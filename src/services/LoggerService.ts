import type { AssessmentLog, EventType } from "../types/types";


const STORAGE_KEY = 'secure_test_logs';
const BACKEND_URL = 'http://localhost:5000/api/assessments';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'failed';
type StatusListener = (status: SyncStatus) => void;

// Module-level state (Internal)
let attemptId = `ATT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
let logs: AssessmentLog[] = [];
let isImmutable = false;
let syncStatus: SyncStatus = 'idle';
let listeners: StatusListener[] = [];

// Initialize from storage immediately
const loadFromStorage = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.attemptId) {
        attemptId = parsed.attemptId;
        logs = parsed.logs || [];
      }
    } catch (e) {
      console.error("Failed to load logs from storage", e);
    }
  }
};

loadFromStorage();

const saveToStorage = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ attemptId, logs }));
};

const setSyncStatus = (status: SyncStatus) => {
  syncStatus = status;
  listeners.forEach(l => l(status));
};

export const getAttemptId = () => attemptId;

export const getSyncStatus = () => syncStatus;

export const subscribeToSyncStatus = (listener: StatusListener) => {
  listeners.push(listener);
  listener(syncStatus);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
};

export const syncLogs = async () => {
  if (logs.length === 0 || isImmutable) return;
  
  setSyncStatus('syncing');
  
  try {
    const response = await fetch(`${BACKEND_URL}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attemptId, logs })
    });
    
    if (!response.ok) throw new Error('Backend sync failed');
    
    setSyncStatus('synced');
  } catch (err) {
    setSyncStatus('failed');
    console.warn(`[Sync Error] Backend unreachable. Data safe in LocalStorage.`);
  }
};

export const logEvent = (type: EventType, metadata: any = {}, questionId?: string) => {
  if (isImmutable) return;

  const entry: AssessmentLog = {
    id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    type,
    timestamp: Date.now(),
    attemptId,
    questionId,
    metadata,
  };

  logs.push(entry);
  saveToStorage();
  syncLogs();
};

export const submitAssessment = async (answers: any) => {
  setSyncStatus('syncing');
  try {
    const response = await fetch(`${BACKEND_URL}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attemptId, answers, logs })
    });
    
    if (!response.ok) throw new Error('Final submission failed');
    
    isImmutable = true;
    setSyncStatus('synced');
    return true;
  } catch (err) {
    setSyncStatus('failed');
    throw err;
  }
};

export const getAllLogs = (): AssessmentLog[] => [...logs];

export const resetLogger = () => {
  logs = [];
  attemptId = `ATT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  isImmutable = false;
  setSyncStatus('idle');
  localStorage.removeItem(STORAGE_KEY);
  saveToStorage();
};
