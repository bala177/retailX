import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import { X, Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle, Loader2, Shield, ArrowLeft } from "lucide-react";

// Password strength checker
const checkPasswordStrength = (password) => {
  let score = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  Object.values(checks).forEach((passed) => {
    if (passed) score++;
  });

  return {
    score,
    checks,
    label: score < 2 ? "Weak" : score < 4 ? "Medium" : "Strong",
    color: score < 2 ? "#ef4444" : score < 4 ? "#f59e0b" : "#22c55e",
  };
};

// Email validation
const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Phone validation (basic)
const validatePhone = (phone) => {
  if (!phone) return true; // Optional
  const regex = /^[\d\s\-\+\(\)]{7,20}$/;
  return regex.test(phone);
};

export default function AuthModal() {
  const { showAuthModal, closeAuthModal, authModalMode, setAuthModalMode, login, register, forgotPassword } = useAuth();
  const { store } = useStore();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [forgotEmailSent, setForgotEmailSent] = useState(false);

  const brandColors = {
    primary: store?.branding?.primaryColor || "#6366f1",
    secondary: store?.branding?.secondaryColor || "#4f46e5",
  };

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (showAuthModal) {
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
        phone: "",
        agreeTerms: false,
      });
      setErrors({});
      setShowPassword(false);
      setShowConfirmPassword(false);
      setPasswordStrength(null);
      setForgotEmailSent(false);
    }
  }, [showAuthModal, authModalMode]);

  // Update password strength when password changes
  useEffect(() => {
    if (authModalMode === "register" && formData.password) {
      setPasswordStrength(checkPasswordStrength(formData.password));
    } else {
      setPasswordStrength(null);
    }
  }, [formData.password, authModalMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = useCallback(() => {
    const newErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation (for login and register)
    if (authModalMode !== "forgot") {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (authModalMode === "register" && formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      }
    }

    // Register-specific validations
    if (authModalMode === "register") {
      if (!formData.firstName.trim()) {
        newErrors.firstName = "First name is required";
      } else if (formData.firstName.length > 50) {
        newErrors.firstName = "First name is too long";
      }

      if (!formData.lastName.trim()) {
        newErrors.lastName = "Last name is required";
      } else if (formData.lastName.length > 50) {
        newErrors.lastName = "Last name is too long";
      }

      if (formData.phone && !validatePhone(formData.phone)) {
        newErrors.phone = "Please enter a valid phone number";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }

      if (passwordStrength && passwordStrength.score < 3) {
        newErrors.password = "Please choose a stronger password";
      }

      if (!formData.agreeTerms) {
        newErrors.agreeTerms = "You must agree to the terms";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, authModalMode, passwordStrength]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (authModalMode === "login") {
        await login({
          email: formData.email,
          password: formData.password,
        });
      } else if (authModalMode === "register") {
        await register({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
        });
      } else if (authModalMode === "forgot") {
        const result = await forgotPassword(formData.email);
        if (result.success) {
          setForgotEmailSent(true);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = (mode) => {
    setAuthModalMode(mode);
    setErrors({});
  };

  if (!showAuthModal) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={closeAuthModal} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
          {/* Header */}
          <div className="relative px-6 pt-6 pb-4">
            {/* Close button */}
            <button onClick={closeAuthModal} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>

            {/* Back button for forgot password */}
            {authModalMode === "forgot" && !forgotEmailSent && (
              <button onClick={() => switchMode("login")} className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100 transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-500" />
              </button>
            )}

            {/* Title */}
            <div className="text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${brandColors.primary}15` }}>
                {authModalMode === "forgot" ? <Mail className="w-7 h-7" style={{ color: brandColors.primary }} /> : <User className="w-7 h-7" style={{ color: brandColors.primary }} />}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{authModalMode === "login" ? "Welcome Back" : authModalMode === "register" ? "Create Account" : "Reset Password"}</h2>
              <p className="text-gray-500 mt-1">{authModalMode === "login" ? "Sign in to continue your booking" : authModalMode === "register" ? "Join us to book appointments easily" : "We'll send you a reset link"}</p>
            </div>
          </div>

          {/* Form */}
          <div className="px-6 pb-6">
            {/* Forgot password success */}
            {authModalMode === "forgot" && forgotEmailSent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Check Your Email</h3>
                <p className="text-gray-500 mb-6">We've sent a password reset link to {formData.email}</p>
                <button onClick={() => switchMode("login")} className="text-sm font-medium hover:underline" style={{ color: brandColors.primary }}>
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name fields (register only) */}
                {authModalMode === "register" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${errors.firstName ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-indigo-200 focus:border-indigo-400"}`}
                          placeholder="John"
                          autoComplete="given-name"
                          maxLength={50}
                        />
                      </div>
                      {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <div className="relative">
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className={`block w-full px-3 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${errors.lastName ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-indigo-200 focus:border-indigo-400"}`}
                          placeholder="Doe"
                          autoComplete="family-name"
                          maxLength={50}
                        />
                      </div>
                      {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                    </div>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${errors.email ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-indigo-200 focus:border-indigo-400"}`}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* Phone (register only) */}
                {authModalMode === "register" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-gray-400">(optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${errors.phone ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-indigo-200 focus:border-indigo-400"}`}
                        placeholder="+1 (555) 000-0000"
                        autoComplete="tel"
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                )}

                {/* Password (not for forgot) */}
                {authModalMode !== "forgot" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${errors.password ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-indigo-200 focus:border-indigo-400"}`}
                        placeholder="••••••••"
                        autoComplete={authModalMode === "login" ? "current-password" : "new-password"}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        {showPassword ? <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" /> : <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}

                    {/* Password strength indicator (register only) */}
                    {authModalMode === "register" && passwordStrength && formData.password && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500">Password strength:</span>
                          <span className="text-xs font-medium" style={{ color: passwordStrength.color }}>
                            {passwordStrength.label}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-1 flex-1 rounded-full transition-colors" style={{ backgroundColor: i <= passwordStrength.score ? passwordStrength.color : "#e5e7eb" }} />
                          ))}
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          {!passwordStrength.checks.length && <span className="block">• At least 8 characters</span>}
                          {!passwordStrength.checks.uppercase && <span className="block">• One uppercase letter</span>}
                          {!passwordStrength.checks.lowercase && <span className="block">• One lowercase letter</span>}
                          {!passwordStrength.checks.number && <span className="block">• One number</span>}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Confirm Password (register only) */}
                {authModalMode === "register" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${errors.confirmPassword ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-indigo-200 focus:border-indigo-400"}`}
                        placeholder="••••••••"
                        autoComplete="new-password"
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" /> : <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                  </div>
                )}

                {/* Forgot password link (login only) */}
                {authModalMode === "login" && (
                  <div className="flex justify-end">
                    <button type="button" onClick={() => switchMode("forgot")} className="text-sm font-medium hover:underline" style={{ color: brandColors.primary }}>
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Terms checkbox (register only) */}
                {authModalMode === "register" && (
                  <div className="flex items-start">
                    <input type="checkbox" name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} className="mt-1 h-4 w-4 rounded border-gray-300 focus:ring-2" style={{ accentColor: brandColors.primary }} />
                    <label className="ml-2 text-sm text-gray-600">
                      I agree to the{" "}
                      <a href="/terms" target="_blank" className="font-medium hover:underline" style={{ color: brandColors.primary }}>
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="/privacy" target="_blank" className="font-medium hover:underline" style={{ color: brandColors.primary }}>
                        Privacy Policy
                      </a>
                    </label>
                  </div>
                )}
                {errors.agreeTerms && <p className="text-red-500 text-xs -mt-2">{errors.agreeTerms}</p>}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center px-6 py-3.5 text-white font-semibold rounded-xl transition-all hover:opacity-90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: brandColors.primary }}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {authModalMode === "login" ? "Sign In" : authModalMode === "register" ? "Create Account" : "Send Reset Link"}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>

                {/* Security notice */}
                <div className="flex items-center justify-center text-xs text-gray-400 mt-4">
                  <Shield className="w-4 h-4 mr-1" />
                  <span>Secured with 256-bit encryption</span>
                </div>
              </form>
            )}

            {/* Switch mode links */}
            {authModalMode !== "forgot" && !forgotEmailSent && (
              <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                {authModalMode === "login" ? (
                  <p className="text-gray-600">
                    Don't have an account?{" "}
                    <button type="button" onClick={() => switchMode("register")} className="font-semibold hover:underline" style={{ color: brandColors.primary }}>
                      Sign up
                    </button>
                  </p>
                ) : (
                  <p className="text-gray-600">
                    Already have an account?{" "}
                    <button type="button" onClick={() => switchMode("login")} className="font-semibold hover:underline" style={{ color: brandColors.primary }}>
                      Sign in
                    </button>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
