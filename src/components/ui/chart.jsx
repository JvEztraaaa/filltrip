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
    <div className="text-xs bg-gray-900 border border-gray-700 rounded-md px-3 py-2 shadow-xl">
      <div className="font-medium text-gray-300 mb-1">{label}</div>
      {(payload||[]).map(p => (
        <div key={p.dataKey} className="flex items-center gap-2 text-gray-400">
          <span className="inline-block w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span>{p.name}: {p.value}</span>
        </div>
      ))}
    </div>
  );
}

export function ChartTooltipContent({ payload, label, hideLabel, formatter }) {
  return (
    <div className="text-xs bg-gray-900 border border-gray-700 rounded-md px-3 py-2 shadow-xl">
      {!hideLabel && <div className="font-medium text-gray-300 mb-1">{label}</div>}
      {(payload||[]).map(p => {
        const val = formatter ? formatter(p.value, p) : p.value;
        return (
          <div key={p.dataKey} className="flex items-center gap-2 text-gray-400">
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span>{p.name || p.dataKey}: {val}</span>
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
