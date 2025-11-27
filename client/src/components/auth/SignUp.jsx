import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  registerUser,
  clearError,
  clearSuccess,
  selectAuth,
} from "../../store/slices/authSlice";
import toast from "react-hot-toast";
import "./auth.css"; // This should now work correctly with the fixed auth.css

function SignUp() {
  const dispatch = useAppDispatch();
  const { isLoading, error, successMessage, isAuthenticated } =
    useAppSelector(selectAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm();

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

  // Redirect on successful registration
  useEffect(() => {
    if (isAuthenticated) {
      toast.success("Registration successful! Welcome to the platform.");
      // REMOVED: window.location.href = "/";
      // Your App.js already handles this navigation automatically.
    }
  }, [isAuthenticated]);

  const onSubmit = async (data) => {
    dispatch(registerUser(data));
  };

  return (
    <div className="auth-container">
      <div className="container">
        <div className="left">
          <h1>Search better with an account</h1>

          <div className="feature">
            <img src="/assets/save.svg" alt="Save Listings" />
            <div>
              <h3>Save listings you love</h3>
              <p>Keep an eye on your favorite homes.</p>
            </div>
          </div>

          <div className="feature">
            <img src="/assets/search.svg" alt="Save Searches" />
            <div>
              <h3>Save your searches</h3>
              <p>Get alerts for homes that are perfect for you.</p>
            </div>
          </div>

          <div className="feature">
            <img src="/assets/access.svg" alt="Search Anywhere" />
            <div>
              <h3>Search from anywhere</h3>
              <p>Access your search across all your devices.</p>
            </div>
          </div>
        </div>

        <div className="right">
          {error && <div className="alert-message error">{error}</div>}

          {successMessage && (
            <div className="alert-message success">{successMessage}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <h2>Sign up</h2>

            <label htmlFor="name">Name*</label>
            <input
              type="text"
              id="name"
              placeholder="Enter your name"
              className={errors.name ? "error" : ""}
              {...register("name", {
                required: "Name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
                pattern: {
                  value: /^[a-zA-Z\s]+$/,
                  message: "Name can only contain letters and spaces",
                },
              })}
            />
            {errors.name && (
              <div className="error-message">{errors.name.message}</div>
            )}

            <label htmlFor="email">Email address*</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              className={errors.email ? "error" : ""}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Please enter a valid email address",
                },
              })}
            />
            {errors.email && (
              <div className="error-message">{errors.email.message}</div>
            )}

            <label htmlFor="role">Select role*</label>
            <div className="select-wrapper">
              <select
                id="role"
                className={errors.role ? "error" : ""}
                {...register("role", {
                  required: "Please select a role",
                })}
              >
                <option value="" disabled>
                  Choose your role
                </option>
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
                <option value="agent">Agent</option>
              </select>
              <i className="fas fa-chevron-down"></i>
            </div>
            {errors.role && (
              <div className="error-message">{errors.role.message}</div>
            )}

            <label htmlFor="password">Create password*</label>
            <input
              type="password"
              id="password"
              placeholder="Create a password"
              className={errors.password ? "error" : ""}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message:
                    "Password must contain at least one lowercase letter, one uppercase letter, and one number",
                },
              })}
            />
            {errors.password && (
              <div className="error-message">{errors.password.message}</div>
            )}

            <button type="submit" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Sign up"}
            </button>

            <p>
              Already have an account?{" "}
              <a className="btn" href="/auth/signin">
                Log in
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

export default SignUp;
