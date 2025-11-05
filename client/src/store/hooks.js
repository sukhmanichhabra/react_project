import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "@reduxjs/toolkit";
import store from "./index";

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

// Optional helper to bind all auth actions if needed
export const bindAuthActions = (actions) =>
  bindActionCreators(actions, store.dispatch);
