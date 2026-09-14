"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Search, SlidersHorizontal, X, SearchX } from "lucide-react";
import { doctors } from "@/lib/mock/doctors";
import { FEE_RANGES } from "@/lib/constants";
import type { Specialty } from "@/types/doctor";
import { DoctorCard } from "@/components/doctors/DoctorCard";
import { DoctorCardSkeleton } from "@/components/doctors/DoctorCardSkeleton";
import { DoctorFilters } from "@/components/doctors/DoctorFilters";

interface DoctorsListClientProps {
  initialQuery: string;
  initialSpecialty: Specialty | null;
}

export function DoctorsListClient({
  initialQuery,
  initialSpecialty,
}: DoctorsListClientProps) {
  const [query, setQuery] = useState(initialQuery);
  const [selectedSpecialties, setSelectedSpecialties] = useState<Specialty[]>(
    initialSpecialty ? [initialSpecialty] : []
  );
  const [availableOnly, setAvailableOnly] = useState(false);
  const [feeRangeId, setFeeRangeId] = useState("any");
  const [loading, setLoading] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Simulate a brief network delay whenever filters change, so the
  // loading state is visible without needing a real backend yet.
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(timer);
  }, [query, selectedSpecialties, availableOnly, feeRangeId]);

  const feeRange = FEE_RANGES.find((r) => r.id === feeRangeId) ?? FEE_RANGES[0];

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return doctors.filter((doctor) => {
      const matchesQuery =
        q.length === 0 ||
        doctor.name.toLowerCase().includes(q) ||
        doctor.specialty.toLowerCase().includes(q);

      const matchesSpecialty =
        selectedSpecialties.length === 0 ||
        selectedSpecialties.includes(doctor.specialty);

      const matchesAvailability = !availableOnly || doctor.isAvailableToday;

      const matchesFee =
        doctor.consultationFee >= feeRange.min && doctor.consultationFee <= feeRange.max;

      return matchesQuery && matchesSpecialty && matchesAvailability && matchesFee;
    });
  }, [query, selectedSpecialties, availableOnly, feeRange]);

  function toggleSpecialty(specialty: Specialty) {
    setSelectedSpecialties((prev) =>
      prev.includes(specialty)
        ? prev.filter((s) => s !== specialty)
        : [...prev, specialty]
    );
  }

  function clearAll() {
    setQuery("");
    setSelectedSpecialties([]);
    setAvailableOnly(false);
    setFeeRangeId("any");
  }

  const filterProps = {
    selectedSpecialties,
    onToggleSpecialty: toggleSpecialty,
    availableOnly,
    onToggleAvailableOnly: () => setAvailableOnly((v) => !v),
    feeRangeId,
    onChangeFeeRange: setFeeRangeId,
    onClearAll: clearAll,
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-xl border border-border bg-surface p-6">
          <DoctorFilters {...filterProps} />
        </div>
      </aside>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-border-strong bg-surface px-3.5 py-2.5">
            <Search className="h-4 w-4 shrink-0 text-ink-faint" />
            <input
              type="text"
              value={query}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
              placeholder="Search by doctor name or specialty"
              className="w-full bg-transparent text-[15px] text-ink placeholder:text-ink-faint focus:outline-none"
              aria-label="Search doctors by name or specialty"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="text-ink-faint hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border-strong px-4 text-sm font-medium text-ink lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        </div>

        <p className="text-sm text-ink-muted">
          {loading ? "Searching…" : `${results.length} doctor${results.length === 1 ? "" : "s"} found`}
        </p>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <DoctorCardSkeleton key={i} />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-20 text-center">
            <SearchX className="h-8 w-8 text-ink-faint" />
            <p className="text-base font-medium text-ink">No doctors match your filters</p>
            <p className="max-w-sm text-sm text-ink-muted">
              Try a different search term or clear your filters to see more doctors.
            </p>
            <button
              type="button"
              onClick={clearAll}
              className="mt-2 inline-flex h-10 items-center justify-center rounded-lg bg-primary-500 px-4 text-sm font-medium text-white hover:bg-primary-600"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        )}
      </div>

      {/* Mobile filters drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setMobileFiltersOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-xs flex-col gap-6 overflow-y-auto bg-surface p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-ink">Filters</h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
                className="text-ink-faint hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <DoctorFilters {...filterProps} />
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="mt-auto inline-flex h-11 items-center justify-center rounded-lg bg-primary-500 text-sm font-medium text-white hover:bg-primary-600"
            >
              Show {results.length} results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
