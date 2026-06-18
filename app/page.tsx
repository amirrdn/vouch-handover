"use client";

import { useEffect, useState } from "react";

type HandoverItem = {
  room?: string;
  guest?: string;
  issue?: string;
  source?: string[];
  action_needed?: string;
  resolution?: string;
  note?: string;
};

type HandoverReport = {
  urgent_action_required: HandoverItem[];
  still_open: HandoverItem[];
  new_tonight: HandoverItem[];
  newly_resolved: HandoverItem[];
  flagged_for_review: HandoverItem[];
};

type SectionConfig = {
  key: keyof HandoverReport;
  title: string;
  description: string;
  className: string;
};

const SECTIONS: SectionConfig[] = [
  {
    key: "urgent_action_required",
    title: "Urgent Action Required",
    description: "Needs immediate attention this morning",
    className: "border-red-400 bg-red-50",
  },
  {
    key: "flagged_for_review",
    title: "Flagged for Review",
    description: "Conflicts or unclear data — verify before acting",
    className: "border-red-300 bg-red-50/60",
  },
  {
    key: "still_open",
    title: "Still Open",
    description: "Carried over from previous shifts",
    className: "border-amber-400 bg-amber-50",
  },
  {
    key: "new_tonight",
    title: "New Tonight",
    description: "Issues that started during the night shift",
    className: "border-orange-400 bg-orange-50",
  },
  {
    key: "newly_resolved",
    title: "Newly Resolved",
    description: "Closed out overnight — no action needed",
    className: "border-green-300 bg-gray-50",
  },
];

function ItemCard({ item }: { item: HandoverItem }) {
  const headline = [item.room, item.guest].filter(Boolean).join(" — ");
  const detail = item.issue ?? item.note ?? item.resolution;

  return (
    <li className="rounded border border-black/10 bg-white p-3 text-sm">
      {headline && <p className="font-semibold text-gray-900">{headline}</p>}
      {detail && <p className="mt-1 text-gray-700">{detail}</p>}
      {item.action_needed && (
        <p className="mt-2 font-medium text-gray-900">
          Action: {item.action_needed}
        </p>
      )}
      {item.resolution && !item.issue && (
        <p className="mt-1 text-gray-600">{item.resolution}</p>
      )}
      {item.source && item.source.length > 0 && (
        <p className="mt-2 text-xs text-gray-500">
          Source: {item.source.join(", ")}
        </p>
      )}
    </li>
  );
}

function Section({ config, items }: { config: SectionConfig; items: HandoverItem[] }) {
  return (
    <section className={`rounded-lg border-2 p-4 ${config.className}`}>
      <div className="mb-3">
        <h2 className="text-lg font-bold text-gray-900">
          {config.title}{" "}
          <span className="text-base font-normal text-gray-600">({items.length})</span>
        </h2>
        <p className="text-sm text-gray-600">{config.description}</p>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">None</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item, i) => (
            <ItemCard key={i} item={item} />
          ))}
        </ul>
      )}
    </section>
  );
}

export default function Home() {
  const [report, setReport] = useState<HandoverReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchHandover() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/handover");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            typeof data.error === "string" ? data.error : "Failed to load handover"
          );
        }

        if (!cancelled) {
          setReport({
            urgent_action_required: data.urgent_action_required ?? [],
            still_open: data.still_open ?? [],
            new_tonight: data.new_tonight ?? [],
            newly_resolved: data.newly_resolved ?? [],
            flagged_for_review: data.flagged_for_review ?? [],
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Something went wrong");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchHandover();
    return () => {
      cancelled = true;
    };
  }, []);

  const urgentCount =
    (report?.urgent_action_required.length ?? 0) +
    (report?.flagged_for_review.length ?? 0);

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <main className="mx-auto max-w-3xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Morning Handover</h1>
          <p className="mt-1 text-sm text-gray-600">
            Night shift summary for hotel managers
          </p>
        </header>

        {loading && (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-600">
            Loading handover report…
          </div>
        )}

        {error && !loading && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-6 text-red-800">
            <p className="font-semibold">Could not load handover</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        )}

        {report && !loading && !error && (
          <>
            {urgentCount > 0 && (
              <p className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-2 text-sm font-medium text-red-900">
                {urgentCount} item{urgentCount === 1 ? "" : "s"} need your attention first
              </p>
            )}

            <div className="flex flex-col gap-4">
              {SECTIONS.map((config) => (
                <Section
                  key={config.key}
                  config={config}
                  items={report[config.key]}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
