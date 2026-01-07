import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import SignIn from "./pages/SignIn";
import Feed from "./pages/Feed";
import VideoPlayer from "./pages/VideoPlayer";
import Admin from "./pages/Admin";
import UserManagement from "./pages/UserManagement";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./contexts/AuthContext";

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route
          index
          element={
            <ProtectedRoute>
              <Feed />
            </ProtectedRoute>
          }
        />
        <Route
          path="sign-in"
          element={user ? <Navigate to="/" replace /> : <SignIn />}
        />
        <Route
          path="video-player/:id?"
          element={
            <ProtectedRoute>
              <VideoPlayer />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin"
          element={
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/create-user"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
