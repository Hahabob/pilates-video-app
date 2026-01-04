import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
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
          element={user ? <Navigate to="/feed" replace /> : <HomePage />}
        />
        <Route
          path="sign-in"
          element={user ? <Navigate to="/feed" replace /> : <SignIn />}
        />
        <Route
          path="feed"
          element={
            <ProtectedRoute>
              <Feed />
            </ProtectedRoute>
          }
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
