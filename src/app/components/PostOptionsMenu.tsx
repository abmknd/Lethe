import { useState, useRef, useEffect } from 'react';
import { Link2, UserPlus, Download, EyeOff, VolumeX, Ban, AlertCircle, Pin, RotateCcw, Trash2, Clock } from 'lucide-react';

interface PostOptionsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'feed' | 'profile';
  isFaded?: boolean; // Only used for profile to show/hide Revive option
  position?: { top: number; left: number };
}

export function PostOptionsMenu({ isOpen, onClose, type, isFaded = false, position }: PostOptionsMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Add a small delay to prevent immediate closing when opening
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const feedOptions = [
    { icon: Link2, label: 'Copy link', color: 'white' },
    { icon: UserPlus, label: 'Follow', color: 'white' },
    { icon: Download, label: 'Save as image', color: 'white' },
    { icon: EyeOff, label: 'Hide note', color: 'white' },
    { icon: VolumeX, label: 'Mute', color: '#DC2626' },
    { icon: Ban, label: 'Block', color: '#DC2626' },
    { icon: AlertCircle, label: 'Report', color: '#DC2626' },
  ];

  const profileOptions = [
    { icon: Link2, label: 'Copy link', color: 'white', show: true },
    { icon: Clock, label: 'Fade post', color: 'white', show: !isFaded }, // Only show for non-faded posts
    { icon: RotateCcw, label: 'Revive', color: '#7FFF00', show: isFaded }, // Only show for faded posts
    { icon: Pin, label: 'Pin to profile', color: 'white', show: true },
    { icon: Trash2, label: 'Delete', color: '#DC2626', show: true },
  ].filter(option => option.show);

  const options = type === 'feed' ? feedOptions : profileOptions;

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] w-[240px] bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] shadow-2xl overflow-hidden"
      style={position ? { top: `${position.top}px`, left: `${position.left}px` } : {}}>
      {options.map((option, index) => {
        const Icon = option.icon;
        const isRed = option.color === '#DC2626';
        const isChartreuse = option.color === '#7FFF00';
        
        return (
          <button
            key={option.label}
            onClick={(e) => {
              e.stopPropagation();
              console.log(`${option.label} clicked`);
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 transition-colors ${
              index === 0 ? '' : 'border-t border-[#2a2a2a]'
            } ${
              isRed 
                ? 'hover:bg-[#DC2626]/10' 
                : isChartreuse
                ? 'hover:bg-[#7FFF00]/10'
                : 'hover:bg-[#2a2a2a]'
            }`}
          >
            <Icon 
              size={18} 
              strokeWidth={1.5} 
              className={isRed ? 'text-[#DC2626]' : isChartreuse ? 'text-[#7FFF00]' : 'text-white'}
            />
            <span 
              className={`font-['Inter'] text-[14px] leading-[21px] tracking-[0.35px] ${
                isRed ? 'text-[#DC2626]' : isChartreuse ? 'text-[#7FFF00]' : 'text-white'
              }`}
            >
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}