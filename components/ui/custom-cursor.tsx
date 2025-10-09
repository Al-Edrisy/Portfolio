'use client';
 
import * as React from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
  type HTMLMotionProps,
  type SpringOptions,
} from 'motion/react';
 
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
 
type CursorContextType = {
  cursorPos: { x: number; y: number };
  isActive: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  cursorRef: React.RefObject<HTMLDivElement | null>;
};
 
const CursorContext = React.createContext<CursorContextType | undefined>(
  undefined,
);
 
const useCursor = (): CursorContextType => {
  const context = React.useContext(CursorContext);
  if (!context) {
    throw new Error('useCursor must be used within a CursorProvider');
  }
  return context;
};
 
type CursorProviderProps = React.ComponentProps<'div'> & {
  children: React.ReactNode;
};
 
function CursorProvider({ ref, children, ...props }: CursorProviderProps) {
  const [cursorPos, setCursorPos] = React.useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const cursorRef = React.useRef<HTMLDivElement>(null);
  const rafRef = React.useRef<number>();
  
  React.useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

  // Cleanup effect to ensure cursor is restored when component unmounts
  React.useEffect(() => {
    return () => {
      // Ensure cursor is restored when navigating away
      document.body.classList.remove('custom-cursor-active');
    };
  }, []);
 
  React.useEffect(() => {
    if (!containerRef.current) return;
 
    const parent = containerRef.current.parentElement;
    if (!parent) return;
 
    if (getComputedStyle(parent).position === 'static') {
      parent.style.position = 'relative';
    }

    // Add class to body to disable cursor globally
    document.body.classList.add('custom-cursor-active');
 
    let lastX = 0;
    let lastY = 0;
 
    const handleMouseMove = (e: MouseEvent) => {
      // Only show cursor on main content areas, not on buttons, inputs, etc.
      const target = e.target as HTMLElement;
      const isInteractive = target.closest('button, input, textarea, select, a, [role="button"]');
      
      if (isInteractive) {
        setIsActive(false);
        return;
      }
      
      // Use RAF for smooth updates
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      rafRef.current = requestAnimationFrame(() => {
        // Use clientX and clientY directly for viewport-relative positioning
        // This prevents the cursor from moving with page scroll
        const newX = e.clientX;
        const newY = e.clientY;
        
        // Only update if position changed significantly (performance optimization)
        if (Math.abs(newX - lastX) > 1 || Math.abs(newY - lastY) > 1) {
          setCursorPos({ x: newX, y: newY });
          lastX = newX;
          lastY = newY;
        }
        
        setIsActive(true);
      });
    };
    
    const handleMouseLeave = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      setIsActive(false);
    };
    
    const handleMouseEnter = () => {
      // Reset cursor position when entering the container
      setIsActive(false);
    };
 
    // Handle scroll to maintain cursor position
    const handleScroll = () => {
      // Cursor position is already viewport-relative, so no adjustment needed
      // But we can use this to ensure smooth updates during scroll
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };

    parent.addEventListener('mousemove', handleMouseMove, { passive: true });
    parent.addEventListener('mouseleave', handleMouseLeave);
    parent.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('scroll', handleScroll, { passive: true });
 
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      parent.removeEventListener('mousemove', handleMouseMove);
      parent.removeEventListener('mouseleave', handleMouseLeave);
      parent.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('scroll', handleScroll);
      // Re-enable cursor when component unmounts
      document.body.classList.remove('custom-cursor-active');
    };
  }, []);
 
  return (
    <CursorContext.Provider
      value={{ cursorPos, isActive, containerRef, cursorRef }}
    >
      <div ref={containerRef} data-slot="cursor-provider" {...props}>
        {children}
      </div>
    </CursorContext.Provider>
  );
}
 
type CursorProps = HTMLMotionProps<'div'> & {
  children: React.ReactNode;
};
 
function Cursor({ ref, children, className, style, ...props }: CursorProps) {
  const { cursorPos, isActive, containerRef, cursorRef } = useCursor();
  React.useImperativeHandle(ref, () => cursorRef.current as HTMLDivElement);
 
  const x = useMotionValue(0);
  const y = useMotionValue(0);
 
  React.useEffect(() => {
    const parentElement = containerRef.current?.parentElement;
 
    if (parentElement && isActive) {
      parentElement.style.cursor = 'none';
      // Also disable cursor on the document body for better coverage
      document.body.style.cursor = 'none';
    } else if (parentElement) {
      parentElement.style.cursor = 'default';
      document.body.style.cursor = 'default';
    }
 
    return () => {
      if (parentElement) {
        parentElement.style.cursor = 'default';
      }
      document.body.style.cursor = 'default';
    };
  }, [containerRef, cursorPos, isActive]);
 
  React.useEffect(() => {
    x.set(cursorPos.x);
    y.set(cursorPos.y);
  }, [cursorPos, x, y]);
 
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          ref={cursorRef}
          data-slot="cursor"
          className={cn(
            'transform-[translate(-50%,-50%)] pointer-events-none z-[9999] fixed',
            className,
          )}
          style={{ top: y, left: x, ...style }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
 
type Align =
  | 'top'
  | 'top-left'
  | 'top-right'
  | 'bottom'
  | 'bottom-left'
  | 'bottom-right'
  | 'left'
  | 'right'
  | 'center';
 
type CursorFollowProps = HTMLMotionProps<'div'> & {
  sideOffset?: number;
  align?: Align;
  transition?: SpringOptions;
  children: React.ReactNode;
};
 
function CursorFollow({
  ref,
  sideOffset = 15,
  align = 'bottom-right',
  children,
  className,
  style,
  transition = { stiffness: 500, damping: 50, bounce: 0 },
  ...props
}: CursorFollowProps) {
  const { cursorPos, isActive, cursorRef } = useCursor();
  const cursorFollowRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(
    ref,
    () => cursorFollowRef.current as HTMLDivElement,
  );
 
  const x = useMotionValue(0);
  const y = useMotionValue(0);
 
  const springX = useSpring(x, transition);
  const springY = useSpring(y, transition);
 
  const calculateOffset = React.useCallback(() => {
    const rect = cursorFollowRef.current?.getBoundingClientRect();
    const width = rect?.width ?? 0;
    const height = rect?.height ?? 0;
 
    let newOffset;
 
    switch (align) {
      case 'center':
        newOffset = { x: width / 2, y: height / 2 };
        break;
      case 'top':
        newOffset = { x: width / 2, y: height + sideOffset };
        break;
      case 'top-left':
        newOffset = { x: width + sideOffset, y: height + sideOffset };
        break;
      case 'top-right':
        newOffset = { x: -sideOffset, y: height + sideOffset };
        break;
      case 'bottom':
        newOffset = { x: width / 2, y: -sideOffset };
        break;
      case 'bottom-left':
        newOffset = { x: width + sideOffset, y: -sideOffset };
        break;
      case 'bottom-right':
        newOffset = { x: -sideOffset, y: -sideOffset };
        break;
      case 'left':
        newOffset = { x: width + sideOffset, y: height / 2 };
        break;
      case 'right':
        newOffset = { x: -sideOffset, y: height / 2 };
        break;
      default:
        newOffset = { x: 0, y: 0 };
    }
 
    return newOffset;
  }, [align, sideOffset]);
 
  React.useEffect(() => {
    const offset = calculateOffset();
    const cursorRect = cursorRef.current?.getBoundingClientRect();
    const cursorWidth = cursorRect?.width ?? 24; // Updated to match new cursor size
    const cursorHeight = cursorRect?.height ?? 24;
 
    // Use cursorPos directly since it's now viewport-relative
    x.set(cursorPos.x - offset.x + cursorWidth / 2);
    y.set(cursorPos.y - offset.y + cursorHeight / 2);
  }, [calculateOffset, cursorPos, cursorRef, x, y]);
 
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          ref={cursorFollowRef}
          data-slot="cursor-follow"
          className={cn(
            'transform-[translate(-50%,-50%)] pointer-events-none z-[9998] fixed',
            className,
          )}
          style={{ top: springY, left: springX, ...style }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * User-aware cursor component that displays user information based on authentication state
 * - Shows user name when logged in
 * - Shows "Guest" when not authenticated
 * - Displays admin badge for admin users
 * - Uses proper cursor SVG shape for better performance
 */
function UserCursor() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <Cursor className="w-6 h-6">
        <svg
          className="w-full h-full text-primary animate-pulse"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 40 40"
        >
          <path
            fill="currentColor"
            d="M1.8 4.4 7 36.2c.3 1.8 2.6 2.3 3.6.8l3.9-5.7c1.7-2.5 4.5-4.1 7.5-4.3l6.9-.5c1.8-.1 2.5-2.4 1.1-3.5L5 2.5c-1.4-1.1-3.5 0-3.3 1.9Z"
          />
        </svg>
      </Cursor>
    );
  }

  if (user) {
    return (
      <>
        <Cursor className="w-6 h-6">
          <svg
            className="w-full h-full text-primary"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 40 40"
          >
            <path
              fill="currentColor"
              d="M1.8 4.4 7 36.2c.3 1.8 2.6 2.3 3.6.8l3.9-5.7c1.7-2.5 4.5-4.1 7.5-4.3l6.9-.5c1.8-.1 2.5-2.4 1.1-3.5L5 2.5c-1.4-1.1-3.5 0-3.3 1.9Z"
            />
          </svg>
        </Cursor>
        <CursorFollow 
          align="bottom-right" 
          sideOffset={20}
          transition={{ stiffness: 400, damping: 40, bounce: 0 }}
          className="bg-background/95 backdrop-blur-md border border-border/50 rounded-lg px-3 py-2 shadow-lg"
        >
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-foreground">{user.name}</span>
            {user.role === 'admin' && (
              <span className="text-xs bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800 px-2 py-1 rounded-full font-medium">
                👑 Admin
              </span>
            )}
          </div>
        </CursorFollow>
      </>
    );
  }

  return (
    <>
      <Cursor className="w-6 h-6">
        <svg
          className="w-full h-full text-muted-foreground/60"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 40 40"
        >
          <path
            fill="currentColor"
            d="M1.8 4.4 7 36.2c.3 1.8 2.6 2.3 3.6.8l3.9-5.7c1.7-2.5 4.5-4.1 7.5-4.3l6.9-.5c1.8-.1 2.5-2.4 1.1-3.5L5 2.5c-1.4-1.1-3.5 0-3.3 1.9Z"
          />
        </svg>
      </Cursor>
      <CursorFollow 
        align="bottom-right" 
        sideOffset={20}
        transition={{ stiffness: 400, damping: 40, bounce: 0 }}
        className="bg-background/95 backdrop-blur-md border border-border/50 rounded-lg px-3 py-2 shadow-lg"
      >
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-muted-foreground">Guest</span>
          <span className="text-xs text-muted-foreground/70">Sign in to personalize</span>
        </div>
      </CursorFollow>
    </>
  );
}
 
export {
  CursorProvider,
  Cursor,
  CursorFollow,
  UserCursor,
  useCursor,
  type CursorContextType,
  type CursorProviderProps,
  type CursorProps,
  type CursorFollowProps,
};
