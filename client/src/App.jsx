import { useEffect, lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Toaster } from "react-hot-toast";
import { setUser, setLoading } from "./app/features/authSlice";
import ErrorBoundary from "./components/ErrorBoundary";
import Loader from "./components/Loader";
import { auth } from "./config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import api from "./configs/api";

// Lazy load route components
const Home = lazy(() => import("./pages/Home"));
const Layout = lazy(() => import("./pages/Layout"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ResumeBuilder = lazy(() => import("./pages/ResumeBuilder"));
const Preview = lazy(() => import("./pages/Preview"));
const Upgrade = lazy(() => import("./pages/Upgrade"));

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("[Auth] onAuthStateChanged:", firebaseUser ? firebaseUser.email : "signed out");
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          console.log("[Auth] got ID token, syncing user...");
          const { data } = await api.post(
            "/api/users/sync",
            {
              name: firebaseUser.displayName || firebaseUser.email?.split("@")[0],
              email: firebaseUser.email,
              photoURL: firebaseUser.photoURL,
            },
            { headers: { Authorization: `Bearer ${idToken}` } }
          );
          console.log("[Auth] sync succeeded, user:", data.user?.email);
          dispatch(setUser(data.user));
        } catch (error) {
          console.error("[Auth] sync failed:", error.message);
          dispatch(setLoading(false));
        }
      } else {
        dispatch(setLoading(false));
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

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
