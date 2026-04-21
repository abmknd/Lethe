import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { ChevronLeft, MessageCircle, Share2, Plus, MoreVertical } from 'lucide-react';
import svgPaths from "../imports/svg-mzo5g4s9h6";
import svgPathsBack from "../imports/svg-9x8xqlgryp";
import svgPathsRing from "../imports/svg-gaju7ne3wq";
import imgAvatar from "../assets/8c692006a4e235a1e390f04abab516d1cc8c4603.png";
import imgFriend1 from "../assets/91b749ae2ed39b38d6b09e9ebf9089bb1282ea00.png";
import imgFriend2 from "../assets/ae452150c9e875ae34875f023d350bff334f8b87.png";
import imgFriend3 from "../assets/dba0c83f5f7a5668ec5a87de35c3d9ced174c343.png";
import imgPost1 from "../assets/8f8487078257ce2c7db83e0c3005b1e39ee814cd.png";
import imgPost2 from "../assets/fe98c07725f02b23548275ef00b42b5d401a7e57.png";
import imgPost3 from "../assets/ad4f4c674c88db29136842902b4279a695b867c1.png";
import LetheLogo from "../imports/LetheLogo";
import GenderIcon from "../imports/Gender";
import BarChartIcon from "../imports/BarChart3";
import TrashIcon from "../imports/Trash2";
import ArcticonsTetherfi from "../imports/ArcticonsTetherfi";
import { PostOptionsMenu } from "./components/PostOptionsMenu";
import { EditProfileModal, type ProfileData } from "./components/EditProfileModal";

// Profile page component for Lethe app
type TabType = 'all' | 'faded' | 'echoes';

const avatarUrlCurrent = imgAvatar;

interface Post {
  image?: string;
  timestamp: string;
  text: string;
  status: 'flowing' | 'fading' | 'faded';
  fadingIn?: string;
}

// Mock posts data - 1/3 have images (6 out of 19)
const mockPosts: Post[] = [
  {
    image: imgFriend1,
    timestamp: "1d",
    text: "Sometimes the most profound connections happen in silence, when words would only dilute the moment.",
    status: "flowing",
  },
  {
    timestamp: "2d",
    text: "Found myself thinking about the architecture of memory. How we build rooms for certain moments but not others.",
    status: "flowing",
  },
  {
    timestamp: "4d",
    text: "There's a peculiar beauty in impermanence. Like cherry blossoms or morning fog.",
    status: "flowing",
  },
  {
    image: "https://images.unsplash.com/photo-1661362758906-3a85700516c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW5zZXQlMjBza3klMjBjbG91ZHN8ZW58MXx8fHwxNzcyNTAxODc4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    timestamp: "5d",
    text: "Every sunset is proof that endings can be beautiful too.",
    status: "flowing",
  },
  {
    timestamp: "8d",
    text: "The distance between who we were and who we are becomes clearest in silence.",
    status: "flowing",
  },
  {
    timestamp: "10d",
    text: "Watched someone return a library book today. Made me think about all the borrowed things we eventually give back.",
    status: "flowing",
  },
  {
    timestamp: "12d",
    text: "There's a peculiar weight to forgotten things. Not heavy, exactly. More like the absence of weight.",
    status: "flowing",
  },
  {
    timestamp: "14d",
    text: "Silence isn't empty. It's full of answers we're not yet ready to hear.",
    status: "flowing",
  },
  {
    image: imgFriend2,
    timestamp: "1w",
    text: "The hardest part about letting go is not the release, but accepting that holding on was a choice.",
    status: "fading",
    fadingIn: "9mins",
  },
  {
    timestamp: "1w",
    text: "Some bridges are meant to be crossed only once. That doesn't make them any less important.",
    status: "fading",
    fadingIn: "15mins",
  },
  {
    timestamp: "2w",
    text: "Found this quote in an old notebook: 'We are the sum of what we choose to remember.'",
    status: "fading",
    fadingIn: "22mins",
  },
  {
    timestamp: "2w",
    text: "Some truths are best discovered in hindsight, when the dust has settled.",
    status: "fading",
    fadingIn: "30mins",
  },
  {
    image: imgFriend3,
    timestamp: "2w",
    text: "The ocean doesn't try to remember every wave. Perhaps there's wisdom in that.",
    status: "faded",
  },
  {
    timestamp: "3w",
    text: "We collect memories the way some people collect postcards. But unlike postcards, memories change with us.",
    status: "faded",
  },
  {
    image: "https://images.unsplash.com/photo-1636893580433-5ac59809bb13?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZWFjZWZ1bCUyMGxhbmRzY2FwZSUyMG5hdHVyZXxlbnwxfHx8fDE3NzI1Mjk0NDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    timestamp: "1mo",
    text: "Yesterday I watched rain erase footprints. A reminder that impermanence isn't always loss.",
    status: "faded",
  },
  {
    timestamp: "1mo",
    text: "What if our mistakes aren't failures but simply unfinished lessons?",
    status: "faded",
  },
  {
    image: "https://images.unsplash.com/photo-1602128110234-2d11c0aaadfe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwYXJjaGl0ZWN0dXJlfGVufDF8fHx8MTc3MjQ5NjI4NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    timestamp: "2mo",
    text: "In the quiet moments between thoughts, that's where clarity lives.",
    status: "faded",
  },
  {
    timestamp: "2mo",
    text: "What if forgetting isn't loss but liberation?",
    status: "faded",
  },
  {
    timestamp: "3mo",
    text: "The stories we tell about our past say more about our present than we realize.",
    status: "faded",
  },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const navigate = useNavigate();
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "A. Fitch",
    handle: "@alabaster.f",
    bio: "Writing about the spaces between things. Product at Tempo. Thinking about memory and what we owe the future.",
    pronouns: "He / Him / His",
    avatarUrl: imgAvatar,
    socialLinks: {
      linkedin: "",
      twitter: "",
      instagram: "",
      github: "",
      website: "",
    },
  });

  const handleProfileSave = (data: ProfileData) => {
    setProfileData(data);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header - Same as Feed but simplified */}
      <header className="sticky top-0 z-10 bg-black border-b border-[#1a1a1a]">
        <div className="px-4 sm:px-12 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-white text-sm tracking-[0.3em] uppercase font-light font-display hover:opacity-70 cursor-pointer transition-opacity"
          >
            <div className="w-5 h-5">
              <LetheLogo />
            </div>
            LETHE
          </button>

          {/* Back Button */}
          <button 
            onClick={() => navigate("/feed")}
            className="flex items-center gap-3 text-[#6b6b6b] hover:opacity-70 cursor-pointer transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
              <path d={svgPathsBack.p543f5c0} stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-['Inter'] font-light leading-[16.5px] text-[11px] tracking-[3.3px] uppercase">BACK</span>
          </button>
        </div>
      </header>

      {/* Profile Header Card - Full Width */}
      <div className="mt-5 mx-12 mb-6">
        <div className="bg-[#0a0d0a] rounded-[16px] border border-white/[0.07] px-6 py-8">
          <div className="flex items-start justify-between">
            {/* Left: Avatar + Info */}
            <div className="flex gap-6 items-start">
              {/* Avatar with Ring - 115px to match profile details height */}
              <div className="flex-shrink-0">
                <div className="w-[115px] h-[115px] relative">
                  {/* Profile Image - 115px */}
                  <img 
                    src={imgAvatar} 
                    alt="Profile" 
                    className="w-[115px] h-[115px] rounded-full object-cover relative z-10"
                  />
                  {/* Green Dashed Ring */}
                  <div className="absolute inset-0 z-0">
                    <div className="relative size-full">
                      <div className="absolute inset-[-1.5%]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 108 108">
                          <path d={svgPathsRing.pe60fb00} stroke="#ADFF2F" strokeDasharray="55 30" strokeLinecap="round" strokeOpacity="0.5" strokeWidth="3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Identity */}
              <div className="flex flex-col h-[115px]">
                <div className="flex flex-col gap-[4px] mb-[12px]">
                  <h1 className="font-['Cormorant_Garamond'] text-[22px] leading-[26.4px] text-[rgba(255,255,255,0.88)]">
                    A. Fitch
                  </h1>
                  <p className="font-['Inter'] text-[13px] leading-[19.5px] tracking-[0.52px] text-[rgba(255,255,255,0.25)]">
                    @alabaster.f
                  </p>
                </div>

                {/* Occupation, Location & Gender */}
                <div className="flex flex-col gap-[4px]">
                  <div className="font-['Cormorant_Garamond'] text-[13px] leading-[19.5px] text-[rgba(255,255,255,0.4)]">
                    Civil Engineer
                  </div>
                  <div className="flex gap-6">
                  <div className="flex items-center gap-[6px]">
                    <div className="w-4 h-4 relative flex-shrink-0">
                      <svg className="w-full h-full" fill="none" viewBox="0 0 20 20">
                        <g transform="translate(3.33, 1.67)">
                          <path 
                            d={svgPaths.p1fd14140} 
                            stroke="rgba(173,255,47,0.5)" 
                            strokeLinecap="round" 
                            strokeWidth="1.25" 
                          />
                          <path 
                            d={svgPaths.p1b528f0} 
                            stroke="rgba(173,255,47,0.5)" 
                            strokeWidth="1.25" 
                          />
                          <path 
                            d={svgPaths.p312c0700} 
                            stroke="rgba(173,255,47,0.5)" 
                            strokeWidth="1.25" 
                          />
                        </g>
                      </svg>
                    </div>
                    <p className="font-['Inter'] text-[13px] leading-[19.5px] tracking-[0.52px] text-[rgba(255,255,255,0.25)]">
                      Frankfurt, Kentucky
                    </p>
                  </div>

                  <div className="flex items-center gap-[6px]">
                    <div className="w-4 h-4 relative flex-shrink-0">
                      <GenderIcon />
                    </div>
                    <p className="font-['Inter'] text-[13px] leading-[19.5px] tracking-[0.52px] text-[rgba(255,255,255,0.25)]">
                      He/Him/His
                    </p>
                  </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Edit Button */}
            <button 
              className="bg-[rgba(173,255,47,0.06)] border border-[rgba(173,255,47,0.2)] rounded-full px-7 h-[34px] font-['Inter'] text-[11px] tracking-[1.98px] uppercase text-[rgba(173,255,47,0.7)] hover:bg-[rgba(173,255,47,0.12)] hover:border-[rgba(173,255,47,0.4)] transition-all flex items-center justify-center"
              onClick={() => setIsEditProfileModalOpen(true)}
            >
              Edit profile
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <main className="px-12 pb-20 max-w-[1440px] mx-auto">
        <div className="flex gap-8">
          {/* CENTER - Feed */}
          <div className="flex-1 min-w-[400px]">
            {/* Tabs - No Toggle */}
            <div className="mb-6">
              <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-full p-[7px] pr-[8px] pl-[9px] flex items-center gap-1 inline-flex">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-[21px] py-[4px] rounded-full font-['Inter'] text-[11px] tracking-[2.2px] uppercase leading-[16.5px] transition-all ${
                    activeTab === 'all'
                      ? 'text-[rgba(255,255,255,0.9)]'
                      : 'text-[#3a3a3a]'
                  }`}
                >
                  All Posts <span className="text-[9px] leading-[13.5px] text-[rgba(173,255,47,0.5)] ml-1">35</span>
                </button>
                <button
                  onClick={() => setActiveTab('faded')}
                  className={`px-[20px] py-[4px] rounded-full font-['Inter'] text-[11px] tracking-[2.2px] uppercase leading-[16.5px] transition-all ${
                    activeTab === 'faded'
                      ? 'text-[rgba(255,255,255,0.9)]'
                      : 'text-[#3a3a3a]'
                  }`}
                >
                  Faded <span className="text-[9px] leading-[13.5px] text-[rgba(173,255,47,0.5)] ml-1">2</span>
                </button>
                <button
                  onClick={() => setActiveTab('echoes')}
                  className={`px-[20px] py-[4px] rounded-full font-['Inter'] text-[11px] tracking-[2.2px] uppercase leading-[16.5px] transition-all ${
                    activeTab === 'echoes'
                      ? 'text-[rgba(255,255,255,0.9)]'
                      : 'text-[#3a3a3a]'
                  }`}
                >
                  echoes <span className="text-[9px] leading-[13.5px] text-[rgba(173,255,47,0.5)] ml-1">2</span>
                </button>
              </div>
            </div>

            {/* Posts - Manual implementation matching PostCard */}
            <div className="flex flex-col gap-5">
              {mockPosts.map((post, idx) => (
                <PostCardProfile key={idx} post={post} />
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN - Sidebar (Sticky) */}
          <div className="w-[400px] min-w-[400px] flex-shrink-0">
            <div className="sticky top-[100px]">
              <div className="bg-[#0a0a0a] rounded-[16px] border-[0.8px] border-[rgba(255,255,255,0.07)] overflow-hidden">
                {/* Bio Section */}
                <div className="p-5">
                  <p className="font-['Inter'] font-medium text-[11px] tracking-[2px] uppercase text-[#6b6b6b] mb-4">
                    bio
                  </p>
                  <p className="font-['Cormorant_Garamond'] text-[14px] leading-[25.5px] text-[rgba(255,255,255,0.4)]">
                    Writing about the spaces between things. Product at Tempo. Thinking about memory and what we owe the future.
                  </p>
                </div>

                {/* Stats Grid Section */}
                <div className="relative border-t-[0.8px] border-b-[0.8px] border-[rgba(255,255,255,0.07)]">
                  <div className="flex flex-wrap gap-x-8 gap-y-8 px-5 py-[20.8px]">
                    <div className="w-[160px]">
                      <p className="font-['Cormorant_Garamond'] text-[22px] leading-[22px] text-[rgba(255,255,255,0.9)] mb-2">
                        284
                      </p>
                      <p className="font-['Inter'] font-medium text-[11px] tracking-[2px] uppercase text-[#6b6b6b]">
                        Followers
                      </p>
                    </div>
                    <div className="w-[160px]">
                      <p className="font-['Cormorant_Garamond'] text-[22px] leading-[22px] text-[rgba(255,255,255,0.9)] mb-2">
                        521
                      </p>
                      <p className="font-['Inter'] font-medium text-[11px] tracking-[2px] uppercase text-[#6b6b6b]">
                        Following
                      </p>
                    </div>
                    <div className="w-[160px]">
                      <p className="font-['Cormorant_Garamond'] text-[22px] leading-[22px] text-[rgba(255,255,255,0.9)] mb-2">
                        1,603
                      </p>
                      <p className="font-['Inter'] font-medium text-[11px] tracking-[2px] uppercase text-[#6b6b6b]">
                        posts
                      </p>
                    </div>
                    <div className="w-[160px]">
                      <p className="font-['Cormorant_Garamond'] text-[22px] leading-[22px] text-[rgba(255,255,255,0.9)] mb-2">
                        5,499
                      </p>
                      <p className="font-['Inter'] font-medium text-[11px] tracking-[2px] uppercase text-[#6b6b6b]">
                        faded
                      </p>
                    </div>
                  </div>
                </div>

                {/* Matches & Meetings Section - COMBINED */}
                <div className="p-5">
                  <div className="flex gap-8">
                    {/* Matches */}
                    <div className="flex-1">
                      <p className="font-['Inter'] font-medium text-[11px] tracking-[2px] uppercase text-[#6b6b6b] mb-2">
                        matches
                      </p>
                      <div className="flex items-end gap-2">
                        <div className="flex items-center pr-[20px]">
                          <div className="bg-[#e2e2e2] mr-[-20px] relative rounded-full shrink-0 size-[32px]">
                            <img src={imgPost1} alt="" className="w-full h-full rounded-full object-cover" />
                            <div aria-hidden="true" className="absolute border border-black border-solid inset-[-1px] pointer-events-none rounded-full" />
                          </div>
                          <div className="bg-[#e2e2e2] mr-[-20px] relative rounded-full shrink-0 size-[32px]">
                            <img src={imgPost2} alt="" className="w-full h-full rounded-full object-cover" />
                            <div aria-hidden="true" className="absolute border border-black border-solid inset-[-1px] pointer-events-none rounded-full" />
                          </div>
                          <div className="bg-[#e2e2e2] mr-[-20px] relative rounded-full shrink-0 size-[32px]">
                            <img src={imgPost3} alt="" className="w-full h-full rounded-full object-cover" />
                            <div aria-hidden="true" className="absolute border border-black border-solid inset-[-1px] pointer-events-none rounded-full" />
                          </div>
                        </div>
                        <p className="font-['Cormorant_Garamond'] text-[22px] leading-[22px] text-[rgba(255,255,255,0.9)]">
                          132
                        </p>
                      </div>
                    </div>

                    {/* Meetings */}
                    <div className="flex-1">
                      <p className="font-['Inter'] font-medium text-[11px] tracking-[2px] uppercase text-[#6b6b6b] mb-2">
                        meetings
                      </p>
                      <div className="flex items-end gap-2">
                        <div className="flex items-center pr-[20px]">
                          <div className="bg-[#e2e2e2] mr-[-20px] relative rounded-full shrink-0 size-[32px]">
                            <img src={imgPost2} alt="" className="w-full h-full rounded-full object-cover" />
                            <div aria-hidden="true" className="absolute border border-black border-solid inset-[-1px] pointer-events-none rounded-full" />
                          </div>
                          <div className="bg-[#e2e2e2] mr-[-20px] relative rounded-full shrink-0 size-[32px]">
                            <img src={imgPost3} alt="" className="w-full h-full rounded-full object-cover" />
                            <div aria-hidden="true" className="absolute border border-black border-solid inset-[-1px] pointer-events-none rounded-full" />
                          </div>
                          <div className="bg-[#e2e2e2] mr-[-20px] relative rounded-full shrink-0 size-[32px]">
                            <img src={imgPost1} alt="" className="w-full h-full rounded-full object-cover" />
                            <div aria-hidden="true" className="absolute border border-black border-solid inset-[-1px] pointer-events-none rounded-full" />
                          </div>
                        </div>
                        <p className="font-['Cormorant_Garamond'] text-[22px] leading-[22px] text-[rgba(255,255,255,0.9)]">
                          56
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interests Section */}
                <div className="p-5 border-t-[0.8px] border-[rgba(255,255,255,0.07)]">
                  <p className="font-['Inter'] font-medium text-[11px] tracking-[2px] uppercase text-[#6b6b6b] mb-4">
                    Interests
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {['social impact', 'travel', 'food', 'venture capital', 'coffee', 'fitness'].map((tag) => (
                      <div key={tag} className="bg-[#1a1a1a] rounded-full px-2 py-1">
                        <span className="font-['Inter'] font-light text-[13px] leading-[19.5px] tracking-[0.65px] text-[#6b6b6b]">
                          {tag}
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* Add More Button */}
                  <div className="bg-[#0a0a0a] rounded-full border-[0.8px] border-[#1a1a1a] inline-flex">
                    <button className="flex items-center gap-1 px-4 py-[6px]">
                      <div className="w-5 h-5 relative flex-shrink-0">
                        <svg className="w-full h-full" fill="none" viewBox="0 0 20 20">
                          <g transform="translate(3.33, 3.33)">
                            <path d="M0.833333 6.66667H12.5" stroke="white" strokeDasharray="13.33 13.33" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                            <path d="M6.66667 0.833333V12.5" stroke="white" strokeDasharray="13.33 13.33" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                          </g>
                        </svg>
                      </div>
                      <span className="font-['Inter'] font-medium text-[11px] leading-[16.5px] tracking-[2.2px] uppercase text-[rgba(255,255,255,0.9)]">
                        Add more
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        initialData={profileData}
        onSave={handleProfileSave}
      />
    </div>
  );
}

// Profile-specific PostCard component
function PostCardProfile({ post }: { post: Post }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const getStatusBadge = () => {
    if (post.status === "faded") {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0a0a0a] border border-[#1a1a1a]">
          <div className="w-1 h-1 rounded-full bg-[#6B6B6B]" />
          <span className="text-[#6B6B6B] text-[9px] tracking-[0.2em] uppercase font-light">FADED</span>
        </div>
      );
    }
    if (post.status === "fading" && post.fadingIn) {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0a0a0a] border border-[#1a1a1a]">
          <div className="w-1 h-1 rounded-full bg-[#CC9933]" />
          <span className="text-[#CC9933] text-[9px] tracking-[0.2em] uppercase font-light">FADING IN {post.fadingIn}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <article className="relative bg-[#0a0a0a] rounded-2xl border border-[rgba(255,255,255,0.04)] shadow-2xl shadow-black/60 overflow-hidden">
      {/* Optional image at top */}
      {post.image && (
        <div className="w-full bg-black max-h-48 overflow-hidden">
          <img
            src={post.image}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="relative p-5">
        {/* Header with Avatar, Username, Timestamp, Status Badge */}
        <div className="flex items-start gap-3 mb-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <img
              src={avatarUrlCurrent}
              alt="A. Fitch"
              className="w-10 h-10 rounded-full object-cover bg-[#1a1a1a] ring-1 ring-[#2a2a2a]"
            />
          </div>

          {/* Username and handle */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-[10px] mb-1">
              <p className="font-['Inter'] text-[15px] leading-[22.5px] tracking-[0.375px] text-white font-light">
                A. Fitch
              </p>
              <p className="font-['Inter'] text-[13px] leading-[19.5px] tracking-[0.65px] text-[#6b6b6b] font-light">
                {post.timestamp}
              </p>
            </div>
            {/* Handle instead of Following badge */}
            <p className="font-['Inter'] text-[13px] leading-[19.5px] tracking-[0.65px] text-[#6b6b6b] font-light">
              @alabaster.f
            </p>
          </div>

          {/* Right side: Status Badge and More Menu */}
          <div className="flex items-center gap-3">
            {/* Status Badge */}
            {getStatusBadge()}
            
            {/* More Options Menu */}
            <button 
              ref={buttonRef}
              onClick={handleMenuClick}
              className="flex items-center justify-center text-[#6b6b6b] hover:text-white/60 transition-colors w-5 h-5"
            >
              <MoreVertical size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Post Options Menu */}
        {isMenuOpen && buttonRef.current && (
          <PostOptionsMenu
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            type="profile"
            isFaded={post.status === "faded"}
            position={{
              top: buttonRef.current.getBoundingClientRect().bottom + 4,
              left: buttonRef.current.getBoundingClientRect().left - 220,
            }}
          />
        )}

        {/* Text - NO BLUR OR FADE */}
        <p className="font-['Cormorant_Garamond'] text-[14px] leading-[23.8px] tracking-[0.35px] text-[#d4d4d4] mb-4">
          {post.text}
        </p>

        {/* Actions - Left: Comment/Echo, Right: Stat/Share/Delete */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
          {/* Left actions */}
          <div className="flex items-center gap-5">
            <button className="flex items-center justify-center text-[#6b6b6b] hover:text-white/60 transition-colors w-[18px] h-[18px]">
              <MessageCircle size={18} strokeWidth={1.125} />
            </button>
            <button className="flex items-center justify-center text-[#6b6b6b] hover:text-white/60 transition-colors w-[18px] h-[18px]">
              <ArcticonsTetherfi />
            </button>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-5">
            <button className="flex items-center justify-center text-[#6b6b6b] hover:text-white/60 transition-colors w-[18px] h-[18px]">
              <BarChartIcon />
            </button>
            <button className="flex items-center justify-center text-[#6b6b6b] hover:text-white/60 transition-colors w-[18px] h-[18px]">
              <Share2 size={18} strokeWidth={1.125} />
            </button>
            <button className="flex items-center justify-center text-[#6b6b6b] hover:text-white/60 transition-colors w-[18px] h-[18px]">
              <TrashIcon />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
