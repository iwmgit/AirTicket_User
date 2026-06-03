import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { resendVerificationEmail } from "../utils/api";
import { FaEnvelope, FaLock, FaUser, FaPhoneAlt, FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";

export default function SignIn({ open = true, setOpen }) {
  const [screen, setScreen] = useState("login");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { login, register, loading, error: authError } = useAuth();
  const [error, setError] = useState("");
  const [verificationPending, setVerificationPending] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isModal = typeof setOpen === "function";
  if (isModal && !open) return null;

  const close = () => {
    if (isModal) setOpen(false);
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login(formData.email, formData.password);
      close();
      navigate("/");
    } catch (err) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail || err.message || "Login failed";
      if (status === 403 && detail.toLowerCase().includes("not verified")) {
        setVerificationPending(true);
        setScreen("verify");
      } else if (status === 404) {
        setError("No account found with this email address. Please sign up first.");
      } else if (status === 401) {
        setError("Incorrect password. Please try again.");
      } else if (status === 403 && detail.toLowerCase().includes("inactive")) {
        setError("Your account has been deactivated. Please contact support.");
      } else {
        setError(detail);
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        phone: formData.phone,
      });

      setVerificationPending(true);
      setScreen("verify");
    } catch (err) {
      const detail = err?.response?.data?.detail || err.message || "Signup failed";
      if (detail.toLowerCase().includes("already registered")) {
        setVerificationPending(true);
        setScreen("verify");
        resendVerificationEmail({ email: formData.email }).catch(() => {});
      } else {
        setError(detail);
      }
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setError("");

    try {
      await resendVerificationEmail({ email: formData.email });
      alert("Verification email sent! Please check your inbox.");
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Failed to resend email"
      );
    } finally {
      setResendLoading(false);
    }
  };

  const displayError = error || authError;

  return (
    <div
      className={`${
        isModal
          ? "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          : "flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
      }`}
      onClick={isModal ? close : undefined}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md"
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-8 pt-6 ${
            isModal ? "border-b border-gray-200" : ""
          }`}
        >
          <h2 className="text-2xl font-bold text-gray-900">
            {screen === "login"
              ? "Welcome Back"
              : screen === "register"
              ? "Create Account"
              : "Verify Email"}
          </h2>

          {isModal && (
            <button
              onClick={close}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <FaTimes size={20} />
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        {screen !== "verify" && (
          <div
            className={`flex border-b border-gray-200 ${
              !isModal ? "bg-gray-50" : ""
            }`}
          >
            <button
              onClick={() => {
                setScreen("login");
                setError("");
                setVerificationPending(false);
              }}
              className={`flex-1 py-4 text-sm font-semibold transition-all ${
                screen === "login"
                  ? "border-b-2 border-blue-600 text-blue-600 bg-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Log In
            </button>

            <button
              onClick={() => {
                setScreen("register");
                setError("");
                setVerificationPending(false);
              }}
              className={`flex-1 py-4 text-sm font-semibold transition-all ${
                screen === "register"
                  ? "border-b-2 border-blue-600 text-blue-600 bg-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Register
            </button>
          </div>
        )}

        <div className="p-8">
          {displayError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{displayError}</p>
            </div>
          )}

          {screen === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email/Username
                </label>

                <div className="relative">
                  <FaEnvelope className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={onChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Enter your email or username"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>

                <div className="relative">
                  <FaLock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={onChange}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>

              <div className="text-center">
                <Link
                  to="/forgot-password"
                  className="text-sm text-gray-600 hover:text-blue-700 underline transition"
                  onClick={() => {
                    if (isModal) close();
                  }}
                >
                  Forgot Password?
                </Link>
              </div>

              <div className="border-t border-gray-200 pt-4 text-center">
                <p className="text-sm text-gray-500">
                  Don't have an account{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setScreen("register");
                      setError("");
                      setVerificationPending(false);
                    }}
                    className="text-blue-600 font-medium hover:underline"
                  >
                    Register
                  </button>
                </p>
              </div>
            </form>
          )}

          {screen === "register" && !verificationPending && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>

                <div className="relative">
                  <FaUser className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    name="full_name"
                    type="text"
                    value={formData.full_name}
                    onChange={onChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>

                <div className="relative">
                  <FaPhoneAlt className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={onChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>

                <div className="relative">
                  <FaEnvelope className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={onChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>

                <div className="relative">
                  <FaLock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={onChange}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Create a password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>

                <div className="relative">
                  <FaLock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={onChange}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>

              <p className="text-xs text-gray-600 text-center">
                By signing up, you agree to our Terms of Service and Privacy Policy
              </p>
            </form>
          )}

          {screen === "verify" && verificationPending && (
            <div className="text-center py-4">
              <div className="mb-4 text-4xl">✉️</div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Verify Your Email
              </h3>

              <p className="text-gray-600 text-sm mb-6">
                We&apos;ve sent a verification link to <br />
                <strong className="text-gray-900">{formData.email}</strong>
              </p>

              <p className="text-gray-600 text-sm mb-6">
                Please check your inbox and click the verification link to complete
                your registration.
              </p>

              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition mb-3"
              >
                {resendLoading ? "Resending..." : "Resend Verification Email"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setVerificationPending(false);
                  setScreen("login");
                  setFormData({
                    full_name: "",
                    phone: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                  });
                }}
                className="w-full border-2 border-gray-300 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Back to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}