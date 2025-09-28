import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';

// Helper function to truncate location names
const truncateLocation = (location, maxLength = 12) => {
  if (!location) return '';
  return location.length > maxLength ? location.substring(0, maxLength) + '..' : location;
};

// Calendar component: month grid with trip + refuel highlights.
// Props: { activityMap, initialDate, asSection }
export default function AnalyticsCalendar({ activityMap = {}, initialDate = new Date(), asSection = false }) {
  const [cursor, setCursor] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
  const [hoverDay, setHoverDay] = useState(null);

  const currentDate = new Date();
  const currentMonth = currentDate.getFullYear() * 12 + currentDate.getMonth();
  const cursorMonth = cursor.getFullYear() * 12 + cursor.getMonth();

  const monthLabel = cursor.toLocaleString(undefined, { month: 'long', year: 'numeric' });

  // Navigation handlers with current month limit
  const goToPrevMonth = () => {
    const prevMonth = new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1);
    const prevMonthNum = prevMonth.getFullYear() * 12 + prevMonth.getMonth();
    // Allow going back to any previous month, but not beyond current month when going forward
    setCursor(prevMonth);
  };

  const goToNextMonth = () => {
    const nextMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    const nextMonthNum = nextMonth.getFullYear() * 12 + nextMonth.getMonth();
    // Only allow going to next month if it's not beyond current month
    if (nextMonthNum <= currentMonth) {
      setCursor(nextMonth);
    }
  };

  // Check if next button should be disabled
  const isNextDisabled = cursorMonth >= currentMonth;

  const days = useMemo(() => {
    const startDow = new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay();
    const nextMonth = new Date(cursor.getFullYear(), cursor.getMonth()+1, 1);
    const daysInMonth = Math.round((nextMonth - new Date(cursor.getFullYear(), cursor.getMonth(), 1)) / 86400000);
    const grid = [];
    for (let i=0;i<startDow;i++) grid.push({ blank: true, key: 'b'+i });
    for (let d=1; d<=daysInMonth; d++) {
      const dateObj = new Date(cursor.getFullYear(), cursor.getMonth(), d);
      const key = dateObj.toISOString().slice(0,10);
      const act = activityMap[key] || { trips: [], refuels: [] };
      grid.push({ day: d, iso: key, trips: act.trips, refuels: act.refuels });
    }
    return grid;
  }, [cursor, activityMap]);

  const hoverData = hoverDay && activityMap[hoverDay];

  const CalendarGrid = (
    <>
      <div className={asSection ? 'grid grid-cols-7 text-[9px] uppercase tracking-wide text-gray-500 mb-1' : 'grid grid-cols-7 text-[10px] uppercase tracking-wide text-gray-400 mb-2'}>
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=> <div key={d} className="text-center">{d}</div>)}
      </div>
      <div className={asSection ? 'grid grid-cols-7 gap-1 text-[11px] flex-1 auto-rows-[1.9rem] relative' : 'grid grid-cols-7 gap-1 text-sm flex-1 auto-rows-[2.2rem] relative'}>
        {days.map(cell => cell.blank ? (
          <div key={cell.key} />
        ) : (
          <div
            key={cell.iso}
            onMouseEnter={()=> setHoverDay(cell.iso)}
            onMouseLeave={()=> setHoverDay(null)}
            className={`relative rounded-md border border-gray-700/40 bg-gray-800/40 flex items-center justify-center cursor-pointer group overflow-visible
              ${cell.trips.length && 'ring-1 ring-orange-400/60'}
              ${cell.refuels.length && 'outline outline-1 outline-purple-400/50'}
            `}
          >
            <span className={asSection ? 'text-gray-300 text-[11px] font-medium relative z-10' : 'text-gray-300 text-xs font-medium relative z-10'}>{cell.day}</span>
            
            {/* Hover Tooltip */}
            {hoverDay === cell.iso && (cell.trips.length > 0 || cell.refuels.length > 0) && (
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full z-50 pointer-events-none">
                <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-600/60 rounded-lg p-3 shadow-xl transition-all duration-200 ease-out opacity-100 scale-100">
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
                    <div className="w-2 h-2 bg-gray-900/95 border-r border-b border-gray-600/60 transform rotate-45"></div>
                  </div>
                  
                  {/* Content */}
                  <div className="text-[10px] leading-tight space-y-1 min-w-[120px] max-w-[200px]">
                    <div className="font-semibold text-gray-200 text-center mb-1">
                      {new Date(cell.iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    
                    {cell.trips.length > 0 && (
                      <div className="space-y-0.5">
                        <div className="text-orange-300 font-medium">{cell.trips.length} Trip{cell.trips.length > 1 ? 's' : ''}:</div>
                        {cell.trips.slice(0, 2).map(trip => (
                          <div key={'t'+trip.id} className="text-teal-300 text-[9px]">
                            {truncateLocation(trip.startLocationName || trip.startName, 10)} → {truncateLocation(trip.endLocationName || trip.endName, 10)}
                          </div>
                        ))}
                        {cell.trips.length > 2 && (
                          <div className="text-gray-400 text-[9px]">+{cell.trips.length - 2} more</div>
                        )}
                      </div>
                    )}
                    
                    {cell.refuels.length > 0 && (
                      <div className="space-y-0.5">
                        <div className="text-purple-300 font-medium">{cell.refuels.length} Refuel{cell.refuels.length > 1 ? 's' : ''}:</div>
                        {cell.refuels.slice(0, 2).map(refuel => (
                          <div key={'r'+refuel.id} className="text-purple-300 text-[9px]">
                            {refuel.liters}L @ ₱{refuel.pricePerLiter}/L
                          </div>
                        ))}
                        {cell.refuels.length > 2 && (
                          <div className="text-gray-400 text-[9px]">+{cell.refuels.length - 2} more</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Activity indicators */}
            {cell.trips.length > 0 && <div className={asSection ? 'absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-400 to-orange-500' : 'absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-orange-500'} />}
            {cell.refuels.length > 0 && <div className={asSection ? 'absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 to-fuchsia-500' : 'absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-fuchsia-500'} />}
          </div>
        ))}
      </div>
    </>
  );

  if (asSection) {
    return (
      <div className="flex flex-col h-full">
        <div className="pb-2 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">Activity</div>
            <div className="text-[11px] text-gray-500 -mt-0.5">{monthLabel}</div>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={goToPrevMonth} 
              className="px-2 py-1 rounded-md bg-gray-800/70 hover:bg-gray-700 text-gray-300 text-[10px] transition-colors"
            >
              Prev
            </button>
            <button 
              onClick={goToNextMonth} 
              disabled={isNextDisabled}
              className={`px-2 py-1 rounded-md text-[10px] transition-colors ${
                isNextDisabled 
                  ? 'bg-gray-800/40 text-gray-500 cursor-not-allowed' 
                  : 'bg-gray-800/70 hover:bg-gray-700 text-gray-300'
              }`}
            >
              Next
            </button>
          </div>
        </div>
        <div className="flex-1 flex flex-col overflow-visible relative">
          {CalendarGrid}
        </div>
      </div>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm">Activity Calendar</CardTitle>
            <CardDescription>{monthLabel}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={goToPrevMonth} 
              className="px-2 py-1 rounded-md bg-gray-800/70 hover:bg-gray-700 text-gray-300 text-xs transition-colors"
            >
              Prev
            </button>
            <button 
              onClick={goToNextMonth} 
              disabled={isNextDisabled}
              className={`px-2 py-1 rounded-md text-xs transition-colors ${
                isNextDisabled 
                  ? 'bg-gray-800/40 text-gray-500 cursor-not-allowed' 
                  : 'bg-gray-800/70 hover:bg-gray-700 text-gray-300'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-visible relative">
        {CalendarGrid}
      </CardContent>
    </Card>
  );
}
