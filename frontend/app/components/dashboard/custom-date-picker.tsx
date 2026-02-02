import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon } from "lucide-react";

interface CustomDatePickerProps {
  value: Date | null;
  onChange: (date: Date) => void;
  minDate?: Date;
  onClose?: () => void;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function CustomDatePicker({ value, onChange, minDate, onClose }: CustomDatePickerProps) {
  const [viewDate, setViewDate] = useState(() => {
    const d = value ? new Date(value) : new Date();
    d.setDate(1);
    return d;
  });

  const [selectedHour, setSelectedHour] = useState(() => value ? value.getHours() : new Date().getHours());
  const [selectedMinute, setSelectedMinute] = useState(() => value ? value.getMinutes() : new Date().getMinutes());
  const [view, setView] = useState<"calendar" | "time">("calendar");

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const handleDateClick = (day: number) => {
    const newDate = new Date(year, month, day, selectedHour, selectedMinute);
    if (minDate && newDate < minDate) return;
    onChange(newDate);
  };

  const handleTimeChange = (hour: number, minute: number) => {
    setSelectedHour(hour);
    setSelectedMinute(minute);

    if (value) {
      const newDate = new Date(value);
      newDate.setHours(hour);
      newDate.setMinutes(minute);
      onChange(newDate);
    }
  };

  const isSelected = (day: number) => {
    if (!value) return false;
    return value.getDate() === day && value.getMonth() === month && value.getFullYear() === year;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  };

  const isDisabled = (day: number) => {
    if (!minDate) return false;
    const dateToCheck = new Date(year, month, day, 23, 59, 59);
    return dateToCheck < minDate;
  };

  // Generate time options
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div className="bg-surface-card rounded-xl shadow-2xl border border-border p-3 w-[260px] overflow-hidden">
      {/* Header Toggle */}
      <div className="flex items-center justify-center bg-muted p-1 rounded-lg mb-3">
        <button
          onClick={() => setView("calendar")}
          className={`flex-1 py-1 text-[11px] font-bold rounded-md transition-all ${view === "calendar" ? "bg-surface-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          Date
        </button>
        <button
          onClick={() => setView("time")}
          className={`flex-1 py-1 text-[11px] font-bold rounded-md transition-all ${view === "time" ? "bg-surface-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          Time
        </button>
      </div>

      {view === "calendar" ? (
        <>
          <div className="flex items-center justify-between mb-2 px-1">
            <button onClick={handlePrevMonth} className="p-1 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-bold text-foreground">
              {MONTHS[month]} {year}
            </span>
            <button onClick={handleNextMonth} className="p-1 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 mb-2">
            {DAYS.map(day => (
              <div key={day} className="text-[10px] font-bold text-muted-foreground text-center py-1">
                {day}
              </div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const selected = isSelected(day);
              const disabled = isDisabled(day);
              const today = isToday(day);

              return (
                <button
                  key={day}
                  onClick={() => !disabled && handleDateClick(day)}
                  disabled={disabled}
                  className={`
                        h-7 w-7 rounded-md text-[11px] font-medium flex items-center justify-center transition-all
                        ${selected
                      ? "bg-black text-white font-bold shadow-md"
                      : disabled
                        ? "text-muted-foreground/50 cursor-not-allowed"
                        : "text-foreground hover:bg-muted hover:text-foreground"
                    }
                        ${today && !selected ? "ring-1 ring-black text-black font-bold" : ""}
                    `}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div className="h-[200px] flex gap-2">
          {/* Hours */}
          <div className="flex-1 flex flex-col">
            <div className="text-[10px] font-bold text-muted-foreground/50 text-center mb-1 uppercase tracking-wider">Hour</div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-0.5">
              {hours.map(h => (
                <button
                  key={h}
                  onClick={() => handleTimeChange(h, selectedMinute)}
                  className={`w-full py-1.5 rounded-md text-xs font-medium transition-all ${selectedHour === h
                      ? "bg-black text-white font-bold shadow-sm"
                      : "text-muted-foreground hover:bg-muted"
                    }`}
                >
                  {h.toString().padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>

          <div className="w-px bg-border my-2"></div>

          {/* Minutes */}
          <div className="flex-1 flex flex-col">
            <div className="text-[10px] font-bold text-muted-foreground/50 text-center mb-1 uppercase tracking-wider">Minute</div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-0.5">
              {minutes.map(m => (
                <button
                  key={m}
                  onClick={() => handleTimeChange(selectedHour, m)}
                  className={`w-full py-1.5 rounded-md text-xs font-medium transition-all ${selectedMinute === m
                      ? "bg-black text-white font-bold shadow-sm"
                      : "text-muted-foreground hover:bg-muted"
                    }`}
                >
                  {m.toString().padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="border-t border-border pt-2 mt-1 flex items-center justify-between text-[10px]">
        <span className="text-muted-foreground/50 font-medium">Selected:</span>
        <span className="font-bold text-foreground">
          {value ? value.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "None"}
        </span>
      </div>
    </div>
  );
}
