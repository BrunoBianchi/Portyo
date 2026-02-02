import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import i18n from "~/i18n";

export const meta: MetaFunction = ({ params }) => {
    const lang = params?.lang === "pt" ? "pt" : "en";
    return [
        { title: i18n.t("meta.about.title", { lng: lang }) },
        { name: "description", content: i18n.t("meta.about.description", { lng: lang }) },
    ];
};

export default function About() {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-surface-alt font-sans text-text-main selection:bg-primary selection:text-black pt-24 pb-20 px-6">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
                    {t("aboutPage.hero.pre")} <span className="text-primary">{t("aboutPage.hero.highlight")}</span>
                </h1>

                <p className="text-xl md:text-2xl text-text-muted leading-relaxed mb-24">
                    {t("aboutPage.subtitle")}
                </p>

                {/* Story - Text Only */}
                <div className="mb-24 space-y-8 text-lg font-medium leading-relaxed text-text-secondary">
                    <p>
                        {t("aboutPage.story.p1")}
                    </p>
                    <p>
                        {t("aboutPage.story.p2")}
                    </p>
                    <p>
                        {t("aboutPage.story.p3")}
                    </p>
                </div>

                {/* Values - Grid Text */}
                <div className="grid md:grid-cols-2 gap-x-12 gap-y-16 mb-24">
                    <div>
                        <h3 className="text-lg font-bold uppercase tracking-wider mb-3">{t("aboutPage.values.creatorFirst.title")}</h3>
                        <p className="text-text-muted">{t("aboutPage.values.creatorFirst.body")}</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold uppercase tracking-wider mb-3">{t("aboutPage.values.innovation.title")}</h3>
                        <p className="text-text-muted">{t("aboutPage.values.innovation.body")}</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold uppercase tracking-wider mb-3">{t("aboutPage.values.community.title")}</h3>
                        <p className="text-text-muted">{t("aboutPage.values.community.body")}</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold uppercase tracking-wider mb-3">{t("aboutPage.values.growth.title")}</h3>
                        <p className="text-text-muted">{t("aboutPage.values.growth.body")}</p>
                    </div>
                </div>

                {/* Minimal CTA */}
                <div className="border-t border-black/10 pt-16">
                    <p className="text-2xl font-bold mb-6">{t("aboutPage.cta.title")}</p>
                    <Link
                        to="/sign-up"
                        className="inline-block px-8 py-4 bg-black text-white font-bold rounded-full hover:bg-black/80 transition-all custom-focus"
                    >
                        {t("aboutPage.cta.button")}
                    </Link>
                </div>
            </div>
        </div>
    );
}
