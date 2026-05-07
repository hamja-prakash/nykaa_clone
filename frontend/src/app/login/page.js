'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { login, addToCart } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();
  const { fetchCart } = useCart();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const redirect = searchParams.get('redirect') || '/';
  const addToCartId = searchParams.get('addToCart');
  const qty = parseInt(searchParams.get('qty') || '1', 10);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!EMAIL_RE.test(form.email.trim())) { toast.error('Please enter a valid email address'); return; }
    if (!form.password) { toast.error('Please enter your password'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await login({ email: form.email.trim(), password: form.password });
      signIn(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}!`);

      if (addToCartId) {
        try {
          await addToCart(parseInt(addToCartId, 10), qty);
          await fetchCart();
          toast.success('Item added to your bag!');
        } catch {
          toast.error('Could not add item to bag. Please try again.');
        }
      }

      router.push(redirect);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => setForm({ email: 'demo@glamcart.com', password: 'Demo@1234' });

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-nykaa-pink-pale">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <span className="text-4xl font-black text-nykaa-pink">GlamCart</span>
          </Link>
          <p className="text-nykaa-gray mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-nykaa-dark mb-1">Email</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-nykaa-dark mb-1">Password</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field pr-12"
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-nykaa-gray hover:text-nykaa-dark">
                {showPwd ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 p-3 bg-nykaa-pink-pale rounded-lg text-center">
          <p className="text-xs text-nykaa-gray mb-2">Try the demo account:</p>
          <button onClick={fillDemo} className="text-sm text-nykaa-pink font-semibold hover:underline">
            demo@glamcart.com / Demo@1234
          </button>
        </div>

        <p className="text-center text-sm text-nykaa-gray mt-6">
          Don't have an account?{' '}
          <Link href="/register" className="text-nykaa-pink font-semibold hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}
