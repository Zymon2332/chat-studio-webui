import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Session } from "@/types/session";
import { getSessionList } from "@/lib/session";

interface SessionContextType {
  sessions: Session[];
  isLoading: boolean;
  addSession: (sessionId: string, title: string) => void;
  fetchSessions: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getSessionList();
      const sorted = data.sort((a, b) => b.updatedAt - a.updatedAt);
      setSessions(sorted);
    } catch {
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addSession = useCallback((sessionId: string, title: string) => {
    const newSession: Session = {
      sessionId,
      sessionTitle: title,
      updatedAt: Date.now(),
    };
    setSessions(prev => [newSession, ...prev]);
  }, []);

  return (
    <SessionContext.Provider value={{ sessions, isLoading, addSession, fetchSessions }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
