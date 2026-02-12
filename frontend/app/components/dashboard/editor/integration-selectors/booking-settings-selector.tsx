import { useTranslation } from "react-i18next";
import { Calendar, Clock, ExternalLink, AlertCircle, Check } from "lucide-react";
import { Link } from "react-router";
import { useBookingSettings } from "~/hooks/use-block-integration";

interface BookingSettingsSelectorProps {
  bioId: string | null;
  isActive: boolean;
  onToggle: (useBooking: boolean) => void;
  className?: string;
}

const DAY_LABELS: Record<string, string> = {
  mon: "Seg",
  tue: "Ter",
  wed: "Qua",
  thu: "Qui",
  fri: "Sex",
  sat: "Sáb",
  sun: "Dom",
};

const DAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export function BookingSettingsSelector({
  bioId,
  isActive,
  onToggle,
  className = "",
}: BookingSettingsSelectorProps) {
  const { t } = useTranslation("dashboard");
  const { settings, isLoading, isConfigured, availableDays } =
    useBookingSettings({ bioId });

  if (isLoading) {
    return (
      <div className={`neo-card p-4 ${className}`}>
        <div className="flex items-center gap-3 animate-pulse">
          <div className="w-10 h-10 bg-gray-200 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className={`border-2 border-dashed border-gray-200 rounded-xl p-4 text-center ${className}`}>
        <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 mb-1 font-medium">
          Agendamento não configurado
        </p>
        <p className="text-xs text-gray-400 mb-3">
          Configure sua disponibilidade para usar o agendamento integrado
        </p>
        <Link
          to="/dashboard/scheduler"
          className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-semibold"
        >
          <ExternalLink className="w-4 h-4" />
          Configurar Agendamento
        </Link>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Toggle */}
      <button
        type="button"
        onClick={() => onToggle(!isActive)}
        className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
          isActive
            ? "border-green-500 bg-green-50"
            : "border-gray-200 bg-white hover:border-gray-300"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isActive ? "bg-green-500 text-white" : "bg-gray-100 text-gray-500"
            }`}
          >
            <Calendar className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold">
              Usar agendamento integrado
            </p>
            <p className="text-[10px] text-gray-400">
              Visitantes podem agendar direto na sua bio
            </p>
          </div>
        </div>
        <div
          className={`w-10 h-6 rounded-full transition-colors relative ${
            isActive ? "bg-green-500" : "bg-gray-300"
          }`}
        >
          <div
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              isActive ? "translate-x-[18px]" : "translate-x-0.5"
            }`}
          />
        </div>
      </button>

      {/* Settings Preview */}
      {isActive && settings && (
        <div className="bg-gray-50 rounded-xl p-3 space-y-3">
          {/* Duration */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-600">
              Duração: <strong>{settings.durationMinutes} min</strong>
            </span>
          </div>

          {/* Available Days */}
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">
              Dias disponíveis
            </p>
            <div className="flex gap-1.5">
              {DAY_ORDER.map((day) => {
                const isAvailable = availableDays.includes(day);
                return (
                  <div
                    key={day}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                      isAvailable
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-300"
                    }`}
                  >
                    {DAY_LABELS[day]}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Paused indicator */}
          {settings.updatesPaused && (
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 rounded-lg px-3 py-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Agendamento pausado</span>
            </div>
          )}

          {/* Blocked dates count */}
          {settings.blockedDates?.length > 0 && (
            <p className="text-[10px] text-gray-400">
              {settings.blockedDates.length} data(s) bloqueada(s)
            </p>
          )}

          {/* Manage link */}
          <Link
            to="/dashboard/scheduler"
            className="inline-flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-semibold"
          >
            <ExternalLink className="w-3 h-3" />
            Gerenciar disponibilidade
          </Link>
        </div>
      )}
    </div>
  );
}
