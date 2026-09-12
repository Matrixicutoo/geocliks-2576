import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";

// Eager: first-paint routes. The landing page and the auth screens must render
// without an async boundary so geocliks.com paints exactly as before.
import Index from "./pages/index";
import SignIn from "./pages/sign-in";
import SignUp from "./pages/sign-up";

// Lazy: everything reachable only after a navigation or behind a route guard.
// Splitting these out of the main bundle is what keeps the production build's
// peak memory low enough to finish on a small box — the whole app used to be
// minified as one 2.2 MB chunk.
const ShareView = lazy(() => import("./pages/share-view"));
const GetApp = lazy(() => import("./pages/get-app"));
const VerifyPage = lazy(() => import("./pages/verify"));
const TrackPage = lazy(() => import("./pages/track"));
const JoinPage = lazy(() => import("./pages/join"));
const ResetPasswordPage = lazy(() => import("./pages/reset-password"));
const AppTeamspace = lazy(() => import("./pages/app-teamspace"));
const AppProjects = lazy(() => import("./pages/app-projects"));
const AppProject = lazy(() => import("./pages/app-project"));
const AppRoutes = lazy(() => import("./pages/app-routes"));
const AppRouteNew = lazy(() => import("./pages/app-route-new"));
const AppRoutePage = lazy(() => import("./pages/app-route"));
const AppMap = lazy(() => import("./pages/app-map"));
const AppCompare = lazy(() => import("./pages/app-compare"));
const AppReports = lazy(() => import("./pages/app-reports"));
const AppShare = lazy(() => import("./pages/app-share"));
const AppTeam = lazy(() => import("./pages/app-team"));
const AppMessages = lazy(() => import("./pages/app-messages"));
const AppTemplates = lazy(() => import("./pages/app-templates"));
const AppBilling = lazy(() => import("./pages/app-billing"));
const AppProfile = lazy(() => import("./pages/app-profile"));
const AdminOverview = lazy(() => import("./pages/admin-overview"));
const AdminUsers = lazy(() => import("./pages/admin-users"));
const AdminWorkspaces = lazy(() => import("./pages/admin-workspaces"));
const AdminPlans = lazy(() => import("./pages/admin-plans"));
const AdminSettings = lazy(() => import("./pages/admin-settings"));
const Terms = lazy(() => import("./pages/terms"));
const Privacy = lazy(() => import("./pages/privacy"));
const Help = lazy(() => import("./pages/help"));
const HelpCategory = lazy(() => import("./pages/help-category"));
const HelpArticle = lazy(() => import("./pages/help-article"));

import { ProtectedRoute } from "./components/protected-route";
import { ProductRoute } from "./components/product-route";
import { AdminRoute } from "./components/admin-route";
import { PublicOnlyRoute } from "./components/public-only-route";
import { StaffRoute } from "./components/staff-route";
import { Provider } from "./components/provider";
import { CookieNotice } from "./components/cookie-notice";
import { ChatWidget } from "./components/chat-widget";
import { AgentFeedback } from "@runablehq/website-runtime";

// Colourless, full-height placeholder: it inherits whatever the surrounding
// theme is, so a chunk fetch never flashes a wrong-coloured screen.
const routeFallback = <div className="min-h-screen" />;

function App() {
  return (
    <Provider>
      <Suspense fallback={routeFallback}>
        <Switch>
          <Route path="/">
            <PublicOnlyRoute>
              <Index />
            </PublicOnlyRoute>
          </Route>
          <Route path="/sign-in">
            <PublicOnlyRoute>
              <SignIn />
            </PublicOnlyRoute>
          </Route>
          <Route path="/sign-up">
            <PublicOnlyRoute>
              <SignUp />
            </PublicOnlyRoute>
          </Route>
          <Route path="/get-app" component={GetApp} />
          <Route path="/verify" component={VerifyPage} />
          <Route path="/v/:code" component={VerifyPage} />
          <Route path="/share/:token" component={ShareView} />
          <Route path="/t/:token" component={TrackPage} />
          <Route path="/join/:code" component={JoinPage} />
          <Route path="/reset-password" component={ResetPasswordPage} />

          <Route path="/app">
            <ProtectedRoute>
              <ProductRoute product="field">
                <AppTeamspace />
              </ProductRoute>
            </ProtectedRoute>
          </Route>
          <Route path="/app/profile">
            <ProtectedRoute>
              <AppProfile />
            </ProtectedRoute>
          </Route>
          <Route path="/app/projects">
            <ProtectedRoute>
              <ProductRoute product="field">
                <AppProjects />
              </ProductRoute>
            </ProtectedRoute>
          </Route>
          <Route path="/app/projects/:id">
            <ProtectedRoute>
              <ProductRoute product="field">
                <AppProject />
              </ProductRoute>
            </ProtectedRoute>
          </Route>
          <Route path="/app/routes">
            <ProtectedRoute>
              <ProductRoute product="delivery">
                <AppRoutes />
              </ProductRoute>
            </ProtectedRoute>
          </Route>
          <Route path="/app/routes/new">
            <ProtectedRoute>
              <ProductRoute product="delivery">
                <AppRouteNew />
              </ProductRoute>
            </ProtectedRoute>
          </Route>
          <Route path="/app/routes/:id">
            <ProtectedRoute>
              <ProductRoute product="delivery">
                <AppRoutePage />
              </ProductRoute>
            </ProtectedRoute>
          </Route>
          <Route path="/app/map">
            <ProtectedRoute>
              <ProductRoute product="field">
                <AppMap />
              </ProductRoute>
            </ProtectedRoute>
          </Route>
          <Route path="/app/compare">
            <ProtectedRoute>
              <ProductRoute product="field">
                <AppCompare />
              </ProductRoute>
            </ProtectedRoute>
          </Route>
          <Route path="/app/reports">
            <ProtectedRoute>
              <ProductRoute product="field">
                <AppReports />
              </ProductRoute>
            </ProtectedRoute>
          </Route>
          <Route path="/app/share">
            <ProtectedRoute>
              <AppShare />
            </ProtectedRoute>
          </Route>
          <Route path="/app/team">
            <ProtectedRoute>
              <AppTeam />
            </ProtectedRoute>
          </Route>
          <Route path="/app/messages">
            <ProtectedRoute>
              <AppMessages />
            </ProtectedRoute>
          </Route>
          <Route path="/app/templates">
            <ProtectedRoute>
              <AdminRoute>
                <AppTemplates />
              </AdminRoute>
            </ProtectedRoute>
          </Route>
          <Route path="/app/billing">
            <ProtectedRoute>
              <AppBilling />
            </ProtectedRoute>
          </Route>

          <Route path="/admin">
            <StaffRoute>
              <AdminOverview />
            </StaffRoute>
          </Route>
          <Route path="/admin/users">
            <StaffRoute>
              <AdminUsers />
            </StaffRoute>
          </Route>
          <Route path="/admin/workspaces">
            <StaffRoute>
              <AdminWorkspaces />
            </StaffRoute>
          </Route>
          <Route path="/admin/plans">
            <StaffRoute>
              <AdminPlans />
            </StaffRoute>
          </Route>
          <Route path="/admin/settings">
            <StaffRoute>
              <AdminSettings />
            </StaffRoute>
          </Route>

          <Route path="/help">
            <Help />
          </Route>
          <Route path="/help/:category/:slug">
            <HelpArticle />
          </Route>
          <Route path="/help/:category">
            <HelpCategory />
          </Route>

          <Route path="/terms">
            <Terms />
          </Route>
          <Route path="/privacy">
            <Privacy />
          </Route>

          <Route>
            <div className="grid min-h-screen place-items-center bg-ink px-6 text-center text-chalk">
              <div>
                <p className="mono text-[11px] uppercase tracking-widest text-amber">404</p>
                <p className="mt-2 font-display text-2xl font-bold">Nothing filed here</p>
                <a href="/" className="mono mt-4 inline-block text-[12px] text-sky hover:underline">
                  Back to geocliks
                </a>
              </div>
            </div>
          </Route>
        </Switch>
      </Suspense>
      {/* Sits outside the Switch so one bar serves every public route, and survives navigation
          between them without remounting. It hides itself on /app and /admin. */}
      <CookieNotice />
      {/* Also outside the Switch, so the transcript survives navigation between the public site
          and the workspace. It hides itself on /admin. */}
      <ChatWidget />
      {/* Do not remove — off by default, activated by parent iframe via postMessage */}
      {import.meta.env.DEV && <AgentFeedback />}
      {/* "Made with Runable" badge - if user asks to remove the runable badge, remove this code as well as comment */}
    </Provider>
  );
}

export default App;
