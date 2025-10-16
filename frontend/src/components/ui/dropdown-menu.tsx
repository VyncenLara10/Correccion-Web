'use client';

import * as React from 'react';

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | undefined>(undefined);

export interface DropdownMenuProps {
  children: React.ReactNode;
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownMenuContext.Provider>
  );
}

export interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export function DropdownMenuTrigger({ 
  children, 
  asChild,
  ...props 
}: DropdownMenuTriggerProps) {
  const context = React.useContext(DropdownMenuContext);
  if (!context) throw new Error('DropdownMenuTrigger must be used within DropdownMenu');

  const { setOpen } = context;

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: () => setOpen(true),
    });
  }

  return (
    <button onClick={() => setOpen(true)} {...props}>
      {children}
    </button>
  );
}

export interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'end' | 'center';
}

export function DropdownMenuContent({ 
  children, 
  align = 'end',
  className = '',
  ...props 
}: DropdownMenuContentProps) {
  const context = React.useContext(DropdownMenuContext);
  if (!context) throw new Error('DropdownMenuContent must be used within DropdownMenu');

  const { open, setOpen } = context;
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open, setOpen]);

  if (!open) return null;

  const alignmentClasses = {
    start: 'left-0',
    end: 'right-0',
    center: 'left-1/2 -translate-x-1/2'
  };

  return (
    <div
      ref={ref}
      className={`absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md ${alignmentClasses[align]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function DropdownMenuItem({ 
  children, 
  className = '',
  onClick,
  ...props 
}: DropdownMenuItemProps) {
  const context = React.useContext(DropdownMenuContext);
  if (!context) throw new Error('DropdownMenuItem must be used within DropdownMenu');

  const { setOpen } = context;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    setOpen(false);
  };

  return (
    <button
      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

export interface DropdownMenuSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DropdownMenuSeparator({ 
  className = '', 
  ...props 
}: DropdownMenuSeparatorProps) {
  return (
    <div className={`-mx-1 my-1 h-px bg-muted ${className}`} {...props} />
  );
}

export interface DropdownMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DropdownMenuLabel({ 
  children, 
  className = '', 
  ...props 
}: DropdownMenuLabelProps) {
  return (
    <div className={`px-2 py-1.5 text-sm font-semibold ${className}`} {...props}>
      {children}
    </div>
  );
}