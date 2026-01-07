import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { apiClient, type User } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { Search } from "lucide-react";

function UserManagement() {
  const { isAdmin, user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    user: User | null;
  }>({ isOpen: false, user: null });
  const [deleting, setDeleting] = useState(false);

  const getAccessLevelLabel = (role: string): string => {
    const labels: Record<string, string> = {
      admin: "מנהל",
      mat: "מזרן",
      machine: "מכשירים",
      combined: "משולב",
    };
    return labels[role] || role;
  };

  useEffect(() => {
    if (isAdmin()) {
      loadUsers();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiClient.getAllUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "שגיאה בטעינת המשתמשים");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (user: User) => {
    setDeleteModal({ isOpen: true, user });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.user) return;

    try {
      setDeleting(true);
      await apiClient.deleteUser(deleteModal.user.id);
      setDeleteModal({ isOpen: false, user: null });
      await loadUsers();
    } catch (err: any) {
      setError(err.message || "שגיאה במחיקת המשתמש");
      setDeleteModal({ isOpen: false, user: null });
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, user: null });
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase();
    return users.filter((user) => user.email.toLowerCase().includes(query));
  }, [users, searchQuery]);

  if (!isAdmin()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-destructive">אין לך הרשאה לגשת לדף זה</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">טוען משתמשים...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">ניהול משתמשים</h1>
        <Link
          to="/admin/create-user"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          צור משתמש
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            size={20}
          />
          <input
            type="text"
            placeholder="חפש לפי אימייל..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* User List */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery.trim()
              ? "לא נמצאו משתמשים המתאימים לחיפוש"
              : "אין משתמשים זמינים"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex flex-col">
                <span className="text-foreground">{user.email}</span>
                <span className="text-sm text-muted-foreground">
                  רמת גישה: {getAccessLevelLabel(user.role)}
                </span>
              </div>
              <button
                onClick={() => handleDeleteClick(user)}
                disabled={user.id === currentUser?.id}
                className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                מחק
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && deleteModal.user && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={handleDeleteCancel}
          />
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-background border border-border rounded-lg p-6 max-w-md w-full shadow-xl"
              dir="rtl"
            >
              <h2 className="text-xl font-semibold mb-4">מחיקת משתמש</h2>
              <p className="mb-6 text-foreground">
                את בטוחה שאת רוצה למחוק את המשתמש{" "}
                <span className="font-semibold">{deleteModal.user.email}</span>?
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleDeleteCancel}
                  disabled={deleting}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                >
                  לא
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {deleting ? "מוחק..." : "כן"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default UserManagement;
