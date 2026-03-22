import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ChevronLeft, Search, Share2, MoreVertical, Image as ImageIcon, FileText, Heart, MessageCircle, Smile, Pin, User, Activity, AlertTriangle, LogOut, Volume2, Plus } from 'lucide-react';
import { AvatarDropdown } from './components/AvatarDropdown';
import imgAvatar from "figma:asset/8c692006a4e235a1e390f04abab516d1cc8c4603.png";
import LetheLogo from '../imports/LetheLogo';
import Reaction from '../imports/Reaction';
import ComposeCard from '../imports/Container-169-248';
import OptionsButton from '../imports/Button-169-259';

interface Post {
  id: number;
  author: {
    name: string;
    avatar: string;
    role?: string;
  };
  time: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  pinned?: boolean;
  isLiked?: boolean;
}

const mockPosts: Post[] = [
  {
    id: 1,
    author: {
      name: 'Marcus Jin',
      avatar: 'https://images.unsplash.com/photo-1629507208649-70919ca33793?w=80&q=70&fit=crop&crop=face'
    },
    time: '2 hours ago',
    content: "Has anyone else noticed that the failure mode of most voice agents isn't bad intent-parsing - it's bad pacing? The agent answers correctly but speaks like it's reading from a spreadsheet. The trust never builds. Curious how people are handling this.",
    likes: 14,
    comments: 6,
    isLiked: true
  },
  {
    id: 2,
    author: {
      name: 'Anika Patel',
      avatar: 'https://images.unsplash.com/photo-1672685667592-0392f458f46f?w=80&q=70&fit=crop&crop=face'
    },
    time: '4 hours ago',
    content: 'Put together a framework for evaluating agentic conversation flows - specifically around how to think about error recovery. When should an agent apologise vs. just correct course quietly? Sharing here before I write it up properly.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=70&fit=crop',
    likes: 31,
    comments: 12
  },
  {
    id: 3,
    author: {
      name: 'River Castillo',
      avatar: 'https://images.unsplash.com/photo-1770363757711-aa4db84d308d?w=80&q=70&fit=crop&crop=face'
    },
    time: 'Yesterday',
    content: 'Reading through some older HCI papers on conversational repair strategies. Remarkable how much of what we call "AI UX" was figured out in the 90s - we just didn\'t have the compute to execute. Anyone have recommendations for more obscure reading in this space?',
    likes: 19,
    comments: 9
  },
  {
    id: 4,
    author: {
      name: 'Elena Voss',
      avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=80&q=70&fit=crop&crop=face'
    },
    time: 'Yesterday',
    content: 'Shipped our first voice agent for customer support last week. The biggest learning: users don\'t trust silence. Even a 2-second pause feels broken. We added ambient "thinking" sounds and satisfaction scores jumped 40%. Details in comments.',
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&q=70&fit=crop',
    likes: 47,
    comments: 23
  },
  {
    id: 5,
    author: {
      name: 'James Okafor',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=70&fit=crop&crop=face'
    },
    time: '2 days ago',
    content: 'Hot take: Most conversational UX designers are optimizing for the wrong metric. We obsess over completion rates when we should be measuring "felt understanding" - does the user feel heard? I built a small prototype testing this and the results are fascinating.',
    likes: 38,
    comments: 15
  },
  {
    id: 6,
    author: {
      name: 'Sophia Chen',
      avatar: 'https://images.unsplash.com/photo-1532272278764-53cd1fe53f72?w=80&q=70&fit=crop&crop=face',
      role: 'Admin'
    },
    time: '3 days ago',
    content: 'Sharing our team\'s latest design system for conversational patterns. Covers everything from greeting styles to error recovery flows. This has been 6 months in the making and I\'m excited to finally share it with the guild.',
    image: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=600&q=70&fit=crop',
    likes: 62,
    comments: 28
  },
  {
    id: 7,
    author: {
      name: 'Noah Bekele',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&q=70&fit=crop&crop=face'
    },
    time: '4 days ago',
    content: 'Question for the group: When designing multi-turn conversations, how do you handle context degradation? I find that after 4-5 exchanges, users start repeating themselves because they assume the agent has forgotten. Any patterns that work well?',
    likes: 26,
    comments: 18
  }
];

const mockMembers = [
  {
    name: 'You',
    avatar: imgAvatar,
    role: 'Member',
    online: true
  },
  {
    name: 'Sophia Chen',
    avatar: 'https://images.unsplash.com/photo-1532272278764-53cd1fe53f72?w=80&q=70&fit=crop&crop=face',
    role: 'Admin',
    online: true
  },
  {
    name: 'Marcus Jin',
    avatar: 'https://images.unsplash.com/photo-1629507208649-70919ca33793?w=80&q=70&fit=crop&crop=face',
    role: 'Member',
    online: true
  },
  {
    name: 'Anika Patel',
    avatar: 'https://images.unsplash.com/photo-1672685667592-0392f458f46f?w=80&q=70&fit=crop&crop=face',
    role: 'Member',
    online: false
  },
  {
    name: 'River Castillo',
    avatar: 'https://images.unsplash.com/photo-1770363757711-aa4db84d308d?w=80&q=70&fit=crop&crop=face',
    role: 'Member',
    online: false
  },
  {
    name: 'Elena Voss',
    avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=80&q=70&fit=crop&crop=face',
    role: 'Member',
    online: false
  },
  {
    name: 'James Okafor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=70&fit=crop&crop=face',
    role: 'Member',
    online: false
  }
];

const communities = [
  {
    id: 1,
    name: 'Conversation Design Guild',
    icon: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=80&q=70&fit=crop',
    members: 134,
    hasUnread: true,
    active: true
  },
  {
    id: 2,
    name: 'African Design Leaders',
    icon: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=80&q=70&fit=crop',
    members: 47,
    hasUnread: false,
    active: false
  },
  {
    id: 3,
    name: 'Effective Altruism × Tech',
    icon: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=80&q=70&fit=crop',
    members: 289,
    hasUnread: false,
    active: false
  }
];

export default function CommunityPage() {
  const [posts, setPosts] = useState(mockPosts);
  const [composeValue, setComposeValue] = useState('');
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleLike = (postId: number) => {
    setPosts(posts.map(p => 
      p.id === postId 
        ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
        : p
    ));
  };

  return (
    <div className="h-screen bg-[#050705] text-white/88 flex flex-col overflow-hidden">
      {/* TopNav */}
      <nav className="h-14 flex items-center justify-between px-8 bg-[#000000] border-b border-[#1a1a1a] flex-shrink-0 relative z-50">
        <div className="flex items-center gap-6">
          <Link
            to="/communities"
            className="flex items-center gap-[7px] text-[13px] font-medium tracking-[0.1em] uppercase text-white/25 hover:text-white/52 transition-colors no-underline"
          >
            <ChevronLeft size={14} strokeWidth={1.5} />
            Communities
          </Link>
          <div className="w-px h-4 bg-white/[0.07]" />
          <div className="text-[13px] font-light text-white/25">
            <span className="text-white/52">Conversation Design Guild</span>
          </div>
        </div>
        <AvatarDropdown avatarUrl={imgAvatar} />
      </nav>

      {/* Body */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <div className="flex-1 flex overflow-hidden min-h-0 gap-4 px-12 py-5">
          {/* Center - Feed */}
          <div className="flex-1 min-w-0 flex flex-col overflow-hidden bg-[#0b0e0b] border border-white/[0.07] rounded-2xl">
          {/* Community Header */}
          <div className="flex-shrink-0 border-b border-white/[0.07] relative">
            <div className="h-[100px] overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=900&q=70&fit=crop"
                alt=""
                className="w-full h-full object-cover brightness-[0.45] saturate-[0.6]"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[30%] to-[rgba(11,14,11,0.9)]" />
            </div>
            <div className="px-6 pb-4 flex items-end gap-[14px] relative -mt-6">
              <div className="w-[52px] h-[52px] rounded-[12px] overflow-hidden border border-white/[0.07] flex-shrink-0 bg-[#0f130f]">
                <img
                  src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=80&q=70&fit=crop"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0 pb-[2px]">
                <h1 className="font-['Libre_Baskerville'] text-[18px] font-normal text-white/88 mb-[3px] leading-[1.2]">
                  Conversation Design Guild
                </h1>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-[13px] font-light text-white/25">
                    <User size={13} strokeWidth={1.5} className="opacity-60" />
                    134 members
                  </div>
                  <div className="flex items-center gap-1 text-[13px] font-light text-white/25">
                    <User size={13} strokeWidth={1.5} className="opacity-60" />
                    Created by Sophia Chen
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0 pb-[2px]">
                <button className="flex items-center gap-[6px] px-[13px] py-[7px] rounded-lg border border-white/[0.12] bg-transparent text-white/52 text-[13px] font-medium tracking-[0.06em] hover:bg-white/[0.06] hover:text-white/88 transition-all">
                  <Share2 size={13} strokeWidth={1.5} />
                  Invite
                </button>
                <div className="relative">
                  <button 
                    onClick={() => setShowOptionsDropdown(!showOptionsDropdown)}
                    className="flex items-center justify-center w-[29.6px] h-[29.6px] rounded-lg border border-white/[0.12] bg-transparent text-white/52 hover:bg-white/[0.06] hover:text-white/88 transition-all"
                  >
                    <MoreVertical size={13} strokeWidth={1.5} />
                  </button>
                  {showOptionsDropdown && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowOptionsDropdown(false)}
                      />
                      <div className="absolute top-full right-0 mt-2 w-[220px] bg-[#1a1a1a] border border-[#2a2a2a] rounded-[12px] shadow-[0px_8px_24px_rgba(0,0,0,0.4)] overflow-hidden z-50">
                        <button className="w-full px-4 py-3 flex items-center gap-3 text-[13px] font-light text-white/88 hover:bg-white/[0.06] transition-colors text-left">
                          <Activity size={14} strokeWidth={1.5} className="text-white/25" />
                          Activity
                        </button>
                        <button className="w-full px-4 py-3 flex items-center gap-3 text-[13px] font-light text-white/88 hover:bg-white/[0.06] transition-colors text-left">
                          <Volume2 size={14} strokeWidth={1.5} className="text-white/25" />
                          Mute community
                        </button>
                        <div className="h-px bg-white/[0.07]" />
                        <button className="w-full px-4 py-3 flex items-center gap-3 text-[13px] font-light text-[#ff6b6b] hover:bg-white/[0.06] transition-colors text-left">
                          <AlertTriangle size={14} strokeWidth={1.5} />
                          Report community
                        </button>
                        <button className="w-full px-4 py-3 flex items-center gap-3 text-[13px] font-light text-[#ff6b6b] hover:bg-white/[0.06] transition-colors text-left">
                          <LogOut size={14} strokeWidth={1.5} />
                          Leave community
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Feed Scroll */}
          <div className="flex-1 overflow-y-auto px-6 py-5" style={{ scrollbarWidth: 'none' }}>
            {/* Compose */}
            <div className="bg-[#0f130f] border border-[#2a2a2a] rounded-[16px] h-[130px] p-5 mb-5 flex flex-col justify-between">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border-[1.5px] border-white/[0.07]">
                  <img src={imgAvatar} alt="You" className="w-full h-full object-cover" />
                </div>
                <textarea
                  value={composeValue}
                  onChange={(e) => setComposeValue(e.target.value)}
                  placeholder="Share something with the guild..."
                  className="flex-1 bg-transparent border-none outline-none text-[13px] font-light text-white/88 placeholder:text-white/25 resize-none leading-[1.65]"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button className="w-5 h-5 flex items-center justify-center text-[#6b6b6b] hover:text-white/52 transition-colors">
                    <ImageIcon size={16} strokeWidth={1.5} />
                  </button>
                  <button className="w-5 h-5 flex items-center justify-center text-[#6b6b6b] hover:text-white/52 transition-colors">
                    <FileText size={16} strokeWidth={1.5} />
                  </button>
                  <button className="w-5 h-5 flex items-center justify-center text-[#6b6b6b] hover:text-white/52 transition-colors">
                    <Plus size={16} strokeWidth={1.5} />
                  </button>
                </div>
                <button className="bg-[#3a3a3a] text-[13px] font-medium text-[#6b6b6b] tracking-[0.025em] px-[17px] py-[8px] rounded-full hover:bg-[#4a4a4a] hover:text-white/65 transition-colors">
                  Post
                </button>
              </div>
            </div>

            {/* Pinned Post */}
            <div className="bg-[rgba(173,255,47,0.02)] border border-[rgba(173,255,47,0.1)] rounded-[14px] p-4 mb-3 hover:border-[rgba(173,255,47,0.15)] transition-colors">
              <div className="flex items-center justify-between mb-[10px]">
                <div className="flex items-center gap-[9px]">
                  <div className="w-[34px] h-[34px] rounded-full overflow-hidden flex-shrink-0 border-[1.5px] border-white/[0.07]">
                    <img
                      src="https://images.unsplash.com/photo-1532272278764-53cd1fe53f72?w=80&q=70&fit=crop&crop=face"
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-[1px]">
                    <div className="text-[13px] font-medium text-white/88">
                      Sophia Chen <span className="text-[13px] font-light text-[rgba(173,255,47,0.5)] ml-1">· Admin</span>
                    </div>
                    <div className="text-[13px] font-light text-white/25">Pinned · 3 days ago</div>
                  </div>
                </div>
                <button className="w-6 h-6 rounded-[6px] bg-transparent flex items-center justify-center text-white/25 hover:bg-white/[0.06] hover:text-white/52 transition-all">
                  <MoreVertical size={14} strokeWidth={1.5} />
                </button>
              </div>
              <div className="text-[13px] font-light text-white/52 leading-[1.75] mb-3">
                <strong className="font-medium text-white/88">Welcome to the Conversation Design Guild.</strong> This is a space for practitioners who think seriously about how AI should speak, listen, and reason. Share work, ask questions, argue about what good looks like. We're glad you're here.
              </div>
              <div className="flex items-center gap-0 pt-[10px] border-t border-white/[0.07]">
                <button className="flex items-center gap-[5px] px-[10px] py-[5px] rounded-[7px] bg-transparent text-white/25 text-[13px] font-light hover:bg-white/[0.06] hover:text-white/52 transition-all mr-1">
                  <Heart size={13} strokeWidth={1.5} />
                  24
                </button>
                <button className="flex items-center gap-[5px] px-[10px] py-[5px] rounded-[7px] bg-transparent text-white/25 text-[13px] font-light hover:bg-white/[0.06] hover:text-white/52 transition-all mr-1">
                  <MessageCircle size={13} strokeWidth={1.5} />
                  8
                </button>
                <div className="ml-auto flex items-center gap-[5px] text-[13px] font-medium tracking-[0.1em] uppercase text-[rgba(173,255,47,0.4)]">
                  <Pin size={13} strokeWidth={2} />
                  Pinned
                </div>
              </div>
            </div>

            {/* Posts */}
            {posts.map(post => (
              <div
                key={post.id}
                className="bg-[#0f130f] border border-white/[0.07] rounded-[14px] p-4 mb-3 hover:border-white/[0.12] transition-colors"
              >
                <div className="flex items-center justify-between mb-[10px]">
                  <div className="flex items-center gap-[9px]">
                    <div className="w-[34px] h-[34px] rounded-full overflow-hidden flex-shrink-0 border-[1.5px] border-white/[0.07]">
                      <img src={post.author.avatar} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col gap-[1px]">
                      <div className="text-[13px] font-medium text-white/88">
                        {post.author.name}
                        {post.author.role && (
                          <span className="text-[13px] font-light text-[rgba(173,255,47,0.5)] ml-1">· {post.author.role}</span>
                        )}
                      </div>
                      <div className="text-[13px] font-light text-white/25">{post.time}</div>
                    </div>
                  </div>
                  <button className="w-6 h-6 rounded-[6px] bg-transparent flex items-center justify-center text-white/25 hover:bg-white/[0.06] hover:text-white/52 transition-all">
                    <MoreVertical size={14} strokeWidth={1.5} />
                  </button>
                </div>
                {post.image && (
                  <div className="rounded-[10px] overflow-hidden mb-3">
                    <img src={post.image} alt="" className="w-full block max-h-[260px] object-cover" />
                  </div>
                )}
                <div className="text-[13px] font-light text-white/52 leading-[1.75] mb-3">
                  {post.content}
                </div>
                <div className="flex items-center gap-0 pt-[10px] border-t border-white/[0.07]">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-[5px] px-[10px] py-[5px] rounded-[7px] bg-transparent text-[13px] font-light transition-all mr-1 ${
                      post.isLiked
                        ? 'text-[rgba(173,255,47,0.65)]'
                        : 'text-white/25 hover:bg-white/[0.06] hover:text-white/52'
                    }`}
                  >
                    <Heart size={13} strokeWidth={1.5} fill={post.isLiked ? 'currentColor' : 'none'} />
                    {post.likes}
                  </button>
                  <button className="flex items-center gap-[5px] px-[10px] py-[5px] rounded-[7px] bg-transparent text-white/25 text-[13px] font-light hover:bg-white/[0.06] hover:text-white/52 transition-all mr-1">
                    <MessageCircle size={13} strokeWidth={1.5} />
                    {post.comments}
                  </button>
                  <div className="relative ml-auto">
                    <button 
                      onClick={() => setShowEmojiPicker(showEmojiPicker === post.id ? null : post.id)}
                      className="flex items-center gap-[5px] px-[10px] py-[5px] rounded-[7px] bg-transparent text-white/25 text-[13px] font-light hover:bg-white/[0.06] hover:text-white/52 transition-all"
                    >
                      <div className="w-[13px] h-[13px]">
                        <Reaction />
                      </div>
                    </button>
                    {showEmojiPicker === post.id && (
                      <div className="absolute bottom-full right-0 mb-2 p-[6px] bg-[#1a1a1a] border border-[#2a2a2a] rounded-[10px] shadow-[0px_8px_24px_rgba(0,0,0,0.4)] z-50 flex items-center gap-[4px]">
                        <button className="text-[18px] hover:scale-110 transition-transform">👍</button>
                        <button className="text-[18px] hover:scale-110 transition-transform">❤️</button>
                        <button className="text-[18px] hover:scale-110 transition-transform">😂</button>
                        <button className="text-[18px] hover:scale-110 transition-transform">😮</button>
                        <button className="text-[18px] hover:scale-110 transition-transform">😢</button>
                        <button className="text-[18px] hover:scale-110 transition-transform">🙏</button>
                        <button className="text-white/25 hover:text-white/52 transition-colors ml-[2px]">
                          <Plus size={16} strokeWidth={1.5} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar - Members Card */}
        <div className="w-[400px] flex-shrink-0 flex flex-col bg-[#0b0e0b] border border-white/[0.07] rounded-2xl overflow-hidden">
          {/* About Card */}
          <div className="m-3 bg-[#0f130f] border border-white/[0.07] rounded-[12px] p-[14px]">
            <div className="text-[13px] font-semibold tracking-[0.2em] uppercase text-white/25 mb-2">
              About
            </div>
            <div className="text-[13px] font-light text-white/52 leading-[1.65]">
              Practitioners thinking at the frontier of how AI should communicate. Voice agents, chat systems, agentic UX.
            </div>
            <div className="flex flex-wrap gap-[5px] mt-[10px]">
              {['AI', 'Voice', 'UX', 'Conversation'].map(tag => (
                <span
                  key={tag}
                  className="text-[13px] px-[9px] py-[3px] rounded-[20px] bg-white/[0.06] border border-white/[0.07] text-white/25"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Members */}
          <div className="px-[18px] pt-4 pb-3 flex-shrink-0 border-b border-white/[0.07]">
            <div className="text-[13px] font-semibold tracking-[0.2em] uppercase text-white/25">
              Members · 134
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-2" style={{ scrollbarWidth: 'none' }}>
            <span className="text-[13px] font-semibold tracking-[0.2em] uppercase text-white/25 px-[18px] py-[10px] block">
              Online now
            </span>
            {mockMembers.filter(m => m.online).map(member => (
              <div
                key={member.name}
                className="flex items-center gap-[10px] px-[18px] py-[9px] cursor-pointer hover:bg-white/[0.06] transition-colors"
              >
                <div className="relative w-8 h-8 flex-shrink-0">
                  <div className="absolute left-0 top-0 w-8 h-8 rounded-full overflow-hidden border-[0.8px] border-white/[0.07]">
                    <img src={member.avatar} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute top-0 left-0 w-[9px] h-[9px] rounded-full bg-[#adff2f] border-[1.6px] border-solid border-[#0b0e0b]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-normal text-white/88 whitespace-nowrap overflow-hidden text-ellipsis">
                    {member.name}
                  </div>
                  <div className="text-[13px] font-light text-white/25">{member.role}</div>
                </div>
              </div>
            ))}
            <span className="text-[13px] font-semibold tracking-[0.2em] uppercase text-white/25 px-[18px] py-[10px] block mt-[6px]">
              All members
            </span>
            {mockMembers.filter(m => !m.online).map(member => (
              <div
                key={member.name}
                className="flex items-center gap-[10px] px-[18px] py-[9px] cursor-pointer hover:bg-white/[0.06] transition-colors"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border-[1.5px] border-white/[0.07]">
                  <img src={member.avatar} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-normal text-white/88 whitespace-nowrap overflow-hidden text-ellipsis">
                    {member.name}
                  </div>
                  <div className="text-[13px] font-light text-white/25">{member.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}