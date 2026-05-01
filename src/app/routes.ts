import { createBrowserRouter } from "react-router";
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
import ProtectedRoute from "./ProtectedRoute";
import TrialLayout from "./trial/TrialLayout";
import TrialHomePage from "./trial/TrialHomePage";
import TrialOnboardingPage from "./trial/TrialOnboardingPage";
import TrialConnectPage from "./trial/TrialConnectPage";
import TrialAdminPage from "./trial/TrialAdminPage";
import TrialEventsPage from "./trial/TrialEventsPage";

const baseUrl = import.meta.env.BASE_URL;
const routerOptions = baseUrl === "/" ? undefined : { basename: baseUrl.replace(/\/$/, "") };

// Router configuration for Lethe app
export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
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
        path: "trial",
        Component: TrialLayout,
        children: [
          {
            index: true,
            Component: TrialHomePage,
          },
          {
            path: "onboarding",
            Component: TrialOnboardingPage,
          },
          {
            path: "connect",
            Component: TrialConnectPage,
          },
          {
            path: "admin",
            Component: TrialAdminPage,
          },
          {
            path: "events",
            Component: TrialEventsPage,
          },
        ],
      },
      {
        path: "*",
        Component: NotFound
      }
    ],
  },
],
routerOptions);
