import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignIn } from '@clerk/clerk-react';
import { Mail, Lock, AlertCircle, Sparkles, Zap } from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import toast from 'react-hot-toast';
import { UserRole } from '../../types';

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('REPORTER');
  const [loading, setLoading] = useState(false);
  const [showClerkSignIn, setShowClerkSignIn] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { login, register } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        await register(email, password, name, role);
        toast.success('Account created! Logging you in...');
        await login(email, password);
        if (onLoginSuccess) onLoginSuccess();
        navigate('/');
      } else {
        await login(email, password);
        toast.success('Successfully logged in!');
        if (onLoginSuccess) onLoginSuccess();
        navigate('/');
      }
    } catch (error) {
      toast.error(isSignUp ? 'Registration failed' : 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const demoCredentials = [];

  if (showClerkSignIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <button
              onClick={() => setShowClerkSignIn(false)}
              className="text-white/70 hover:text-white transition-colors mb-4"
            >
              ← Back to demo login
            </button>
          </div>
          <SignIn 
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl",
              }
            }}
            afterSignInUrl="/"
            afterSignUpUrl="/"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full blur-lg opacity-75 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-purple-500 to-cyan-500 p-4 rounded-full">
                <AlertCircle className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Issues & Insights
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            Sign in to your account
          </p>
        </div>

        <div className="glass rounded-2xl p-8 shadow-2xl border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <Input
                label="Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
                className="bg-white/80 border-white/20 text-white placeholder-gray-400 rounded-xl focus:border-purple-500 focus:ring-purple-500 focus:ring-2 transition-all duration-300 pl-4"
              />
            )}
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              required
              fullWidth
              className="bg-white/80 border-white/20 text-white placeholder-gray-400"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={Lock}
              required
              fullWidth
              className="bg-white/80 border-white/20 text-white placeholder-gray-400"
            />
            {isSignUp && (
              <div>
                <label className="block text-sm text-white mb-2">Role</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as UserRole)}
                  className="w-full p-3 rounded-xl bg-transparent border border-white/20 text-white dark:text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500 focus:ring-2 transition-all duration-300"
                >
                  <option className='text-black' value="REPORTER">Reporter</option>
                  <option className='text-black' value="MAINTAINER">Maintainer</option>
                  <option className='text-black' value="ADMIN">Admin</option>
                </select>
              </div>
            )}
            <Button
              type="submit"
              loading={loading}
              fullWidth
              size="lg"
              className="btn-futuristic bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Zap className="h-5 w-5 mr-2" />
              {isSignUp ? 'Sign up' : 'Sign in'}
            </Button>
            <div className="text-center mt-4">
              <button
                type="button"
                className="text-purple-300 hover:underline"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-gray-400">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={() => setShowClerkSignIn(true)}
              fullWidth
              size="lg"
              className="btn-futuristic bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-xl border border-white/20 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/20">
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;