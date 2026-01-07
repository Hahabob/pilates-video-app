import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import earthandsky from "../assets/earthandsky.png";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate("/sign-in");
  };

  return (
    <nav
      className="border-b border-border"
      style={{ background: "hsl(290, 20%, 98.2%)" }}
    >
      <div className="container mx-auto pl-4">
        <div
          className="flex items-center justify-between"
          style={{ minHeight: "80px" }}
        >
          <Link to="/" className="flex items-center">
            <img
              src="/facivon-qilates-32x32.png"
              alt="שמיים וארץ"
              className="h-8 w-auto object-contain md:hidden pr-4"
            />
            <img
              src={earthandsky}
              alt="שמיים וארץ"
              className="h-20 w-auto object-contain hidden md:block"
            />
          </Link>
          <div className="flex gap-4 items-center">
            {user ? (
              <>
                {isAdmin() && (
                  <>
                    <Link
                      to="/"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive("/")
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      סרטונים
                    </Link>
                    <Link
                      to="/admin"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive("/admin")
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      ניהול
                    </Link>
                  </>
                )}
                <span className="text-sm text-muted-foreground">
                  {user.email?.split("@")[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  התנתק
                </button>
              </>
            ) : (
              <Link
                to="/sign-in"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/sign-in")
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                התחברות
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
