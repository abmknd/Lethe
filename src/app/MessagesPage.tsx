import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Search, Plus, User, MoreHorizontal, Paperclip, Send } from 'lucide-react';
import { AvatarDropdown } from './components/AvatarDropdown';
import ReletheLogo from '../imports/ReletheLogo';
import { useNavigate } from 'react-router';
import { useAuth } from './context/AuthContext';
import { usePolledQuery } from './hooks/usePolledQuery';
import {
  listConversations,
  listMessages,
  markConversationRead,
  sendMessage as sendMessageApi,
} from "./api";
import type { ConversationListItem, Message } from "./types";

const avatarUrlCurrent = "https://images.unsplash.com/photo-1683815251677-8df20f826622?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMHBlcnNvbnxlbnwxfHx8fDE3NzIyMTAxNTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

type FilterType = 'All' | 'Direct' | 'Unread';

const CONVERSATIONS_POLL_MS = 30_000;
const MESSAGES_POLL_MS = 15_000;

function initialsOf(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join('') || '?';
}

function formatRelativeTime(iso: string | null): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  const diffSec = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (diffSec < 60) return 'now';
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `${diffH}h`;
  const diffD = Math.round(diffH / 24);
  if (diffD < 7) return `${diffD}d`;
  const diffW = Math.round(diffD / 7);
  if (diffW < 5) return `${diffW}w`;
  const diffMo = Math.round(diffD / 30);
  return `${diffMo}mo`;
}

function formatClockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function dayBucket(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOf(today) - startOf(d)) / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function MessagesPage() {
  const navigate = useNavigate();
  const { user, getAccessToken } = useAuth();
  const myUserId = user?.id ?? null;

  const [token, setToken] = useState<string | undefined>(undefined);
  useEffect(() => {
    let cancelled = false;
    void getAccessToken().then((t) => { if (!cancelled) setToken(t); });
    return () => { cancelled = true; };
  }, [getAccessToken]);

  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [activeConvoId, setActiveConvoId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = useCallback(
    () => listConversations(token),
    [token],
  );
  const { data: conversationsData, refetch: refetchConversations } = usePolledQuery(
    fetchConversations,
    CONVERSATIONS_POLL_MS,
    Boolean(token),
  );
  const conversations: ConversationListItem[] = conversationsData ?? [];

  const fetchActiveMessages = useCallback(
    () => (activeConvoId ? listMessages(activeConvoId, { limit: 100 }, token) : Promise.resolve([])),
    [activeConvoId, token],
  );
  const { data: messagesData, refetch: refetchMessages } = usePolledQuery(
    fetchActiveMessages,
    MESSAGES_POLL_MS,
    Boolean(token && activeConvoId),
  );
  const serverMessages: Message[] = messagesData ?? [];

  // Merge server messages with any optimistic ones not yet confirmed by id.
  const activeMessages = useMemo(() => {
    if (!activeConvoId) return [] as Message[];
    const seen = new Set(serverMessages.map((m) => m.id));
    const pending = optimisticMessages.filter((m) => m.conversationId === activeConvoId && !seen.has(m.id));
    return [...serverMessages, ...pending];
  }, [serverMessages, optimisticMessages, activeConvoId]);

  // Clear optimistic entries once they show up server-side.
  useEffect(() => {
    if (!serverMessages.length) return;
    const ids = new Set(serverMessages.map((m) => m.id));
    setOptimisticMessages((prev) => prev.filter((m) => !ids.has(m.id)));
  }, [serverMessages]);

  const activeConvo = conversations.find((c) => c.id === activeConvoId);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [messageInput]);

  useEffect(() => {
    if (messagesEndRef.current) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }, [activeConvoId, activeMessages.length]);

  const filteredConvos = conversations.filter((c) => {
    if (activeFilter === 'Unread') return c.unreadCount > 0;
    return true;
  }).filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.peer.name.toLowerCase().includes(q)
        || (c.peer.handle ?? '').toLowerCase().includes(q);
  });

  const openThread = async (id: string) => {
    setActiveConvoId(id);
    if (!token) return;
    try {
      await markConversationRead(id, token);
      void refetchConversations();
    } catch {
      // silent — next poll will resync
    }
  };

  const handleSend = async () => {
    if (!activeConvoId || !messageInput.trim() || !token || !myUserId) return;
    const body = messageInput.trim();
    const clientId = `msg_${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    setOptimisticMessages((prev) => [...prev, {
      id: clientId, conversationId: activeConvoId, senderId: myUserId, body, createdAt: now,
    }]);
    setMessageInput('');
    try {
      await sendMessageApi(activeConvoId, body, clientId, token);
      void refetchMessages();
      void refetchConversations();
    } catch {
      // leave optimistic message in place; user will see it didn't sync on next poll
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-black">
      {/* Top Navigation */}
      <header className="sticky top-0 z-10 bg-black border-b border-white/[0.07] transition-colors duration-300">
        <div className="px-4 sm:px-10 h-14 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate("/feed")}
            className="flex items-center gap-2 text-white text-sm tracking-[0.3em] uppercase font-light font-display transition-colors duration-300 hover:opacity-70 cursor-pointer"
          >
            <div className="w-5 h-5">
              <ReletheLogo />
            </div>
            RELETHE
          </button>

          <div className="flex items-center gap-3 flex-shrink-0">
            <AvatarDropdown avatarUrl={avatarUrlCurrent} />
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 gap-4 px-12 py-5">
        {/* Sidebar */}
        <aside className="w-[400px] min-w-[400px] flex-shrink-0 flex flex-col border border-white/[0.07] bg-black rounded-2xl">
          <div className="px-5 pt-5 pb-0 flex-shrink-0">
            <div className="font-['Cormorant_Garamond'] text-[18px] font-normal italic text-white/90 mb-[14px] leading-[27px]">
              Messages
            </div>

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

            <div className="flex items-center gap-2 mb-3">
              {(['All', 'Unread'] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`font-['Inter'] text-[11px] tracking-[0.06em] px-3 py-1 rounded-full transition-colors ${
                    activeFilter === f
                      ? 'bg-[#7FFF00]/10 text-[#7FFF00]/80'
                      : 'text-white/45 hover:text-white/70'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto relative" style={{ scrollbarWidth: 'none' }}>
            {filteredConvos.length === 0 && (
              <div className="px-5 py-8 text-center font-['Inter'] text-[12px] text-white/[0.35]">
                No conversations yet. New chats unlock after a mutual match.
              </div>
            )}
            {filteredConvos.map((convo) => {
              const unread = convo.unreadCount > 0;
              return (
                <div
                  key={convo.id}
                  onClick={() => void openThread(convo.id)}
                  className={`flex items-center gap-3 px-5 py-[14px] border-b-[0.8px] border-white/[0.04] cursor-pointer transition-colors relative ${
                    activeConvoId === convo.id ? 'bg-[rgba(127,255,0,0.05)]' : 'hover:bg-white/[0.03]'
                  }`}
                >
                  {activeConvoId === convo.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-[#7FFF00]" />
                  )}
                  {unread && activeConvoId !== convo.id && (
                    <div className="absolute left-[10px] top-1/2 -translate-y-1/2 w-[6px] h-[6px] rounded-full bg-[#7FFF00]" />
                  )}

                  <div className="relative w-[42px] h-[42px] rounded-full flex-shrink-0 overflow-hidden border-[0.8px] border-white/[0.07] bg-white/[0.04] flex items-center justify-center">
                    <span className="font-['Inter'] text-[14px] text-white/70">{initialsOf(convo.peer.name)}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between mb-[3px]">
                      <div className="flex items-center gap-[6px]">
                        <span className={`font-['Inter'] text-[14px] font-medium truncate max-w-[160px] ${unread ? 'text-white' : 'text-white/90'}`}>
                          {convo.peer.name}
                        </span>
                        {convo.unlockedByRecommendationId && (
                          <span className="font-['Inter'] text-[11px] font-medium tracking-[0.08em] px-[8.6px] py-[4.2px] rounded-[40px] bg-[rgba(127,255,0,0.1)] text-[rgba(127,255,0,0.7)] whitespace-nowrap flex-shrink-0 leading-[16.5px]">
                            Match
                          </span>
                        )}
                      </div>
                      <span className={`font-['Inter'] text-[11px] leading-[16.5px] flex-shrink-0 ml-2 ${unread ? 'text-[#7FFF00]/55' : 'text-white/[0.18]'}`}>
                        {formatRelativeTime(convo.lastMessageAt ?? convo.createdAt)}
                      </span>
                    </div>
                    <div className={`font-['Inter'] text-[12px] font-light leading-[18px] truncate ${unread ? 'text-white/45' : 'text-white/[0.18]'}`}>
                      {convo.lastMessagePreview?.body ?? 'No messages yet'}
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black to-transparent pointer-events-none z-10" />
          </div>

          <div className="px-5 py-[14px] flex-shrink-0 border-t border-white/[0.07]">
            <button
              disabled
              title="New chats unlock automatically when you accept a match"
              className="w-full py-[11.6px] rounded-[12px] bg-[#7FFF00]/[0.05] border-[0.8px] border-[#7FFF00]/15 text-[#7FFF00]/35 font-['Inter'] text-[12px] font-medium tracking-[0.08em] flex items-center justify-center gap-[7px] cursor-not-allowed leading-[18px]"
            >
              <Plus size={14} strokeWidth={0.875} />
              Unlocks via matches
            </button>
          </div>
        </aside>

        {/* Main Panel */}
        <main className="flex-1 min-w-0 flex flex-col bg-black border border-white/[0.07] rounded-2xl overflow-hidden relative">
          {!activeConvoId || !activeConvo ? (
            <div className="flex-1 flex flex-col items-center justify-center px-10 animate-[fadeUp_0.5s_cubic-bezier(0.16,1,0.3,1)_forwards]">
              <div className="w-20 h-20 relative flex items-center justify-center mb-7">
                <div className="absolute inset-0 border border-[#7FFF00]/12 rounded-full animate-[emptyRipple_3s_ease-out_infinite]" />
                <div className="absolute inset-0 border border-[#7FFF00]/12 rounded-full animate-[emptyRipple_3s_ease-out_infinite] [animation-delay:1.5s]" />
                <div className="w-7 h-7 rounded-full bg-[#7FFF00]/[0.05] border border-[#7FFF00]/15 flex items-center justify-center text-[#7FFF00]/50">
                  <Send size={13} strokeWidth={1.5} />
                </div>
              </div>
              <h2 className="font-['Cormorant_Garamond'] text-[26px] font-normal italic text-white/90 mb-[10px] text-center">
                Choose a conversation
              </h2>
              <p className="text-[14px] font-light text-white/45 text-center leading-[1.7] max-w-[300px]">
                Pick a thread from the left, or wait for a fresh match to unlock a new one.
              </p>
            </div>
          ) : (
            <>
              <div className="h-16 px-7 flex items-center gap-[14px] border-b border-white/[0.07] bg-[#050705]/70 backdrop-blur-2xl flex-shrink-0">
                <div className="relative w-9 h-9 rounded-full flex-shrink-0 overflow-hidden border border-white/[0.07] bg-white/[0.04] flex items-center justify-center">
                  <span className="font-['Inter'] text-[13px] text-white/70">{initialsOf(activeConvo.peer.name)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-['Inter'] text-[14px] font-medium text-white/90 mb-[1px]">{activeConvo.peer.name}</div>
                  {activeConvo.peer.handle && (
                    <div className="font-['Inter'] text-[11px] font-light text-white/[0.35]">@{activeConvo.peer.handle}</div>
                  )}
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

              {activeConvo.unlockedByRecommendationId && (
                <div className="px-7 pt-3 flex-shrink-0">
                  <div className="flex items-center gap-[10px] px-[14px] py-[10px] bg-[#7FFF00]/[0.05] border border-[#7FFF00]/12 rounded-[10px]">
                    <User size={14} className="text-[#7FFF00]/50 flex-shrink-0" strokeWidth={1.5} />
                    <p className="font-['Inter'] text-[12px] font-light text-[#7FFF00]/65 leading-[1.5]">
                      <strong className="font-medium text-[#7FFF00]/85">Relethe match</strong> — This thread unlocked because you accepted each other's intro.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto px-7 pt-5 pb-2 flex flex-col gap-1 relative" style={{ scrollbarWidth: 'none' }}>
                {activeMessages.length === 0 && (
                  <div className="flex-1 flex items-center justify-center text-white/[0.35] font-['Inter'] text-[13px]">
                    No messages yet — say hi.
                  </div>
                )}
                {activeMessages.map((msg, i) => {
                  const mine = msg.senderId === myUserId;
                  const prev = activeMessages[i - 1];
                  const currentBucket = dayBucket(msg.createdAt);
                  const prevBucket = prev ? dayBucket(prev.createdAt) : null;
                  const showDate = currentBucket !== prevBucket;
                  const showSender = !mine && (!prev || prev.senderId === myUserId || prevBucket !== currentBucket);
                  const showYou = mine && (!prev || prev.senderId !== myUserId || prevBucket !== currentBucket);

                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div className="flex items-center gap-3 my-4">
                          <div className="flex-1 h-px bg-white/[0.07]" />
                          <span className="font-['Inter'] text-[11px] font-normal text-white/[0.18] whitespace-nowrap tracking-[0.06em]">
                            {currentBucket}
                          </span>
                          <div className="flex-1 h-px bg-white/[0.07]" />
                        </div>
                      )}

                      {showSender && (
                        <div className="font-['Inter'] text-[11px] font-medium text-white/[0.18] mb-[3px] tracking-[0.04em]">
                          {activeConvo.peer.name}
                        </div>
                      )}

                      {showYou && (
                        <div className="flex justify-end mb-[3px]">
                          <span className="font-['Inter'] font-medium leading-[16.5px] text-[11px] text-white/[0.18] tracking-[0.44px]">You</span>
                        </div>
                      )}

                      <div className={`flex items-end gap-2 mb-[2px] group animate-[msgIn_0.3s_cubic-bezier(0.16,1,0.3,1)_forwards] ${mine ? 'flex-row-reverse pr-0' : ''}`}>
                        <div className={`max-w-[68%] px-[15px] pt-[11px] pb-[24px] rounded-[18px] font-['Inter'] text-[14px] leading-[1.65] relative ${
                          mine
                            ? 'bg-[#7FFF00]/[0.12] text-white/90 rounded-br-[4px] font-light'
                            : 'bg-[#0f130f] border border-white/[0.07] text-white/90 rounded-bl-[4px] font-light'
                        }`}>
                          <div>{msg.body}</div>
                          <div className="absolute bottom-[7px] right-[12px] font-['Inter'] text-[10px] text-white/[0.15] whitespace-nowrap">
                            {formatClockTime(msg.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-10" />
              </div>

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
                        onClick={() => void handleSend()}
                        disabled={!messageInput.trim()}
                        className={`w-[32px] h-[32px] rounded-full flex items-center justify-center transition-all ${
                          messageInput.trim() ? 'text-[#7FFF00]' : 'text-white/[0.18]'
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
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes emptyRipple { 0% { width: 28px; height: 28px; opacity: 0.5; } 100% { width: 80px; height: 80px; opacity: 0; } }
        @keyframes msgIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
