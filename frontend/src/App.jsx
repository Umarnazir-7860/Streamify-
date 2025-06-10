import { Navigate, Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import CallPage from "./pages/CallPage";
import NotificationPage from "./pages/NotificationPage";
import OnboardingPage from "./pages/OnboardingPage";
import ChatPage from "./pages/ChatPage";
import SignupPage from "./pages/SignupPage";
import { Toaster } from "react-hot-toast";
import PageLoader from "./components/PageLoader";
import useAuthUser from "./hooks/useAuthUser";
import Layout from "./components/Layout";
import { useThemeStore } from "./store/useThemeStore";
function App() {
  //tanstack query
  const { isLoading, authUser } = useAuthUser();
  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;
  const { theme, setTheme } = useThemeStore();
  if (isLoading) return <PageLoader />;

  //  const [data, setData] = useState([]);
  //   const [isloading, setisLoading] = useState(false);
  //   const [error, setError] = useState(null);
  //   useEffect(()=>{
  //   const getData = async () => {
  //    setisLoading(true);
  //     try {
  //       const data = await fetch("https://jsonplaceholder.typicode.com/todos")
  //       const json = await data.json();
  //       setData(json);
  //     } catch (error) {
  //       setError(error);
  //     }
  //     finally {
  //       setisLoading(false);
  //     }
  //   };
  //   getData();
  //   },[])
  //   console.log(data);
  return (
    <>
      <div data-theme={theme} className="h-screen">
        {/* <button onClick={()=>setTheme("night")}>Update to Night Theme</button> */}
        <Toaster />
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                isOnboarded ? (
                  <Layout showSidebar={true}>
                    <HomePage />
                  </Layout>
                ) : (
                  <Navigate to="/onboarding" />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/signup"
            element={
              !isAuthenticated ? (
                <SignupPage />
              ) : (
                <Navigate to={isOnboarded ? "/" : "/onboarding"} />
              )
            }
          />
          <Route
            path="/login"
            element={
              !isAuthenticated ? (
                <LoginPage />
              ) : (
                <Navigate to={isOnboarded ? "/" : "/onboarding"} />
              )
            }
          />
               <Route
          path="/call/:id"
          element={
            isAuthenticated && isOnboarded ? (
              <CallPage />
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />
        
          <Route
            path="/notification"
            element={
              isAuthenticated && isOnboarded ? (
                <Layout showSidebar={true}>
                  <NotificationPage />
                </Layout>
              ) : (
                <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
              )
            }
          />
          <Route
            path="/chat/:id"
            element={
              isAuthenticated && isOnboarded ? (
                <Layout showSidebar={false}>
                  <ChatPage />
                </Layout>
              ) : (
                <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
              )
            }
          />

          <Route
            path="/onboarding"
            element={
              isAuthenticated ? (
                !isOnboarded ? (
                  <OnboardingPage />
                ) : (
                  <Navigate to="/" />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </div>
    </>
  );
}

export default App;
