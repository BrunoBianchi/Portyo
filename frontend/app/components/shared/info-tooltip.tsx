import { useState, useRef, useEffect } from "react";
import { HelpCircle } from "lucide-react";

interface InfoTooltipProps {
    content: string;
    position?: "top" | "bottom" | "left" | "right";
    size?: "sm" | "md";
}

export function InfoTooltip({ content, position = "top", size = "sm" }: InfoTooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                tooltipRef.current &&
                buttonRef.current &&
                !tooltipRef.current.contains(event.target as Node) &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsVisible(false);
            }
        };

        if (isVisible) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isVisible]);

    const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
    const buttonSize = size === "sm" ? "w-5 h-5" : "w-6 h-6";

    const positionClasses = {
        top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
        bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
        left: "right-full top-1/2 -translate-y-1/2 mr-2",
        right: "left-full top-1/2 -translate-y-1/2 ml-2",
    };

    const arrowClasses = {
        top: "top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-surface-elevated",
        bottom: "bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-surface-elevated",
        left: "left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-surface-elevated",
        right: "right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-surface-elevated",
    };

    return (
        <div className="relative inline-flex items-center">
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setIsVisible(!isVisible)}
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                className={`${buttonSize} flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-white/30`}
                aria-label="More information"
            >
                <HelpCircle className={iconSize} />
            </button>

            {isVisible && (
                <div
                    ref={tooltipRef}
                    className={`absolute z-50 ${positionClasses[position]} animate-in fade-in zoom-in-95 duration-150`}
                >
                    <div className="bg-surface-elevated text-foreground text-xs px-3 py-2 rounded-lg shadow-lg min-w-[280px] max-w-[320px] leading-relaxed border border-border">
                        {content}
                    </div>
                    <div
                        className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`}
                    />
                </div>
            )}
        </div>
    );
}
