import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  User, Calendar, Target, Bell, 
  Upload, X, Plus, ChevronDown, Heart, 
  MessageCircle, Users, Globe, Check
} from 'lucide-react';
import LetheLogo from '../imports/LetheLogo';
import svgPathsBack from "../imports/svg-9x8xqlgryp";
import GoogleCalendarIcon from '../imports/Container-120-16';
import GoogleIcon from '../imports/Container-120-20';
import AppleIcon from '../imports/Container-120-24';
import { toast } from 'sonner';

type SectionType = 'account' | 'availability' | 'goals' | 'notifications';

interface AvailabilityData {
  [key: string]: string[];
}

interface NotificationGroup {
  id: string;
  title: string;
  icon: JSX.Element;
  items: NotificationItem[];
}

interface NotificationItem {
  title: string;
  desc: string;
  email: boolean;
  push: boolean;
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SectionType>('account');
  const [isDirty, setIsDirty] = useState(false);
  
  // Account state
  const [email, setEmail] = useState('abiola@lethe.io');
  const [location, setLocation] = useState('Lagos, Nigeria');
  const [languages, setLanguages] = useState(['English', 'French']);
  const [languageInput, setLanguageInput] = useState('');
  const [dob, setDob] = useState('1999-06-10');
  const [connectedAccounts, setConnectedAccounts] = useState([
    { name: 'Google Calendar', icon: <GoogleCalendarIcon />, connected: true },
    { name: 'Google', icon: <GoogleIcon />, connected: false },
    { name: 'Apple', icon: <AppleIcon />, connected: false },
  ]);
  
  // Availability state
  const [availability, setAvailability] = useState<AvailabilityData>({
    Mon: ['7:00 AM'],
    Tue: [],
    Wed: ['8:00 PM'],
    Thu: [],
    Fri: [],
    Sat: ['10:00 AM'],
    Sun: []
  });
  const [meetingFrequency, setMeetingFrequency] = useState('Every week');
  const [localMatchesOnly, setLocalMatchesOnly] = useState(false);
  const [pauseMeetings, setPauseMeetings] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState<{ day: string; x: number; y: number } | null>(null);
  
  // Goals state
  const [interests, setInterests] = useState(['Design Ethics', 'AI Research', 'Systems Thinking', 'Effective Altruism', 'Building in Public', 'Conversation Design']);
  const [interestInput, setInterestInput] = useState('');
  const [introText, setIntroText] = useState("I'm a product designer exploring the intersection of AI and human communication. Looking for people working on hard problems who think out loud.");
  const [goals, setGoals] = useState([
    { icon: '🧠', label: 'Brainstorm with peers', active: true },
    { icon: '💼', label: 'Business development', active: true },
    { icon: '🌍', label: 'Meet interesting people', active: true },
    { icon: '🚀', label: 'Find a co-founder', active: false },
    { icon: '🎯', label: 'Get career advice', active: false },
    { icon: '📣', label: 'Find collaborators', active: false },
    { icon: '💡', label: 'Share knowledge', active: false },
  ]);
  const [learnAbout, setLearnAbout] = useState('I want to understand more about the intersection of cognitive science and AI design.');
  const [askAbout, setAskAbout] = useState('Designing AI products from first principles, or how to pivot into conversation design.');
  const [whoToMeet, setWhoToMeet] = useState(3);
  const [whereBased, setWhereBased] = useState('Anywhere in the world');
  const [meetingFormat, setMeetingFormat] = useState(0);
  
  // Notifications state
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);
  const [notificationGroups, setNotificationGroups] = useState<NotificationGroup[]>([
    {
      id: 'engagement',
      title: 'Engagement',
      icon: <Heart size={14} strokeWidth={1.5} />,
      items: [
        { title: 'Echoes', desc: 'When someone echoes your post', email: true, push: true },
        { title: 'Replies', desc: 'When someone replies to your post', email: true, push: true },
        { title: 'Mentions', desc: 'When someone mentions you', email: true, push: true },
        { title: 'Follows', desc: 'When someone follows you', email: true, push: true },
      ]
    },
    {
      id: 'messaging',
      title: 'Messaging',
      icon: <MessageCircle size={14} strokeWidth={1.5} />,
      items: [
        { title: 'New messages', desc: 'When you receive a message', email: true, push: true },
        { title: 'Message requests', desc: 'When a new match messages you first', email: true, push: true },
      ]
    },
    {
      id: 'matches',
      title: 'Match updates',
      icon: <Users size={14} strokeWidth={1.5} />,
      items: [
        { title: 'New suggestions', desc: 'Your weekly suggestions are ready', email: true, push: true },
        { title: 'Introduction set', desc: 'When Lethe schedules your introduction', email: true, push: true },
        { title: 'Meeting reminder', desc: '24 hours before a scheduled meeting', email: true, push: true },
      ]
    },
    {
      id: 'community',
      title: 'Community',
      icon: <Globe size={14} strokeWidth={1.5} />,
      items: [
        { title: 'Community invites', desc: 'When you get invited to an exclusive community', email: true, push: true },
        { title: 'Lethe updates', desc: 'Product news and feature announcements', email: true, push: true },
      ]
    },
  ]);

  const MAX_SLOTS = 5;
  const TIME_OPTIONS = ['6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM'];

  const totalSlots = () => {
    return Object.values(availability).reduce((sum, times) => sum + times.length, 0);
  };

  const markDirty = () => setIsDirty(true);

  const saveChanges = () => {
    setIsDirty(false);
    toast.success('Changes saved');
  };

  const discardChanges = () => {
    setIsDirty(false);
    toast.info('Changes discarded');
    // Reset to initial values would go here
  };

  const addLanguage = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && languageInput.trim()) {
      e.preventDefault();
      setLanguages([...languages, languageInput.trim()]);
      setLanguageInput('');
      markDirty();
    }
  };

  const removeLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index));
    markDirty();
  };

  const addInterest = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && interestInput.trim()) {
      e.preventDefault();
      setInterests([...interests, interestInput.trim()]);
      setInterestInput('');
      markDirty();
    }
  };

  const removeInterest = (index: number) => {
    setInterests(interests.filter((_, i) => i !== index));
    markDirty();
  };

  const toggleGoal = (index: number) => {
    setGoals(goals.map((g, i) => i === index ? { ...g, active: !g.active } : g));
    markDirty();
  };

  const toggleConnection = (index: number) => {
    setConnectedAccounts(connectedAccounts.map((acc, i) => 
      i === index ? { ...acc, connected: !acc.connected } : acc
    ));
    markDirty();
  };

  const addTimeSlot = (day: string, time: string) => {
    setAvailability({
      ...availability,
      [day]: [...availability[day], time]
    });
    setShowTimePicker(null);
    markDirty();
  };

  const removeTimeSlot = (day: string, time: string) => {
    setAvailability({
      ...availability,
      [day]: availability[day].filter(t => t !== time)
    });
    markDirty();
  };

  const toggleAccordion = (id: string) => {
    setOpenAccordions(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleNotification = (groupId: string, itemIndex: number, type: 'email' | 'push') => {
    setNotificationGroups(groups => 
      groups.map(g => {
        if (g.id === groupId) {
          return {
            ...g,
            items: g.items.map((item, i) => 
              i === itemIndex ? { ...item, [type]: !item[type] } : item
            )
          };
        }
        return g;
      })
    );
    markDirty();
  };

  const turnOffAllInGroup = (groupId: string) => {
    setNotificationGroups(groups => 
      groups.map(g => {
        if (g.id === groupId) {
          return {
            ...g,
            items: g.items.map(item => ({ ...item, email: false, push: false }))
          };
        }
        return g;
      })
    );
    markDirty();
  };

  const sections = [
    { id: 'account' as SectionType, label: 'Account', icon: <User size={14} strokeWidth={1.5} /> },
    { id: 'availability' as SectionType, label: 'Availability', icon: <Calendar size={14} strokeWidth={1.5} /> },
    { id: 'goals' as SectionType, label: 'Goals', icon: <Target size={14} strokeWidth={1.5} /> },
    { id: 'notifications' as SectionType, label: 'Notifications', icon: <Bell size={14} strokeWidth={1.5} /> },
  ];

  const meetingFormatOptions = [
    { title: 'Video call', desc: '30-min video call' },
    { title: 'Voice call', desc: 'Audio only, no video' },
    { title: 'In person', desc: 'Meet locally when possible' },
    { title: 'No preference', desc: 'Open to any format' },
  ];

  const whoToMeetOptions = [
    'Someone in the same field as me',
    'Someone in an adjacent or similar field',
    'Someone I can talk about career strategy with',
    'Anyone who I can have an interesting conversation with',
    'Someone building a company or product',
    'A potential mentor or mentee',
  ];

  // Close time picker when clicking outside
  useEffect(() => {
    const handleClick = () => setShowTimePicker(null);
    if (showTimePicker) {
      document.addEventListener('click', handleClick);
      // CEP state
  const [isPaidUser, setIsPaidUser] = useState(false);
  const [cepMessages, setCepMessages] = useState<{role: 'ai' | 'user', text: string}[]>([
    { role: 'ai', text: "Tell me about the kinds of people you'd like to meet. If you're not sure, type /guide me and I'll walk you through it." }
  ]);
  const [cepInput, setCepInput] = useState('');
  const [cepDone, setCepDone] = useState(false);
  const [cepPills, setCepPills] = useState<string[]>([]);
  const [weeklyNudge] = useState('What are you focused on this week?');
  const [nudgeAnswered, setNudgeAnswered] = useState(false);

  return () => document.removeEventListener('click', handleClick);
    }
  }, [showTimePicker]);

  return (
    <div className="h-screen flex flex-col bg-black">
      {/* Top Navigation */}
      <header className="sticky top-0 z-10 bg-black border-b border-[#1a1a1a]">
        <div className="px-4 sm:px-12 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-white text-sm tracking-[0.3em] uppercase font-light font-serif hover:opacity-70 cursor-pointer transition-opacity"
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
            <span className="font-['Inter'] font-light leading-[16.5px] text-[12px] tracking-[3.3px] uppercase">BACK</span>
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 min-h-0 gap-4 px-12 py-5">
        {/* Sidebar */}
        <aside className="w-[320px] min-w-[320px] flex-shrink-0 bg-[#0b0e0b] border border-white/[0.07] rounded-2xl overflow-hidden self-start">
          <div className="p-4 pb-4 border-b border-white/[0.07]">
            <div className="font-['Libre_Baskerville'] text-[13px] italic text-white/52">
              Settings
            </div>
          </div>
          
          <nav className="py-2">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-[10px] px-5 py-[10px] transition-all border-l-2 ${
                  activeSection === section.id
                    ? 'bg-[#7FFF00]/[0.08] border-l-[#7FFF00] text-white/90'
                    : 'border-l-transparent text-white/[0.25] hover:bg-white/[0.07] hover:text-white/45'
                }`}
              >
                <span className={activeSection === section.id ? 'text-[#7FFF00]/70' : 'text-white/[0.25]'}>
                  {section.icon}
                </span>
                <span className="font-['Inter'] text-[14px] font-normal">
                  {section.label}
                </span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 min-w-0 overflow-y-auto ${isDirty ? 'pb-24' : ''}`} style={{ scrollbarWidth: 'none' }}>
          <div className="w-full">
            {/* Account Section */}
            {activeSection === 'account' && (
              <div className="bg-[#0b0e0b] border border-white/[0.07] rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="px-7 pt-[22px] pb-[22px] border-b border-white/[0.07]">
                  <h2 className="font-['Libre_Baskerville'] text-[20px] font-normal text-white/88 mb-[5px]">
                    Account
                  </h2>
                  <p className="text-[12px] font-light text-white/[0.25] leading-[1.6]">
                    Manage your account details, connected services, and security.
                  </p>
                </div>

                {/* Fields Section */}
                <div className="px-7 py-[22px] border-b border-white/[0.07]">
                  <div className="mb-[18px]">
                    <label className="block text-[12px] font-semibold tracking-[0.18em] uppercase text-white/[0.25] mb-[7px]">
                      Email address
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); markDirty(); }}
                        className="flex-1 bg-black border border-white/[0.12] rounded-[10px] px-[14px] py-[11px] text-[13px] font-light text-white/88 outline-none transition-colors focus:border-[#7FFF00]/30 placeholder:text-white/[0.25]"
                      />
                      <div className="px-3 py-[5px] rounded-lg bg-white/[0.07] border border-white/[0.12] text-[12px] font-medium tracking-[0.08em] uppercase text-white/[0.25] whitespace-nowrap">
                        verified
                      </div>
                    </div>
                  </div>

                  <div className="mb-[18px]">
                    <label className="block text-[12px] font-semibold tracking-[0.18em] uppercase text-white/[0.25] mb-[7px]">
                      Location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => { setLocation(e.target.value); markDirty(); }}
                      className="w-full bg-black border border-white/[0.12] rounded-[10px] px-[14px] py-[11px] text-[13px] font-light text-white/88 outline-none transition-colors focus:border-[#7FFF00]/30 placeholder:text-white/[0.25]"
                    />
                  </div>

                  <div className="mb-[18px]">
                    <label className="block text-[12px] font-semibold tracking-[0.18em] uppercase text-white/[0.25] mb-[7px]">
                      Languages
                    </label>
                    <div className="flex flex-wrap gap-[6px] p-[10px] bg-black border border-white/[0.12] rounded-[10px] min-h-[44px] focus-within:border-[#7FFF00]/30 transition-colors">
                      {languages.map((lang, i) => (
                        <div key={i} className="flex items-center gap-[5px] px-[10px] py-1 rounded-full bg-white/[0.07] border border-white/[0.12] text-[12px] text-white/52">
                          {lang}
                          <button onClick={() => removeLanguage(i)} className="text-white/[0.25] hover:text-white/88 transition-colors">
                            <X size={12} strokeWidth={2} />
                          </button>
                        </div>
                      ))}
                      <input
                        type="text"
                        value={languageInput}
                        onChange={(e) => setLanguageInput(e.target.value)}
                        onKeyDown={addLanguage}
                        placeholder="Add language..."
                        className="flex-1 min-w-[80px] bg-transparent border-none outline-none text-[12px] text-white/88 placeholder:text-white/[0.25]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold tracking-[0.18em] uppercase text-white/[0.25] mb-[7px]">
                      Date of birth
                    </label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => { setDob(e.target.value); markDirty(); }}
                      className="w-full bg-black border border-white/[0.12] rounded-[10px] px-[14px] py-[11px] text-[13px] font-light text-white/88 outline-none transition-colors focus:border-[#7FFF00]/30"
                    />
                  </div>
                </div>

                {/* Connected Accounts */}
                <div className="px-7 py-[22px] border-b border-white/[0.07]">
                  <div className="text-[12px] font-semibold tracking-[0.22em] uppercase text-white/[0.25] mb-[14px]">
                    Connected accounts
                  </div>
                  {connectedAccounts.map((account, i) => (
                    <div key={i} className="flex items-center gap-3 py-[14px] border-b border-white/[0.07] last:border-0">
                      <div className="w-10 h-10 flex-shrink-0">
                        {account.icon}
                      </div>
                      <div className="flex-1 text-[13px] font-normal text-white/88">
                        {account.name}
                      </div>
                      <button
                        onClick={() => toggleConnection(i)}
                        className={`px-[14px] py-[7px] rounded-lg text-[12px] font-semibold tracking-[0.1em] uppercase transition-all whitespace-nowrap ${
                          account.connected
                            ? 'bg-[#7FFF00]/[0.08] border border-[#7FFF00]/20 text-[#7FFF00]/60'
                            : 'bg-white/[0.07] border border-white/[0.12] text-white/52 hover:bg-white/[0.06] hover:text-white/88'
                        }`}
                      >
                        {account.connected ? 'Connected' : 'Connect'}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Password */}
                <div className="px-7 py-[22px] border-b border-white/[0.07]">
                  <label className="block text-[12px] font-semibold tracking-[0.18em] uppercase text-white/[0.25] mb-[7px]">
                    Password
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      value="••••••••••"
                      readOnly
                      className="flex-1 bg-black border border-white/[0.12] rounded-[10px] px-[14px] py-[11px] text-[13px] font-light text-white/88 outline-none"
                    />
                    <button
                      onClick={() => toast.success('Password update email sent')}
                      className="px-[14px] py-[7px] rounded-lg bg-white/[0.07] border border-white/[0.12] text-[12px] font-semibold tracking-[0.1em] uppercase text-white/52 transition-all hover:bg-white/[0.06] hover:text-white/88 whitespace-nowrap"
                    >
                      Update
                    </button>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="px-7 py-[22px] bg-[#FF4D4D]/[0.03]">
                  <div className="text-[12px] font-semibold tracking-[0.1em] uppercase text-[#FF4D4D]/60 mb-3">
                    Danger zone
                  </div>
                  <div className="flex items-center justify-between gap-4 py-3 border-b border-[#FF4D4D]/[0.08]">
                    <div>
                      <div className="text-[13px] font-normal text-white/88 mb-[2px]">
                        Deactivate account
                      </div>
                      <div className="text-[12px] font-light text-white/[0.25] leading-[1.5]">
                        Pause your account. You can reactivate anytime.
                      </div>
                    </div>
                    <button
                      onClick={() => toast.info('Deactivation flow would open here')}
                      className="px-4 py-2 rounded-lg bg-transparent border border-[#FF4D4D]/25 text-[12px] font-medium tracking-[0.06em] text-[#FF4D4D]/60 transition-all hover:bg-[#FF4D4D]/[0.08] hover:border-[#FF4D4D]/40 hover:text-[#FF4D4D]/85 whitespace-nowrap flex-shrink-0"
                    >
                      Deactivate
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-4 pt-3">
                    <div>
                      <div className="text-[13px] font-normal text-white/88 mb-[2px]">
                        Delete account
                      </div>
                      <div className="text-[12px] font-light text-white/[0.25] leading-[1.5]">
                        Permanently delete your account and all data. This cannot be undone.
                      </div>
                    </div>
                    <button
                      onClick={() => toast.error('Deletion confirmation would open here')}
                      className="px-4 py-2 rounded-lg bg-transparent border border-[#FF4D4D]/25 text-[12px] font-medium tracking-[0.06em] text-[#FF4D4D]/60 transition-all hover:bg-[#FF4D4D]/[0.08] hover:border-[#FF4D4D]/40 hover:text-[#FF4D4D]/85 whitespace-nowrap flex-shrink-0"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Availability Section */}
            {activeSection === 'availability' && (
              <div className="bg-[#0b0e0b] border border-white/[0.07] rounded-2xl overflow-hidden">
                <div className="px-7 pt-[22px] pb-[22px] border-b border-white/[0.07]">
                  <h2 className="font-['Libre_Baskerville'] text-[20px] font-normal text-white/88 mb-[5px]">
                    Availability
                  </h2>
                  <p className="text-[12px] font-light text-white/[0.25] leading-[1.6]">
                    Set when you're available for introductions and how often you want to meet.
                  </p>
                </div>

                <div className="px-7 py-[22px] border-b border-white/[0.07]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-semibold tracking-[0.18em] uppercase text-white/[0.25]">
                      Meeting times
                    </span>
                    <span className={`text-[12px] font-normal tracking-[0.04em] ${totalSlots() >= MAX_SLOTS ? 'text-[#7FFF00]/60' : 'text-white/[0.25]'}`}>
                      <strong className="font-semibold">{totalSlots()}</strong> of 5 slots used
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-[6px] mb-[10px] relative">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].slice(0, 4).map(day => (
                      <div key={day} className="bg-black border border-white/[0.07] rounded-[10px] overflow-hidden">
                        <div className="px-[10px] py-2 border-b border-white/[0.07] flex items-center justify-between">
                          <span className="text-[12px] font-semibold tracking-[0.16em] uppercase text-white/[0.25]">
                            {day}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (totalSlots() < MAX_SLOTS) {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setShowTimePicker({ day, x: rect.left - 60, y: rect.bottom + 4 });
                              } else {
                                toast.error('5 slot limit reached. Remove a time first.');
                              }
                            }}
                            disabled={totalSlots() >= MAX_SLOTS}
                            className={`w-[14px] h-[14px] flex items-center justify-center transition-colors ${
                              totalSlots() >= MAX_SLOTS 
                                ? 'text-white/[0.25] opacity-25 cursor-not-allowed' 
                                : 'text-white/[0.25] hover:text-[#7FFF00]'
                            }`}
                            title={totalSlots() >= MAX_SLOTS ? 'Limit reached (5 max)' : 'Add time'}
                          >
                            <Plus size={14} strokeWidth={2} />
                          </button>
                        </div>
                        <div className="px-2 py-[6px] flex flex-col gap-1 min-h-2">
                          {availability[day].map((time, i) => (
                            <div
                              key={i}
                              onClick={() => removeTimeSlot(day, time)}
                              className="flex items-center justify-between gap-1 px-1 py-[2px] rounded-[5px] cursor-pointer transition-colors hover:bg-white/[0.05] group"
                            >
                              <div className="flex items-center gap-1">
                                <div className="w-[3px] h-[3px] rounded-full bg-[#7FFF00]/35 flex-shrink-0" />
                                <span className="text-[12px] font-normal text-[#7FFF00]/65">{time}</span>
                              </div>
                              <X size={12} strokeWidth={2.5} className="text-white/[0.25] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-[6px] mb-[10px]">
                    {['Fri', 'Sat', 'Sun'].map(day => (
                      <div key={day} className="bg-black border border-white/[0.07] rounded-[10px] overflow-hidden">
                        <div className="px-[10px] py-2 border-b border-white/[0.07] flex items-center justify-between">
                          <span className="text-[12px] font-semibold tracking-[0.16em] uppercase text-white/[0.25]">
                            {day}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (totalSlots() < MAX_SLOTS) {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setShowTimePicker({ day, x: rect.left - 60, y: rect.bottom + 4 });
                              } else {
                                toast.error('5 slot limit reached. Remove a time first.');
                              }
                            }}
                            disabled={totalSlots() >= MAX_SLOTS}
                            className={`w-[14px] h-[14px] flex items-center justify-center transition-colors ${
                              totalSlots() >= MAX_SLOTS 
                                ? 'text-white/[0.25] opacity-25 cursor-not-allowed' 
                                : 'text-white/[0.25] hover:text-[#7FFF00]'
                            }`}
                            title={totalSlots() >= MAX_SLOTS ? 'Limit reached (5 max)' : 'Add time'}
                          >
                            <Plus size={14} strokeWidth={2} />
                          </button>
                        </div>
                        <div className="px-2 py-[6px] flex flex-col gap-1 min-h-2">
                          {availability[day].map((time, i) => (
                            <div
                              key={i}
                              onClick={() => removeTimeSlot(day, time)}
                              className="flex items-center justify-between gap-1 px-1 py-[2px] rounded-[5px] cursor-pointer transition-colors hover:bg-white/[0.05] group"
                            >
                              <div className="flex items-center gap-1">
                                <div className="w-[3px] h-[3px] rounded-full bg-[#7FFF00]/35 flex-shrink-0" />
                                <span className="text-[12px] font-normal text-[#7FFF00]/65">{time}</span>
                              </div>
                              <X size={12} strokeWidth={2.5} className="text-white/[0.25] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-[12px] font-light text-white/[0.25] mt-[2px]">
                    Hover a time to remove it. Max 5 slots across all days.
                  </div>

                  <div className="mt-[18px]">
                    <label className="block text-[12px] font-semibold tracking-[0.18em] uppercase text-white/[0.25] mb-[7px]">
                      Meeting frequency
                    </label>
                    <select
                      value={meetingFrequency}
                      onChange={(e) => { setMeetingFrequency(e.target.value); markDirty(); }}
                      className="w-full bg-black border border-white/[0.12] rounded-[10px] px-[14px] py-[11px] text-[13px] font-light text-white/88 outline-none transition-colors focus:border-[#7FFF00]/30 appearance-none bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22rgba(255%2C255%2C255%2C0.25)%22%20stroke-width%3D%221.5%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_12px_center] bg-[length:16px]"
                    >
                      <option>Every week</option>
                      <option>Every two weeks</option>
                      <option>Once a month</option>
                      <option>Twice a month</option>
                    </select>
                  </div>
                </div>

                <div className="px-7 py-[22px]">
                  <div className="flex items-start justify-between gap-4 py-4">
                    <div className="flex-1">
                      <div className="text-[13px] font-medium text-white/88 mb-[3px]">
                        Meet local matches only
                      </div>
                      <div className="text-[12px] font-light text-white/[0.25] leading-[1.6]">
                        Only get introduced to people in your area.
                      </div>
                    </div>
                    <button
                      onClick={() => { setLocalMatchesOnly(!localMatchesOnly); markDirty(); }}
                      className={`relative w-9 h-[22px] rounded-full transition-colors flex-shrink-0 mt-[2px] ${
                        localMatchesOnly ? 'bg-[#7FFF00]' : 'bg-white/10'
                      }`}
                    >
                      <div className={`absolute top-[3px] w-4 h-4 rounded-full transition-all ${
                        localMatchesOnly 
                          ? 'left-[18px] bg-[#050705]' 
                          : 'left-[3px] bg-white/40'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-start justify-between gap-4 py-4 border-t border-white/[0.07]">
                    <div className="flex-1">
                      <div className="text-[13px] font-medium text-white/88 mb-[3px]">
                        Pause meetings
                      </div>
                      <div className="text-[12px] font-light text-white/[0.25] leading-[1.6]">
                        Take a break from introductions. You can still message existing matches.
                      </div>
                    </div>
                    <button
                      onClick={() => { setPauseMeetings(!pauseMeetings); markDirty(); }}
                      className={`relative w-9 h-[22px] rounded-full transition-colors flex-shrink-0 mt-[2px] ${
                        pauseMeetings ? 'bg-[#7FFF00]' : 'bg-white/10'
                      }`}
                    >
                      <div className={`absolute top-[3px] w-4 h-4 rounded-full transition-all ${
                        pauseMeetings 
                          ? 'left-[18px] bg-[#050705]' 
                          : 'left-[3px] bg-white/40'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Goals Section */}
            {activeSection === 'goals' && (
              <div className="bg-[#0b0e0b] border border-white/[0.07] rounded-2xl overflow-hidden">
                <div className="px-7 pt-[22px] pb-[22px] border-b border-white/[0.07]">
                  <h2 className="font-['Libre_Baskerville'] text-[20px] font-normal text-white/88 mb-[5px]">
                    Goals
                  </h2>
                  <p className="text-[12px] font-light text-white/[0.25] leading-[1.6]">
                    Help Lethe understand what you're looking for. This is never shared publicly.
                  </p>
                </div>

                {/* CEP Block */}
                <div className="px-7 py-[22px] border-b border-white/[0.07]">
                  <div className="flex items-start justify-between mb-[6px]">
                    <div>
                      <div className="text-[13px] font-medium text-white/88">Chat with Lethe AI</div>
                      <div className="text-[12px] font-light text-white/[0.25] mt-[2px]">Fine-tune your matches</div>
                    </div>
                    {isPaidUser && cepPills.length > 0 && (
                      <button className="text-[11px] font-medium tracking-[0.1em] uppercase text-[#7FFF00]/60 hover:text-[#7FFF00] transition-colors">
                        Your matching preferences &rarr;
                      </button>
                    )}
                  </div>

                  {!isPaidUser ? (
                    <div className="mt-3 rounded-xl bg-[#7FFF00]/[0.04] border border-[#7FFF00]/[0.12] px-5 py-4 flex items-start gap-4">
                      <div className="flex-1">
                        <div className="text-[13px] font-medium text-white/88 mb-[6px]">Unlock hyper-personalised matching</div>
                        <ul className="space-y-[5px]">
                          {['Chat with Lethe AI to fine-tune who you meet', 'Access all signals driving your match decisions', 'Get matched within your network and goals'].map((benefit, i) => (
                            <li key={i} className="flex items-center gap-2 text-[12px] font-light text-white/[0.25]">
                              <div className="w-[3px] h-[3px] rounded-full bg-[#7FFF00]/40 flex-shrink-0" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <button
                        onClick={() => setIsPaidUser(true)}
                        className="flex-shrink-0 px-4 py-2 rounded-lg bg-[#7FFF00]/[0.08] border border-[#7FFF00]/20 text-[12px] font-semibold tracking-[0.08em] uppercase text-[#7FFF00]/80 hover:bg-[#7FFF00]/[0.14] hover:text-[#7FFF00] transition-all whitespace-nowrap"
                      >
                        Go premium
                      </button>
                    </div>
                  ) : cepDone ? (
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-[6px] mb-3">
                        {cepPills.map((pill, i) => (
                          <div key={i} className="flex items-center gap-[5px] px-[10px] py-1 rounded-full bg-[#7FFF00]/[0.08] border border-[#7FFF00]/20 text-[12px] text-[#7FFF00]/70">
                            {pill}
                          </div>
                        ))}
                      </div>
                      <div className="text-[12px] font-light text-white/[0.25] italic">Come back tomorrow to fine-tune further.</div>
                    </div>
                  ) : (
                    <div className="mt-3 rounded-xl bg-black border border-white/[0.07] overflow-hidden">
                      {!nudgeAnswered && (
                        <div className="px-4 py-3 border-b border-white/[0.07] flex items-center justify-between gap-3">
                          <span className="text-[12px] font-light text-white/52 italic">{weeklyNudge}</span>
                          <div className="flex gap-2">
                            {['Building a product', 'Seeking collaborators', 'Exploring new ideas'].map((opt, i) => (
                              <button
                                key={i}
                                onClick={() => setNudgeAnswered(true)}
                                className="px-3 py-1 rounded-full bg-white/[0.07] border border-white/[0.12] text-[11px] text-white/52 hover:border-[#7FFF00]/30 hover:text-white/88 transition-all"
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="px-4 py-3 max-h-[200px] overflow-y-auto flex flex-col gap-3" style={{ scrollbarWidth: 'none' }}>
                        {cepMessages.map((msg, i) => (
                          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] px-3 py-2 rounded-xl text-[12px] font-light leading-[1.6] ${
                              msg.role === 'ai'
                                ? 'bg-white/[0.05] text-white/70 rounded-tl-none'
                                : 'bg-[#7FFF00]/[0.08] border border-[#7FFF00]/20 text-white/88 rounded-tr-none'
                            }`}>
                              {msg.text}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="px-4 py-3 border-t border-white/[0.07] flex items-center gap-2">
                        <input
                          type="text"
                          value={cepInput}
                          onChange={(e) => setCepInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && cepInput.trim()) {
                              setCepMessages(prev => [...prev, { role: 'user', text: cepInput.trim() }]);
                              setCepInput('');
                              setTimeout(() => {
                                setCepMessages(prev => [...prev, { role: 'ai', text: "Got it. I've updated your matching preferences." }]);
                                setCepPills(['Builders & founders', 'AI & systems thinking', 'Open to mentorship', 'Remote-first']);
                                setCepDone(true);
                              }, 800);
                            }
                          }}
                          placeholder="Type your answer or /guide me..."
                          className="flex-1 bg-transparent border-none outline-none text-[12px] font-light text-white/88 placeholder:text-white/[0.25]"
                        />
                        <button
                          onClick={() => {
                            if (cepInput.trim()) {
                              setCepMessages(prev => [...prev, { role: 'user', text: cepInput.trim() }]);
                              setCepInput('');
                            }
                          }}
                          className="text-[#7FFF00]/40 hover:text-[#7FFF00] transition-colors text-[18px] leading-none"
                        >
                          ↑
                        </button>
                      </div>
                    </div>
                  )}
                </div>


                <div className="px-7 py-[22px] border-b border-white/[0.07]">
                  <label className="block text-[12px] font-semibold tracking-[0.18em] uppercase text-white/[0.25] mb-[7px]">
                    Your interests
                  </label>
                  <div className="flex flex-wrap gap-[6px] p-[10px] bg-black border border-white/[0.12] rounded-[10px] min-h-[44px] focus-within:border-[#7FFF00]/30 transition-colors">
                    {interests.map((interest, i) => (
                      <div key={i} className="flex items-center gap-[5px] px-[10px] py-1 rounded-full bg-white/[0.07] border border-white/[0.12] text-[12px] text-white/52">
                        {interest}
                        <button onClick={() => removeInterest(i)} className="text-white/[0.25] hover:text-white/88 transition-colors">
                          <X size={12} strokeWidth={2} />
                        </button>
                      </div>
                    ))}
                    <input
                      type="text"
                      value={interestInput}
                      onChange={(e) => setInterestInput(e.target.value)}
                      onKeyDown={addInterest}
                      placeholder="Add interest..."
                      className="flex-1 min-w-[80px] bg-transparent border-none outline-none text-[12px] text-white/88 placeholder:text-white/[0.25]"
                    />
                  </div>
                </div>

                <div className="px-7 py-[22px] border-b border-white/[0.07]">
                  <div className="mb-[18px]">
                    <label className="block text-[12px] font-semibold tracking-[0.18em] uppercase text-white/[0.25] mb-[7px]">
                      How would you like to be introduced?
                    </label>
                    <textarea
                      value={introText}
                      onChange={(e) => { setIntroText(e.target.value); markDirty(); }}
                      placeholder="e.g. I'm a product designer exploring the intersection of AI and human communication..."
                      className="w-full h-[90px] bg-black border border-white/[0.12] rounded-[10px] px-[14px] py-[11px] text-[13px] font-light text-white/88 outline-none transition-colors focus:border-[#7FFF00]/30 placeholder:text-white/[0.25] resize-none leading-[1.65]"
                    />
                    <div className="text-[12px] text-white/[0.25] mt-[6px] font-light">
                      This is what Lethe uses when introducing you — different from your public bio.
                    </div>
                  </div>

                  <div className="mb-[18px]">
                    <label className="block text-[12px] font-semibold tracking-[0.18em] uppercase text-white/[0.25] mb-[7px]">
                      Your goals
                    </label>
                    <div className="flex flex-wrap gap-[7px] mb-[14px]">
                      {goals.map((goal, i) => (
                        <button
                          key={i}
                          onClick={() => toggleGoal(i)}
                          className={`flex items-center gap-[7px] px-[13px] py-2 rounded-[22px] transition-all ${
                            goal.active
                              ? 'bg-[#7FFF00]/[0.08] border border-[#7FFF00]/20'
                              : 'bg-white/[0.07] border border-white/[0.12] hover:border-white/[0.18]'
                          }`}
                        >
                          <span className="text-sm leading-none">{goal.icon}</span>
                          <span className={`text-[12px] font-normal ${goal.active ? 'text-white/88' : 'text-white/52'}`}>
                            {goal.label}
                          </span>
                          {goal.active && (
                            <X size={14} strokeWidth={2} className="text-white/[0.25]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-[18px]">
                    <label className="flex items-center gap-[7px] text-[12px] font-semibold tracking-[0.18em] uppercase text-white/[0.25] mb-[7px]">
                      <span className="text-sm">🧩</span>
                      I'd like to learn about...
                    </label>
                    <textarea
                      value={learnAbout}
                      onChange={(e) => { setLearnAbout(e.target.value); markDirty(); }}
                      placeholder="e.g. I want to understand more about psychology."
                      className="w-full h-[76px] bg-black border border-white/[0.12] rounded-[10px] px-[14px] py-[11px] text-[13px] font-light text-white/88 outline-none transition-colors focus:border-[#7FFF00]/30 placeholder:text-white/[0.25] resize-none leading-[1.65]"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-[7px] text-[12px] font-semibold tracking-[0.18em] uppercase text-white/[0.25] mb-[7px]">
                      <span className="text-sm">💬</span>
                      Ask me about...
                    </label>
                    <textarea
                      value={askAbout}
                      onChange={(e) => { setAskAbout(e.target.value); markDirty(); }}
                      placeholder="e.g. Transitioning from agency to freelance, or building in public."
                      className="w-full h-[76px] bg-black border border-white/[0.12] rounded-[10px] px-[14px] py-[11px] text-[13px] font-light text-white/88 outline-none transition-colors focus:border-[#7FFF00]/30 placeholder:text-white/[0.25] resize-none leading-[1.65]"
                    />
                  </div>
                </div>

                <div className="px-7 py-[22px] border-b border-white/[0.07]">
                  <div className="mb-4">
                    <label className="block text-[12px] font-semibold tracking-[0.18em] uppercase text-white/[0.25] mb-[7px]">
                      Who would you enjoy meeting most?
                    </label>
                    <div className="border border-white/[0.12] rounded-xl overflow-hidden">
                      {whoToMeetOptions.map((option, i) => (
                        <button
                          key={i}
                          onClick={() => { setWhoToMeet(i); markDirty(); }}
                          className={`w-full flex items-center justify-between px-4 py-[13px] transition-colors border-b border-white/[0.07] last:border-0 ${
                            whoToMeet === i
                              ? 'bg-[#7FFF00]/[0.08]'
                              : 'hover:bg-white/[0.07]'
                          }`}
                        >
                          <span className={`text-[13px] font-light ${whoToMeet === i ? 'text-white/88' : 'text-white/52'}`}>
                            {option}
                          </span>
                          <div className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center transition-all ${
                            whoToMeet === i
                              ? 'border-[#7FFF00] bg-[#7FFF00]'
                              : 'border-white/[0.18]'
                          }`}>
                            {whoToMeet === i && (
                              <div className="w-[5px] h-[5px] rounded-full bg-[#050705]" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold tracking-[0.18em] uppercase text-white/[0.25] mb-[7px]">
                      Where are they based?
                    </label>
                    <select
                      value={whereBased}
                      onChange={(e) => { setWhereBased(e.target.value); markDirty(); }}
                      className="w-full bg-black border border-white/[0.12] rounded-[10px] px-[14px] py-[11px] text-[13px] font-light text-white/88 outline-none transition-colors focus:border-[#7FFF00]/30 appearance-none bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22rgba(255%2C255%2C255%2C0.25)%22%20stroke-width%3D%221.5%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_12px_center] bg-[length:16px]"
                    >
                      <option>Anywhere in the world</option>
                      <option>Africa</option>
                      <option>Asia</option>
                      <option>Europe</option>
                      <option>Latin America</option>
                      <option>Middle East</option>
                      <option>North America</option>
                      <option>Oceania</option>
                    </select>
                  </div>
                </div>

                <div className="px-7 py-[22px]">
                  <label className="block text-[12px] font-semibold tracking-[0.18em] uppercase text-white/[0.25] mb-[14px]">
                    Preferred meeting format
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {meetingFormatOptions.map((format, i) => (
                      <button
                        key={i}
                        onClick={() => { setMeetingFormat(i); markDirty(); }}
                        className={`px-4 py-3 rounded-xl text-left transition-all ${
                          meetingFormat === i
                            ? 'bg-[#7FFF00]/[0.08] border-2 border-[#7FFF00]/25'
                            : 'bg-white/[0.07] border-2 border-white/[0.07] hover:border-white/[0.18]'
                        }`}
                      >
                        <div className="text-[12px] font-medium text-white/88 mb-[3px]">
                          {format.title}
                        </div>
                        <div className="text-[12px] font-light text-white/[0.25] leading-[1.5]">
                          {format.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <div className="bg-[#0b0e0b] border border-white/[0.07] rounded-2xl overflow-hidden">
                <div className="px-7 pt-[22px] pb-[22px] border-b border-white/[0.07]">
                  <h2 className="font-['Libre_Baskerville'] text-[20px] font-normal text-white/88 mb-[5px]">
                    Notifications
                  </h2>
                  <p className="text-[12px] font-light text-white/[0.25] leading-[1.6]">
                    Choose what Lethe notifies you about and how.
                  </p>
                </div>

                {notificationGroups.map((group, gi) => (
                  <div key={group.id} className={`px-7 py-4 ${gi < notificationGroups.length - 1 ? 'border-b border-white/[0.07]' : ''}`}>
                    <button
                      onClick={() => toggleAccordion(group.id)}
                      className="w-full flex items-center gap-3 pb-3 hover:opacity-80 transition-opacity"
                    >
                      <div className="w-8 h-8 rounded-[10px] bg-white/[0.07] border border-white/[0.07] flex items-center justify-center text-white/[0.25] flex-shrink-0">
                        {group.icon}
                      </div>
                      <div className="flex-1 text-[13px] font-medium text-white/88 text-left">
                        {group.title}
                      </div>
                      <ChevronDown
                        size={16}
                        strokeWidth={1.5}
                        className={`text-white/[0.25] flex-shrink-0 transition-transform ${
                          openAccordions.includes(group.id) ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    <div className={`overflow-hidden transition-all ${
                      openAccordions.includes(group.id) ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <div className="pt-1">
                        <div className="flex items-center px-0 py-2">
                          <div className="flex-1" />
                          <div className="w-[52px] text-center text-[12px] font-semibold tracking-[0.18em] uppercase text-white/[0.25]">
                            Email
                          </div>
                          <div className="w-[52px] text-center text-[12px] font-semibold tracking-[0.18em] uppercase text-white/[0.25]">
                            Push
                          </div>
                        </div>

                        {group.items.map((item, ii) => (
                          <div key={ii} className="flex items-center py-2 border-b border-white/[0.07] last:border-0">
                            <div className="flex-1">
                              <div className="text-[12px] font-medium text-white/88 mb-[2px]">
                                {item.title}
                              </div>
                              <div className="text-[12px] font-light text-white/[0.25]">
                                {item.desc}
                              </div>
                            </div>
                            <div className="w-[52px] flex justify-center">
                              <button
                                onClick={() => toggleNotification(group.id, ii, 'email')}
                                className={`w-[18px] h-[18px] rounded-[5px] border-[1.5px] flex items-center justify-center transition-all ${
                                  item.email
                                    ? 'bg-[#7FFF00] border-[#7FFF00]'
                                    : 'bg-transparent border-white/[0.18]'
                                }`}
                              >
                                {item.email && (
                                  <Check size={12} strokeWidth={2} className="text-[#050705]" />
                                )}
                              </button>
                            </div>
                            <div className="w-[52px] flex justify-center">
                              <button
                                onClick={() => toggleNotification(group.id, ii, 'push')}
                                className={`w-[18px] h-[18px] rounded-[5px] border-[1.5px] flex items-center justify-center transition-all ${
                                  item.push
                                    ? 'bg-[#7FFF00] border-[#7FFF00]'
                                    : 'bg-transparent border-white/[0.18]'
                                }`}
                              >
                                {item.push && (
                                  <Check size={12} strokeWidth={2} className="text-[#050705]" />
                                )}
                              </button>
                            </div>
                          </div>
                        ))}

                        <button
                          onClick={() => turnOffAllInGroup(group.id)}
                          className="w-full mt-1 py-3 rounded-[10px] bg-white/[0.07] border border-white/[0.12] text-[12px] font-medium tracking-[0.08em] uppercase text-white/52 transition-all hover:bg-white/[0.06] hover:text-white/88"
                        >
                          Turn off all
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Time Picker Dropdown */}
      {showTimePicker && (
        <div
          style={{
            position: 'absolute',
            left: `${showTimePicker.x}px`,
            top: `${showTimePicker.y}px`,
            zIndex: 300,
            scrollbarWidth: 'none'
          }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#0f130f] border border-white/[0.12] rounded-[10px] p-1 w-[120px] max-h-[220px] overflow-y-auto shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
        >
          {TIME_OPTIONS.filter(time => !availability[showTimePicker.day].includes(time)).map(time => (
            <button
              key={time}
              onClick={() => addTimeSlot(showTimePicker.day, time)}
              className="w-full px-3 py-2 text-[12px] font-light text-white/65 rounded-[7px] transition-all hover:bg-[#7FFF00]/[0.08] hover:text-white/90 text-left"
            >
              {time}
            </button>
          ))}
        </div>
      )}

      {/* Save Bar */}
      <div className={`fixed bottom-0 left-0 right-0 h-16 bg-black/95 backdrop-blur-xl border-t border-white/[0.07] flex items-center justify-end px-12 gap-[10px] z-50 transition-transform ${
        isDirty ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="text-[12px] font-light text-white/[0.25] mr-auto">
          Unsaved changes
        </div>
        <button
          onClick={discardChanges}
          className="px-[18px] py-[10px] rounded-[10px] bg-transparent border border-white/[0.12] text-[12px] font-medium tracking-[0.08em] uppercase text-white/52 transition-all hover:bg-white/[0.07] hover:text-white/88"
        >
          Discard
        </button>
        <button
          onClick={saveChanges}
          className="px-6 py-[10px] rounded-[10px] bg-white/10 border border-white/20 text-[12px] font-semibold tracking-[0.08em] uppercase text-white/88 transition-all hover:bg-white/[0.16] hover:border-white/30"
        >
          Save changes
        </button>
      </div>
    </div>
  );
}