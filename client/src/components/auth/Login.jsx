import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  loginUser,
  verifyTwoFactor,
  clearError,
  clearSuccess,
  selectAuth,
} from "../../store/slices/authSlice";
import toast from "react-hot-toast";
import "./auth.css";

function Login() {
  const dispatch = useAppDispatch();
  const {
    isLoading,
    error,
    successMessage,
    requiresTwoFactor,
    isAuthenticated,
  } = useAppSelector(selectAuth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [twoFactorToken, setTwoFactorToken] = useState("");

  // Clear messages on component mount
  useEffect(() => {
    dispatch(clearError());
    dispatch(clearSuccess());
  }, [dispatch]);

  // Show toast messages for errors and success
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearSuccess());
    }
  }, [error, successMessage, dispatch]);

  // Redirect on successful login
  useEffect(() => {
    if (isAuthenticated) {
      toast.success("Login successful! Welcome back.");
      // REMOVED: window.location.href = "/";
      // Your App.js already handles this navigation automatically.
      // Keeping this line causes an unnecessary full-page reload.
    }
  }, [isAuthenticated]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    dispatch(loginUser(formData));
  };

  const handleTwoFactorSubmit = async (e) => {
    e.preventDefault();
    dispatch(verifyTwoFactor({ token: twoFactorToken }));
  };

  if (requiresTwoFactor) {
    return (
      <div className="auth-container">
        <div className="container">
          <div className="left">
            <h1>Welcome back</h1>
            <img src="/assets/house.svg" alt="Illustration" />
          </div>

          <div className="right">
            {error && <div className="alert-message error">{error}</div>}

            {successMessage && (
              <div className="alert-message success">{successMessage}</div>
            )}

            <form onSubmit={handleTwoFactorSubmit}>
              <h2>Two-Factor Authentication</h2>
              <p>
                Please enter the verification code from your Google
                Authenticator app.
              </p>

              <label htmlFor="token">Verification Code</label>
              <input
                type="text"
                id="token"
                name="token"
                className="verification-code"
                required
                placeholder="000000"
                maxLength="6"
                minLength="6"
                autoComplete="one-time-code"
                value={twoFactorToken}
                onChange={(e) => setTwoFactorToken(e.target.value)}
              />
              <p className="code-help">
                Enter the 6-digit code from your authenticator app
              </p>

              <button type="submit" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify"}
              </button>
            </form>
          </div>
        </div>

        <footer>
          <p>
            By creating an account, you agree to Realtor.com's{" "}
            <a href="#">Privacy notice</a> and <a href="#">Terms of use</a>.
          </p>
        </footer>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="container">
        <div className="left">
          <h1>Welcome back</h1>
          <img src="/assets/house.svg" alt="Illustration" />
        </div>

        <div className="right">
          {error && <div className="alert-message error">{error}</div>}

          {successMessage && (
            <div className="alert-message success">{successMessage}</div>
          )}

          <form onSubmit={handleLogin}>
            <h2>Log in</h2>

            <label htmlFor="email">Email address*</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />

            <label htmlFor="password">Password*</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />

            <a href="#" className="forgot-password">
              Forgot password?
            </a>

            <button type="submit" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Log in"}
            </button>

            <p>
              Don't have an account?{" "}
              <a className="btn" href="/auth/signup">
                Sign up
              </a>
            </p>

            <div className="or">OR</div>

            <button type="button" className="google">
              <i className="fab fa-google"></i> Continue with Google
            </button>
            <button type="button" className="facebook">
              <i className="fab fa-facebook"></i> Continue with Facebook
            </button>
          </form>
        </div>
      </div>

      <footer>
        <p>
          By creating an account, you agree to Realtor.com's{" "}
          <a href="#">Privacy notice</a> and <a href="#">Terms of use</a>.
        </p>
      </footer>
    </div>
  );
}

export default Login;
