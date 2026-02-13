import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Vote, ChevronDown, Plus, ExternalLink } from "lucide-react";
import { Link } from "react-router";
import { usePolls } from "~/hooks/use-block-integration";
import type { Poll } from "~/services/block-integration.service";

interface PollSelectorProps {
  bioId: string | null;
  selectedPollId?: string;
  onSelect: (poll: Poll | null) => void;
  className?: string;
}

export function PollSelector({
  bioId,
  selectedPollId,
  onSelect,
  className = "",
}: PollSelectorProps) {
  const { t } = useTranslation("dashboard");
  const { polls, isLoading, error } = usePolls({ bioId });
  const [isOpen, setIsOpen] = useState(false);

  const selectedPoll = polls.find((p) => p.id === selectedPollId);

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
          {t("editor.blockIntegration.polls.error", { defaultValue: "Failed to load polls" })}
        </p>
      </div>
    );
  }

  if (polls.length === 0) {
    return (
      <div className={`neo-card p-4 text-center ${className}`}>
        <Vote className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 mb-3">
          {t("editor.blockIntegration.polls.empty", { defaultValue: "No polls created yet" })}
        </p>
        <Link
          to="/dashboard/polls"
          className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-semibold"
        >
          <Plus className="w-4 h-4" />
          {t("editor.blockIntegration.polls.create", { defaultValue: "Create poll" })}
        </Link>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="neo-input w-full flex items-center justify-between gap-3 p-3 text-left bg-white"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Vote className="w-5 h-5 text-primary-600" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">
              {selectedPoll?.title || t("editor.blockIntegration.polls.select", { defaultValue: "Select poll" })}
            </p>
            {selectedPoll && (
              <p className="text-xs text-gray-500">
                {(selectedPoll.options || []).length} {t("editor.blockIntegration.polls.options", { defaultValue: "options" })}
                {` • ${selectedPoll.votes || 0} ${t("editor.blockIntegration.polls.votes", { defaultValue: "votes" })}`}
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
              className="relative z-50 mt-2 max-h-64 overflow-auto rounded-2xl border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
            >
              <div className="p-2">
                {polls.map((poll) => (
                  <button
                    key={poll.id}
                    type="button"
                    onClick={() => {
                      onSelect(poll.id === selectedPollId ? null : poll);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      poll.id === selectedPollId
                        ? "bg-primary-100 border-2 border-primary-500"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Vote className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {poll.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(poll.options || []).length} {t("editor.blockIntegration.polls.options", { defaultValue: "options" })}
                        {` • ${poll.votes || 0} ${t("editor.blockIntegration.polls.votes", { defaultValue: "votes" })}`}
                      </p>
                    </div>
                    {poll.id === selectedPollId && (
                      <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
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
                  to="/dashboard/polls"
                  className="flex items-center justify-center gap-2 w-full p-3 text-sm text-primary-600 hover:bg-primary-50 rounded-lg font-semibold"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t("editor.blockIntegration.polls.manage", { defaultValue: "Manage polls" })}
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
