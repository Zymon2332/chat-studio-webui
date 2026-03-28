import type { KnowledgeBaseConfig } from '../types';
import { RetrievalConfigForm } from './RetrievalConfigForm';

interface RetrievalConfigTabProps {
  config: KnowledgeBaseConfig;
  onChange: (config: KnowledgeBaseConfig) => void;
}

export function RetrievalConfigTab({ config, onChange }: RetrievalConfigTabProps) {
  return (
    <div className="max-w-2xl">
      <RetrievalConfigForm config={config} onChange={onChange} />
    </div>
  );
}
