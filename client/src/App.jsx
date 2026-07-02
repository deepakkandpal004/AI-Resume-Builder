import { useEffect } from "react";
import ResumeBuilder from "./pages/ResumeBuilder";
import Preview from "./pages/Preview";
import Dashboard from "./pages/Dashboard";
import ResetPassword from "./pages/ResetPassword";
import Upgrade from "./pages/Upgrade";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Layout from "./pages/Layout";
import { useDispatch } from "react-redux";
import api from "./configs/api";
import { login, setLoading } from "./app/features/authSlice";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "./components/ErrorBoundary";

const App = () => {
  const dispatch = useDispatch();

  const getUserData = async () => {
    const token = localStorage.getItem("token");
    try {
      if (token) {
        const { data } = await api.get("/api/users/data", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (data.user) {
          dispatch(login({ user: data.user, token }));
        }
      }
      dispatch(setLoading(false));
    } catch (error) {
      dispatch(setLoading(false));
      console.log(error.message);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "var(--color-surface)",
            color: "var(--color-ink)",
            border: "1px solid var(--color-line)",
            borderRadius: "12px",
          },
          success: {
            iconTheme: { primary: "#0D9488", secondary: "#ffffff" },
          },
          error: {
            iconTheme: { primary: "#E11D48", secondary: "#ffffff" },
          },
        }}
      />
      <ErrorBoundary>
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="app" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="builder/:resumeId" element={<ResumeBuilder />} />
          <Route path="upgrade" element={<Upgrade />} />
        </Route>
        <Route path="view/:resumeId" element={<Preview />} />
        <Route path="reset-password" element={<ResetPassword />} />
        </Routes>
      </ErrorBoundary>
    </>
  );
};

export default App;
