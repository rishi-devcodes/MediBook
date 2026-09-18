"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  X,
  SearchX,
  AlertCircle,
} from "lucide-react";
import type { Doctor, Specialty } from "@/types/doctor";
import { DoctorCard } from "@/components/doctors/DoctorCard";
import { DoctorCardSkeleton } from "@/components/doctors/DoctorCardSkeleton";
import { DoctorFilters } from "@/components/doctors/DoctorFilters";
import { SPECIALTIES } from "@/lib/constants";

interface DoctorsListClientProps {
  initialQuery: string;
  initialSpecialty: Specialty | null;
}

export function DoctorsListClient({
  initialQuery,
  initialSpecialty,
}: DoctorsListClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialQuery);

  const [selectedSpecialties, setSelectedSpecialties] = useState<
    Specialty[]
  >(initialSpecialty ? [initialSpecialty] : []);

  const [availableOnly, setAvailableOnly] = useState(false);
  const [feeRangeId, setFeeRangeId] = useState("any");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [results, setResults] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  const activeFilterCount = useMemo(() => {
    return (
      selectedSpecialties.length +
      (availableOnly ? 1 : 0) +
      (feeRangeId !== "any" ? 1 : 0)
    );
  }, [selectedSpecialties, availableOnly, feeRangeId]);

  // Keep the browser URL synchronized with the current filters.
  useEffect(() => {
    const params = new URLSearchParams();

    if (query.trim()) {
      params.set("query", query.trim());
    }

    selectedSpecialties.forEach((specialty) => {
      params.append("specialty", specialty);
    });

    if (availableOnly) {
      params.set("availableOnly", "true");
    }

    if (feeRangeId !== "any") {
      params.set("feeRangeId", feeRangeId);
    }

    const nextUrl = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;

    const currentUrl = searchParams.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;

    if (nextUrl !== currentUrl) {
      router.replace(nextUrl, { scroll: false });
    }
  }, [
    query,
    selectedSpecialties,
    availableOnly,
    feeRangeId,
    pathname,
    router,
    searchParams,
  ]);

  // Fetch doctors whenever filters change.
  useEffect(() => {
    const controller = new AbortController();

    const params = new URLSearchParams();

    if (query.trim()) {
      params.set("query", query.trim());
    }

    selectedSpecialties.forEach((specialty) => {
      params.append("specialty", specialty);
    });

    if (availableOnly) {
      params.set("availableOnly", "true");
    }

    if (feeRangeId !== "any") {
      params.set("feeRangeId", feeRangeId);
    }

    setLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/doctors?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error ?? "Failed to load doctors.");
        }

        const data = await res.json();
        setResults(data.doctors ?? []);
      } catch (err) {
        if (
          err instanceof DOMException &&
          err.name === "AbortError"
        ) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load doctors."
        );
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [
    query,
    selectedSpecialties,
    availableOnly,
    feeRangeId,
    retryToken,
  ]);

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

  function retry() {
    setRetryToken((token) => token + 1);
  }

  const filterProps = {
    selectedSpecialties,
    onToggleSpecialty: toggleSpecialty,
    availableOnly,
    onToggleAvailableOnly: () =>
      setAvailableOnly((value) => !value),
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
        {/* Search + mobile filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-border-strong bg-surface px-3.5 py-2.5">
            <Search className="h-4 w-4 shrink-0 text-ink-faint" />

            <input
              type="text"
              value={query}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setQuery(e.target.value)
              }
              placeholder="Search by doctor name or specialty"
              className="w-full bg-transparent text-[15px] text-ink placeholder:text-ink-faint focus:outline-none"
              aria-label="Search doctors by name or specialty"
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="text-ink-faint transition-colors hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border-strong px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-muted lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-500 px-1.5 text-xs font-semibold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Result count */}
        <p className="text-sm text-ink-muted">
          {loading
            ? "Searching…"
            : error
              ? "Something went wrong"
              : `${results.length} doctor${
                  results.length === 1 ? "" : "s"
                } found`}
        </p>

        {/* Loading */}
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <DoctorCardSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          /* Error */
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-20 text-center">
            <AlertCircle className="h-8 w-8 text-danger" />

            <p className="text-base font-medium text-ink">
              Couldn&apos;t load doctors
            </p>

            <p className="max-w-sm text-sm text-ink-muted">
              {error}
            </p>

            <button
              type="button"
              onClick={retry}
              className="mt-2 inline-flex h-10 items-center justify-center rounded-lg bg-primary-500 px-4 text-sm font-medium text-white transition-colors hover:bg-primary-600"
            >
              Try again
            </button>
          </div>
        ) : results.length === 0 ? (
          /* Empty */
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-20 text-center">
            <SearchX className="h-8 w-8 text-ink-faint" />

            <p className="text-base font-medium text-ink">
              No doctors match your filters
            </p>

            <p className="max-w-sm text-sm text-ink-muted">
              Try a different search term or clear your filters
              to see more doctors.
            </p>

            <button
              type="button"
              onClick={clearAll}
              className="mt-2 inline-flex h-10 items-center justify-center rounded-lg bg-primary-500 px-4 text-sm font-medium text-white transition-colors hover:bg-primary-600"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          /* Results */
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
              <h2 className="text-base font-semibold text-ink">
                Filters
              </h2>

              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
                className="text-ink-faint transition-colors hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <DoctorFilters {...filterProps} />

            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="mt-auto inline-flex h-11 items-center justify-center rounded-lg bg-primary-500 text-sm font-medium text-white transition-colors hover:bg-primary-600"
            >
              View results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}