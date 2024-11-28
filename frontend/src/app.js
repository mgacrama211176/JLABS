import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/Home";
import { useSelector } from "react-redux";
import "./index.css";
function App() {
  const token = useSelector((state) => state.auth.token);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={token ? <Navigate to="/home" /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={!token ? <Login /> : <Navigate to="/home" />}
        />
        <Route
          path="/home"
          element={token ? <Home /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
