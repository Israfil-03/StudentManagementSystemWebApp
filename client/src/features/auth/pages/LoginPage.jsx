import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '../../../app/AuthProvider';
import { Button, Input } from '../../../components/ui';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Welcome to Mirage!');
      navigate('/');
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Login failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-purple/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/branding/logo.svg" alt="Mirage" className="h-12 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-surface-100">Welcome Back</h1>
          <p className="text-surface-400 mt-2">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              error={errors.password?.message}
              {...register('password')}
            />

            <Button 
              type="submit" 
              className="w-full" 
              loading={loading}
            >
              Sign In
            </Button>
          </form>
        </div>

        {/* Demo credentials */}
        <div className="mt-6 p-4 bg-surface-800/50 rounded-lg border border-surface-700">
          <p className="text-xs text-surface-400 text-center mb-2">Demo Credentials</p>
          <div className="text-xs text-surface-500 space-y-1">
            <p><span className="text-surface-300">Super Admin:</span> mirage@mirage.local</p>
            <p><span className="text-surface-300">Admin:</span> admin@mirage.local / Admin123!</p>
            <p><span className="text-surface-300">Staff:</span> staff@mirage.local / Staff123!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
