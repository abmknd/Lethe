import { createBrowserRouter, Navigate } from "react-router";
import Root from "./Root";
import OnboardingFlow from "./OnboardingFlow";
import Feed from "./Feed";
import LandingPage from "./LandingPage";
import ProfilePage from "./ProfilePage";
import OtherUserProfilePage from "./OtherUserProfilePage";
import MessagesPage from "./MessagesPage";
import MatchesPage from "./MatchesPage";
import SettingsPage from "./SettingsPage";
import ConnectPage from "./ConnectPage";
import CommunitiesPage from "./CommunitiesPage";
import CommunityPage from "./CommunityPage";
import NotFound from "./NotFound";
import AuthPage from "./AuthPage";
import AuthCallback from "./AuthCallback";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import AdminLayout from "./admin/AdminLayout";
import AdminHomePage from "./admin/AdminHomePage";
import AdminOnboardingPage from "./admin/AdminOnboardingPage";
import AdminConnectPage from "./admin/AdminConnectPage";
import AdminReviewPage from "./admin/AdminReviewPage";
import AdminEventsPage from "./admin/AdminEventsPage";
import ErrorBoundary from "./ErrorBoundary";

const baseUrl = import.meta.env.BASE_URL;
const routerOptions = baseUrl === "/" ? undefined : { basename: baseUrl.replace(/\/$/, "") };

// Router configuration for Relethe app
export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    ErrorBoundary,
    children: [
      { 
        index: true, 
        Component: LandingPage 
      },
      {
        path: "auth",
        Component: AuthPage,
      },
      {
        path: "auth/callback",
        Component: AuthCallback,
      },
      {
        Component: ProtectedRoute,
        children: [
          { path: "onboarding", Component: OnboardingFlow },
          { path: "feed", Component: Feed },
          { path: "profile", Component: ProfilePage },
          { path: "user/:username", Component: OtherUserProfilePage },
          { path: "messages", Component: MessagesPage },
          { path: "matches", Component: MatchesPage },
          { path: "connect", Component: ConnectPage },
          { path: "settings", Component: SettingsPage },
          { path: "communities", Component: CommunitiesPage },
          { path: "community/:id", Component: CommunityPage },
        ],
      },
      {
        Component: AdminRoute,
        children: [
          {
            path: "mvp",
            Component: AdminLayout,
            ErrorBoundary,
            children: [
              {
                index: true,
                Component: AdminHomePage,
              },
              {
                path: "onboarding",
                Component: AdminOnboardingPage,
              },
              {
                path: "connect",
                Component: AdminConnectPage,
              },
              {
                path: "admin",
                Component: AdminReviewPage,
              },
              {
                path: "events",
                Component: AdminEventsPage,
              },
            ],
          },
        ],
      },
      { path: "trial", element: <Navigate to="/mvp" replace /> },
      { path: "trial/*", element: <Navigate to="/mvp" replace /> },
      {
        path: "*",
        Component: NotFound
      }
    ],
  },
],
routerOptions);
