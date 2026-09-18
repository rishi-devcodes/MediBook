"use client";

import { useRouter, useSearchParams } from "next/navigation";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function AppointmentFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentFilter = searchParams.get("filter") || "all";

  function changeFilter(filter: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (filter === "all") {
      params.delete("filter");
    } else {
      params.set("filter", filter);
    }

    const query = params.toString();

    router.push(query ? `/appointments?${query}` : "/appointments");
  }

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {FILTERS.map((filter) => {
        const active = currentFilter === filter.value;

        return (
          <button
            key={filter.value}
            type="button"
            onClick={() => changeFilter(filter.value)}
            className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
              active
                ? "border-[#1958C1] bg-[#1958C1] text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-[#1958C1] hover:text-[#1958C1]"
            }`}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}