import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateOrJoinMess from "./pages/CreateOrJoinMess";
import PrivateRoute from "./components/PrivateRoute"; // Import PrivateRoute
import ApprovedRoute from "./components/ApprovedRoute"; // Import PrivateRoute
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protect the Dashboard route */}
        <Route element={<PrivateRoute />}>
          <Route path="/create-or-join" element={<CreateOrJoinMess />} />

          <Route element={<ApprovedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
