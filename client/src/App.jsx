import { useEffect, lazy, Suspense, useCallback } from "react";
import { Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";
import api from "./configs/api";
import { login, setLoading } from "./app/features/authSlice";
import ErrorBoundary from "./components/ErrorBoundary";
import Loader from "./components/Loader";

// Lazy load route components
const Home = lazy(() => import("./pages/Home"));
const Layout = lazy(() => import("./pages/Layout"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ResumeBuilder = lazy(() => import("./pages/ResumeBuilder"));
const Preview = lazy(() => import("./pages/Preview"));
const Upgrade = lazy(() => import("./pages/Upgrade"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

const App = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  const getUserData = useCallback(async () => {
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
  }, [token, dispatch]);

  useEffect(() => {
    getUserData();
  }, [getUserData]);
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
        <Suspense fallback={<Loader />}>
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
        </Suspense>
      </ErrorBoundary>
    </>
  );
};

export default App;
