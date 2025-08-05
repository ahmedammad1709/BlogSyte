import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';

// Animated background component
const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
    <div className="absolute top-40 left-40 w-80 h-80 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
  </div>
);

const Verify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const email = location.state?.email || 'your email';

  useEffect(() => {
    setIsVisible(true);
    // Start 5-minute countdown
    setCountdown(300);
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email,
          otp: otpString 
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        // Clear pending user data
        localStorage.removeItem('pendingUser');
        // Login user using context
        if (data.user) {
          login(data.user);
        }
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.message || 'Invalid OTP. Please try again.');
        // Clear OTP on error
        setOtp(['', '', '', '', '', '']);
        document.getElementById('otp-0')?.focus();
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email }),
      });

      const data = await response.json();

      if (data.success) {
        setOtp(['', '', '', '', '', '']);
        setCountdown(300); // Reset countdown
        setError('');
      } else {
        setError(data.message || 'Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AnimatedBackground />
      
      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110">
                <Mail className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-gray-900 via-purple-800 to-violet-900 bg-clip-text text-transparent">
              Verify Your Email
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              We've sent a 6-digit OTP to <span className="font-semibold text-purple-600">{email}</span>
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Account created successfully! Redirecting to login...
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
              <XCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-gray-700/20 hover:shadow-3xl transition-all duration-500">
            {/* OTP Input */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Enter 6-digit OTP
              </label>
              <div className="flex justify-center space-x-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 dark:bg-gray-700/50 dark:text-white transition-all duration-300"
                    placeholder="0"
                  />
                ))}
              </div>
            </div>

            {/* Timer */}
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                OTP expires in: <span className="font-semibold text-purple-600">{formatTime(countdown)}</span>
              </p>
            </div>

            {/* Verify Button */}
            <Button 
              onClick={handleVerifyOTP}
              disabled={isLoading || otp.join('').length !== 6}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              <span className="flex items-center justify-center">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    Confirm & Create Account
                    <CheckCircle className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  </>
                )}
              </span>
            </Button>

            {/* Resend OTP */}
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Didn't receive the OTP?
              </p>
              <Button
                onClick={handleResendOTP}
                disabled={resendLoading || countdown > 0}
                variant="outline"
                size="sm"
                className="text-purple-600 border-purple-600 hover:bg-purple-600 hover:text-white transition-all duration-300"
              >
                <span className="flex items-center">
                  {resendLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Resend OTP
                    </>
                  )}
                </span>
              </Button>
            </div>

            {/* Back to Signup */}
            <div className="text-center mt-6">
              <Button
                onClick={() => navigate('/signup')}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-purple-600 transition-colors duration-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Signup
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verify; 