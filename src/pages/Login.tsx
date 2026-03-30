import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { sendVerificationCode, register } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // Tab 切换状态
  const [activeTab, setActiveTab] = useState('login');
  
  // 登录表单状态
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 注册表单状态
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerError, setRegisterError] = useState('');

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!loginEmail) {
      setError('请输入邮箱');
      return;
    }
    if (!validateEmail(loginEmail)) {
      setError('请输入有效的邮箱地址');
      return;
    }
    if (!loginPassword) {
      setError('请输入密码');
      return;
    }

    setIsLoading(true);
    try {
      await login({
        email: loginEmail,
        password: loginPassword,
        rememberMe,
      });
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendVerificationCode = async () => {
    if (!registerEmail) {
      setRegisterError('请先输入邮箱');
      return;
    }
    if (!validateEmail(registerEmail)) {
      setRegisterError('请输入有效的邮箱地址');
      return;
    }

    setIsSendingCode(true);
    setRegisterError('');
    try {
      await sendVerificationCode(registerEmail);
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setRegisterError(err instanceof Error ? err.message : '发送验证码失败，请重试');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');

    if (!registerEmail) {
      setRegisterError('请输入邮箱');
      return;
    }
    if (!validateEmail(registerEmail)) {
      setRegisterError('请输入有效的邮箱地址');
      return;
    }
    if (!registerPassword) {
      setRegisterError('请输入密码');
      return;
    }
    if (registerPassword.length < 6) {
      setRegisterError('密码长度至少为6位');
      return;
    }
    if (registerPassword !== confirmPassword) {
      setRegisterError('两次输入的密码不一致');
      return;
    }
    if (!verificationCode) {
      setRegisterError('请输入验证码');
      return;
    }

    setIsRegistering(true);
    try {
      await register({
        email: registerEmail,
        pwd: registerPassword,
        captcha: verificationCode,
        inviteCode: inviteCode || undefined
      });
      // 注册成功后切换到登录页
      setLoginEmail(registerEmail);
      setLoginPassword(registerPassword);
      setRegisterEmail('');
      setRegisterPassword('');
      setConfirmPassword('');
      setVerificationCode('');
      setInviteCode('');
      setError('注册成功，请直接登录');
      // 自动切换到登录 Tab
      setActiveTab('login');
    } catch (err) {
      setRegisterError(err instanceof Error ? err.message : '注册失败，请重试');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* 左侧 - 品牌区域 */}
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden">
        {/* 渐变背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
          {/* 动态光效 */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          </div>
          
          {/* 网格背景 */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />
        </div>
        
        {/* 品牌内容 */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-white mb-6 tracking-tight">
              Chat Studio
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-6 rounded-full">
            </div>
            <p className="text-2xl text-slate-300 font-light">
              智能对话，无限可能
            </p>
          </div>
        </div>
      </div>

      {/* 右侧 - 登录/注册表单 */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-8 bg-slate-50">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">欢迎</CardTitle>
            <CardDescription className="text-center">
              登录或注册您的账号
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">登录</TabsTrigger>
                <TabsTrigger value="register">注册</TabsTrigger>
              </TabsList>
              
              {/* 登录表单 */}
              <TabsContent value="login">
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">邮箱</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">密码</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="输入您的密码"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      disabled={isLoading}
                    />
                    <Label htmlFor="remember" className="text-sm font-normal">
                      记住我
                    </Label>
                  </div>

                  {error && (
                    <div className="text-sm text-red-500 text-center">{error}</div>
                  )}

                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        登录中...
                      </>
                    ) : (
                      '登录'
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              {/* 注册表单 */}
              <TabsContent value="register">
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-email">邮箱</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="your@email.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      disabled={isRegistering}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password">密码</Label>
                    <div className="relative">
                      <Input
                        id="register-password"
                        type={showRegisterPassword ? 'text' : 'password'}
                        placeholder="设置密码（至少6位）"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        disabled={isRegistering}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showRegisterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">确认密码</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="再次输入密码"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isRegistering}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="verification-code">验证码</Label>
                    <div className="flex gap-2">
                      <Input
                        id="verification-code"
                        type="text"
                        placeholder="请输入验证码"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        disabled={isRegistering}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSendVerificationCode}
                        disabled={countdown > 0 || isSendingCode || isRegistering}
                        className="whitespace-nowrap"
                      >
                        {isSendingCode ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : countdown > 0 ? (
                          `${countdown}秒后重试`
                        ) : (
                          '发送验证码'
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="invite-code">邀请码（选填）</Label>
                    <Input
                      id="invite-code"
                      type="text"
                      placeholder="请输入邀请码（可选）"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      disabled={isRegistering}
                    />
                  </div>

                  {registerError && (
                    <div className="text-sm text-red-500 text-center">{registerError}</div>
                  )}

                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={isRegistering}
                  >
                    {isRegistering ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        注册中...
                      </>
                    ) : (
                      '注册'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
