import React from 'react';
// Simple table primitives similar to shadcn/ui tailored for dark theme.

export function Table({ className = '', ...props }) {
  return <div className={'overflow-x-auto ' + className}><table className='w-full text-sm text-left border-collapse' {...props} /></div>;
}
export function THead(props) { return <thead {...props} className={'text-xs uppercase text-gray-400 bg-gray-800/60'} />; }
export function TBody(props) { return <tbody {...props} className='divide-y divide-gray-800/70' />; }
export function TR({ className='', ...props }) { return <tr className={'hover:bg-gray-800/40 transition-colors ' + className} {...props} />; }
export function TH({ className='', ...props }) { return <th className={'px-3 py-2 font-medium tracking-wide ' + className} {...props} />; }
export function TD({ className='', ...props }) { return <td className={'px-3 py-2 text-gray-300 ' + className} {...props} />; }
