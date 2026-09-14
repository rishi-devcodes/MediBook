import { SPECIALTIES, FEE_RANGES } from "@/lib/constants";
import type { Specialty } from "@/types/doctor";

interface DoctorFiltersProps {
  selectedSpecialties: Specialty[];
  onToggleSpecialty: (specialty: Specialty) => void;
  availableOnly: boolean;
  onToggleAvailableOnly: () => void;
  feeRangeId: string;
  onChangeFeeRange: (id: string) => void;
  onClearAll: () => void;
}

export function DoctorFilters({
  selectedSpecialties,
  onToggleSpecialty,
  availableOnly,
  onToggleAvailableOnly,
  feeRangeId,
  onChangeFeeRange,
  onClearAll,
}: DoctorFiltersProps) {
  const hasActiveFilters =
    selectedSpecialties.length > 0 || availableOnly || feeRangeId !== "any";

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink">Filters</h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-sm font-medium text-primary-500 hover:text-primary-600"
          >
            Clear all
          </button>
        )}
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-sm font-semibold text-ink">Specialty</legend>
        {SPECIALTIES.map((specialty) => (
          <label
            key={specialty}
            className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-muted"
          >
            <input
              type="checkbox"
              checked={selectedSpecialties.includes(specialty)}
              onChange={() => onToggleSpecialty(specialty)}
              className="h-4 w-4 rounded border-border-strong text-primary-500 focus:ring-2 focus:ring-primary-100"
            />
            {specialty}
          </label>
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-sm font-semibold text-ink">Availability</legend>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-muted">
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={onToggleAvailableOnly}
            className="h-4 w-4 rounded border-border-strong text-primary-500 focus:ring-2 focus:ring-primary-100"
          />
          Available today
        </label>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-sm font-semibold text-ink">Consultation fee</legend>
        {FEE_RANGES.map((range) => (
          <label
            key={range.id}
            className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-muted"
          >
            <input
              type="radio"
              name="feeRange"
              checked={feeRangeId === range.id}
              onChange={() => onChangeFeeRange(range.id)}
              className="h-4 w-4 border-border-strong text-primary-500 focus:ring-2 focus:ring-primary-100"
            />
            {range.label}
          </label>
        ))}
      </fieldset>
    </div>
  );
}
