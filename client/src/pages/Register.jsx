import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      await register({ name, email, password });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <h2 className="text-2xl font-bold">Register</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          Create your QRVerse account.
        </p>

        {error && (
          <div className="mt-4 text-sm px-3 py-2 rounded border border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 grid gap-3">
          <label className="grid gap-1 text-sm">
            <span className="text-zinc-600 dark:text-zinc-300">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded px-3 py-2"
              required
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-zinc-600 dark:text-zinc-300">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded px-3 py-2"
              required
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-zinc-600 dark:text-zinc-300">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded px-3 py-2"
              required
            />
          </label>
          <button
            disabled={loading}
            className="mt-2 px-4 py-3 rounded bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-medium disabled:opacity-60"
          >
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
          Already have an account? <Link className="underline" to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
