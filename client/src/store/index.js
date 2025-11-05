import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";

// Detect production mode in Vite/browser safely
const isProduction =
  typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env.MODE === "production"
    : false;

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  devTools: !isProduction,
});

export default store;
