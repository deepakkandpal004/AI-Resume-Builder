import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import Loader from "../components/Loader";
import Login from "./Login";

const Layout = () => {
  const { user, loading } = useSelector((state) => state.auth);
  const location = useLocation();
  const isBuilder = location.pathname.includes("/app/builder/");

  if (loading) {
    return <Loader />;
  }
  return (
    <div>
      {user ? (
        <div className={`min-h-screen bg-canvas ${isBuilder ? "" : "pt-[90px]"}`}>
          <Navbar />
          <Outlet />
        </div>
      ) : (
        <Login />
      )}
    </div>
  );
};

export default Layout;
