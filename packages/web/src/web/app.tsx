import { Route, Switch } from "wouter";
import Index from "./pages/index";
import SignIn from "./pages/sign-in";
import SignUp from "./pages/sign-up";
import ShareView from "./pages/share-view";
import GetApp from "./pages/get-app";
import VerifyPage from "./pages/verify";
import TrackPage from "./pages/track";
import JoinPage from "./pages/join";
import ResetPasswordPage from "./pages/reset-password";
import AppTeamspace from "./pages/app-teamspace";
import AppProjects from "./pages/app-projects";
import AppProject from "./pages/app-project";
import AppRoutes from "./pages/app-routes";
import AppRouteNew from "./pages/app-route-new";
import AppRoutePage from "./pages/app-route";
import AppMap from "./pages/app-map";
import AppCompare from "./pages/app-compare";
import AppReports from "./pages/app-reports";
import AppShare from "./pages/app-share";
import AppTeam from "./pages/app-team";
import AppMessages from "./pages/app-messages";
import AppTemplates from "./pages/app-templates";
import AppBilling from "./pages/app-billing";
import AppProfile from "./pages/app-profile";
import AdminOverview from "./pages/admin-overview";
import AdminUsers from "./pages/admin-users";
import AdminWorkspaces from "./pages/admin-workspaces";
import AdminPlans from "./pages/admin-plans";
import AdminSettings from "./pages/admin-settings";
import Terms from "./pages/terms";
import Privacy from "./pages/privacy";
import { ProtectedRoute } from "./components/protected-route";
import { PublicOnlyRoute } from "./components/public-only-route";
import { StaffRoute } from "./components/staff-route";
import { Provider } from "./components/provider";
import { AgentFeedback } from "@runablehq/website-runtime";

function App() {
  return (
    <Provider>
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
            <AppTeamspace />
          </ProtectedRoute>
        </Route>
        <Route path="/app/profile">
          <ProtectedRoute>
            <AppProfile />
          </ProtectedRoute>
        </Route>
        <Route path="/app/projects">
          <ProtectedRoute>
            <AppProjects />
          </ProtectedRoute>
        </Route>
        <Route path="/app/projects/:id">
          <ProtectedRoute>
            <AppProject />
          </ProtectedRoute>
        </Route>
        <Route path="/app/routes">
          <ProtectedRoute>
            <AppRoutes />
          </ProtectedRoute>
        </Route>
        <Route path="/app/routes/new">
          <ProtectedRoute>
            <AppRouteNew />
          </ProtectedRoute>
        </Route>
        <Route path="/app/routes/:id">
          <ProtectedRoute>
            <AppRoutePage />
          </ProtectedRoute>
        </Route>
        <Route path="/app/map">
          <ProtectedRoute>
            <AppMap />
          </ProtectedRoute>
        </Route>
        <Route path="/app/compare">
          <ProtectedRoute>
            <AppCompare />
          </ProtectedRoute>
        </Route>
        <Route path="/app/reports">
          <ProtectedRoute>
            <AppReports />
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
            <AppTemplates />
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
      {/* Do not remove — off by default, activated by parent iframe via postMessage */}
      {import.meta.env.DEV && <AgentFeedback />}
      {/* "Made with Runable" badge - if user asks to remove the runable badge, remove this code as well as comment */}
    </Provider>
  );
}

export default App;
