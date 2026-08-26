import { useEffect, useState, lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Toaster, toast } from "react-hot-toast";
import { setUser, setLoading, logout } from "./app/features/authSlice";
import ErrorBoundary from "./components/ErrorBoundary";
import Loader from "./components/Loader";
import { auth } from "./config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import api, { setCachedToken } from "./configs/api";

const Home = lazy(() => import("./pages/Home"));
const Layout = lazy(() => import("./pages/Layout"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ResumeBuilder = lazy(() => import("./pages/ResumeBuilder"));
const Preview = lazy(() => import("./pages/Preview"));
const Upgrade = lazy(() => import("./pages/Upgrade"));

const App = () => {
  const dispatch = useDispatch();
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          setCachedToken(idToken);
          const { data } = await api.post(
            "/api/users/sync",
            {
              name: firebaseUser.displayName || firebaseUser.email?.split("@")[0],
              email: firebaseUser.email,
              photoURL: firebaseUser.photoURL,
              emailVerified: firebaseUser.emailVerified,
            },
            { headers: { Authorization: `Bearer ${idToken}` } }
          );
          dispatch(setUser(data.user));
        } catch (err) {
          dispatch(setLoading(false));
          if (err?.response?.status === 403) {
            toast.error(err.response.data?.message || "Please verify your email before signing in.");
          }
        }
      } else {
        dispatch(logout());
      }
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, [dispatch]);

  if (!authReady) return <Loader />;

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
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </>
  );
};

export default App;
