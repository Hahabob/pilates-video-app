import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main
        className="grow"
        style={{ backgroundColor: "hsl(290, 20%, 98.2%)" }}
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
