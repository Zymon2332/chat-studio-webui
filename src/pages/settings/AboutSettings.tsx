import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AboutSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">关于</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>应用信息</CardTitle>
          <CardDescription>Chat-Studio 版本信息</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>版本:</strong> 1.0.0</p>
            <p><strong>构建时间:</strong> 2024</p>
            <p className="text-muted-foreground">更多应用信息将在这里展示...</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>许可证</CardTitle>
          <CardDescription>开源许可证信息</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">许可证信息将在这里展示...</p>
        </CardContent>
      </Card>
    </div>
  );
}
