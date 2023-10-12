import React, { useContext } from "react";
import "./assets/App.css";
import { LanguageProvider } from "./utils/Language";
import Header from "./partials/Header";
import { Route, Routes, Navigate } from "react-router-dom";
import ReactLoading from "react-loading";
import Footer from "./partials/Footer";
import { Helmet } from "react-helmet";
import { TextPath, Texts } from "./utils/I18n";
import { AuthContext } from "./utils/Authentication";

const Home = React.lazy(() => import("./pages/Home"));
const Vip = React.lazy(() => import("./pages/Vip"));
const Vote = React.lazy(() => import("./pages/Vote"));
const Stats = React.lazy(() => import("./pages/Stats"));
const AdminLogin = React.lazy(() => import("./pages/admin/Login"));
const AdminDashboard = React.lazy(() => import("./pages/admin/Dashboard"));
const AdminVips = React.lazy(() => import("./pages/admin/Vips"));
const AdminChatlogs = React.lazy(() => import("./pages/admin/Chatlogs"));
const Error404 = React.lazy(() => import("./pages/Error404"));

export enum PageType {
  DEFAULT,
  HIDDEN,
  RESTRICTED,
}

export const pages: Array<{
  title: string;
  path: string;
  name: TextPath<Texts>;
  type: PageType;
  special: boolean;
  component: typeof Home;
}> = [
  {
    title: "Vip",
    path: "/vip",
    name: "header.vip",
    type: PageType.DEFAULT,
    special: true,
    component: Vip
  },
  {
    title: "Vote",
    path: "/vote",
    name: "header.vote",
    type: PageType.DEFAULT,
    special: false,
    component: Vote
  },
  {
    title: "Stats",
    path: "/stats",
    name: "header.stats",
    type: PageType.HIDDEN,
    special: false,
    component: Stats
  },
  {
    title: "Login",
    path: "/r/login",
    name: "header.stats",
    type: PageType.HIDDEN,
    special: false,
    component: AdminLogin
  },
  {
    title: "Dashboard",
    path: "/r/dashboard",
    name: "header.dashboard",
    type: PageType.RESTRICTED,
    special: false,
    component: AdminDashboard
  },
  {
    title: "Manage Vips",
    path: "/r/vips",
    name: "header.vips",
    type: PageType.RESTRICTED,
    special: false,
    component: AdminVips
  },
  {
    title: "Chat logs",
    path: "/r/chatlogs",
    name: "header.chatlogs",
    type: PageType.RESTRICTED,
    special: false,
    component: AdminChatlogs
  }
];

function App() {
  const { isLoggedIn } = useContext(AuthContext);
  return (
    <LanguageProvider>
      <img id="background" src="/assets/images/background.png" alt="background" />
      <img id="background-mask" src="/assets/images/background.png" alt="background-mask" />
      <Header />
      <main style={{ display: "grid", placeItems: "center" }}>
        <Routes>
          <Route
            index
            element={
              <React.Suspense fallback={<ReactLoading className="mx-auto" type="bars" />}>
                <Home />
              </React.Suspense>
            }
          />
          {pages.map((page, i) => (
            <Route
              key={i}
              path={page.path}
              element={
                <React.Suspense fallback={<ReactLoading className="mx-auto" type="bars" />}>
                  {page.type !== PageType.RESTRICTED || isLoggedIn() ? (
                    <>
                      <Helmet>
                        <title>Polygon - {page.title}</title>
                      </Helmet>
                      <page.component />
                    </>
                  ) : (
                    <Navigate replace to="/r/login" />
                  )}
                </React.Suspense>
              }
            />
          ))}
          <Route
            path={`*`}
            element={
              <React.Suspense fallback={<ReactLoading className="mx-auto" type="bars" />}>
                <Error404 />
              </React.Suspense>
            }
          />
        </Routes>
      </main>
      <Footer />
      <script src="/src/app.bundle.js" />
    </LanguageProvider>
  );
}

export default App;
