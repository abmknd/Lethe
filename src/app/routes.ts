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
        path: "onboarding", 
        Component: OnboardingFlow 
      },
      { 
        path: "feed", 
        Component: Feed 
      },
      { 
        path: "profile", 
        Component: ProfilePage 
      },
      { 
        path: "user/:username", 
        Component: OtherUserProfilePage 
      },
      { 
        path: "messages", 
        Component: MessagesPage 
      },
      { 
        path: "matches", 
        Component: MatchesPage 
      },
      { 
        path: "connect", 
        Component: ConnectPage 
      },
      { 
        path: "settings", 
        Component: SettingsPage 
      },
      { 
        path: "communities", 
        Component: CommunitiesPage 
      },
      { 
        path: "community/:id", 
        Component: CommunityPage 
      },
      {
        path: "*",
        Component: NotFound
      }
    ],
  },
],
{ basename: "/lethe" });
