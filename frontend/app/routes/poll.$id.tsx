import { useParams } from "react-router";
import { PollWidget } from "~/components/bio/poll-widget";

export default function PublicPollPage() {
  const { id } = useParams();

  if (!id) {
    return (
      <main className="min-h-screen bg-[#F3F3F1] flex items-center justify-center px-4">
        <div className="bg-white border-2 border-black rounded-2xl p-6">Enquete inválida.</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F3F3F1] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl">
        <PollWidget pollId={id} />
      </div>
    </main>
  );
}
