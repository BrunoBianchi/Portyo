import { useTranslation } from "react-i18next";
import type { BioBlock } from "~/contexts/bio.context";
import { BookingSettingsSelector } from "../integration-selectors/booking-settings-selector";

interface Props {
  block: BioBlock;
  onChange: (updates: Partial<BioBlock>) => void;
}

export function CalendarBlockEditor({ block, onChange }: Props) {
  const { t } = useTranslation("dashboard");
  const useBooking = block.calendarUseBooking ?? false;

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-xs font-black uppercase tracking-wider mb-2 ml-1">
          {t("editor.editDrawer.fields.calendarTitleLabel")}
        </label>
        <input
          type="text"
          value={block.calendarTitle || ""}
          onChange={(e) => onChange({ calendarTitle: e.target.value })}
          className="w-full p-4 bg-white border-2 border-black rounded-xl font-medium text-sm focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all outline-none placeholder:text-black/20"
          placeholder={t("editor.editDrawer.fields.calendarTitlePlaceholder")}
        />
      </div>
      <div>
        <label className="block text-xs font-black uppercase tracking-wider mb-2 ml-1">
          {t("editor.editDrawer.fields.calendarDescriptionLabel")}
        </label>
        <textarea
          value={block.body || ""}
          onChange={(e) => onChange({ body: e.target.value })}
          rows={3}
          className="w-full p-4 bg-white border-2 border-black rounded-xl font-medium text-sm focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all outline-none placeholder:text-black/20 resize-none"
          placeholder={t("editor.editDrawer.fields.calendarDescriptionPlaceholder")}
        />
      </div>

      {/* Booking Integration */}
      <div>
        <label className="block text-[10px] font-black uppercase tracking-wider mb-2 ml-0.5 text-black/40">
          Agendamento
        </label>
        <BookingSettingsSelector
          bioId={block.bioId || null}
          isActive={useBooking}
          onToggle={(val) => onChange({ calendarUseBooking: val })}
        />
      </div>

      {/* External URL fallback (only shown when booking is OFF) */}
      {!useBooking && (
        <div>
          <label className="block text-xs font-black uppercase tracking-wider mb-2 ml-1">
            URL Externa
          </label>
          <input
            type="url"
            value={block.calendarUrl || ""}
            onChange={(e) => onChange({ calendarUrl: e.target.value })}
            className="w-full p-4 bg-white border-2 border-black rounded-xl font-medium text-sm focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all outline-none placeholder:text-black/20"
            placeholder="https://calendly.com/..."
          />
          <p className="text-[10px] text-gray-400 mt-1 ml-1">
            Link externo para agendamento (Calendly, Cal.com, etc.)
          </p>
        </div>
      )}
    </div>
  );
}
