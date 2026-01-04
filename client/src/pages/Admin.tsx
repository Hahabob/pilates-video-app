import { useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

function Admin() {
  const { isAdmin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isAdmin()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-destructive">אין לך הרשאה לגשת לדף זה</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const result = await apiClient.createUser(email, password, role);
      setMessage(result.message);
      setEmail("");
      setPassword("");
      setRole("user");
    } catch (err: any) {
      setError(err.message || "שגיאה ביצירת משתמש");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="max-w-md mx-auto">
        <div className="mb-4">
          <Link
            to="/admin"
            className="text-primary hover:underline text-sm"
          >
            ← חזרה לניהול משתמשים
          </Link>
        </div>
        <h1 className="text-3xl font-bold mb-6">יצירת משתמש חדש</h1>
        {message && (
          <div className="mb-4 p-3 bg-green-500/10 text-green-600 rounded-lg text-sm">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">אימייל</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="הזן אימייל"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">סיסמה</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="הזן סיסמה"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">תפקיד</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "user" | "admin")}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="user">משתמש</option>
              <option value="admin">מנהל</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "יוצר..." : "צור משתמש"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Admin;
