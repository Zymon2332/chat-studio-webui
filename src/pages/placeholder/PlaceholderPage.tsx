export function PlaceholderPage({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground mt-2">{description ?? `${title}功能开发中...`}</p>
      </div>
    </div>
  );
}
