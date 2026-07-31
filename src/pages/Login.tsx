import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { sendVerificationCode, register } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [activeTab, setActiveTab] = useState('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
          if (prev <= 1) { clearInterval(timer); return 0; }
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
    if (!registerEmail) { setRegisterError('请输入邮箱'); return; }
    if (!validateEmail(registerEmail)) { setRegisterError('请输入有效的邮箱地址'); return; }
    if (!registerPassword) { setRegisterError('请输入密码'); return; }
    if (registerPassword.length < 6) { setRegisterError('密码长度至少为6位'); return; }
    if (registerPassword !== confirmPassword) { setRegisterError('两次输入的密码不一致'); return; }
    if (!verificationCode) { setRegisterError('请输入验证码'); return; }

    setIsRegistering(true);
    try {
      await register({ email: registerEmail, pwd: registerPassword, captcha: verificationCode, inviteCode: inviteCode || undefined });
      setLoginEmail(registerEmail);
      setLoginPassword(registerPassword);
      setRegisterEmail(''); setRegisterPassword(''); setConfirmPassword(''); setVerificationCode(''); setInviteCode('');
      setError('注册成功，请直接登录');
      setActiveTab('login');
    } catch (err) {
      setRegisterError(err instanceof Error ? err.message : '注册失败，请重试');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#050505]">
      {/* Ambient glow orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-[#D4A040]/8 blur-[120px] animate-ambient-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[#D4A040]/5 blur-[100px] animate-ambient-glow" style={{ animationDelay: '-4s' }} />
        <div className="absolute top-1/2 left-2/3 w-[350px] h-[350px] rounded-full bg-[#B8860B]/6 blur-[90px] animate-ambient-glow" style={{ animationDelay: '-8s' }} />
      </div>

      {/* Grid overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.08]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)',
          backgroundSize: '48px 48px'
        }}
      />

      {/* Left - Brand area */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-center items-center px-12">
        <motion.div
          className="text-center relative z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-7xl font-serif-display text-white mb-4 tracking-tight leading-[1.1]">
            Chat Studio
          </h1>
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="h-px w-12 bg-[#D4A040]/60" />
            <span className="w-2 h-2 rounded-full bg-[#D4A040] shadow-[0_0_8px_rgba(212,160,64,0.5)]" />
            <span className="h-px w-12 bg-[#D4A040]/60" />
          </div>
          <p className="text-lg text-white/50 font-light tracking-wide">
            智能对话 · 无限可能
          </p>
        </motion.div>

        {/* Decorative corner elements */}
        <div className="absolute top-12 left-12 w-16 h-16 border-l-2 border-t-2 border-[#D4A040]/20 rounded-tl-xl" />
        <div className="absolute bottom-12 right-12 w-16 h-16 border-r-2 border-b-2 border-[#D4A040]/20 rounded-br-xl" />
      </div>

      {/* Right - Form area */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 lg:p-12">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-8 shadow-2xl">
            {/* Logo mark */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-[#D4A040]/15 flex items-center justify-center">
                <span className="text-[#D4A040] font-serif-display text-lg leading-none">C</span>
              </div>
              <span className="text-white/70 text-sm font-medium tracking-wide uppercase">Chat Studio</span>
            </div>

            {/* Tab switcher */}
            <div className="flex gap-8 mb-8 border-b border-white/10">
              {[
                { key: 'login', label: '登录' },
                { key: 'register', label: '注册' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="relative pb-3 text-sm transition-colors"
                >
                  <span className={activeTab === tab.key ? 'text-white' : 'text-white/40 hover:text-white/60'}>
                    {tab.label}
                  </span>
                  {activeTab === tab.key && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4A040] rounded-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'login' ? (
                <motion.form
                  key="login"
                  onSubmit={handleLoginSubmit}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-white/60 text-xs uppercase tracking-wider font-medium">邮箱</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      disabled={isLoading}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-[#D4A040]/50 focus:ring-[#D4A040]/20 h-11 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-white/60 text-xs uppercase tracking-wider font-medium">密码</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="输入您的密码"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        disabled={isLoading}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-[#D4A040]/50 focus:ring-[#D4A040]/20 h-11 rounded-xl pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/50 transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      disabled={isLoading}
                      className="border-white/20 data-[state=checked]:bg-[#D4A040] data-[state=checked]:border-[#D4A040]"
                    />
                    <Label htmlFor="remember" className="text-sm text-white/50 font-normal">记住我</Label>
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-400/90 text-center"
                    >
                      {error}
                    </motion.p>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-11 rounded-xl bg-[#D4A040] hover:bg-[#D4A040]/90 text-[#050505] font-medium shadow-[0_0_20px_rgba(212,160,64,0.15)] hover:shadow-[0_0_30px_rgba(212,160,64,0.25)] transition-all duration-300"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />登录中...</>
                    ) : '登录'}
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
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-white/60 text-xs uppercase tracking-wider font-medium">邮箱</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="your@email.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      disabled={isRegistering}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-[#D4A040]/50 focus:ring-[#D4A040]/20 h-11 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-white/60 text-xs uppercase tracking-wider font-medium">密码</Label>
                    <div className="relative">
                      <Input
                        id="register-password"
                        type={showRegisterPassword ? 'text' : 'password'}
                        placeholder="设置密码（至少6位）"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        disabled={isRegistering}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-[#D4A040]/50 focus:ring-[#D4A040]/20 h-11 rounded-xl pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/50 transition-colors"
                      >
                        {showRegisterPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-white/60 text-xs uppercase tracking-wider font-medium">确认密码</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="再次输入密码"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isRegistering}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-[#D4A040]/50 focus:ring-[#D4A040]/20 h-11 rounded-xl pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/50 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="verification-code" className="text-white/60 text-xs uppercase tracking-wider font-medium">验证码</Label>
                    <div className="flex gap-2">
                      <Input
                        id="verification-code"
                        type="text"
                        placeholder="请输入验证码"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        disabled={isRegistering}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-[#D4A040]/50 focus:ring-[#D4A040]/20 h-11 rounded-xl flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSendVerificationCode}
                        disabled={countdown > 0 || isSendingCode || isRegistering}
                        className="h-11 rounded-xl border-white/10 text-white/70 hover:text-white hover:bg-white/5 whitespace-nowrap"
                      >
                        {isSendingCode ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : countdown > 0 ? (
                          `${countdown}秒`
                        ) : '发送验证码'}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="invite-code" className="text-white/60 text-xs uppercase tracking-wider font-medium">邀请码（选填）</Label>
                    <Input
                      id="invite-code"
                      type="text"
                      placeholder="请输入邀请码"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      disabled={isRegistering}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-[#D4A040]/50 focus:ring-[#D4A040]/20 h-11 rounded-xl"
                    />
                  </div>

                  {registerError && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-400/90 text-center"
                    >
                      {registerError}
                    </motion.p>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-11 rounded-xl bg-[#D4A040] hover:bg-[#D4A040]/90 text-[#050505] font-medium shadow-[0_0_20px_rgba(212,160,64,0.15)] hover:shadow-[0_0_30px_rgba(212,160,64,0.25)] transition-all duration-300"
                    disabled={isRegistering}
                  >
                    {isRegistering ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />注册中...</>
                    ) : '注册'}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          <p className="text-center mt-6 text-white/20 text-xs">
            © 2026 Chat Studio. All rights reserved.
          </p>
        </motion.div>
      </div>

      {/* Noise overlay */}
      <div className="noise-overlay" />
    </div>
  );
};
