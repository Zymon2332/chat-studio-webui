import { createContext, useContext } from "react";

interface AgentReasoningContextType {
  openAgentReasoning: (toolRequestId: string) => void;
}

const AgentReasoningContext = createContext<AgentReasoningContextType>({
  openAgentReasoning: () => {},
});

export function useAgentReasoning() {
  return useContext(AgentReasoningContext);
}

export { AgentReasoningContext };
