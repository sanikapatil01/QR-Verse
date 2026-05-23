import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Generator from "./pages/Generator.jsx";
import Template from "./pages/Template.jsx";
import Pricing from "./pages/Pricing.jsx";
import Contact from "./pages/Contact.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import { useAuth } from "./context/AuthContext.jsx";

const ProtectedRoute = ({ children }) => {
  const { loading, isAuthed } = useAuth();
  if (loading) return <div className="p-6">Loading...</div>;
  return isAuthed ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/generate" element={<Generator />} />
        <Route path="/template" element={<Template />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
