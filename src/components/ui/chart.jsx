import React from 'react';
// Lightweight equivalents of shadcn/ui chart helpers for consistent API usage.
// ChartContainer provides CSS vars for palette and wraps children.

export function ChartContainer({ config = {}, className = '', children }) {
  // Provide CSS variables for each series key.
  const style = {};
  let i = 1;
  Object.entries(config).forEach(([key, def]) => {
    style[`--color-${key}`] = def.color || `hsl(${(i*65)%360} 70% 55%)`;
    i++;
  });
  return (
    <div className={'w-full h-full ' + className} style={style}>
      {children}
    </div>
  );
}

export function ChartTooltip({ active, payload, label, content }) {
  if (!active) return null;
  if (content) return React.cloneElement(content, { payload, label });
  return (
    <div className="text-sm bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 shadow-2xl min-w-[200px]">
      <div className="font-semibold text-gray-100 mb-2 text-[15px]">{label}</div>
      {(payload||[]).map(p => (
        <div key={p.dataKey} className="flex items-center gap-3 text-gray-300 py-1">
          <span className="inline-block w-3 h-3 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="font-medium">{p.name}: <span className="font-semibold text-white">{p.value}</span></span>
        </div>
      ))}
    </div>
  );
}

export function ChartTooltipContent({ payload, label, hideLabel, formatter }) {
  return (
    <div className="text-sm bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 shadow-2xl min-w-[200px]">
      {!hideLabel && <div className="font-semibold text-gray-100 mb-2 text-[15px]">{label}</div>}
      {(payload||[]).map(p => {
        const val = formatter ? formatter(p.value, p) : p.value;
        return (
          <div key={p.dataKey} className="flex items-center gap-3 text-gray-300 py-1">
            <span className="inline-block w-3 h-3 rounded-full flex-shrink-0" style={{ background: p.color }} />
            <span className="font-medium">{p.name || p.dataKey}: <span className="font-semibold text-white">{val}</span></span>
          </div>
        );
      })}
    </div>
  );
}

export function computeTrendPercent(values) {
  if (!Array.isArray(values) || values.length < 2) return 0;
  const last = values[values.length - 1];
  const prev = values[values.length - 2] || 0;
  if (!prev) return 0;
  return ((last - prev) / prev) * 100;
}
