interface BrandMarkProps {
  className?: string;
}

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* 对话气泡 */}
      <path
        d="M16 4C9.9 4 5 8.7 5 14.5c0 3.1 1.6 5.9 4.1 7.7V26l4.2-2.3c.9.1 1.8.2 2.7.2 6.1 0 11-4.7 11-10.5S22.1 4 16 4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* 智能体节点 */}
      <circle cx="16" cy="14.5" r="2.6" fill="currentColor" />
      {/* 轨道环 */}
      <circle
        cx="16"
        cy="14.5"
        r="5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="3 3"
        opacity="0.55"
      />
    </svg>
  );
}
