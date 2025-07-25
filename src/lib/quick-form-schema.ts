
import { z } from "zod";

export const quickFormSchema = z.object({
  nameEn: z.string().min(1, "Student's name is required."),
  nameHi: z.string().min(1, "Student's name in Hindi is required."),
  fatherNameEn: z.string().min(1, "Father's name is required."),
  fatherNameHi: z.string().min(1, "Father's name in Hindi is required."),
  mobileNumber: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit mobile number."),
  classSelection: z.enum(
    ["9", "10", "11-arts", "11-science", "11-commerce", "12-arts", "12-science", "12-commerce"],
    { required_error: "Please select a class/stream." }
  ),
  caste: z.enum(["gen", "ebc", "bc", "sc", "st"], { required_error: "Please select caste for fee calculation." }),
  rollNumber: z.string().min(1, "Roll number is required."),
  admissionNumber: z.string().optional(),
});

export type QuickFormValues = z.infer<typeof quickFormSchema>;
