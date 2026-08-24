import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { sendVerificationCode, register } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Message, MessageContent } from '@/components/ui/message';
import { Bubble, BubbleContent } from '@/components/ui/bubble';
import { ChatToolCall } from './chat/components/ChatToolCall';
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Bot,
  Database,
  Wrench,
  Users,
  Send,
  Paperclip,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BrandMark } from '@/components/BrandMark';

type TabKey = 'login' | 'register';

const tabItems: Array<{ key: TabKey; label: string }> = [
  { key: 'login', label: '登录' },
  { key: 'register', label: '注册' },
];

const features = [
  { icon: Bot, title: '多智能体协作', desc: '编排多个智能体与团队，自动路由任务' },
  { icon: Database, title: '知识库驱动', desc: '接入文档与知识库，让回答有据可依' },
  { icon: Wrench, title: '技能扩展', desc: '通过技能与工具扩展模型能力边界' },
  { icon: Users, title: '团队协作', desc: '成员共享会话与资源，高效协同' },
];

/* ── 产品演示预览（复用真实聊天渲染组件） ── */
function DemoPreview() {
  return (
    <div className="relative w-full max-w-md animate-float select-none">
      {/* 光晕 */}
      <div className="absolute -inset-6 rounded-[28px] bg-primary/[0.04] blur-3xl" />
      <div className="relative overflow-hidden rounded-2xl border border-border bg-background shadow-[0_24px_70px_-20px_rgba(0,0,0,0.18)]">
        {/* 窗口头 */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-[#FF5F57]" />
            <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="size-2.5 rounded-full bg-[#28C840]" />
          </div>
          <span className="ml-1 flex-1 truncate text-xs font-medium text-muted-foreground">
            对话演示
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground">
            <Sparkles className="size-3 text-foreground/70" />
            GPT-4o
          </span>
        </div>

        {/* 消息区 — 使用真实 Message / Bubble / ChatToolCall */}
        <div className="space-y-4 px-4 py-4">
          {/* 用户消息 */}
          <Message align="end" className="w-fit max-w-full ml-auto">
            <MessageContent>
              <Bubble variant="default">
                <BubbleContent className="bg-primary text-primary-foreground rounded-3xl">
                  <div className="text-sm whitespace-pre-wrap wrap-break-word">
                    帮我做一个智能客服的 demo
                  </div>
                </BubbleContent>
              </Bubble>
            </MessageContent>
          </Message>

          {/* AI 消息 */}
          <Message align="start">
            <MessageContent>
              <Bubble variant="muted">
                <BubbleContent className="rounded-3xl">
                  <div className="flex flex-col gap-3">
                    <div className="text-sm text-foreground">
                      好的，我来帮你规划这个任务。
                      <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-[blink_1s_steps(2)_infinite] bg-foreground/70" />
                    </div>
                    <ChatToolCall name="联网搜索" argument="智能客服 demo 最佳实践" />
                  </div>
                </BubbleContent>
              </Bubble>
            </MessageContent>
          </Message>
        </div>

        {/* 输入条 */}
        <div className="flex items-center gap-2 border-t border-border px-3 py-2.5">
          <Paperclip className="size-4 shrink-0 text-muted-foreground/60" />
          <div className="h-9 flex-1 rounded-lg bg-muted/60 px-3 text-sm leading-9 text-muted-foreground/70">
            输入消息…
          </div>
          <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Send className="size-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface PasswordFieldProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
  disabled?: boolean;
  autoComplete?: string;
}

function PasswordField({
  id,
  label,
  placeholder,
  value,
  onChange,
  visible,
  onToggle,
  disabled = false,
  autoComplete,
}: PasswordFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          autoComplete={autoComplete}
          className="h-11 pr-10"
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? '隐藏密码' : '显示密码'}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  );
}

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [activeTab, setActiveTab] = useState<TabKey>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

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

  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const switchTab = (tab: TabKey) => {
    setActiveTab(tab);
    setError('');
    setRegisterError('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');

    if (!loginEmail) { setError('请输入邮箱'); return; }
    if (!validateEmail(loginEmail)) { setError('请输入有效的邮箱地址'); return; }
    if (!loginPassword) { setError('请输入密码'); return; }

    setIsLoading(true);
    try {
      await login({ email: loginEmail, password: loginPassword, rememberMe });
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendVerificationCode = async () => {
    if (!registerEmail) { setRegisterError('请先输入邮箱'); return; }
    if (!validateEmail(registerEmail)) { setRegisterError('请输入有效的邮箱地址'); return; }

    setIsSendingCode(true);
    setRegisterError('');
    try {
      await sendVerificationCode(registerEmail);
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            countdownTimerRef.current = null;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      countdownTimerRef.current = timer;
    } catch (err) {
      setRegisterError(err instanceof Error ? err.message : '发送验证码失败，请重试');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    if (!registerEmail) { setRegisterError('请输入邮箱'); return; }
    if (!validateEmail(registerEmail)) { setRegisterError('请输入有效的邮箱地址'); return; }
    if (!registerPassword) { setRegisterError('请输入密码'); return; }
    if (registerPassword.length < 6) { setRegisterError('密码长度至少为6位'); return; }
    if (registerPassword !== confirmPassword) { setRegisterError('两次输入的密码不一致'); return; }
    if (!verificationCode) { setRegisterError('请输入验证码'); return; }

    setIsRegistering(true);
    try {
      await register({
        email: registerEmail,
        pwd: registerPassword,
        captcha: verificationCode,
        inviteCode: inviteCode || undefined,
      });
      setLoginEmail(registerEmail);
      setLoginPassword(registerPassword);
      setRegisterEmail(''); setRegisterPassword(''); setConfirmPassword(''); setVerificationCode(''); setInviteCode('');
      setNotice('注册成功，请直接登录');
      setActiveTab('login');
    } catch (err) {
      setRegisterError(err instanceof Error ? err.message : '注册失败，请重试');
    } finally {
      setIsRegistering(false);
    }
  };

  const isLogin = activeTab === 'login';

  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* 左 - 品牌区 */}
      <div className="relative hidden lg:flex lg:w-[50%] flex-col justify-between overflow-hidden bg-background border-r border-border p-10 xl:p-14">
        {/* 氛围背景 */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-10 size-[420px] rounded-full bg-primary/[0.04] blur-3xl" />
          <div className="absolute right-0 bottom-0 size-[360px] rounded-full bg-muted blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)',
              backgroundSize: '26px 26px',
            }}
          />
        </div>

        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
              <BrandMark className="size-5" />
            </div>
            <div className="leading-tight">
              <p className="text-base font-semibold text-foreground">Chat Studio</p>
              <p className="text-xs text-muted-foreground">Agent 智能体平台</p>
            </div>
          </motion.div>
        </div>

        <div className="relative mt-8 flex flex-1 flex-col justify-center">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="max-w-md text-4xl xl:text-5xl font-semibold tracking-tight text-foreground leading-[1.12]"
          >
            构建、编排并运行你的 AI 智能体
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground"
          >
            通过对话、知识库与技能，打造可执行、可协作的智能体工作流。
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.32 }}
            className="mt-10"
          >
            <DemoPreview />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative mt-8 grid grid-cols-2 gap-x-6 gap-y-4"
        >
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="flex items-start gap-2.5">
                <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                  <Icon className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{f.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* 右 - 表单区 */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="w-full max-w-md"
        >
          <div className="mb-6 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
                <BrandMark className="size-5" />
              </div>
              <span className="text-base font-semibold text-foreground">Chat Studio</span>
            </div>
          </div>

          <Card className="shadow-sm">
            <CardContent className="p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  {isLogin ? '欢迎回来' : '创建账户'}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isLogin ? '登录以继续使用 Chat Studio' : '注册以开始构建你的智能体'}
                </p>
              </div>

              {/* Tab 切换 */}
              <div className="relative grid grid-cols-2 rounded-lg bg-muted p-1 mb-6">
                {tabItems.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => switchTab(tab.key)}
                    className="relative py-2 text-sm font-medium"
                  >
                    {activeTab === tab.key && (
                      <motion.span
                        layoutId="login-tab-bg"
                        className="absolute inset-0 rounded-md bg-background shadow-sm"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    <span className={`relative z-10 transition-colors ${
                      activeTab === tab.key ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {tab.label}
                    </span>
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {isLogin ? (
                  <motion.form
                    key="login"
                    onSubmit={handleLoginSubmit}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-sm font-medium text-foreground">邮箱</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your@email.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        disabled={isLoading}
                        autoComplete="email"
                        className="h-11"
                      />
                    </div>

                    <PasswordField
                      id="login-password"
                      label="密码"
                      placeholder="输入您的密码"
                      value={loginPassword}
                      onChange={setLoginPassword}
                      visible={showPassword}
                      onToggle={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      autoComplete="current-password"
                    />

                    <div className="flex items-center gap-2 pt-1">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked === true)}
                        disabled={isLoading}
                      />
                      <Label htmlFor="remember" className="font-normal text-sm text-muted-foreground">
                        记住我
                      </Label>
                    </div>

                    {notice && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        aria-live="polite"
                        className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-xs text-foreground"
                      >
                        <Check className="size-3.5 text-emerald-600" />
                        {notice}
                      </motion.p>
                    )}

                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        aria-live="polite"
                        className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-center text-xs text-destructive"
                      >
                        {error}
                      </motion.p>
                    )}

                    <Button
                      type="submit"
                      className="group h-11 w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          登录中...
                        </>
                      ) : (
                        <>
                          登录
                          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                        </>
                      )}
                    </Button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="register"
                    onSubmit={handleRegisterSubmit}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="text-sm font-medium text-foreground">邮箱</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="your@email.com"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        disabled={isRegistering}
                        autoComplete="email"
                        className="h-11"
                      />
                    </div>

                    <PasswordField
                      id="register-password"
                      label="设置密码"
                      placeholder="至少6位密码"
                      value={registerPassword}
                      onChange={setRegisterPassword}
                      visible={showRegisterPassword}
                      onToggle={() => setShowRegisterPassword(!showRegisterPassword)}
                      disabled={isRegistering}
                      autoComplete="new-password"
                    />

                    <PasswordField
                      id="confirm-password"
                      label="确认密码"
                      placeholder="再次输入密码"
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                      visible={showConfirmPassword}
                      onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isRegistering}
                      autoComplete="new-password"
                    />

                    <div className="space-y-2">
                      <Label htmlFor="verification-code" className="text-sm font-medium text-foreground">验证码</Label>
                      <div className="flex gap-2">
                        <Input
                          id="verification-code"
                          type="text"
                          placeholder="请输入验证码"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          disabled={isRegistering}
                          className="h-11 min-w-0 flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleSendVerificationCode}
                          disabled={countdown > 0 || isSendingCode || isRegistering}
                          className="h-11 min-w-[100px] shrink-0"
                        >
                          {isSendingCode ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : countdown > 0 ? (
                            `${countdown}秒`
                          ) : (
                            '发送验证码'
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="invite-code" className="text-sm font-medium text-foreground">邀请码（选填）</Label>
                      <Input
                        id="invite-code"
                        type="text"
                        placeholder="请输入邀请码"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        disabled={isRegistering}
                        className="h-11"
                      />
                    </div>

                    {registerError && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        aria-live="polite"
                        className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-center text-xs text-destructive"
                      >
                        {registerError}
                      </motion.p>
                    )}

                    <Button
                      type="submit"
                      className="h-11 w-full"
                      disabled={isRegistering}
                    >
                      {isRegistering ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          注册中...
                        </>
                      ) : (
                        '注册'
                      )}
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            © 2026 Chat Studio · Agent 智能体平台
          </p>
        </motion.div>
      </div>
    </div>
  );
};
