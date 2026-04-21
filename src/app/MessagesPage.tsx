import { useState, useRef, useEffect } from 'react';
import { Search, Plus, User, MoreHorizontal, Paperclip, Send } from 'lucide-react';
import { AvatarDropdown } from './components/AvatarDropdown';
import LetheLogo from '../imports/LetheLogo';
import { useNavigate } from 'react-router';

const avatarUrlCurrent = "https://images.unsplash.com/photo-1683815251677-8df20f826622?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMHBlcnNvbnxlbnwxfHx8fDE3NzIyMTAxNTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

interface Conversation {
  id: number;
  name: string;
  handle: string;
  initial: string;
  avatar: string;
  time: string;
  preview: string;
  unread: boolean;
  online: boolean;
  match: boolean;
}

interface Message {
  mine: boolean;
  text: string;
  time: string;
  date?: string;
}

const mockConvos: Conversation[] = [
  { id: 1, name: 'Marcus Jin', handle: '@marcus.jin', initial: 'M', avatar: 'https://images.unsplash.com/photo-1738566061505-556830f8b8f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBhc2lhbiUyMG1hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc3Mjc4MDQzMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', time: '2h', preview: "Looking forward to our meeting Thursday.", unread: true, online: true, match: true },
  { id: 2, name: 'Sophia Chen', handle: '@sophia.chen', initial: 'S', avatar: 'https://images.unsplash.com/photo-1581065178026-390bc4e78dad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBhc2lhbiUyMHdvbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcyODIwODk0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', time: '1d', preview: "That's a really interesting take on it.", unread: false, online: false, match: false },
  { id: 3, name: 'Elena Voss', handle: '@elena.voss', initial: 'E', avatar: 'https://images.unsplash.com/photo-1616065297965-6b2a76de6807?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBldXJvcGVhbiUyMHdvbWFuJTIwYmxvbmRlJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcyODU5MzM3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', time: '3d', preview: "Let me know what time works for you.", unread: true, online: true, match: true },
  { id: 4, name: 'Theo Lark', handle: '@theo.lark', initial: 'T', avatar: 'https://images.unsplash.com/photo-1769636930047-4478f12cf430?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBjcmVhdGl2ZSUyMHBvcnRyYWl0fGVufDF8fHx8MTc3Mjg1OTMzN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', time: '1w', preview: "I read your post about memory — really resonant.", unread: false, online: false, match: false },
  { id: 5, name: 'River C.', handle: '@river.c', initial: 'R', avatar: 'https://images.unsplash.com/photo-1634922057403-59163697f3c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwZXJzb24lMjBwb3J0cmFpdCUyMGNyZWF0aXZlfGVufDF8fHx8MTc3Mjg1OTMzOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', time: '2w', preview: "Same. We should talk more about this.", unread: false, online: false, match: false },
  { id: 6, name: 'Jordan Blake', handle: '@jordan.blake', initial: 'J', avatar: 'https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwZXJzb24lMjBwb3J0cmFpdCUyMGJ1c2luZXNzfGVufDF8fHx8MTc3MjgzNjc2Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', time: '3w', preview: "Your perspective on design systems is spot on.", unread: false, online: false, match: false },
  { id: 7, name: 'Amara Diaz', handle: '@amara.diaz', initial: 'A', avatar: 'https://images.unsplash.com/photo-1770235622504-3851a96ac6ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMHBvcnRyYWl0JTIwY29uZmlkZW50fGVufDF8fHx8MTc3Mjg2NDY4MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', time: '1mo', preview: "I'd love to hear more about your research.", unread: false, online: true, match: false },
  { id: 8, name: 'Kai Morrison', handle: '@kai.morrison', initial: 'K', avatar: 'https://images.unsplash.com/photo-1769636930047-4478f12cf430?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBwb3J0cmFpdCUyMG1vZGVybnxlbnwxfHx8fDE3NzI4NjQ2ODF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', time: '1mo', preview: "The workshop was incredible, thanks for organizing.", unread: false, online: false, match: true },
  { id: 9, name: 'Nyx Patel', handle: '@nyx.patel', initial: 'N', avatar: 'https://images.unsplash.com/photo-1737574821698-862e77f044c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGNyZWF0aXZlJTIweW9uZ38ZW58MXx8fHwxNzcyODY0NjgyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', time: '2mo', preview: "We should collaborate on that project.", unread: false, online: false, match: false },
  { id: 10, name: 'Zara Lin', handle: '@zara.lin', initial: 'Z', avatar: 'https://images.unsplash.com/photo-1769636929131-56dd60238266?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGVudHJlcHJlbmV1ciUyMHBlcnNvbnxlbnwxfHx8fDE3NzI4NjQ2ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', time: '2mo', preview: "Fascinating discussion yesterday.", unread: false, online: true, match: false },
];

const mockThreads: Record<number, Message[]> = {
  1: [
    { mine: false, text: "Hey Iris, great to be connected. I read a few of your posts — love how you think about product ethics.", time: "Jan 27, 10:43 AM", date: "Jan 27" },
    { mine: true, text: "Thanks Marcus! Your thread on distributed systems was something I kept coming back to.", time: "Jan 27, 11:02 AM" },
    { mine: true, text: "Curious what drew you to that particular framing.", time: "Jan 27, 11:02 AM" },
    { mine: false, text: "Honestly it started as a shower thought and I couldn't let it go. The best ones usually do.", time: "Jan 27, 11:18 AM" },
    { mine: false, text: "I've been thinking a lot about how systems reflect the values of their creators, whether we intend them to or not.", time: "Jan 27, 11:19 AM" },
    { mine: true, text: "That's exactly it. The architecture choices we make early on become locked in, and suddenly they're shaping behavior at scale.", time: "Jan 27, 11:24 AM" },
    { mine: true, text: "Have you read anything by Ursula Franklin? She has this concept of 'prescriptive vs holistic technologies' that feels relevant.", time: "Jan 27, 11:25 AM" },
    { mine: false, text: "I haven't! Adding to my list now. That sounds like exactly what I've been trying to articulate.", time: "Jan 27, 11:31 AM" },
    { mine: false, text: "Looking forward to our meeting Thursday — I'll send a calendar invite.", time: "2h ago", date: "Today" },
    { mine: true, text: "Perfect, I'll keep an eye out for it.", time: "1h ago" },
  ],
  2: [
    { mine: false, text: "Your post on optimising for presence really got to me. I've been doing exactly the opposite.", time: "Yesterday, 3:12 PM", date: "Yesterday" },
    { mine: true, text: "I wrote it at 2am which probably says everything.", time: "Yesterday, 3:20 PM" },
    { mine: true, text: "The whole thing came from realizing I couldn't remember the last time I was fully present for a conversation.", time: "Yesterday, 3:21 PM" },
    { mine: false, text: "God, same. I've been in back-to-back meetings all week and I couldn't tell you what half of them were about.", time: "Yesterday, 3:28 PM" },
    { mine: false, text: "That's a really interesting take on it.", time: "Yesterday, 3:45 PM" },
    { mine: true, text: "It's wild how normalized that's become, right? Like we just accept that as the cost of being productive.", time: "Yesterday, 3:52 PM" },
    { mine: false, text: "I'm trying to block out 'thinking time' on my calendar but people just book over it anyway.", time: "Yesterday, 4:03 PM" },
    { mine: true, text: "Maybe that's the problem — we're trying to defend time within a system that's designed to consume it.", time: "Yesterday, 4:15 PM" },
  ],
  3: [
    { mine: false, text: "Hi Iris, Lethe introduced us this week! I build at the intersection of AI and healthcare.", time: "3 days ago", date: "3 days ago" },
    { mine: true, text: "Hi Elena! That intersection is fascinating. What's the hardest problem you're working on right now?", time: "3 days ago" },
    { mine: false, text: "Right now it's around consent and data dignity. How do you build systems that respect patient autonomy while still being useful?", time: "3 days ago" },
    { mine: false, text: "Everyone wants to 'revolutionize healthcare' but most solutions treat patients like data sources rather than people.", time: "3 days ago" },
    { mine: true, text: "That's such an important framing. The 'move fast and break things' mentality gets really dangerous in healthcare.", time: "3 days ago" },
    { mine: true, text: "Are you familiar with the work on participatory design in medical contexts? Might be relevant.", time: "3 days ago" },
    { mine: false, text: "Yes! That's been a huge influence. Trying to actually practice it is harder than it sounds though.", time: "3 days ago" },
    { mine: false, text: "Let me know what time works for you — happy to do async or a call.", time: "3 days ago" },
    { mine: true, text: "Would love to grab coffee if you're in the city? Or a call works too.", time: "3 days ago" },
  ],
  4: [
    { mine: false, text: "I read your post about memory — really resonant. The idea of posts aging like memory does is beautiful.", time: "1 week ago", date: "1 week ago" },
    { mine: true, text: "That was one of those posts I almost didn't publish. Glad it landed.", time: "1 week ago" },
    { mine: false, text: "I think the best ones always feel that way. There's something about vulnerability that makes ideas stick.", time: "1 week ago" },
    { mine: false, text: "Have you ever considered writing more about the philosophy behind Lethe? The decay mechanic is such a powerful metaphor.", time: "1 week ago" },
    { mine: true, text: "I've thought about it. Part of me wants to let it speak for itself, you know? Let people discover their own meanings in it.", time: "1 week ago" },
    { mine: true, text: "But maybe there's value in articulating the intention behind it.", time: "1 week ago" },
    { mine: false, text: "I get that. Sometimes the ambiguity is the point. But I'd read anything you wrote about it.", time: "1 week ago" },
  ],
  5: [
    { mine: false, text: "Hey! That event last month was really great. Glad we finally got to meet in person.", time: "2 weeks ago", date: "2 weeks ago" },
    { mine: true, text: "Agreed! Your talk on emergent communities was one of my favorites.", time: "2 weeks ago" },
    { mine: false, text: "Thanks! I was honestly nervous about it. Felt like I was still working through the ideas as I spoke.", time: "2 weeks ago" },
    { mine: true, text: "That's exactly what made it good. You could feel you were thinking out loud rather than just presenting conclusions.", time: "2 weeks ago" },
    { mine: false, text: "That means a lot. I've been thinking about doing a follow-up piece exploring some of those threads further.", time: "2 weeks ago" },
    { mine: true, text: "Great conversation last week. Same time next month?", time: "2 weeks ago" },
    { mine: false, text: "Same. We should talk more about this.", time: "2 weeks ago" },
  ],
};

type FilterType = 'All' | 'Direct' | 'Unread';

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>(mockConvos);
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [activeConvoId, setActiveConvoId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [threads, setThreads] = useState<Record<number, Message[]>>(mockThreads);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const activeConvo = conversations.find(c => c.id === activeConvoId);
  const activeThread = activeConvoId ? threads[activeConvoId] || [] : [];

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [messageInput]);

  // Scroll to bottom when thread changes
  useEffect(() => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  }, [activeConvoId, activeThread.length]);

  const filteredConvos = conversations.filter(c => {
    if (activeFilter === 'Unread') return c.unread;
    if (activeFilter === 'Direct') return !c.match;
    return true;
  }).filter(c => {
    if (!searchQuery) return true;
    return c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           c.handle.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const openThread = (id: number) => {
    setActiveConvoId(id);
    // Mark as read
    setConversations(prev => prev.map(c =>
      c.id === id ? { ...c, unread: false } : c
    ));
  };

  const sendMessage = () => {
    if (!activeConvoId || !messageInput.trim()) return;

    const newMessage: Message = {
      mine: true,
      text: messageInput.trim(),
      time: 'Just now'
    };

    setThreads(prev => ({
      ...prev,
      [activeConvoId]: [...(prev[activeConvoId] || []), newMessage]
    }));

    // Update conversation preview
    setConversations(prev => prev.map(c =>
      c.id === activeConvoId
        ? { ...c, preview: messageInput.trim(), time: 'now' }
        : c
    ));

    setMessageInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-black">
      {/* Top Navigation */}
      <header className="sticky top-0 z-10 bg-black border-b border-white/[0.07] transition-colors duration-300">
        <div className="px-4 sm:px-10 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <button 
            onClick={() => navigate("/feed")}
            className="flex items-center gap-2 text-white text-sm tracking-[0.3em] uppercase font-light font-display transition-colors duration-300 hover:opacity-70 cursor-pointer"
          >
            <div className="w-5 h-5">
              <LetheLogo />
            </div>
            LETHE
          </button>

          {/* Right Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <AvatarDropdown avatarUrl={avatarUrlCurrent} />
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 gap-4 px-12 py-5">
        {/* Sidebar */}
        <aside className="w-[400px] min-w-[400px] flex-shrink-0 flex flex-col border border-white/[0.07] bg-black rounded-2xl">
          {/* Sidebar Header */}
          <div className="px-5 pt-5 pb-0 flex-shrink-0">
            <div className="font-['Cormorant_Garamond'] text-[18px] font-normal italic text-white/90 mb-[14px] leading-[27px]">
              Messages
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 bg-white/[0.07] border border-white/[0.07] rounded-[10px] px-[14.8px] py-[9.8px] mb-4 transition-colors focus-within:border-[#7FFF00]/25">
              <Search size={14} className="text-white/[0.18] flex-shrink-0" strokeWidth={0.875} />
              <input
                type="text"
                placeholder="Search chats…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none font-['Inter'] text-[13px] text-white/90 placeholder:text-white/[0.18]"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto relative" style={{ scrollbarWidth: 'none' }}>
            {filteredConvos.map(convo => (
              <div
                key={convo.id}
                onClick={() => openThread(convo.id)}
                className={`flex items-center gap-3 px-5 py-[14px] border-b-[0.8px] border-white/[0.04] cursor-pointer transition-colors relative ${
                  activeConvoId === convo.id
                    ? 'bg-[rgba(127,255,0,0.05)]'
                    : 'hover:bg-white/[0.03]'
                }`}
              >
                {activeConvoId === convo.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-[#7FFF00]" />
                )}
                {convo.unread && activeConvoId !== convo.id && (
                  <div className="absolute left-[10px] top-1/2 -translate-y-1/2 w-[6px] h-[6px] rounded-full bg-[#7FFF00]" />
                )}

                {/* Avatar */}
                <div className="relative w-[42px] h-[42px] rounded-full flex-shrink-0 overflow-hidden border-[0.8px] border-white/[0.07]">
                  <img src={convo.avatar} alt="" className="w-full h-full object-cover" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between mb-[3px]">
                    <div className="flex items-center gap-[6px]">
                      <span className={`font-['Inter'] text-[14px] font-medium truncate max-w-[160px] ${
                        convo.unread ? 'text-white' : 'text-white/90'
                      }`}>
                        {convo.name}
                      </span>
                      {convo.match && (
                        <span className="font-['Inter'] text-[11px] font-medium tracking-[0.08em] px-[8.6px] py-[4.2px] rounded-[40px] bg-[rgba(127,255,0,0.1)] text-[rgba(127,255,0,0.7)] whitespace-nowrap flex-shrink-0 leading-[16.5px]">
                          Match
                        </span>
                      )}
                    </div>
                    <span className={`font-['Inter'] text-[11px] leading-[16.5px] flex-shrink-0 ml-2 ${
                      convo.unread ? 'text-[#7FFF00]/55' : 'text-white/[0.18]'
                    }`}>
                      {convo.time}
                    </span>
                  </div>
                  <div className={`font-['Inter'] text-[12px] font-light leading-[18px] truncate ${
                    convo.unread ? 'text-white/45' : 'text-white/[0.18]'
                  }`}>
                    {convo.preview}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Fade effect at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black to-transparent pointer-events-none z-10" />
          </div>

          {/* New Chat Button */}
          <div className="px-5 py-[14px] flex-shrink-0 border-t border-white/[0.07]">
            <button className="w-full py-[11.6px] rounded-[12px] bg-[#7FFF00]/10 border-[0.8px] border-[#7FFF00]/20 text-[#7FFF00]/80 font-['Inter'] text-[12px] font-medium tracking-[0.08em] flex items-center justify-center gap-[7px] transition-all hover:bg-[#7FFF00]/16 hover:border-[#7FFF00]/35 hover:text-[#7FFF00] leading-[18px]">
              <Plus size={14} strokeWidth={0.875} />
              New chat
            </button>
          </div>
        </aside>

        {/* Main Panel */}
        <main className="flex-1 min-w-0 flex flex-col bg-black border border-white/[0.07] rounded-2xl overflow-hidden relative">
          {!activeConvoId ? (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center px-10 animate-[fadeUp_0.5s_cubic-bezier(0.16,1,0.3,1)_forwards]">
              <div className="w-20 h-20 relative flex items-center justify-center mb-7">
                <div className="absolute inset-0 border border-[#7FFF00]/12 rounded-full animate-[emptyRipple_3s_ease-out_infinite]" />
                <div className="absolute inset-0 border border-[#7FFF00]/12 rounded-full animate-[emptyRipple_3s_ease-out_infinite] [animation-delay:1.5s]" />
                <div className="w-7 h-7 rounded-full bg-[#7FFF00]/[0.05] border border-[#7FFF00]/15 flex items-center justify-center text-[#7FFF00]/50">
                  <Send size={13} strokeWidth={1.5} />
                </div>
              </div>

              <h2 className="font-['Cormorant_Garamond'] text-[26px] font-normal italic text-white/90 mb-[10px] text-center">
                Start a conversation
              </h2>
              <p className="text-[14px] font-light text-white/45 text-center leading-[1.7] max-w-[300px] mb-7">
                Choose from your existing conversations, or start a new one.
              </p>
              <button className="flex items-center gap-2 px-7 py-[13px] rounded-full bg-[#7FFF00] border-none font-['Inter'] text-[12px] font-semibold tracking-[0.1em] uppercase text-[#050705] transition-all hover:bg-[#c8ff4f] hover:-translate-y-px">
                <Plus size={14} strokeWidth={2} />
                New chat
              </button>
            </div>
          ) : (
            /* Thread View */
            <>
              {/* Thread Header */}
              <div className="h-16 px-7 flex items-center gap-[14px] border-b border-white/[0.07] bg-[#050705]/70 backdrop-blur-2xl flex-shrink-0">
                <div className="relative w-9 h-9 rounded-full flex-shrink-0 overflow-hidden border border-white/[0.07]">
                  <img src={activeConvo?.avatar} alt="" className="w-full h-full object-cover" />
                  {activeConvo?.online && (
                    <div className="absolute bottom-0 right-0 w-[9px] h-[9px] rounded-full bg-[#7FFF00] border-[1.5px] border-black" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-['Inter'] text-[14px] font-medium text-white/90 mb-[1px]">
                    {activeConvo?.name}
                  </div>
                  <div className={`font-['Inter'] text-[11px] font-light ${activeConvo?.online ? 'text-[#7FFF00]/60' : 'text-white/[0.18]'}`}>
                    {activeConvo?.online ? 'Active now' : 'Last seen recently'}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button className="w-8 h-8 rounded-full bg-transparent text-white/[0.18] flex items-center justify-center transition-all hover:bg-white/[0.07] hover:text-white/45">
                    <User size={16} strokeWidth={1.5} />
                  </button>
                  <button className="w-8 h-8 rounded-full bg-transparent text-white/[0.18] flex items-center justify-center transition-all hover:bg-white/[0.07] hover:text-white/45">
                    <MoreHorizontal size={16} strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* Match Context Strip */}
              {activeConvo?.match && (
                <div className="px-7 pt-3 flex-shrink-0">
                  <div className="flex items-center gap-[10px] px-[14px] py-[10px] bg-[#7FFF00]/[0.05] border border-[#7FFF00]/12 rounded-[10px]">
                    <User size={14} className="text-[#7FFF00]/50 flex-shrink-0" strokeWidth={1.5} />
                    <p className="font-['Inter'] text-[12px] font-light text-[#7FFF00]/65 leading-[1.5]">
                      <strong className="font-medium text-[#7FFF00]/85">Lethe match</strong> — You two were introduced this week. Your meeting is scheduled for Thursday at 3pm.
                    </p>
                  </div>
                </div>
              )}

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto px-7 pt-5 pb-2 flex flex-col gap-1 relative" style={{ scrollbarWidth: 'none' }}>
                {activeThread.map((msg, i) => {
                  const prevMsg = activeThread[i - 1];
                  const showDate = msg.date && msg.date !== prevMsg?.date;
                  const showSender = !msg.mine && (!prevMsg || prevMsg.mine || prevMsg.date !== msg.date);
                  const showYou = msg.mine && (!prevMsg || !prevMsg.mine || prevMsg.date !== msg.date);

                  return (
                    <div key={i}>
                      {showDate && (
                        <div className="flex items-center gap-3 my-4">
                          <div className="flex-1 h-px bg-white/[0.07]" />
                          <span className="font-['Inter'] text-[11px] font-normal text-white/[0.18] whitespace-nowrap tracking-[0.06em]">
                            {msg.date}
                          </span>
                          <div className="flex-1 h-px bg-white/[0.07]" />
                        </div>
                      )}

                      {showSender && (
                        <div className="font-['Inter'] text-[11px] font-medium text-white/[0.18] mb-[3px] tracking-[0.04em]">
                          {activeConvo?.name}
                        </div>
                      )}

                      {showYou && (
                        <div className="flex justify-end mb-[3px]">
                          <span className="font-['Inter'] font-medium leading-[16.5px] text-[11px] text-white/[0.18] tracking-[0.44px]">
                            You
                          </span>
                        </div>
                      )}

                      <div className={`flex items-end gap-2 mb-[2px] group animate-[msgIn_0.3s_cubic-bezier(0.16,1,0.3,1)_forwards] ${msg.mine ? 'flex-row-reverse pr-0' : ''}`}>
                        <div className={`max-w-[68%] px-[15px] pt-[11px] pb-[24px] rounded-[18px] font-['Inter'] text-[14px] leading-[1.65] relative ${
                          msg.mine
                            ? 'bg-[#7FFF00]/[0.12] text-white/90 rounded-br-[4px] font-light'
                            : 'bg-[#0f130f] border border-white/[0.07] text-white/90 rounded-bl-[4px] font-light'
                        }`}>
                          <div>{msg.text}</div>
                          <div className="absolute bottom-[7px] right-[12px] font-['Inter'] text-[10px] text-white/[0.15] whitespace-nowrap">
                            {msg.time.split(',').pop()?.trim().split(' ').slice(-2).join(' ')}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
                
                {/* Fade effect at bottom - positioned absolutely */}
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-10" />
              </div>

              {/* Input Bar */}
              <div className="px-7 pt-3 pb-5 flex-shrink-0 border-t border-white/[0.07] bg-[#050705]/80 backdrop-blur-2xl">
                <div className="relative bg-[#0f130f] rounded-[16px] px-[16.8px] py-[0.8px]">
                  <div className="absolute inset-0 border-[0.8px] border-white/[0.07] rounded-[16px] pointer-events-none" />
                  <div className="flex items-center gap-[10px]">
                    <textarea
                      ref={textareaRef}
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Write a message…"
                      rows={1}
                      className="flex-1 bg-transparent border-none outline-none resize-none font-['Inter'] text-[14px] font-light text-white/90 placeholder:text-white/[0.18] leading-[21px] max-h-[120px] py-[4px] min-h-[29px]"
                      style={{ scrollbarWidth: 'none' }}
                    />

                    <div className="flex items-center justify-end h-[36px] flex-shrink-0">
                      <button className="w-[32px] h-[32px] rounded-full bg-transparent text-white/[0.18] flex items-center justify-center transition-all hover:bg-white/[0.07] hover:text-white/45">
                        <Paperclip size={16} strokeWidth={0.875} />
                      </button>
                      <button
                        onClick={sendMessage}
                        disabled={!messageInput.trim()}
                        className={`w-[32px] h-[32px] rounded-full flex items-center justify-center transition-all ${
                          messageInput.trim()
                            ? 'text-[#7FFF00]'
                            : 'text-white/[0.18]'
                        }`}
                      >
                        <Send size={16} strokeWidth={1} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes emptyRipple {
          0% {
            width: 28px;
            height: 28px;
            opacity: 0.5;
          }
          100% {
            width: 80px;
            height: 80px;
            opacity: 0;
          }
        }

        @keyframes msgIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}