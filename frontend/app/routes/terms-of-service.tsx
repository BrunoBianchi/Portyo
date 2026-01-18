import type { MetaFunction } from "react-router";
import { useTranslation } from "react-i18next";
import i18n from "~/i18n";

export const meta: MetaFunction = ({ params }) => {
    const lang = params?.lang === "pt" ? "pt" : "en";
    return [
        { title: i18n.t("meta.termsOfService.title", { lng: lang }) },
        { name: "description", content: i18n.t("meta.termsOfService.description", { lng: lang }) },
    ];
};

export default function TermsOfService() {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-surface-alt flex flex-col font-sans text-text-main selection:bg-primary selection:text-black">

            <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-24 md:py-32">
                <header className="mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">{t("termsPage.title")}</h1>
                    <p className="text-lg text-text-muted">{t("termsPage.updated")}</p>
                </header>

                <div className="prose prose-lg prose-neutral max-w-none text-text-secondary space-y-12">
                    <section>
                        <h2 className="text-2xl font-bold text-text-main mb-4">{t("termsPage.sections.acceptance.title")}</h2>
                        <p>
                            {t("termsPage.sections.acceptance.body")}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-main mb-4">{t("termsPage.sections.accounts.title")}</h2>
                        <p>
                            {t("termsPage.sections.accounts.body")}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-main mb-4">{t("termsPage.sections.userContent.title")}</h2>
                        <p>
                            {t("termsPage.sections.userContent.body")}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-main mb-4">{t("termsPage.sections.billing.title")}</h2>
                        <p>
                            {t("termsPage.sections.billing.body")}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-main mb-4">{t("termsPage.sections.termination.title")}</h2>
                        <p>
                            {t("termsPage.sections.termination.body")}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-main mb-4">{t("termsPage.sections.changes.title")}</h2>
                        <p>
                            {t("termsPage.sections.changes.body")}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-main mb-4">{t("termsPage.sections.contact.title")}</h2>
                        <p>
                            {t("termsPage.sections.contact.bodyPrefix")} <a href="mailto:support@portyo.me" className="text-primary hover:underline">support@portyo.me</a>
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}
