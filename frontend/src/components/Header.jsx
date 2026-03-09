import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { proxyApi } from "../api";
import useAlert from "../hooks/useAlert";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [userRole, setUserRole] = useState('customer'); // 'customer' or 'supplier'
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  
  // Login fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCountryCode, setRegCountryCode] = useState('+91');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  
  // OTP fields
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [isOtpDisabled, setIsOtpDisabled] = useState(false);
  
  const [error, setError] = useState('');
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  // Check for existing user session
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  // Fetch cart and wishlist counts
  useEffect(() => {
    const fetchCounts = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;

      try {
        // Fetch cart count
        const cartRes = await api.get("/cart");
        const cartItems = Array.isArray(cartRes.data) ? cartRes.data : [];
        const totalCart = cartItems.reduce((sum, item) => sum + (parseInt(item.quantity, 10) || 0), 0);
        setCartCount(totalCart);

        // Fetch wishlist count
        const wishlistRes = await api.get("/wishlist");
        const wishlistItems = Array.isArray(wishlistRes.data) ? wishlistRes.data : [];
        setWishlistCount(wishlistItems.length);
      } catch (err) {
        // User not logged in or error
      }
    };

    fetchCounts();
  }, [user]);

  // OTP Timer
  useEffect(() => {
    if (otpTimer === 0) {
      setIsOtpDisabled(false);
      return;
    }
    const interval = setInterval(() => {
      setOtpTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  const resetForm = () => {
    setIdentifier('');
    setPassword('');
    setRegName('');
    setRegEmail('');
    setRegPhone('');
    setRegPassword('');
    setRegConfirmPassword('');
    setOtp('');
    setOtpSent(false);
    setOtpVerified(false);
    setError('');
  };

  const switchToLogin = () => {
    setAuthMode('login');
    resetForm();
  };

  const switchToRegister = () => {
    setAuthMode('register');
    resetForm();
  };

  // Send OTP - Try direct first, fall back to proxy if CORS blocks
  const handleSendOtp = async () => {
    if (!regEmail) {
      setError('Email is required');
      return;
    }
    if (!regPhone) {
      setError('Phone number is required');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      // Try direct first
      try {
        await api.post("/auth/register/requestOtp", 
          { identifier: regEmail }
        );
      } catch (directErr) {
        // If direct fails due to CORS, try proxy
        if (!directErr.response) {
          console.log("Direct failed, trying proxy...");
          await proxyApi.post("/auth/register/requestOtp", 
            { identifier: regEmail }
          );
        } else {
          throw directErr;
        }
      }
      
      setOtpSent(true);
      setIsOtpDisabled(true);
      setOtpTimer(300);
    } catch (err) {
      console.log("OTP Error:", err);
      
      // Handle different error types
      if (err.code === 'ERR_NETWORK' || err.message?.includes('Network')) {
        setError('Network error. Please check your connection.');
      } else if (err.response?.status === 403) {
        setError('Access denied. Please try again later.');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to send OTP. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP (just sets the verified flag)
  const handleVerifyOtp = () => {
    if (otp.length >= 4) {
      setOtpVerified(true);
      setError('');
    }
  };

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const endpoint = userRole === 'supplier' ? '/auth/supplier/login' : '/auth/login';
      
      const response = await api.post(endpoint, {
        identifier: identifier,
        password: userRole === 'customer' ? password : undefined,
      });

      const { token, user: loggedInUser } = response.data;
      
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      localStorage.setItem("mode", userRole);
      
      setUser(loggedInUser);
      setShowAuthModal(false);
      resetForm();
      
      if (userRole === 'supplier') {
        navigate('/');
      } else {
        navigate('/');
      }
      
      window.location.reload();
      
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Register - Try direct first, fall back to proxy if CORS blocks
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!regName || !regEmail || !regPhone || !regPassword || !regConfirmPassword) {
      setError('All fields are required');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!otpVerified) {
      setError('Please verify OTP first');
      return;
    }

    try {
      setIsLoading(true);
      const fullPhone = `${regCountryCode}${regPhone}`;
      
      // Try direct first
      try {
        await api.post("/auth/register/verifyOtp", {
          identifier: regEmail,
          phone: fullPhone,
          name: regName,
          email: regEmail,
          password: regPassword,
          otp: otp,
        });
      } catch (directErr) {
        // If direct fails due to CORS, try proxy
        if (!directErr.response) {
          console.log("Direct failed, trying proxy for registration...");
          await proxyApi.post("/auth/register/verifyOtp", {
            identifier: regEmail,
            phone: fullPhone,
            name: regName,
            email: regEmail,
            password: regPassword,
            otp: otp,
          });
        } else {
          throw directErr;
        }
      }

      showAlert("Registration successful! Please login.", "success");
      switchToLogin();
      
    } catch (err) {
      console.log("Registration Error:", err);
      
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.code === 'ERR_NETWORK') {
        setError('Network error. Please try again.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      // Ignore logout errors
    }
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("mode");
    setUser(null);
    navigate('/');
    window.location.reload();
  };

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Categories', to: '/categories' },
    { label: 'Best Sellers', to: '/#bestsellers' },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm h-[70px] flex justify-between items-center px-4 md:px-8">
        {/* Logo - Left */}
        <Link to="/" className="flex items-center">
          <img src="/icons/Logo.png" alt="Bursana" className="w-20 h-15 mr-2" />
        </Link>

        {/* Navigation - Center (Desktop) */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.to} 
              to={link.to} 
              className="text-gray-700 hover:text-purple-600 font-medium transition-colors text-sm"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Icons */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Search Icon */}
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Search">
            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </button>

          {/* Wishlist Icon */}
          <Link to="/wishlist" className="p-2 hover:bg-gray-100 rounded-full transition-colors relative" aria-label="Wishlist">
            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {wishlistCount > 9 ? '9+' : wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Icon */}
          <Link to="/cart" className="p-2 hover:bg-gray-100 rounded-full transition-colors relative" aria-label="Cart">
            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>

          {/* Login / User Button */}
          {user ? (
            <div className="relative">
              <button 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-1"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                onBlur={() => setTimeout(() => setProfileMenuOpen(false), 200)}
              >
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </button>
              {profileMenuOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white shadow-lg rounded-lg py-2 min-w-[150px] z-50">
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={() => {
                setShowAuthModal(true);
                switchToLogin();
              }}
              className="px-4 py-2 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Login
            </button>
          )}

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              ) : (
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-[70px] left-0 right-0 bg-white shadow-lg md:hidden">
            <div className="flex flex-col p-4 gap-2">
              {navLinks.map((link) => (
                <Link 
                  key={link.to} 
                  to={link.to} 
                  className="px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {!user && (
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowAuthModal(true);
                    switchToLogin();
                  }}
                  className="px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowAuthModal(false)}
          />
          
          {/* Modal Content - Smaller size */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            {/* Close Button */}
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-gray-500 mt-1 text-sm">
                {authMode === 'login' ? 'Sign in to continue' : 'Fill in your details'}
              </p>
            </div>

            {/* Role Toggle (only for login) */}
            {authMode === 'login' && (
              <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setUserRole('customer')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                    userRole === 'customer' 
                      ? 'bg-white text-purple-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Customer
                </button>
                <button
                  onClick={() => setUserRole('supplier')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                    userRole === 'supplier' 
                      ? 'bg-white text-purple-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Supplier
                </button>
              </div>
            )}

            {/* Form */}
            <form onSubmit={authMode === 'login' ? handleLogin : handleRegister}>
              <div className="space-y-4">
                {/* Registration Fields */}
                {authMode === 'register' && (
                  <>
                    <div>
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-base"
                      />
                    </div>

                    <div className="flex gap-2">
                      <select
                        value={regCountryCode}
                        onChange={(e) => setRegCountryCode(e.target.value)}
                        className="px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      >
                        <option value="+91">+91</option>
                        <option value="+1">+1</option>
                        <option value="+44">+44</option>
                        <option value="+61">+61</option>
                        <option value="+971">+971</option>
                      </select>
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="Phone Number"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-base"
                      />
                    </div>

                    <div>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="Email Address"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-base"
                      />
                    </div>

                    {/* OTP Section for Registration */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-3">Verify your email with OTP</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="Enter OTP"
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-base"
                          disabled={!otpSent}
                        />
                        <button
                          type="button"
                          onClick={otpSent ? handleVerifyOtp : handleSendOtp}
                          disabled={isOtpDisabled}
                          className={`px-4 py-3 rounded-lg font-medium text-white ${
                            otpVerified 
                              ? 'bg-green-500' 
                              : isOtpDisabled 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-purple-600 hover:bg-purple-700'
                          }`}
                        >
                          {otpVerified ? 'Verified ✓' : otpSent ? 'Verify OTP' : 'Send OTP'}
                        </button>
                      </div>
                      
                      {otpSent && !otpVerified && (
                        <p className="text-sm text-green-600 mt-2">
                          ✓ OTP sent to your email! Enter the OTP and click Verify.
                        </p>
                      )}
                      
                      {isOtpDisabled && !otpVerified && (
                        <p className="text-sm text-gray-500 mt-2">
                          Resend OTP in {formatTime(otpTimer)}
                        </p>
                      )}
                    </div>

                    <div>
                      <input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Password"
                        autoComplete="new-password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-base"
                      />
                    </div>

                    <div>
                      <input
                        type="password"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Confirm Password"
                        autoComplete="new-password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-base"
                      />
                    </div>
                  </>
                )}

                {/* Login Fields */}
                {authMode === 'login' && (
                  <>
                    <div>
                      <input
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder={userRole === 'supplier' ? 'Email or Phone' : 'Email or Phone Number'}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-base"
                        required
                      />
                    </div>

                    {userRole === 'customer' && (
                      <div>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Password"
                          autoComplete="current-password"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-base"
                          required
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Error Message */}
                {error && (
                  <div className="text-red-500 text-sm text-center p-2 bg-red-50 rounded-lg">{error}</div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || (authMode === 'register' && !otpVerified)}
                  className="w-full py-4 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-lg font-medium text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isLoading 
                    ? 'Please wait...' 
                    : authMode === 'login' 
                      ? 'Sign In' 
                      : 'Create Account'
                  }
                </button>
              </div>
            </form>

            {/* Switch Mode */}
            <p className="text-center mt-6 text-gray-600 text-base">
              {authMode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button 
                    onClick={switchToRegister}
                    className="text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Register
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button 
                    onClick={switchToLogin}
                    className="text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Login
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
