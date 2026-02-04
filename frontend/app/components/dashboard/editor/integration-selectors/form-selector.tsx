import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ChevronDown, Plus, ExternalLink } from "lucide-react";
import { Link } from "react-router";
import { useForms } from "~/hooks/use-block-integration";
import type { Form } from "~/services/block-integration.service";

interface FormSelectorProps {
  bioId: string | null;
  selectedFormId?: string;
  onSelect: (form: Form | null) => void;
  className?: string;
}

export function FormSelector({
  bioId,
  selectedFormId,
  onSelect,
  className = "",
}: FormSelectorProps) {
  const { t } = useTranslation("dashboard");
  const { forms, isLoading, error } = useForms({ bioId });
  const [isOpen, setIsOpen] = useState(false);

  const selectedForm = forms.find((f) => f.id === selectedFormId);

  if (isLoading) {
    return (
      <div className={`neo-card p-3 ${className}`}>
        <div className="flex items-center gap-3 animate-pulse">
          <div className="w-10 h-10 bg-gray-200 rounded-lg" />
          <div className="flex-1 h-4 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`neo-card p-3 border-red-500 ${className}`}>
        <p className="text-sm text-red-600">
          {t("editor.blockIntegration.forms.error")}
        </p>
      </div>
    );
  }

  if (forms.length === 0) {
    return (
      <div className={`neo-card p-4 text-center ${className}`}>
        <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 mb-3">
          {t("editor.blockIntegration.forms.empty")}
        </p>
        <Link
          to="/dashboard/forms"
          className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-semibold"
        >
          <Plus className="w-4 h-4" />
          {t("editor.blockIntegration.forms.create")}
        </Link>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="neo-input w-full flex items-center justify-between gap-3 p-3 text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-primary-600" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">
              {selectedForm?.name || t("editor.blockIntegration.forms.select")}
            </p>
            {selectedForm && (
              <p className="text-xs text-gray-500">
                {selectedForm.fields.length} {t("editor.blockIntegration.forms.fields")}
                {selectedForm.responsesCount !== undefined &&
                  ` • ${selectedForm.responsesCount} ${t("editor.blockIntegration.forms.responses")}`}
              </p>
            )}
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 top-full left-0 right-0 mt-2 neo-card max-h-64 overflow-auto"
            >
              <div className="p-2">
                {forms.map((form) => (
                  <button
                    key={form.id}
                    type="button"
                    onClick={() => {
                      onSelect(form.id === selectedFormId ? null : form);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      form.id === selectedFormId
                        ? "bg-primary-100 border-2 border-primary-500"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {form.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {form.fields.length} {t("editor.blockIntegration.forms.fields")}
                        {form.responsesCount !== undefined &&
                          ` • ${form.responsesCount} ${t("editor.blockIntegration.forms.responses")}`}
                      </p>
                    </div>
                    {form.id === selectedFormId && (
                      <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="border-t border-gray-200 p-2">
                <Link
                  to="/dashboard/forms"
                  className="flex items-center justify-center gap-2 w-full p-3 text-sm text-primary-600 hover:bg-primary-50 rounded-lg font-semibold"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t("editor.blockIntegration.forms.manage")}
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
