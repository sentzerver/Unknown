import { useState, useCallback, useEffect } from 'react';
import { SchemeOfWorkEntry } from '@/lib/curriculum-types';
export interface HistoryEntry {
  id: string;
  timestamp: number;
  schemeData: SchemeOfWorkEntry[];
  customization: {
    grade: string;
    subject: string;
    term: string;
    weeks: number;
  };
}
const STORAGE_KEY = 'elimuplan_history';
export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(STORAGE_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load history from local storage:", error);
      setHistory([]);
    }
  }, []);
  const saveHistory = (newHistory: HistoryEntry[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      setHistory(newHistory);
    } catch (error) {
      console.error("Failed to save history to local storage:", error);
    }
  };
  const addHistoryEntry = useCallback((entryData: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
    const newEntry: HistoryEntry = {
      ...entryData,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    setHistory(prevHistory => {
      const updatedHistory = [newEntry, ...prevHistory].slice(0, 10); // Keep last 10 entries
      saveHistory(updatedHistory);
      return updatedHistory;
    });
  }, []);
  const deleteHistoryEntry = useCallback((id: string) => {
    setHistory(prevHistory => {
      const updatedHistory = prevHistory.filter(entry => entry.id !== id);
      saveHistory(updatedHistory);
      return updatedHistory;
    });
  }, []);
  const clearHistory = useCallback(() => {
    saveHistory([]);
  }, []);
  return { history, addHistoryEntry, deleteHistoryEntry, clearHistory };
}