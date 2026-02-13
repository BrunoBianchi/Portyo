import { Link, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { FormWidget } from "~/components/bio/form-widget";

export default function FormPublicPage() {
  const { id } = useParams();

  if (!id) {
    return (
      <main className="min-h-screen bg-[#F3F3F1] flex items-center justify-center px-4">
        <div className="bg-white border-2 border-black rounded-2xl p-6 text-center">Formulário inválido.</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F3F3F1] py-10 px-4">
      <div className="w-full max-w-2xl mx-auto space-y-4">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>

        <div className="bg-white border-2 border-black rounded-2xl p-4 md:p-6">
          <FormWidget formId={id} bioId="" backgroundColor="#ffffff" textColor="#1f2937" />
        </div>
      </div>
    </main>
  );
}
