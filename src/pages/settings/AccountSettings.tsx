import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AccountSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">账号设置</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>个人信息</CardTitle>
          <CardDescription>管理您的账号信息</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">个人信息表单将在这里...</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>修改密码</CardTitle>
          <CardDescription>更新您的登录密码</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">密码修改表单将在这里...</p>
        </CardContent>
      </Card>
    </div>
  );
}
