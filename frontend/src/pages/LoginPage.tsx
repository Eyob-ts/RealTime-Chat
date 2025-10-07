import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.2),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(236,72,153,0.2),transparent_40%)] blur-3xl"></div>

      {/* Glass Container */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md p-10 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-3xl shadow-[0_0_40px_rgba(255,255,255,0.05)] roboto-flex"
      >
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center text-4xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-500 uppercase roboto-flex-regular"
          style={{
            WebkitTextStroke: '1px white',
            color: 'transparent',
          }}
        >
          Login
        </motion.h1>

        <p className="text-center text-gray-400 text-sm mt-3">
          Welcome back! <br /> Enter your credentials to continue
        </p>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 bg-red-500/20 border border-red-500 text-red-300 px-4 py-2 rounded-lg text-center text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-5 py-3 rounded-xl text-white bg-white/10 border border-white/20 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none placeholder-gray-500 text-base transition-all duration-300"
                placeholder="Enter your username"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-3 rounded-xl text-white bg-white/10 border border-white/20 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none placeholder-gray-500 text-base transition-all duration-300"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {/* Submit */}
          <motion.button
            whileHover={{
              scale: 1.03,
              boxShadow: '0 0 25px rgba(99,102,241,0.6)',
            }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white text-lg font-semibold tracking-wide transition-all duration-300 disabled:opacity-60"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </motion.button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don’t have an account?{' '}
          <Link
            to="/register"
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
