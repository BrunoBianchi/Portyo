import { Target } from "lucide-react";
import { useTranslation } from "react-i18next";

export function CompanyFooter() {
    const { t } = useTranslation("company");

    return (
        <footer className="bg-black text-white py-12 px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#D2E823] rounded flex items-center justify-center">
                        <Target className="w-5 h-5 text-black" />
                    </div>
                    <span className="font-bold text-lg">{t("brand")}</span>
                </div>
                <p className="text-gray-500 text-sm">
                    © {new Date().getFullYear()} Portyo. {t("company.footer.rights")}
                </p>
            </div>
        </footer>
    );
}
