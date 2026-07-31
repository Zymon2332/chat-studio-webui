import './login.css';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { sendVerificationCode, register } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ArrowRight,
  Bot,
  Check,
  CircleDot,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  MessageSquareText,
  ShieldCheck,
  UserPlus,
  Workflow,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type TabKey = 'login' | 'register';

const tabItems: Array<{ key: TabKey; label: string; index: string }> = [
  { key: 'login', label: '登录', index: '01' },
  { key: 'register', label: '注册', index: '02' },
];

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
      <Label
        htmlFor={id}
        className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45"
      >
        <LockKeyhole className="size-3.5 text-[#E3B04B]" />
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
          className="login-field h-12 w-full rounded-[2px] border-white/15 bg-[#070A08] pr-12 text-[15px] text-[#F4F1E8] placeholder:text-white/20 focus-visible:border-[#E3B04B]/70 focus-visible:ring-[#E3B04B]/15"
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? '隐藏密码' : '显示密码'}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 transition-colors hover:text-[#E3B04B]"
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
    <div className="login-page relative min-h-screen overflow-x-hidden">
      <div aria-hidden="true" className="login-grid pointer-events-none absolute inset-0" />
      <div aria-hidden="true" className="login-scanline pointer-events-none absolute inset-x-0" />
      <div aria-hidden="true" className="login-crosshair pointer-events-none absolute right-6 top-6 hidden xl:block" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1720px] flex-col">
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-8 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3"
          >
            <span className="grid size-9 place-items-center border border-[#E3B04B]/35 bg-[#E3B04B]/10 font-serif-display text-lg text-[#E3B04B]">
              C
            </span>
            <span className="font-mono text-[11px] tracking-[0.22em] text-white/70">
              CHAT / STUDIO
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-[#9FE3A2]/80"
          >
            <span className="login-pulse-dot size-1.5 rounded-full bg-[#9FE3A2]" />
            SIGNAL READY
          </motion.div>

          <motion.span
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="hidden font-mono text-[10px] tracking-[0.18em] text-white/30 sm:block"
          >
            EDITION 2026.07
          </motion.span>
        </header>

        <main className="grid flex-1 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
          <section className="relative hidden border-r border-white/10 lg:flex">
            <div className="flex h-full w-full flex-col justify-between p-10 xl:p-14">
              <div>
                <motion.p
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.55, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="mb-7 flex items-center gap-3 font-mono text-[11px] tracking-[0.26em] text-[#E3B04B]"
                >
                  <span className="h-px w-10 bg-[#E3B04B]/60" />
                  AI WORKSPACE / 01
                </motion.p>

                <motion.h1
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="font-serif-display text-[84px] leading-[0.9] tracking-normal text-[#F4F1E8]"
                >
                  Chat
                  <span className="block italic text-[#E3B04B]">Studio</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-7 max-w-md text-lg font-light leading-relaxed text-white/55"
                >
                  让每个想法，都能进入可执行的对话。
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.58, ease: [0.16, 1, 0.3, 1] }}
                className="mt-10"
              >
                <div className="mb-4 flex items-center justify-between font-mono text-[10px] tracking-[0.2em] text-white/35">
                  <span>01 INPUT</span>
                  <span>02 ROUTE</span>
                  <span>03 MODEL</span>
                  <span>04 OUTPUT</span>
                </div>
                <div className="relative flex items-center justify-between px-3 py-7">
                  <div aria-hidden="true" className="login-pipeline-line" />
                  <div className="login-node" title="消息入口">
                    <MessageSquareText size={18} />
                  </div>
                  <div className="login-node" title="任务编排">
                    <Workflow size={18} />
                  </div>
                  <div className="login-node" title="模型路由">
                    <Bot size={18} />
                  </div>
                  <div className="login-node" title="结果输出">
                    <Zap size={18} />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.74 }}
                className="flex items-end justify-between border-t border-white/10 pt-5 font-mono text-[10px] tracking-[0.16em] text-white/35"
              >
                <p>模型路由 / 技能编排 / 会话协作</p>
                <span className="flex items-center gap-2 text-white/45">
                  <CircleDot size={13} className="text-[#E3B04B]" />
                  LIVE 24/7
                </span>
              </motion.div>
            </div>
          </section>

          <section className="relative flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12 xl:px-16">
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-xl"
            >
              <div className="login-sheet px-5 py-7 sm:px-8 sm:py-9">
                <div className="mb-8 flex items-end justify-between gap-4">
                  <div>
                    <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.24em] text-[#E3B04B]">
                      <ShieldCheck size={13} />
                      IDENTITY GATE / 0{isLogin ? '1' : '2'}
                    </p>
                    <h2 className="mt-3 font-serif-display text-4xl leading-tight tracking-normal text-[#F4F1E8]">
                      {isLogin ? '欢迎回来' : '创建账户'}
                    </h2>
                  </div>
                  <div className="hidden text-right font-mono text-[10px] leading-5 tracking-[0.16em] text-white/35 sm:block">
                    <p>SECURE ACCESS</p>
                    <p className="text-[#9FE3A2]/70">AUTH / READY</p>
                  </div>
                </div>

                <div className="relative grid grid-cols-2 border-b border-white/10">
                  {tabItems.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => switchTab(tab.key)}
                      className="relative py-4 text-center font-mono text-xs tracking-[0.2em]"
                    >
                      <span
                        className={
                          activeTab === tab.key
                            ? 'text-[#E3B04B]'
                            : 'text-white/35 transition-colors hover:text-white/70'
                        }
                      >
                        {tab.index} / {tab.label}
                      </span>
                      {activeTab === tab.key && (
                        <motion.span
                          layoutId="login-tab-indicator"
                          className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E3B04B]"
                          transition={{ type: 'spring', stiffness: 520, damping: 36 }}
                        />
                      )}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {isLogin ? (
                    <motion.form
                      key="login"
                      onSubmit={handleLoginSubmit}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-5 pt-7"
                    >
                      <div className="space-y-2">
                        <Label
                          htmlFor="login-email"
                          className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45"
                        >
                          <Mail className="size-3.5 text-[#E3B04B]" />
                          邮箱
                        </Label>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="your@email.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          disabled={isLoading}
                          autoComplete="email"
                          className="login-field h-12 w-full rounded-[2px] border-white/15 bg-[#070A08] px-4 text-[15px] text-[#F4F1E8] placeholder:text-white/20 focus-visible:border-[#E3B04B]/70 focus-visible:ring-[#E3B04B]/15"
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

                      <div className="flex items-center gap-2.5 pt-1">
                        <Checkbox
                          id="remember"
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(checked === true)}
                          disabled={isLoading}
                          className="size-[18px] rounded-[3px] border-white/20 bg-white/5 data-[state=checked]:border-[#E3B04B] data-[state=checked]:bg-[#E3B04B] data-[state=checked]:text-[#0B0E0C]"
                        />
                        <Label
                          htmlFor="remember"
                          className="font-normal text-sm text-white/55"
                        >
                          记住我
                        </Label>
                      </div>

                      {notice && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          aria-live="polite"
                          className="flex items-center gap-2 border border-[#9FE3A2]/25 bg-[#9FE3A2]/10 px-3 py-2.5 font-mono text-xs text-[#9FE3A2]"
                        >
                          <Check size={14} />
                          {notice}
                        </motion.p>
                      )}

                      {error && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          aria-live="polite"
                          className="border border-red-400/25 bg-red-400/10 px-3 py-2.5 text-center font-mono text-xs text-red-300"
                        >
                          {error}
                        </motion.p>
                      )}

                      <Button
                        type="submit"
                        className="group h-12 w-full rounded-[2px] bg-[#E3B04B] text-[#0B0E0C] text-sm font-semibold tracking-[0.08em] hover:bg-[#F0C77B] shadow-[0_0_28px_rgba(227,176,75,0.12)] hover:shadow-[0_0_36px_rgba(227,176,75,0.2)]"
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
                            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                          </>
                        )}
                      </Button>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="register"
                      onSubmit={handleRegisterSubmit}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4 pt-7"
                    >
                      <div className="space-y-2">
                        <Label
                          htmlFor="register-email"
                          className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45"
                        >
                          <Mail className="size-3.5 text-[#E3B04B]" />
                          邮箱
                        </Label>
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="your@email.com"
                          value={registerEmail}
                          onChange={(e) => setRegisterEmail(e.target.value)}
                          disabled={isRegistering}
                          autoComplete="email"
                          className="login-field h-12 w-full rounded-[2px] border-white/15 bg-[#070A08] px-4 text-[15px] text-[#F4F1E8] placeholder:text-white/20 focus-visible:border-[#E3B04B]/70 focus-visible:ring-[#E3B04B]/15"
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
                        <Label
                          htmlFor="verification-code"
                          className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45"
                        >
                          <ShieldCheck className="size-3.5 text-[#E3B04B]" />
                          验证码
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="verification-code"
                            type="text"
                            placeholder="请输入验证码"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            disabled={isRegistering}
                            className="login-field h-12 min-w-0 flex-1 rounded-[2px] border-white/15 bg-[#070A08] px-4 text-[15px] text-[#F4F1E8] placeholder:text-white/20 focus-visible:border-[#E3B04B]/70 focus-visible:ring-[#E3B04B]/15"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleSendVerificationCode}
                            disabled={countdown > 0 || isSendingCode || isRegistering}
                            className="h-12 min-w-[112px] shrink-0 rounded-[2px] border-white/15 bg-white/[0.03] font-mono text-[11px] tracking-[0.1em] text-white/60 hover:bg-[#E3B04B]/10 hover:text-[#E3B04B]"
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
                        <Label
                          htmlFor="invite-code"
                          className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45"
                        >
                          <KeyRound className="size-3.5 text-[#E3B04B]" />
                          邀请码（选填）
                        </Label>
                        <Input
                          id="invite-code"
                          type="text"
                          placeholder="请输入邀请码"
                          value={inviteCode}
                          onChange={(e) => setInviteCode(e.target.value)}
                          disabled={isRegistering}
                          className="login-field h-12 w-full rounded-[2px] border-white/15 bg-[#070A08] px-4 text-[15px] text-[#F4F1E8] placeholder:text-white/20 focus-visible:border-[#E3B04B]/70 focus-visible:ring-[#E3B04B]/15"
                        />
                      </div>

                      {registerError && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          aria-live="polite"
                          className="border border-red-400/25 bg-red-400/10 px-3 py-2.5 text-center font-mono text-xs text-red-300"
                        >
                          {registerError}
                        </motion.p>
                      )}

                      <Button
                        type="submit"
                        className="group h-12 w-full rounded-[2px] bg-[#E3B04B] text-[#0B0E0C] text-sm font-semibold tracking-[0.08em] hover:bg-[#F0C77B] shadow-[0_0_28px_rgba(227,176,75,0.12)] hover:shadow-[0_0_36px_rgba(227,176,75,0.2)]"
                        disabled={isRegistering}
                      >
                        {isRegistering ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            注册中...
                          </>
                        ) : (
                          <>
                            <UserPlus className="size-4" />
                            注册
                          </>
                        )}
                      </Button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>

              <p className="mt-6 text-center font-mono text-[10px] tracking-[0.18em] text-white/25">
                © 2026 CHAT STUDIO / ALL RIGHTS RESERVED
              </p>
            </motion.div>
          </section>
        </main>
      </div>

      <div className="noise-overlay" />
    </div>
  );
};
