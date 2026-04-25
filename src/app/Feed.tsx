import { FeedFilters } from "./components/FeedFilters";
import { AvatarDropdown } from "./components/AvatarDropdown";
import { PageNav } from "./components/PageNav";
import { CreatePostModal } from "./components/CreatePostModal";
import { ConnectContent } from "./components/ConnectContent";
import { RecentMatchesCentralPanel } from "./components/RecentMatchesCentralPanel";
import { MatchesNav } from "./components/MatchesNav";
import { FadedZoneModal } from "./components/FadedZoneModal";
import { PostCard } from "./components/PostCard";
import { KYCModal } from "./components/KYCModal";
import { UpcomingMatches } from "./components/UpcomingMatches";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { ToggleLeft, ToggleRight } from "lucide-react";
import { useTheme } from "./context/ThemeContext";
import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import LetheLogo from "../imports/LetheLogo";

const avatarUrl1 = "https://images.unsplash.com/photo-1762522921456-cdfe882d36c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMHdvbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcyMzI5MzMwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const avatarUrl2 = "https://images.unsplash.com/photo-1532272278764-53cd1fe53f72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMG1hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjM0NDQxOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const avatarUrl3 = "https://images.unsplash.com/photo-1770363757711-aa4db84d308d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHBvcnRyYWl0JTIwY29uZmlkZW50JTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3MjM0NjA0MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const avatarUrl4 = "https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBwb3J0cmFpdCUyMGJ1c2luZXNzJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3MjM0NjA0MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const avatarUrl5 = "https://images.unsplash.com/photo-1689600944138-da3b150d9cb8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGhlYWRzaG90JTIwc21pbGV8ZW58MXx8fHwxNzcyMzQ2MDQxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const avatarUrl6 = "https://images.unsplash.com/photo-1672685667592-0392f458f46f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBoZWFkc2hvdCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjM0NjA0MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const avatarUrl7 = "https://images.unsplash.com/photo-1770894807442-108cc33c0a7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMG1hbiUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjMxODI4NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const avatarUrlCurrent = "https://images.unsplash.com/photo-1683815251677-8df20f826622?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMHBlcnNvbnxlbnwxfHx8fDE3NzIyMTAxNTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

const postImage1 = "https://images.unsplash.com/photo-1635248677595-17a15f7a1972?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250ZW1wbGF0aXZlJTIwbmF0dXJlJTIwYmxhY2slMjB3aGl0ZXxlbnwxfHx8fDE3NzIyODU1NDB8MA&ixlib=rb-4.1.0&q=80&w=1080";
const postImage2 = "https://images.unsplash.com/photo-1569181067672-d6e87f7a1766?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsJTIwYXJjaGl0ZWN0dXJlJTIwbW9ub2Nocm9tZXxlbnwxfHx8fDE3NzIyODU1NDB8MA&ixlib=rb-4.1.0&q=80&w=1080";
const postImage3 = "https://images.unsplash.com/photo-1767911287119-cd9ae9c55afa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2xpdGFyeSUyMHBlcnNvbiUyMHNpbGhvdWV0dGV8ZW58MXx8fHwxNzcyMjg1NTQxfDA&ixlib=rb-4.1.0&q=80&w=1080";
const postImage4 = "https://images.unsplash.com/photo-1667987189392-06fcc377cade?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwbW9vZHklMjBuYXR1cmV8ZW58MXx8fHwxNzcyMjE1NzEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const postImage5 = "https://images.unsplash.com/photo-1694473799096-a915b576511f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwc3Vuc2V0JTIwbGFuZHNjYXBlfGVufDF8fHx8MTc3MjI5NzM0MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

/**
 * Feed Component
 * 
 * KYC Modal Logic:
 * - Shows 3 seconds after first visit to Feed (from onboarding)
 * - Stored in localStorage when completed (persists across sessions)
 * - Stored in sessionStorage when shown (prevents re-showing after "Later" click)
 * 
 * To test KYC modal again:
 * - Open browser console and run: localStorage.removeItem('lethe_kyc_completed'); sessionStorage.removeItem('lethe_kyc_shown');
 * - Then refresh the page
 */
export default function Feed() {
  const { theme } = useTheme();
  const [activePage, setActivePage] = useState<"posts" | "matches">("posts");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [matchesTab, setMatchesTab] = useState<"suggestions" | "recent" | "upcoming">("suggestions");
  const [isMatchmakingEnabled, setIsMatchmakingEnabled] = useState(false);
  const [isFadedZoneModalOpen, setIsFadedZoneModalOpen] = useState(false);
  const [fadedZoneVisitCount, setFadedZoneVisitCount] = useState(0);
  const [hasEnteredFadedZone, setHasEnteredFadedZone] = useState(false);
  const [isKYCModalOpen, setIsKYCModalOpen] = useState(false);
  const postsContainerRef = useRef<HTMLDivElement>(null);
  const fadedZoneStartRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Show KYC modal 3 seconds after first load from onboarding (only once per session)
  useEffect(() => {
    const kycCompleted = localStorage.getItem('lethe_kyc_completed');
    const kycShownThisSession = sessionStorage.getItem('lethe_kyc_shown');

    if (!kycCompleted && !kycShownThisSession) {
      const timer = setTimeout(() => {
        setIsKYCModalOpen(true);
        sessionStorage.setItem('lethe_kyc_shown', 'true');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Handle KYC modal close
  const handleKYCClose = () => {
    setIsKYCModalOpen(false);
    // Only mark as completed if the user finishes all steps
    // The KYCDone component triggers this via onClose after finish
  };

  const bg = theme === "dark" ? "bg-black" : "bg-white";
  const border = theme === "dark" ? "border-[#1a1a1a]" : "border-[#E5E5E5]";
  const text = theme === "dark" ? "text-white" : "text-black";
  const accentColor = theme === "dark" ? "#7FFF00" : "#5D9F00";

  // Sort posts chronologically (newest to oldest) - flowing → fading → faded
  const allPosts = useMemo(() => {
    const posts = [
      {
        avatar: avatarUrl1,
        username: "elena.voss",
        timestamp: "2h",
        text: "There's a peculiar weight to forgotten things. Not the absence of memory, but the presence of its echo. What we lose shapes us as much as what we keep.",
        halfLifeProgress: 92,
        status: "flowing" as const,
        isFollowing: true,
        sortTime: 2,
      },
      {
        avatar: avatarUrl3,
        username: "nova.winters",
        timestamp: "4h",
        text: "Silence isn't empty. It's full of answers we're not yet ready to hear.",
        halfLifeProgress: 88,
        status: "flowing" as const,
        isFollowing: false,
        sortTime: 4,
      },
      {
        avatar: avatarUrl2,
        username: "marcus.jin",
        timestamp: "5h",
        text: "Started my morning watching the city wake up. There's something meditative about the quiet before the noise.",
        image: postImage1,
        halfLifeProgress: 78,
        status: "flowing" as const,
        isFollowing: false,
        sortTime: 5,
      },
      {
        avatar: avatarUrl6,
        username: "river.stone",
        timestamp: "6h",
        text: "Sometimes the most profound conversations happen with ourselves at 3am.",
        image: postImage2,
        halfLifeProgress: 75,
        status: "flowing" as const,
        isFollowing: true,
        sortTime: 6,
      },
      {
        avatar: avatarUrlCurrent,
        username: "A",
        timestamp: "8h",
        text: "The distance between who we were and who we are becomes clearest in silence.",
        halfLifeProgress: 95,
        status: "flowing" as const,
        isFollowing: true,
        sortTime: 8,
      },
      {
        avatar: avatarUrl4,
        username: "sage.bloom",
        timestamp: "9h",
        text: "Every sunset is proof that endings can be beautiful too.",
        image: postImage5,
        halfLifeProgress: 82,
        status: "flowing" as const,
        isFollowing: false,
        sortTime: 9,
      },
      {
        avatar: avatarUrl1,
        username: "echo.vale",
        timestamp: "11h",
        text: "The hardest part about letting go is not the release, but accepting that holding on was a choice all along.",
        halfLifeProgress: 70,
        status: "flowing" as const,
        isFollowing: true,
        sortTime: 11,
      },
      {
        avatar: avatarUrl4,
        username: "kai.shore",
        timestamp: "12h",
        text: "Found this quote in an old notebook: 'We are the sum of what we choose to remember.' Feels relevant here.",
        image: postImage2,
        halfLifeProgress: 65,
        status: "flowing" as const,
        isFollowing: false,
        sortTime: 12,
      },
      {
        avatar: avatarUrl7,
        username: "phoenix.ash",
        timestamp: "14h",
        text: "Found an old photograph today. Strange how a moment frozen in time can make you feel everything at once.",
        image: postImage1,
        halfLifeProgress: 68,
        status: "flowing" as const,
        isFollowing: false,
        sortTime: 14,
      },
      {
        avatar: avatarUrl5,
        username: "lyric.moon",
        timestamp: "16h",
        text: "We collect memories the way some people collect postcards. But unlike postcards, memories change with us.",
        halfLifeProgress: 90,
        status: "flowing" as const,
        isFollowing: true,
        sortTime: 16,
      },
      {
        avatar: avatarUrl7,
        username: "theo.lark",
        timestamp: "18h",
        text: "Yesterday I watched rain erase footprints. A reminder that impermanence isn't always loss.",
        image: postImage4,
        halfLifeProgress: 85,
        status: "flowing" as const,
        isFollowing: false,
        sortTime: 18,
      },
      {
        avatar: avatarUrl2,
        username: "cedar.grey",
        timestamp: "20h",
        text: "The ocean doesn't try to remember every wave. Perhaps there's wisdom in that.",
        image: postImage4,
        halfLifeProgress: 73,
        status: "flowing" as const,
        isFollowing: false,
        sortTime: 20,
      },
      {
        avatar: avatarUrl3,
        username: "jasper.vale",
        timestamp: "21h",
        text: "In the quiet moments between thoughts, that's where clarity lives.",
        halfLifeProgress: 80,
        status: "flowing" as const,
        isFollowing: true,
        sortTime: 21,
      },
      {
        avatar: avatarUrl1,
        username: "winter.hayes",
        timestamp: "22h",
        text: "Some truths are best discovered in hindsight, when the dust has settled and perspective arrives.",
        image: postImage3,
        halfLifeProgress: 76,
        status: "flowing" as const,
        isFollowing: false,
        sortTime: 22,
      },
      {
        avatar: avatarUrl5,
        username: "delta.crow",
        timestamp: "23h",
        text: "Each ending is just a door closing so another can open.",
        halfLifeProgress: 72,
        status: "flowing" as const,
        isFollowing: true,
        sortTime: 23,
      },
      {
        avatar: avatarUrl7,
        username: "ash.meridian",
        timestamp: "1d",
        text: "Today I realized that growth and grief often walk hand in hand.",
        image: postImage1,
        halfLifeProgress: 69,
        status: "flowing" as const,
        isFollowing: false,
        sortTime: 24,
      },
      {
        avatar: avatarUrl4,
        username: "slate.rivers",
        timestamp: "1d",
        text: "The way light filters through morning fog reminds me that clarity takes time.",
        halfLifeProgress: 74,
        status: "flowing" as const,
        isFollowing: true,
        sortTime: 25,
      },
      {
        avatar: avatarUrl2,
        username: "ember.lark",
        timestamp: "1d",
        text: "We spend so much time building walls around our hearts, forgetting that bridges serve us better.",
        image: postImage5,
        halfLifeProgress: 71,
        status: "flowing" as const,
        isFollowing: false,
        sortTime: 26,
      },
      {
        avatar: avatarUrl6,
        username: "quinn.shadow",
        timestamp: "1d",
        text: "Sometimes the bravest thing we can do is simply let go.",
        halfLifeProgress: 77,
        status: "flowing" as const,
        isFollowing: true,
        sortTime: 27,
      },
      {
        avatar: avatarUrl3,
        username: "rowan.flux",
        timestamp: "1d",
        text: "Watched the stars last night and felt impossibly small and infinitely connected all at once.",
        image: postImage2,
        halfLifeProgress: 68,
        status: "flowing" as const,
        isFollowing: false,
        sortTime: 28,
      },
      {
        avatar: avatarUrl5,
        username: "cipher.west",
        timestamp: "1d",
        text: "There's poetry in impermanence if you know where to look.",
        halfLifeProgress: 75,
        status: "flowing" as const,
        isFollowing: true,
        sortTime: 29,
      },
      {
        avatar: avatarUrl1,
        username: "haven.stone",
        timestamp: "1d",
        text: "Peace isn't the absence of chaos—it's learning to find stillness within it.",
        image: postImage4,
        halfLifeProgress: 70,
        status: "flowing" as const,
        isFollowing: false,
        sortTime: 30,
      },
      {
        avatar: avatarUrl6,
        username: "atlas.dawn",
        timestamp: "22h",
        text: "Today I learned that nostalgia is just another word for longing for a version of yourself you've outgrown.",
        halfLifeProgress: 27,
        status: "fading" as const,
        isFollowing: true,
        sortTime: 32,
        fadingIn: "12mins",
      },
      {
        avatar: avatarUrl5,
        username: "iris.morrow",
        timestamp: "1d",
        text: "Three cups of coffee and still thinking about that dream from last week. Memory is such a strange architect.",
        halfLifeProgress: 30,
        status: "fading" as const,
        isFollowing: true,
        sortTime: 24,
        fadingIn: "9mins",
      },
      {
        avatar: avatarUrl3,
        username: "indigo.rain",
        timestamp: "1d",
        text: "There's a difference between remembering and ruminating. One is reflection, the other is residence.",
        image: postImage3,
        halfLifeProgress: 24,
        status: "fading" as const,
        isFollowing: false,
        sortTime: 26,
        fadingIn: "8mins",
      },
      {
        avatar: avatarUrl4,
        username: "willow.frost",
        timestamp: "1d",
        text: "Sometimes closure is just the story we tell ourselves so we can move forward.",
        halfLifeProgress: 28,
        status: "fading" as const,
        isFollowing: true,
        sortTime: 28,
        fadingIn: "15mins",
      },
      {
        avatar: avatarUrl1,
        username: "storm.rivers",
        timestamp: "1d",
        text: "The weight of the past isn't in what happened, but in how long we choose to carry it.",
        image: postImage2,
        halfLifeProgress: 26,
        status: "fading" as const,
        isFollowing: false,
        sortTime: 30,
        fadingIn: "10mins",
      },
      {
        avatar: avatarUrl2,
        username: "lior.m",
        timestamp: "2d",
        text: "Memory is less about the past than about what version of ourselves we carry forward.",
        image: postImage5,
        halfLifeProgress: 22,
        status: "fading" as const,
        isFollowing: false,
        sortTime: 48,
        fadingIn: "6mins",
      },
      {
        avatar: avatarUrl7,
        username: "luna.solace",
        timestamp: "2d",
        text: "Memory is less camera, more watercolor painting—imprecise, emotional, beautifully flawed.",
        halfLifeProgress: 23,
        status: "fading" as const,
        isFollowing: true,
        sortTime: 50,
        fadingIn: "5mins",
      },
      {
        avatar: avatarUrl5,
        username: "orion.night",
        timestamp: "2d",
        text: "I used to think forgetting meant failing. Now I understand it's more like gardening—some things need to be cleared away for new growth.",
        image: postImage5,
        halfLifeProgress: 25,
        status: "fading" as const,
        isFollowing: false,
        sortTime: 52,
        fadingIn: "18mins",
      },
      {
        avatar: avatarUrl2,
        username: "sage.whisper",
        timestamp: "2d",
        text: "The past is a place of reference, not residence. Visit, but don't move back in.",
        halfLifeProgress: 21,
        status: "fading" as const,
        isFollowing: true,
        sortTime: 54,
        fadingIn: "7mins",
      },
      {
        avatar: avatarUrl6,
        username: "moss.echo",
        timestamp: "2d",
        text: "Change isn't the enemy. Clinging to what was—that's where the suffering lives.",
        halfLifeProgress: 29,
        status: "fading" as const,
        isFollowing: false,
        sortTime: 56,
        fadingIn: "11mins",
      },
      {
        avatar: avatarUrl4,
        username: "terra.rain",
        timestamp: "2d",
        text: "Today I released a belief I'd been carrying for years. It was lighter than I expected.",
        image: postImage1,
        halfLifeProgress: 27,
        status: "fading" as const,
        isFollowing: true,
        sortTime: 58,
        fadingIn: "13mins",
      },
      {
        avatar: avatarUrl3,
        username: "silver.haze",
        timestamp: "2d",
        text: "Our memories are sketches, not photographs. Imprecise, evolving, beautifully human.",
        halfLifeProgress: 25,
        status: "fading" as const,
        isFollowing: false,
        sortTime: 60,
        fadingIn: "8mins",
      },
      {
        avatar: avatarUrl7,
        username: "onyx.wave",
        timestamp: "2d",
        text: "What we remember isn't what happened. It's what we needed the story to become.",
        image: postImage4,
        halfLifeProgress: 24,
        status: "fading" as const,
        isFollowing: true,
        sortTime: 62,
        fadingIn: "14mins",
      },
      {
        avatar: avatarUrl5,
        username: "jade.drift",
        timestamp: "2d",
        text: "Forgiveness starts with forgiving ourselves for holding on too long.",
        halfLifeProgress: 22,
        status: "fading" as const,
        isFollowing: false,
        sortTime: 64,
        fadingIn: "9mins",
      },
      // FADED POSTS (over 3 days old)
      {
        avatar: avatarUrl3,
        username: "Sophia Chen",
        timestamp: "3d",
        text: "Walking through the old neighborhood. Some houses remain, others are echoes in memory. Time moves in only one direction, and that's the gift.",
        image: postImage3,
        halfLifeProgress: 15,
        status: "faded" as const,
        isFollowing: true,
        sortTime: 72,
      },
      {
        avatar: avatarUrl6,
        username: "raven.eclipse",
        timestamp: "3d",
        text: "Every memory is a story we tell ourselves. And like all stories, they change with each retelling.",
        image: postImage1,
        halfLifeProgress: 29,
        status: "faded" as const,
        isFollowing: false,
        sortTime: 74,
      },
      {
        avatar: avatarUrl3,
        username: "autumn.leaves",
        timestamp: "3d",
        text: "Letting go isn't a single event. It's a practice, like meditation or breathing.",
        halfLifeProgress: 20,
        status: "faded" as const,
        isFollowing: true,
        sortTime: 76,
      },
      {
        avatar: avatarUrl4,
        username: "horizon.gaze",
        timestamp: "3d",
        text: "We're all historians of our own lives, constantly editing the narrative to make sense of now.",
        image: postImage4,
        halfLifeProgress: 19,
        status: "faded" as const,
        isFollowing: false,
        sortTime: 78,
      },
      {
        avatar: avatarUrl7,
        username: "cypress.wind",
        timestamp: "4d",
        text: "The mind is not a storage unit. It's a living thing, and living things evolve.",
        halfLifeProgress: 18,
        status: "faded" as const,
        isFollowing: true,
        sortTime: 96,
      },
      {
        avatar: avatarUrl1,
        username: "meadow.song",
        timestamp: "5d",
        text: "Sometimes the most radical act is simply to be present, here, now, without the weight of then.",
        image: postImage3,
        halfLifeProgress: 17,
        status: "faded" as const,
        isFollowing: false,
        sortTime: 120,
      },
      {
        avatar: avatarUrl5,
        username: "void.seeker",
        timestamp: "6d",
        text: "What if forgetting isn't loss but liberation? What if we're not meant to carry everything forever?",
        halfLifeProgress: 16,
        status: "faded" as const,
        isFollowing: true,
        sortTime: 144,
      },
      {
        avatar: avatarUrlCurrent,
        username: "A",
        timestamp: "1w",
        text: "Rereading old messages is like archaeology of the self. Who was I when I wrote that?",
        image: postImage3,
        halfLifeProgress: 8,
        status: "faded" as const,
        isFollowing: true,
        sortTime: 168,
      },
      {
        avatar: avatarUrl2,
        username: "jasper.vale",
        timestamp: "2w",
        text: "The stories we tell about our past say more about our present than we realize.",
        halfLifeProgress: 12,
        status: "faded" as const,
        isFollowing: false,
        sortTime: 336,
      },
      {
        avatar: avatarUrl6,
        username: "anya.k",
        timestamp: "1mo",
        text: "A reflection on endings and what we choose to carry forward.",
        halfLifeProgress: 5,
        status: "faded" as const,
        isFollowing: true,
        sortTime: 720,
      },
      {
        avatar: avatarUrl4,
        username: "mira.shadows",
        timestamp: "1mo",
        text: "The art of living is the art of knowing what to hold close and what to release.",
        image: postImage2,
        halfLifeProgress: 4,
        status: "faded" as const,
        isFollowing: false,
        sortTime: 750,
      },
      {
        avatar: avatarUrl1,
        username: "asher.light",
        timestamp: "1mo",
        text: "Every morning is a chance to rewrite the narrative we inherited from yesterday.",
        halfLifeProgress: 6,
        status: "faded" as const,
        isFollowing: true,
        sortTime: 780,
      },
      {
        avatar: avatarUrl3,
        username: "vesper.tide",
        timestamp: "2mo",
        text: "The things we remember choose us as much as we choose them.",
        image: postImage4,
        halfLifeProgress: 3,
        status: "faded" as const,
        isFollowing: false,
        sortTime: 1440,
      },
      {
        avatar: avatarUrl7,
        username: "ember.grey",
        timestamp: "2mo",
        text: "There's a quiet dignity in letting old stories fade. Not erasing them, just allowing them to rest.",
        halfLifeProgress: 7,
        status: "faded" as const,
        isFollowing: true,
        sortTime: 1470,
      },
      {
        avatar: avatarUrl5,
        username: "nyx.cardinal",
        timestamp: "2mo",
        text: "We are not the sum of our memories, but the choices we make in their presence.",
        image: postImage1,
        halfLifeProgress: 2,
        status: "faded" as const,
        isFollowing: false,
        sortTime: 1500,
      },
      {
        avatar: avatarUrl2,
        username: "zara.mist",
        timestamp: "2mo",
        text: "Time doesn't heal. It transforms. And transformation is its own kind of beauty.",
        halfLifeProgress: 9,
        status: "faded" as const,
        isFollowing: true,
        sortTime: 1530,
      },
      {
        avatar: avatarUrl6,
        username: "kai.haven",
        timestamp: "3mo",
        text: "What if the purpose of memory isn't to preserve the past, but to inform the present?",
        image: postImage5,
        halfLifeProgress: 1,
        status: "faded" as const,
        isFollowing: false,
        sortTime: 2160,
      },
      {
        avatar: avatarUrl4,
        username: "wilde.echo",
        timestamp: "3mo",
        text: "The deepest wisdom often comes from knowing when to let silence speak.",
        halfLifeProgress: 10,
        status: "faded" as const,
        isFollowing: true,
        sortTime: 2190,
      },
      {
        avatar: avatarUrl1,
        username: "nova.depth",
        timestamp: "3mo",
        text: "I've stopped trying to hold onto moments. Instead, I'm learning to honor them as they pass.",
        image: postImage3,
        halfLifeProgress: 11,
        status: "faded" as const,
        isFollowing: false,
        sortTime: 2220,
      },
      {
        avatar: avatarUrl3,
        username: "silas.grove",
        timestamp: "4mo",
        text: "Identity is fluid. We are not who we were, and we won't be who we are now.",
        halfLifeProgress: 14,
        status: "faded" as const,
        isFollowing: true,
        sortTime: 2880,
      },
      {
        avatar: avatarUrl5,
        username: "winter.calm",
        timestamp: "4mo",
        text: "In the stillness between thoughts, we find what we've been searching for all along.",
        image: postImage2,
        halfLifeProgress: 13,
        status: "faded" as const,
        isFollowing: false,
        sortTime: 2920,
      },
      {
        avatar: avatarUrl7,
        username: "ocean.breath",
        timestamp: "4mo",
        text: "The beauty of impermanence is that it frees us from the tyranny of forever.",
        halfLifeProgress: 15,
        status: "faded" as const,
        isFollowing: true,
        sortTime: 2960,
      },
      {
        avatar: avatarUrl2,
        username: "luna.path",
        timestamp: "5mo",
        text: "Grief and gratitude are two sides of the same coin. Both prove we were here, we loved, we lived.",
        image: postImage5,
        halfLifeProgress: 8,
        status: "faded" as const,
        isFollowing: false,
        sortTime: 3600,
      },
      {
        avatar: avatarUrl4,
        username: "echo.fields",
        timestamp: "5mo",
        text: "What if the point of memory is not to preserve the past but to shape the future?",
        halfLifeProgress: 7,
        status: "faded" as const,
        isFollowing: true,
        sortTime: 3640,
      },
      {
        avatar: avatarUrl6,
        username: "rune.silence",
        timestamp: "5mo",
        text: "Some chapters close quietly. Not with drama, but with the gentle acknowledgment that the story has moved on.",
        image: postImage1,
        halfLifeProgress: 6,
        status: "faded" as const,
        isFollowing: false,
        sortTime: 3680,
      },
      {
        avatar: avatarUrl1,
        username: "sage.rivers",
        timestamp: "5mo",
        text: "The mind curates what matters. Trust the process of natural selection in your memories.",
        halfLifeProgress: 9,
        status: "faded" as const,
        isFollowing: true,
        sortTime: 3720,
      },
      {
        avatar: avatarUrl3,
        username: "felix.dusk",
        timestamp: "6mo",
        text: "Nostalgia is a liar. It tells us the past was better, when really we just miss being younger.",
        image: postImage4,
        halfLifeProgress: 4,
        status: "faded" as const,
        isFollowing: false,
        sortTime: 4320,
      },
      {
        avatar: avatarUrl5,
        username: "iris.veil",
        timestamp: "6mo",
        text: "To let go is not to forget. It's to remember without being held captive by the remembering.",
        halfLifeProgress: 3,
        status: "faded" as const,
        isFollowing: true,
        sortTime: 4360,
      },
      {
        avatar: avatarUrl7,
        username: "ash.meridian",
        timestamp: "6mo",
        text: "We are all just walking each other home, one fading memory at a time.",
        image: postImage3,
        halfLifeProgress: 5,
        status: "faded" as const,
        isFollowing: false,
        sortTime: 4400,
      },
    ];

    return posts.sort((a, b) => a.sortTime - b.sortTime);
  }, []);

  const handleActionButtonClick = () => {
    if (activePage === "posts") {
      setIsCreateModalOpen(true);
    } else if (activePage === "matches") {
      setIsMatchmakingEnabled(!isMatchmakingEnabled);
    }
  };

  const getActionButtonContent = () => {
    if (activePage === "posts") {
      return "CREATE";
    } else if (activePage === "matches") {
      return (
        <div className="flex items-center gap-2">
          <span style={{ color: isMatchmakingEnabled ? "#7FFF00" : "#6B6B6B" }}>
            {isMatchmakingEnabled ? "You're up for matching" : "You've paused matching"}
          </span>
          {isMatchmakingEnabled ? (
            <ToggleRight className="w-3.5 h-3.5" strokeWidth={2} />
          ) : (
            <ToggleLeft className="w-3.5 h-3.5" strokeWidth={2} />
          )}
        </div>
      );
    }
    return "MEET";
  };

  // Find the index where faded posts start
  const fadedPostStartIndex = allPosts.findIndex(post => post.status === "faded");
  // Trigger modal on the 10th faded post (so user sees 9 faded posts first)
  const fadedZoneTriggerIndex = fadedPostStartIndex >= 0 ? fadedPostStartIndex + 9 : -1;

  // Handler for clicking faded posts before the trigger point
  const handleFadedPostClick = () => {
    if (!hasEnteredFadedZone && !isFadedZoneModalOpen) {
      setHasEnteredFadedZone(true);
      setIsFadedZoneModalOpen(true);
    }
  };

  // Detect when user scrolls into faded zone using IntersectionObserver
  useEffect(() => {
    if (!fadedZoneStartRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Only trigger if scrolling down into faded zone, not already triggered, and modal not open
          if (entry.isIntersecting && !hasEnteredFadedZone && !isFadedZoneModalOpen) {
            setHasEnteredFadedZone(true);
            setIsFadedZoneModalOpen(true);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px",
      }
    );

    observer.observe(fadedZoneStartRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasEnteredFadedZone, isFadedZoneModalOpen, fadedZoneVisitCount]);

  // Handle "Return to Present" button
  const handleReturnToPresent = () => {
    // Close the modal first
    setIsFadedZoneModalOpen(false);
    
    // Restore scrolling immediately
    document.body.style.overflow = "auto";
    
    // Wait a bit for the modal to close, then scroll to top
    setTimeout(() => {
      // Force scroll to top using multiple methods
      window.scrollTo({ top: 0, behavior: "smooth" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 50);
    
    // Wait longer before resetting the flag to ensure we're fully scrolled to top
    // and the faded zone is out of viewport
    setTimeout(() => {
      setHasEnteredFadedZone(false);
    }, 1500);
    
    // Increment visit count for next message
    setFadedZoneVisitCount((prev) => prev + 1);
  };

  return (
    <div className={`min-h-screen overflow-x-hidden ${bg} transition-colors duration-300`}>
      {/* Header */}
      <header className={`sticky top-0 z-10 ${bg} border-b ${border} transition-colors duration-300`}>
        <div className="px-4 sm:px-10 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <button 
            onClick={() => navigate("/")}
            className={`flex items-center gap-2 ${text} text-sm tracking-[0.3em] uppercase font-light font-display transition-colors duration-300 hover:opacity-70 cursor-pointer`}
          >
            <div className="w-5 h-5">
              <LetheLogo />
            </div>
            LETHE
          </button>

          {/* Page Navigation */}
          <div className="flex-1 flex justify-center">
            <PageNav activePage={activePage} onPageChange={setActivePage} />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <AvatarDropdown avatarUrl={avatarUrlCurrent} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-12 py-6">
        {activePage === "posts" && (
          <div>
            {/* Filter Tabs */}
            <div className="mb-6">
              <FeedFilters onCreateClick={() => setIsCreateModalOpen(true)} />
            </div>

            {/* Posts Grid */}
            <ResponsiveMasonry columnsCountBreakPoints={{ 350: 3, 750: 3, 1200: 3 }}>
              <Masonry gutter="1.25rem">
                {allPosts.map((post, index) => {
                  const isTriggerPost = index === fadedZoneTriggerIndex;
                  const isClickableFadedPost = post.status === "faded" && index < fadedZoneTriggerIndex && fadedZoneTriggerIndex !== -1;
                  
                  return (
                    <div key={index} ref={isTriggerPost ? fadedZoneStartRef : null}>
                      <PostCard 
                        {...post} 
                        onFadedClick={isClickableFadedPost ? handleFadedPostClick : undefined}
                      />
                    </div>
                  );
                })}
              </Masonry>
            </ResponsiveMasonry>
          </div>
        )}

        {activePage === "matches" && (
          <div>
            {/* Matches Navigation */}
            <div className="mb-6">
              <MatchesNav 
                activeTab={matchesTab} 
                onTabChange={setMatchesTab}
                isMatchmakingEnabled={isMatchmakingEnabled}
                onToggleMatchmaking={() => setIsMatchmakingEnabled(!isMatchmakingEnabled)}
              />
            </div>

            {/* Matches Content */}
            {matchesTab === "suggestions" ? (
              <ConnectContent activeTab={matchesTab} />
            ) : matchesTab === "recent" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <RecentMatchesCentralPanel />
              </div>
            ) : (
              <UpcomingMatches isMatchingPaused={!isMatchmakingEnabled} />
            )}
          </div>
        )}
      </main>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        avatarUrl={avatarUrlCurrent}
      />

      {/* Faded Zone Modal */}
      <FadedZoneModal
        isOpen={isFadedZoneModalOpen}
        onClose={() => setIsFadedZoneModalOpen(false)}
        visitCount={fadedZoneVisitCount}
        onReturnToPresent={handleReturnToPresent}
      />

      {/* KYC Modal */}
      <KYCModal
        isOpen={isKYCModalOpen}
        onClose={handleKYCClose}
        onComplete={() => {
          localStorage.setItem('lethe_kyc_completed', 'true');
        }}
      />
    </div>
  );
}