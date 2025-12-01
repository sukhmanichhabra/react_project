import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// Async thunks for authentication
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/signin", {
        email,
        password,
      });

      if (response.data.success) {
        // Store user data in localStorage
        if (response.data.data?.user) {
          localStorage.setItem("user", JSON.stringify(response.data.data.user));
        }
        return response.data;
      }

      return rejectWithValue(response.data.message || "Login failed");
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Network error occurred"
      );
    }
  }
);

export const verifyTwoFactor = createAsyncThunk(
  "auth/verifyTwoFactor",
  async ({ token }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/verify-2fa", {
        token,
      });

      if (response.data.success) {
        // Store user data in localStorage
        if (response.data.data?.user) {
          localStorage.setItem("user", JSON.stringify(response.data.data.user));
        }
        return response.data;
      }

      return rejectWithValue(
        response.data.message || "2FA verification failed"
      );
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Network error occurred"
      );
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/signup", userData);

      if (response.data.success) {
        // Store user data in localStorage
        if (response.data.data?.user) {
          localStorage.setItem("user", JSON.stringify(response.data.data.user));
        }
        return response.data;
      }

      return rejectWithValue(response.data.message || "Registration failed");
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Network error occurred"
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/auth/logout");

      // Clear localStorage
      localStorage.removeItem("user");

      return response.data;
    } catch (error) {
      // Even if logout fails on server, clear local storage
      localStorage.removeItem("user");
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  }
);

export const checkAuthStatus = createAsyncThunk(
  "auth/checkAuthStatus",
  async (_, { rejectWithValue }) => {
    try {
      // Check if user data exists in localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        // Validate that the stored user object has required properties
        if (parsedUser && parsedUser._id) {
          return {
            success: true,
            data: {
              user: parsedUser,
            },
          };
        }
      }

      // If no valid stored user, clear localStorage and return not authenticated
      localStorage.removeItem("user");
      return rejectWithValue("Not authenticated");
    } catch {
      // If parsing fails, clear localStorage
      localStorage.removeItem("user");
      return rejectWithValue("Not authenticated");
    }
  }
);

// Fetch fresh user data from server (including latest balance)
export const fetchUserBalance = createAsyncThunk(
  "auth/fetchUserBalance",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/dashboard/debug-user");

      if (response.data.success) {
        // Update user data in localStorage with fresh data
        const updatedUser = response.data.user;
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return response.data;
      }

      return rejectWithValue(
        response.data.message || "Failed to fetch user data"
      );
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Network error occurred"
      );
    }
  }
);

// Update user balance
export const updateUserBalance = createAsyncThunk(
  "auth/updateUserBalance",
  async (amount, { rejectWithValue }) => {
    try {
      const response = await api.post("/dashboard/update-balance", {
        amount,
      });

      if (response.data.success) {
        // Update user data in localStorage
        const updatedUser = response.data.user;
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return response.data;
      }

      return rejectWithValue(
        response.data.message || "Failed to update balance"
      );
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Network error occurred"
      );
    }
  }
);

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading true to prevent premature redirects
  requiresTwoFactor: false,
  error: null,
  successMessage: null,
};

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.successMessage = null;
    },
    clearTwoFactor: (state) => {
      state.requiresTwoFactor = false;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      if (action.payload) {
        localStorage.setItem("user", JSON.stringify(action.payload));
      }
    },
    updateBalance: (state, action) => {
      if (state.user) {
        state.user.accountBalance = action.payload;
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.requiresTwoFactor = false;
      state.error = null;
      state.successMessage = null;
      localStorage.removeItem("user");
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;

        if (action.payload.requiresTwoFactor) {
          state.requiresTwoFactor = true;
          state.successMessage = "Please enter your 2FA code";
        } else {
          state.user = action.payload.data.user;
          state.isAuthenticated = true;
          state.successMessage = action.payload.message;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // 2FA verification cases
      .addCase(verifyTwoFactor.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyTwoFactor.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data.user;
        state.isAuthenticated = true;
        state.requiresTwoFactor = false;
        state.successMessage = action.payload.message;
      })
      .addCase(verifyTwoFactor.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Registration cases
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data.user;
        state.isAuthenticated = true;
        state.successMessage = action.payload.message;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Logout cases
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.requiresTwoFactor = false;
        state.error = null;
        state.successMessage = "Logged out successfully";
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        // Still clear auth state even if logout request failed
        state.user = null;
        state.isAuthenticated = false;
        state.requiresTwoFactor = false;
        state.error = action.payload;
      })

      // Check auth status cases
      .addCase(checkAuthStatus.pending, (state) => {
        // Keep loading true to prevent premature route decisions
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null; // Don't show error for auth check failures
      })

      // Fetch user balance cases
      .addCase(fetchUserBalance.pending, () => {
        // Don't set loading to true here to avoid UI flicker
      })
      .addCase(fetchUserBalance.fulfilled, (state, action) => {
        if (state.user && action.payload.user) {
          // Update the entire user object with fresh data from server
          state.user = action.payload.user;
        }
      })
      .addCase(fetchUserBalance.rejected, (state, action) => {
        console.error("Failed to fetch user balance:", action.payload);
      })

      // Update balance cases
      .addCase(updateUserBalance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserBalance.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.user && action.payload.user) {
          // Update user with new balance
          state.user = action.payload.user;
        }
        state.successMessage = action.payload.message;
      })
      .addCase(updateUserBalance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  clearTwoFactor,
  setUser,
  updateBalance,
  clearAuth,
} = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectError = (state) => state.auth.error;
export const selectSuccessMessage = (state) => state.auth.successMessage;
export const selectRequiresTwoFactor = (state) => state.auth.requiresTwoFactor;
