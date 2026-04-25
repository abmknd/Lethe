import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Grid, List, Users, MessageCircle, Bell, Search } from 'lucide-react';
import { AvatarDropdown } from './components/AvatarDropdown';
import imgAvatar from "../assets/8c692006a4e235a1e390f04abab516d1cc8c4603.png";
import LetheLogo from '../imports/LetheLogo';

type ViewType = 'grid' | 'list';
type TabType = 'my' | 'invites';

interface Community {
  id: number;
  name: string;
  status: 'member' | 'invited';
  desc: string;
  banner: string;
  icon: string;
  members: number;
  posts: number;
  invitedBy?: string;
  tags: string[];
}

const mockCommunities: Community[] = [
  {
    id: 1,
    name: 'European Design Leaders',
    status: 'member',
    desc: 'A curated space for senior designers across Europe building products that shape the continent.',
    banner: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=600&q=70&fit=crop',
    icon: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=80&q=70&fit=crop',
    members: 47,
    posts: 12,
    invitedBy: 'James Okafor',
    tags: ['Design', 'Europe', 'Leadership']
  },
  {
    id: 2,
    name: 'Conversation Design Guild',
    status: 'member',
    desc: 'Practitioners thinking at the frontier of how AI should communicate. Voice agents, chat systems, agentic UX.',
    banner: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=70&fit=crop',
    icon: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=80&q=70&fit=crop',
    members: 134,
    posts: 38,
    invitedBy: 'Sophia Chen',
    tags: ['AI', 'Voice', 'UX']
  },
  {
    id: 3,
    name: 'Effective Altruism × Tech',
    status: 'member',
    desc: 'Where people who build things think seriously about whether those things should be built.',
    banner: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=70&fit=crop',
    icon: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=80&q=70&fit=crop',
    members: 289,
    posts: 67,
    invitedBy: 'Elena Voss',
    tags: ['EA', 'Ethics', 'Tech']
  }
];

const mockInvites: Community[] = [
  {
    id: 4,
    name: 'Calm Companies Circle',
    status: 'invited',
    desc: 'Founders and builders committed to sustainable growth, thoughtful culture, and work that doesn\'t consume you.',
    banner: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=70&fit=crop',
    icon: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=70&fit=crop',
    members: 62,
    posts: 19,
    invitedBy: 'Noah Bekele',
    tags: ['Startups', 'Culture', 'Calm']
  }
];

const memberAvatars = [
  'https://images.unsplash.com/photo-1532272278764-53cd1fe53f72?w=40&q=70&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1629507208649-70919ca33793?w=40&q=70&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1672685667592-0392f458f46f?w=40&q=70&fit=crop&crop=face'
];

export default function CommunitiesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('my');
  const [viewType, setViewType] = useState<ViewType>('grid');
  const [communities] = useState<Community[]>(mockCommunities);
  const [invites, setInvites] = useState<Community[]>(mockInvites);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleAcceptInvite = (id: number) => {
    const invite = invites.find(i => i.id === id);
    if (invite) {
      invite.status = 'member';
      setInvites(invites.filter(i => i.id !== id));
    }
  };

  const handleDeclineInvite = (id: number) => {
    setInvites(invites.filter(i => i.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#050705] text-white/88 flex flex-col">
      {/* TopNav */}
      <nav className="h-14 flex items-center justify-between px-8 bg-[#000000] border-b border-[#1a1a1a] flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5">
            <LetheLogo />
          </div>
          <div className="font-['Cormorant_Garamond'] text-[14px] font-normal text-white tracking-[0.3em] uppercase leading-[1.4]">
            LETHE
          </div>
        </div>
        <AvatarDropdown avatarUrl={imgAvatar} />
      </nav>

      {/* Tabs Container */}
      <div className="px-8 pt-6 pb-4 bg-[#050705] border-b border-white/[0.07] flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-full inline-flex p-[7px] relative">
            <button
              onClick={() => setActiveTab('my')}
              className={`relative px-5 h-[24.5px] rounded-full flex items-center gap-[6px] text-[11px] font-medium tracking-[0.22em] uppercase transition-all ${
                activeTab === 'my'
                  ? 'text-[rgba(255,255,255,0.9)] bg-transparent'
                  : 'text-[#3a3a3a] bg-transparent hover:text-white/50'
              }`}
            >
              My communities
              <span className={`text-[9px] text-[rgba(173,255,47,0.5)]`}>
                {communities.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('invites')}
              className={`relative px-5 h-[24.5px] rounded-full flex items-center gap-[6px] text-[11px] font-medium tracking-[0.22em] uppercase transition-all ${
                activeTab === 'invites'
                  ? 'text-[rgba(255,255,255,0.9)] bg-transparent'
                  : 'text-[#3a3a3a] bg-transparent hover:text-white/50'
              }`}
            >
              Invites
              <span className={`text-[9px] text-[rgba(173,255,47,0.5)]`}>
                {invites.length}
              </span>
            </button>
          </div>

          {/* Search and View Toggle */}
          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="relative">
              <Search size={14} strokeWidth={1.5} className="absolute left-[14px] top-1/2 -translate-y-1/2 text-white/25" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search communities..."
                className="w-[280px] h-[38px] pl-[38px] pr-4 bg-[#0b0e0b] border border-white/[0.07] rounded-[10px] text-[13px] font-light text-white/88 placeholder:text-white/25 outline-none focus:border-white/[0.12] transition-colors"
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewType('grid')}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  viewType === 'grid'
                    ? 'bg-[#0f130f] border border-white/[0.07] text-white/88'
                    : 'bg-transparent border border-transparent text-white/25 hover:text-white/52'
                }`}
                title="Grid view"
              >
                <Grid size={16} strokeWidth={1.5} />
              </button>
              <button
                onClick={() => setViewType('list')}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  viewType === 'list'
                    ? 'bg-[#0f130f] border border-white/[0.07] text-white/88'
                    : 'bg-transparent border border-transparent text-white/25 hover:text-white/52'
                }`}
                title="List view"
              >
                <List size={16} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-12 py-5" style={{ scrollbarWidth: 'none' }}>
        {activeTab === 'my' ? (
          <>
            {/* Page Header */}
            <div className="mb-7">
              <h1 className="font-['Cormorant_Garamond'] text-[26px] font-normal italic text-white/88 mb-[6px]">
                Your communities
              </h1>
              <p className="text-[13px] font-light text-white/25 leading-[1.65] max-w-[520px]">
                Invite-only spaces where you can connect with people who share your world. You only see communities you have been invited to.
              </p>
            </div>

            {/* Invite Banner */}
            {invites.length > 0 && (
              <button
                onClick={() => setActiveTab('invites')}
                className="w-full bg-[rgba(173,255,47,0.04)] border border-[rgba(173,255,47,0.1)] rounded-[14px] p-4 flex items-center gap-[14px] mb-7 hover:bg-[rgba(173,255,47,0.06)] transition-colors"
              >
                <div className="w-9 h-9 rounded-[10px] bg-[rgba(173,255,47,0.08)] border border-[rgba(173,255,47,0.14)] flex items-center justify-center flex-shrink-0 text-[rgba(173,255,47,0.6)]">
                  <Bell size={16} strokeWidth={1.5} />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-[13px] font-medium text-white/88 mb-[2px]">
                    You have {invites.length} pending invite{invites.length > 1 ? 's' : ''}
                  </div>
                  <div className="text-[13px] font-light text-white/25">
                    {invites.map(i => i.name).join(', ')}
                  </div>
                </div>
                <button className="px-[14px] py-[7px] rounded-lg bg-white/[0.08] border border-white/[0.14] text-white/88 text-[13px] font-medium tracking-[0.06em] hover:bg-white/[0.13] hover:text-white transition-all flex-shrink-0">
                  Review
                </button>
              </button>
            )}

            {communities.length === 0 ? (
              <EmptyState type="my" />
            ) : (
              <>
                <div className="text-[13px] font-semibold tracking-[0.22em] uppercase text-white/25 mb-[14px] flex items-center gap-[10px]">
                  Member of {communities.length} communit{communities.length === 1 ? 'y' : 'ies'}
                  <div className="flex-1 h-px bg-white/[0.07]" />
                </div>

                <div className={viewType === 'grid' ? 'grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-[14px]' : 'flex flex-col gap-[10px]'}>
                  {communities.map(comm => (
                    viewType === 'grid' ? (
                      <CommunityCard key={comm.id} community={comm} onNavigate={() => navigate('/community/1')} />
                    ) : (
                      <CommunityListCard key={comm.id} community={comm} onNavigate={() => navigate('/community/1')} />
                    )
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <>
            {/* Invites Tab */}
            <div className="mb-7">
              <h1 className="font-['Cormorant_Garamond'] text-[26px] font-normal italic text-white/88 mb-[6px]">
                Invites
              </h1>
              <p className="text-[13px] font-light text-white/25 leading-[1.65] max-w-[520px]">
                Communities are invite-only. Review who has invited you and decide whether to join.
              </p>
            </div>

            {invites.length === 0 ? (
              <EmptyState type="invites" />
            ) : (
              <>
                <div className="text-[13px] font-semibold tracking-[0.22em] uppercase text-white/25 mb-[14px] flex items-center gap-[10px]">
                  Pending invites
                  <div className="flex-1 h-px bg-white/[0.07]" />
                </div>

                <div className={viewType === 'grid' ? 'grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-[14px]' : 'flex flex-col gap-[10px]'}>
                  {invites.map(comm => (
                    viewType === 'grid' ? (
                      <InviteCard
                        key={comm.id}
                        community={comm}
                        onAccept={() => handleAcceptInvite(comm.id)}
                        onDecline={() => handleDeclineInvite(comm.id)}
                      />
                    ) : (
                      <InviteListCard
                        key={comm.id}
                        community={comm}
                        onAccept={() => handleAcceptInvite(comm.id)}
                        onDecline={() => handleDeclineInvite(comm.id)}
                      />
                    )
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function CommunityCard({ community, onNavigate }: { community: Community; onNavigate: () => void }) {
  return (
    <div
      onClick={onNavigate}
      className="bg-[#0b0e0b] border border-white/[0.07] rounded-2xl overflow-hidden cursor-pointer hover:border-white/[0.12] hover:-translate-y-[2px] transition-all duration-[250ms] flex flex-col"
    >
      <div className="h-20 relative overflow-hidden">
        <img src={community.banner} alt="" className="w-full h-full object-cover brightness-[0.6] saturate-[0.7]" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(11,14,11,0.85)]" />
      </div>
      <div className="p-4 pt-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="w-10 h-10 rounded-[10px] overflow-hidden border-2 border-white/[0.12] flex-shrink-0 -mt-[30px] relative z-10 bg-[#0f130f]">
            <img src={community.icon} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="bg-[rgba(173,255,47,0.08)] rounded-[120px] px-[9px] py-[3px] flex items-center justify-center">
            <span className="font-semibold text-[11px] text-[rgba(173,255,47,0.72)] tracking-[0.88px] uppercase leading-[16.5px]">
              MEMBER
            </span>
          </div>
        </div>
        <h3 className="font-['Cormorant_Garamond'] text-[16px] font-normal text-white/88 mb-[5px] leading-[1.3]">
          {community.name}
        </h3>
        <p className="text-[13px] font-light text-white/52 leading-[1.65] mb-3">
          {community.desc}
        </p>
        <div className="flex items-center gap-[14px] pt-3 border-t border-white/[0.07] mt-auto">
          <div className="flex items-center">
            {memberAvatars.map((avatar, i) => (
              <div
                key={i}
                className={`w-5 h-5 rounded-full overflow-hidden border-[1.5px] border-[#0b0e0b] flex-shrink-0 ${i > 0 ? '-ml-[6px]' : ''}`}
              >
                <img src={avatar} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
            <span className="text-[13px] font-light text-white/25 ml-2">
              {community.members} members
            </span>
          </div>
          <div className="flex items-center gap-[5px] text-[13px] font-light text-white/25 ml-auto">
            <MessageCircle size={13} strokeWidth={1.5} className="opacity-60" />
            {community.posts} posts
          </div>
        </div>
      </div>
    </div>
  );
}

function CommunityListCard({ community, onNavigate }: { community: Community; onNavigate: () => void }) {
  return (
    <div
      onClick={onNavigate}
      className="bg-[#0b0e0b] border border-white/[0.07] rounded-[14px] flex items-center gap-4 p-4 px-5 cursor-pointer hover:border-white/[0.12] transition-colors"
    >
      <div className="w-12 h-12 rounded-[12px] overflow-hidden border-[1.5px] border-white/[0.12] flex-shrink-0">
        <img src={community.icon} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-[3px]">
          <h3 className="font-['Cormorant_Garamond'] text-[15px] font-normal text-white/88">
            {community.name}
          </h3>
          <span className="text-[13px] font-semibold tracking-[0.14em] uppercase px-[9px] py-[3px] rounded-[20px] bg-[rgba(173,255,47,0.08)] text-[rgba(173,255,47,0.65)] border border-[rgba(173,255,47,0.15)]">
            Member
          </span>
        </div>
        <p className="text-[13px] font-light text-white/52 leading-[1.5] whitespace-nowrap overflow-hidden text-ellipsis">
          {community.desc}
        </p>
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="flex items-center gap-[5px] text-[13px] font-light text-white/25 whitespace-nowrap">
          <Users size={13} strokeWidth={1.5} className="opacity-60" />
          {community.members} members
        </div>
        <div className="flex items-center gap-[5px] text-[13px] font-light text-white/25 whitespace-nowrap">
          <MessageCircle size={13} strokeWidth={1.5} className="opacity-60" />
          {community.posts} posts
        </div>
      </div>
    </div>
  );
}

function InviteCard({ community, onAccept, onDecline }: { community: Community; onAccept: () => void; onDecline: () => void }) {
  return (
    <div className="bg-[#0b0e0b] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-white/[0.12] transition-colors">
      <div className="h-20 relative overflow-hidden">
        <img src={community.banner} alt="" className="w-full h-full object-cover brightness-[0.6] saturate-[0.7]" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(11,14,11,0.85)]" />
      </div>
      <div className="p-4 pt-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="w-10 h-10 rounded-[10px] overflow-hidden border-2 border-white/[0.12] flex-shrink-0 -mt-[30px] relative z-10 bg-[#0f130f]">
            <img src={community.icon} alt="" className="w-full h-full object-cover" />
          </div>
          <span className="text-[13px] font-semibold tracking-[0.14em] uppercase px-[9px] py-[3px] rounded-[20px] bg-[rgba(255,200,80,0.08)] text-[rgba(255,200,80,0.65)] border border-[rgba(255,200,80,0.15)]">
            Invited
          </span>
        </div>
        <h3 className="font-['Cormorant_Garamond'] text-[16px] font-normal text-white/88 mb-[5px] leading-[1.3]">
          {community.name}
        </h3>
        <p className="text-[13px] font-light text-white/52 leading-[1.65] mb-3">
          {community.desc}
        </p>
        {community.invitedBy && (
          <div className="flex items-center gap-[5px] text-[13px] font-light text-[rgba(255,200,80,0.5)] mb-3">
            <Users size={13} strokeWidth={1.5} />
            Invited by {community.invitedBy}
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDecline();
            }}
            className="flex-1 px-[14px] py-[7px] rounded-lg bg-transparent border border-white/[0.12] text-white/25 text-[13px] font-medium tracking-[0.06em] hover:border-white/[0.07] hover:text-white/52 transition-all"
          >
            Decline
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAccept();
            }}
            className="flex-[1.6] px-[14px] py-[7px] rounded-lg bg-white/[0.08] border border-white/[0.14] text-white/88 text-[13px] font-medium tracking-[0.06em] hover:bg-white/[0.13] hover:text-white transition-all"
          >
            Join community
          </button>
        </div>
      </div>
    </div>
  );
}

function InviteListCard({ community, onAccept, onDecline }: { community: Community; onAccept: () => void; onDecline: () => void }) {
  return (
    <div className="bg-[#0b0e0b] border border-white/[0.07] rounded-[14px] flex items-center gap-4 p-4 px-5 hover:border-white/[0.12] transition-colors">
      <div className="w-12 h-12 rounded-[12px] overflow-hidden border-[1.5px] border-white/[0.12] flex-shrink-0">
        <img src={community.icon} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-[3px]">
          <h3 className="font-['Cormorant_Garamond'] text-[15px] font-normal text-white/88">
            {community.name}
          </h3>
          <span className="text-[13px] font-semibold tracking-[0.14em] uppercase px-[9px] py-[3px] rounded-[20px] bg-[rgba(255,200,80,0.08)] text-[rgba(255,200,80,0.65)] border border-[rgba(255,200,80,0.15)]">
            Invited
          </span>
        </div>
        <p className="text-[13px] font-light text-white/52 leading-[1.5] whitespace-nowrap overflow-hidden text-ellipsis">
          {community.desc}
        </p>
        {community.invitedBy && (
          <div className="flex items-center gap-[5px] text-[13px] font-light text-[rgba(255,200,80,0.5)] mt-[3px]">
            <Users size={13} strokeWidth={1.5} />
            Invited by {community.invitedBy}
          </div>
        )}
      </div>
      <div className="flex gap-[7px] flex-shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDecline();
          }}
          className="px-[14px] py-[7px] rounded-lg bg-transparent border border-white/[0.12] text-white/25 text-[13px] font-medium tracking-[0.06em] hover:border-white/[0.07] hover:text-white/52 transition-all"
        >
          Decline
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAccept();
          }}
          className="px-[14px] py-[7px] rounded-lg bg-white/[0.08] border border-white/[0.14] text-white/88 text-[13px] font-medium tracking-[0.06em] hover:bg-white/[0.13] hover:text-white transition-all"
        >
          Join
        </button>
      </div>
    </div>
  );
}

function EmptyState({ type }: { type: 'my' | 'invites' }) {
  return (
    <div className="flex flex-col items-center justify-center p-20 text-center border border-white/[0.07] rounded-2xl bg-[#0b0e0b]">
      <div className="w-[72px] h-[72px] relative flex items-center justify-center mb-6">
        <div className="absolute inset-0 rounded-full border border-white/[0.06] animate-[emptyRipple_3s_ease-out_infinite]" />
        <div className="absolute inset-0 rounded-full border border-white/[0.06] animate-[emptyRipple_3s_ease-out_infinite] [animation-delay:1.5s]" />
        <div className="w-7 h-7 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/25">
          <Users size={13} strokeWidth={1.5} />
        </div>
      </div>
      <h3 className="font-['Cormorant_Garamond'] text-[18px] italic font-normal text-white/88 mb-2">
        {type === 'invites' ? 'No pending invites' : "You're not in any communities yet"}
      </h3>
      <p className="text-[13px] font-light text-white/25 leading-[1.7] max-w-[300px]">
        {type === 'invites'
          ? "When someone invites you to a community it'll appear here. Communities are invite-only — you can't apply to join."
          : "Communities are invite-only. When a connection invites you, you'll see it in your Invites tab."}
      </p>
    </div>
  );
}
