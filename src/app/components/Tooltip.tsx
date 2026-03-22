import { ReactNode, useState, useRef, useEffect } from "react";

interface TooltipProps {
  children: ReactNode;
  text: string;
}

export function Tooltip({ children, text }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('top');
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && tooltipRef.current && containerRef.current) {
      const tooltip = tooltipRef.current;
      const container = containerRef.current;
      const tooltipRect = tooltip.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Check if tooltip fits above
      if (containerRect.top - tooltipRect.height - 8 < 0) {
        // Not enough space above, try below
        if (containerRect.bottom + tooltipRect.height + 8 > viewportHeight) {
          // Not enough space below either, try left or right
          if (containerRect.left - tooltipRect.width - 8 < 0) {
            setPosition('right');
          } else {
            setPosition('left');
          }
        } else {
          setPosition('bottom');
        }
      } else {
        setPosition('top');
      }

      // Check horizontal boundaries for top/bottom positions
      if (position === 'top' || position === 'bottom') {
        const tooltipLeft = containerRect.left + containerRect.width / 2 - tooltipRect.width / 2;
        if (tooltipLeft < 8) {
          tooltip.style.left = '8px';
          tooltip.style.transform = 'translateX(0)';
        } else if (tooltipLeft + tooltipRect.width > viewportWidth - 8) {
          tooltip.style.right = '8px';
          tooltip.style.left = 'auto';
          tooltip.style.transform = 'translateX(0)';
        }
      }
    }
  }, [isVisible, position]);

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-3';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-3';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-3';
      default: // top
        return 'bottom-full left-1/2 -translate-x-1/2 mb-3';
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div 
          ref={tooltipRef}
          className={`absolute ${getPositionClasses()} z-50 pointer-events-none`}
        >
          <div className="bg-[#0a0a0a] rounded-lg px-3 py-1.5 shadow-2xl" style={{ boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)' }}>
            <span className="text-[#9B9B9B] text-[11px] tracking-wide font-light font-sans whitespace-nowrap">
              {text}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}