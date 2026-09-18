import { z } from "zod";
import { SPECIALTIES, FEE_RANGES } from "@/lib/constants";

const specialtyEnum = z.enum(
  SPECIALTIES as [string, ...string[]]
);

const feeRangeIds = FEE_RANGES.map((range) => range.id) as [string, ...string[]];
const feeRangeEnum = z.enum(feeRangeIds);

export const doctorListQuerySchema = z.object({
  query: z.string().trim().max(100).optional(),
  specialty: z.array(specialtyEnum).optional(),
  availableOnly: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  feeRangeId: feeRangeEnum.optional(),
});

export type DoctorListQuery = z.infer<typeof doctorListQuerySchema>;