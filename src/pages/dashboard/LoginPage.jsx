import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for success message from signup
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message from navigation state
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    if (submitError) setSubmitError(''); // clear global error when user edits
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  function mapError(err) {
    if (!err) return 'An unexpected error occurred. Please try again.';
    const raw = (err.message || '').toLowerCase();
    switch (err.status) {
      case 400:
        if (err.missing && Array.isArray(err.missing) && err.missing.length) {
          return 'Please fill in: ' + err.missing.join(', ');
        }
        if (raw.includes('invalid credentials')) return 'Please enter a valid email and password.';
        return 'Invalid request. Please review your input.';
      case 401:
        if (raw.includes('invalid password')) return 'The password you entered is incorrect.';
        return 'Unauthorized. Please check your password.';
      case 404:
        if (raw.includes('user not found')) return 'No account exists with that email.';
        return 'Account not found.';
      case 500:
        return 'Server error. Please try again shortly.';
      default:
        if (raw.includes('user not found')) return 'No account exists with that email.';
        if (raw.includes('invalid password')) return 'The password you entered is incorrect.';
        return 'An unexpected error occurred. Please try again.';
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await login({
        email: formData.email,
        password: formData.password
      });

      if (result.success) {
        navigate('/map');
      } else {
        setSubmitError(mapError(result.error));
      }
    } catch (error) {
      setSubmitError(mapError(error));
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="relative min-h-screen flex flex-col lg:flex-row bg-gray-900 overflow-hidden">
      {/* Left: Image Section - Hidden on smaller screens */}
      <div className="hidden lg:flex lg:w-7/12 w-full h-64 lg:h-auto items-center justify-center relative">
        <img
          src="/images/login-bg.avif"
          alt="Workspace"
          className="object-cover w-full h-full lg:rounded-none rounded-b-2xl shadow-lg opacity-75"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black opacity-30" />
      </div>

      {/* Right: Login Form Section - Full width on smaller screens */}
      <div
        className="flex w-full lg:w-5/12 items-center justify-center py-12 px-6 lg:px-16 z-10 relative bg-gray-900"
        style={{
          background: window.innerWidth >= 1024 ? 'linear-gradient(to top, rgba(22,138,138,0.6) 0%, rgba(22,138,138,0.4) 20%, rgba(22,138,138,0.2) 40%, rgba(22,138,138,0.1) 60%, transparent 80%)' : 'none',
        }}
      >
        {/* Back to Home positioned at top left */}
        <div className="absolute top-6 left-6 lg:left-8">
          <Link to="/" className="text-sm text-[#4FD1C5] hover:text-[#168A8A] font-semibold transition-colors duration-200">
            Back to Home
          </Link>
        </div>

        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center">
            <img
              alt="Your Company"
              src="/images/logo.svg"
              className="mx-auto h-14 w-auto mb-4"
            />
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-white text-center">Log in to your account</h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              New to FillTrip?{' '}
              <Link to="/signup" className="font-semibold text-[#4FD1C5] hover:text-[#168A8A] transition-colors duration-200">
                Create an account.
              </Link>
            </p>
            {successMessage && (
              <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-md p-3">
                <p className="text-green-400 text-sm text-center">{successMessage}</p>
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-100">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
                className={`mt-2 block w-full rounded-md bg-white/5 px-3 py-2 text-base text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4FD1C5] border transition ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-transparent focus:border-[#168A8A]'
                  }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-100">
                  Password
                </label>
                <a href="#" className="text-sm font-semibold text-[#4FD1C5] hover:text-[#168A8A] transition-colors duration-200">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                  className={`mt-2 block w-full rounded-md bg-white/5 px-3 py-2 pr-10 text-base text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4FD1C5] border transition ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-transparent focus:border-[#168A8A]'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#4FD1C5] transition-colors duration-200"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
            </div>
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-[#168A8A] focus:ring-[#4FD1C5]"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                Remember me
              </label>
            </div>
            {submitError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3">
                <p className="text-red-400 text-sm">{submitError}</p>
              </div>
            )}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-md bg-gradient-to-r from-[#168A8A] to-[#0B2C36] px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:from-[#0B2C36] hover:to-[#168A8A] hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#4FD1C5] focus:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Logging in...' : 'Log in'}
              </button>
            </div>
            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-gray-700" />
              <span className="mx-4 text-gray-400 text-sm">Or continue with</span>
              <div className="flex-grow border-t border-gray-700" />
            </div>
            <div className="flex justify-center gap-4 sm:gap-6">
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-md bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-gray-600 hover:text-white cursor-pointer min-w-[120px] sm:min-w-[140px]"
              >
                <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                </svg>
                <span className="whitespace-nowrap">Google</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-md bg-[#1877F2] px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-[#1565c0] hover:text-white cursor-pointer min-w-[120px] sm:min-w-[140px]"
              >
                <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="whitespace-nowrap">Facebook</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
