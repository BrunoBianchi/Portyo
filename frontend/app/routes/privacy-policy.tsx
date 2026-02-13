import type { MetaFunction } from "react-router";
import { useTranslation } from "react-i18next";
import i18n from "~/i18n";

export const meta: MetaFunction = ({ params }) => {
    const lang = params?.lang === "pt" ? "pt" : "en";
    return [
        { title: i18n.t("meta.privacyPolicy.title", { lng: lang }) },
        { name: "description", content: i18n.t("meta.privacyPolicy.description", { lng: lang }) },
    ];
};

export default function PrivacyPolicy() {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-surface-alt flex flex-col font-sans text-text-main selection:bg-primary selection:text-black">

            <main className="flex-1 w-full max-w-3xl mx-auto px-6 pt-32 pb-24 md:pt-40 md:pb-32">
                <header className="mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">{t("privacyPage.title")}</h1>
                    <p className="text-lg text-text-muted">{t("privacyPage.updated")}</p>
                </header>

                <div className="prose prose-lg prose-neutral max-w-none text-text-secondary space-y-12">
                    <section className="rounded-2xl border border-black/10 bg-white p-6">
                        <h2 className="text-2xl font-bold text-text-main mb-4">Checklist para uso público (Instagram/Facebook OAuth)</h2>
                        <p className="mb-4">
                            O app está funcional para desenvolvimento, mas precisa dos ajustes abaixo para operação pública:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>
                                <strong>Criar página de privacidade:</strong> Disponibilizar em <a href="https://portyo.me/privacy" className="text-primary hover:underline">https://portyo.me/privacy</a>
                            </li>
                            <li>
                                <strong>Adicionar usuários de teste:</strong> Em <em>Funções do app &gt; Usuários de teste</em>
                            </li>
                            <li>
                                <strong>Testar todas as funcionalidades</strong> com contas de teste
                            </li>
                            <li>
                                <strong>Submeter para App Review</strong> quando estiver pronto para usuários reais
                            </li>
                        </ul>
                        <p className="mt-4">
                            <strong>Importante:</strong> Continue usando a API do Instagram que já está no app, mas garanta que as contas que vão conectar/login sejam do tipo <strong>Business</strong> ou <strong>Creator</strong>.
                        </p>
                        <p className="mt-4">O app está funcional para desenvolvimento, mas precisará dos ajustes acima para uso público. 🎉</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-main mb-4">{t("privacyPage.sections.introduction.title")}</h2>
                        <p>
                            {t("privacyPage.sections.introduction.body")}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-main mb-4">{t("privacyPage.sections.collection.title")}</h2>
                        <p className="mb-4">{t("privacyPage.sections.collection.intro")}</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>{t("privacyPage.sections.collection.items.personal.label")}</strong> {t("privacyPage.sections.collection.items.personal.body")}</li>
                            <li><strong>{t("privacyPage.sections.collection.items.payment.label")}</strong> {t("privacyPage.sections.collection.items.payment.body")}</li>
                            <li><strong>{t("privacyPage.sections.collection.items.usage.label")}</strong> {t("privacyPage.sections.collection.items.usage.body")}</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-main mb-4">{t("privacyPage.sections.usage.title")}</h2>
                        <p>{t("privacyPage.sections.usage.intro")}</p>
                        <ul className="list-disc pl-6 space-y-2 mt-4">
                            <li>{t("privacyPage.sections.usage.items.provide")}</li>
                            <li>{t("privacyPage.sections.usage.items.process")}</li>
                            <li>{t("privacyPage.sections.usage.items.improve")}</li>
                            <li>{t("privacyPage.sections.usage.items.communicate")}</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-main mb-4">{t("privacyPage.sections.sharing.title")}</h2>
                        <p>
                            {t("privacyPage.sections.sharing.body")}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-main mb-4">{t("privacyPage.sections.security.title")}</h2>
                        <p>
                            {t("privacyPage.sections.security.body")}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-main mb-4">{t("privacyPage.sections.rights.title")}</h2>
                        <p>
                            {t("privacyPage.sections.rights.body")}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-main mb-4">{t("privacyPage.sections.contact.title")}</h2>
                        <p>
                            {t("privacyPage.sections.contact.bodyPrefix")} <a href="mailto:support@portyo.me" className="text-primary hover:underline">support@portyo.me</a>
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}
