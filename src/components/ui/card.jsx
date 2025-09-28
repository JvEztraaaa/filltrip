import React from 'react';
// Minimal Card components inspired by shadcn/ui but styled to match existing gradient + border aesthetic.
// Keeping classNames tailwind-only so no extra dependency required.

export function Card({ className = '', children, ...rest }) {
  return (
    <div
      className={
        'rounded-xl border border-gray-700/70 bg-[#0f1622]/95 bg-[radial-gradient(circle_at_25%_15%,rgba(59,130,246,0.08),transparent_60%),radial-gradient(circle_at_80%_90%,rgba(168,85,247,0.06),transparent_70%)] ' +
        'shadow-[0_4px_12px_-2px_rgba(0,0,0,0.4),0_1px_0_0_rgba(255,255,255,0.03)_inset] ' +
        'hover:shadow-[0_6px_18px_-4px_rgba(0,0,0,0.55),0_1px_0_0_rgba(255,255,255,0.05)_inset] hover:border-gray-600/80 transition-all duration-200 ' +
        className
      }
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children, ...rest }) {
  return (
    <div className={'px-4 pt-4 pb-2 flex flex-col gap-1 ' + className} {...rest}>
      {children}
    </div>
  );
}

export function CardTitle({ className = '', children, ...rest }) {
  return (
    <h3 className={'text-sm font-semibold tracking-wide text-gray-200 uppercase ' + className} {...rest}>
      {children}
    </h3>
  );
}

export function CardDescription({ className = '', children, ...rest }) {
  return (
    <p className={'text-xs text-gray-400 ' + className} {...rest}>{children}</p>
  );
}

export function CardContent({ className = '', children, ...rest }) {
  return (
    <div className={'px-4 pb-4 ' + className} {...rest}>{children}</div>
  );
}

export function CardFooter({ className = '', children, ...rest }) {
  return (
    <div className={'px-4 pt-2 pb-4 ' + className} {...rest}>{children}</div>
  );
}
