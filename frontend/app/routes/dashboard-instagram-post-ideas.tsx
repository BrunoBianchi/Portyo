import { useContext, useEffect, useState } from "react";
import type { MetaFunction } from "react-router";
import { AuthorizationGuard } from "~/contexts/guard.context";
import BioContext from "~/contexts/bio.context";
import AuthContext from "~/contexts/auth.context";
import { getInstagramPostIdeas, type InstagramPostIdea } from "~/services/instagram-tools.service";
import { Loader2, RefreshCcw, Sparkles, Hash } from "lucide-react";
import { toast } from "react-hot-toast";

export const meta: MetaFunction = () => {
  return [
    { title: "Instagram post ideas | Portyo" },
    { name: "description", content: "Generate strategic Instagram post ideas quickly." },
  ];
};

export default function DashboardInstagramPostIdeas() {
  const { bio } = useContext(BioContext);
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<InstagramPostIdea[]>([]);
  const [count, setCount] = useState(5);
  const [maxCount, setMaxCount] = useState(5);
  const [marketResearch, setMarketResearch] = useState<{
    searchedTerms: string[];
    similarProfiles: Array<{
      username: string;
      sampleSize: number;
      topKeywords: string[];
      postingSignals: string[];
    }>;
    benchmarkInsights: string[];
  } | null>(null);

  const loadIdeas = async () => {
    if (!bio?.id) return;
    setLoading(true);
    try {
      const response = await getInstagramPostIdeas(bio.id, count);
      setIdeas(response.ideas || []);
      setCount(response.count);
      setMaxCount(response.maxCount);
      setMarketResearch(response.marketResearch || null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to generate post ideas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bio?.id) {
      loadIdeas();
    }
  }, [bio?.id]);

  return (
    <AuthorizationGuard>
      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
        <header className="bg-white rounded-[20px] border-4 border-black p-5 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h1 className="text-2xl sm:text-4xl font-black text-[#1A1A1A] tracking-tighter uppercase" style={{ fontFamily: "var(--font-display)" }}>
            Instagram post ideas
          </h1>
          <p className="text-sm sm:text-base text-gray-600 font-medium mt-2">
            Generate SEO/GEO/AEO-ready post ideas for your Instagram and linked content strategy.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="px-2 py-1 rounded-full border border-black bg-white">Plan: {(user?.plan || "free").toUpperCase()}</span>
            <span className="px-2 py-1 rounded-full border border-black bg-white">Max ideas/request: {maxCount}</span>
          </div>
        </header>

        <section className="bg-white rounded-[20px] border-4 border-black p-5 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">How many ideas</label>
              <input
                type="number"
                min={1}
                max={maxCount}
                value={count}
                onChange={(event) => setCount(Math.max(1, Math.min(maxCount, Number(event.target.value) || 1)))}
                className="mt-1 w-32 px-3 py-2 border-2 border-black rounded-xl font-bold"
              />
            </div>
            <button
              onClick={loadIdeas}
              disabled={loading}
              className="px-4 py-2 rounded-xl border-2 border-black font-black bg-[#C6F035]"
            >
              <span className="inline-flex items-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
                Regenerate
              </span>
            </button>
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              Generating ideas and checking similar profiles on the internet...
            </div>
          ) : ideas.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed rounded-2xl text-gray-500">
              <Sparkles className="w-6 h-6 mx-auto mb-2" />
              No ideas generated yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ideas.map((idea, index) => (
                <article key={`${idea.title}-${index}`} className="rounded-2xl border-2 border-black p-4 bg-gray-50">
                  <p className="text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Idea #{index + 1}</p>
                  <h3 className="text-base font-black text-[#1A1A1A]">{idea.title}</h3>
                  <p className="text-sm text-gray-600 mt-2">{idea.angle}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(idea.keywords || []).map((keyword) => (
                      <span key={keyword} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border border-black bg-white">
                        <Hash className="w-3 h-3" />
                        {keyword}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}

          {marketResearch && (
            <section className="pt-2 space-y-4">
              <h2 className="text-lg font-black text-[#1A1A1A]">Benchmark from similar profiles</h2>

              {marketResearch.similarProfiles.length === 0 ? (
                <p className="text-sm text-gray-500">No similar public profiles were identified in this run.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {marketResearch.similarProfiles.map((profile) => (
                    <article key={profile.username} className="rounded-2xl border-2 border-black p-4 bg-white">
                      <div className="flex items-center justify-between">
                        <p className="font-black text-[#1A1A1A]">@{profile.username}</p>
                        <span className="text-xs font-bold border border-black rounded-full px-2 py-0.5">sample: {profile.sampleSize}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {profile.topKeywords.slice(0, 6).map((keyword) => (
                          <span key={`${profile.username}-${keyword}`} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border border-black bg-gray-50">
                            <Hash className="w-3 h-3" />
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {marketResearch.benchmarkInsights.length > 0 && (
                <div className="rounded-2xl border-2 border-black p-4 bg-[#F7FCEC]">
                  <p className="text-sm font-black mb-2">What seems to be working:</p>
                  <ul className="space-y-1 text-sm text-[#1A1A1A] list-disc list-inside">
                    {marketResearch.benchmarkInsights.map((insight) => (
                      <li key={insight}>{insight}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}
        </section>
      </div>
    </AuthorizationGuard>
  );
}
