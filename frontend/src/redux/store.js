import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import historyReducer from "./slices/historySlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    history: historyReducer,
  },
});

export default store;
