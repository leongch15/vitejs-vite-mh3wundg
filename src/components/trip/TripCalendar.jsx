import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export default function TripCalendar({ trip, onDayClick }) {
  const startDate = trip.start_date ? parseISO(trip.start_date) : new Date();
  const [currentMonth, setCurrentMonth] = useState(startDate);

  // Build a map: dateString -> day entry
  const dayMap = {};
  trip.itinerary?.forEach((day, index) => {
    // Calculate date from start_date + (day.day - 1)
    const date = new Date(startDate);
    date.setDate(date.getDate() + (day.day - 1));
    const key = format(date, 'yyyy-MM-dd');
    dayMap[key] = { ...day, index };
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-center justify-between">
            <CardTitle className="font-heading text-lg flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-accent" />
              Calendrier du voyage
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium w-32 text-center capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: fr })}
              </span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {/* Header days */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS_OF_WEEK.map(d => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const key = format(day, 'yyyy-MM-dd');
              const tripDay = dayMap[key];
              const isCurrentMonth = isSameMonth(day, currentMonth);

              return (
                <button
                  key={key}
                  onClick={() => tripDay && onDayClick(tripDay.index)}
                  disabled={!tripDay}
                  className={`
                    relative aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all duration-200
                    ${!isCurrentMonth ? 'opacity-25' : ''}
                    ${tripDay
                      ? 'bg-primary text-primary-foreground font-semibold hover:bg-primary/80 cursor-pointer shadow-sm hover:shadow-md hover:scale-105'
                      : 'text-foreground hover:bg-muted/50 cursor-default'
                    }
                  `}
                >
                  <span>{format(day, 'd')}</span>
                  {tripDay && (
                    <span className="text-[9px] leading-tight opacity-80 hidden sm:block truncate w-full text-center px-0.5">
                      J{tripDay.day}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/50">
            <div className="w-4 h-4 rounded bg-primary shrink-0" />
            <span className="text-xs text-muted-foreground">Jour de voyage — cliquez pour accéder aux détails</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}