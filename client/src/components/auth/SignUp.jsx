import { useState, useEffect } from "react";
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

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});

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

  // Validation rules
  const validators = {
    name: (value) => {
      if (!value.trim()) return "Name is required";
      if (value.trim().length < 2) return "Name must be at least 2 characters";
      if (!/^[a-zA-Z\s]+$/.test(value))
        return "Name can only contain letters and spaces";
      return null;
    },
    email: (value) => {
      if (!value.trim()) return "Email is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        return "Please enter a valid email address";
      return null;
    },
    role: (value) => {
      if (!value) return "Please select a role";
      return null;
    },
    password: (value) => {
      if (!value) return "Password is required";
      if (value.length < 8) return "Password must be at least 8 characters";
      if (!/(?=.*[a-z])/.test(value))
        return "Password must contain at least one lowercase letter";
      if (!/(?=.*[A-Z])/.test(value))
        return "Password must contain at least one uppercase letter";
      if (!/(?=.*\d)/.test(value))
        return "Password must contain at least one number";
      return null;
    },
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear field error if it exists
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: null,
      });
    }
  };

  const validateField = (fieldName) => {
    const value = formData[fieldName];
    const error = validators[fieldName](value);

    setFieldErrors({
      ...fieldErrors,
      [fieldName]: error,
    });

    return !error;
  };

  const handleBlur = (e) => {
    validateField(e.target.name);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields
    let isValid = true;
    const newErrors = {};

    Object.keys(validators).forEach((field) => {
      const error = validators[field](formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setFieldErrors(newErrors);

    if (isValid) {
      dispatch(registerUser(formData));
    }
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

          <form onSubmit={handleSubmit}>
            <h2>Sign up</h2>

            <label htmlFor="name">Name*</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={fieldErrors.name ? "error" : ""}
            />
            {fieldErrors.name && (
              <div className="error-message">{fieldErrors.name}</div>
            )}

            <label htmlFor="email">Email address*</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={fieldErrors.email ? "error" : ""}
            />
            {fieldErrors.email && (
              <div className="error-message">{fieldErrors.email}</div>
            )}

            <label htmlFor="role">Select role*</label>
            <div className="select-wrapper">
              <select
                id="role"
                name="role"
                required
                value={formData.role}
                onChange={handleChange}
                onBlur={handleBlur}
                className={fieldErrors.role ? "error" : ""}
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
            {fieldErrors.role && (
              <div className="error-message">{fieldErrors.role}</div>
            )}

            <label htmlFor="password">Create password*</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={fieldErrors.password ? "error" : ""}
            />
            {fieldErrors.password && (
              <div className="error-message">{fieldErrors.password}</div>
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
