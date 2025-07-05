import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const fileSchema = z
  .any()
  .refine((file) => file, "Image is required.")
  .refine((file) => file?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
  .refine(
    (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
    ".jpg, .jpeg, .png and .webp files are accepted."
  )
  .optional()
  .nullable();


const admissionDetailsSchema = z.object({
  admissionNumber: z.string(),
  admissionDate: z.date({ required_error: "Admission date is required." }),
  classSelection: z.enum(["9", "11-arts", "11-science", "11-commerce"], { required_error: "Please select a class/stream." }),
});

const studentDetailsSchema = z.object({
    studentPhoto: fileSchema.refine((file) => file, "Student photo is required."),
    nameEn: z.string().min(1, "Student's name is required"),
    nameHi: z.string().min(1, "Student's name in Hindi is required"),
    motherNameEn: z.string().min(1, "Mother's name is required"),
    motherNameHi: z.string().min(1, "Mother's name in Hindi is required"),
    fatherNameEn: z.string().min(1, "Father's name is required"),
    fatherNameHi: z.string().min(1, "Father's name in Hindi is required"),
    dob: z.date({ required_error: "Date of birth is required." }),
    gender: z.enum(["male", "female"], { required_error: "Please select a gender." }),
    caste: z.enum(["gen", "ebc", "bc", "sc", "st"], { required_error: "Please select a caste." }),
    nationality: z.enum(["indian", "other"], { required_error: "Please select nationality." }),
    isDifferentlyAbled: z.boolean(),
    disabilityDetails: z.string().optional(),
    religion: z.enum(["hindu", "islam", "sikh", "jain", "buddhism", "christ", "other"], { required_error: "Please select a religion." }),
    maritalStatus: z.enum(["married", "unmarried"], { required_error: "Please select marital status." }),
});

const contactDetailsSchema = z.object({
    mobileNumber: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit mobile number."),
    emailId: z.string().email("Please enter a valid email address."),
    aadharNumber: z.string().regex(/^\d{12}$/, "Please enter a valid 12-digit Aadhar number."),
});

const addressDetailsSchema = z.object({
    pin: z.string().regex(/^\d{6}$/, "Please enter a valid 6-digit PIN code."),
    area: z.enum(["rural", "urban"], { required_error: "Please select an area." }),
    district: z.string().min(1, "District is required."),
    block: z.string().min(1, "Block is required."),
    village: z.string().min(1, "Village/Town is required."),
    post: z.string().min(1, "Post office is required."),
    ps: z.string().min(1, "Police station is required."),
});

const bankDetailsSchema = z.object({
    accountNo: z.string().min(1, "Bank account number is required."),
    ifsc: z.string().min(1, "IFSC code is required.").length(11, "IFSC code must be 11 characters."),
    bankName: z.string().min(1, "Bank name is required."),
    branch: z.string().min(1, "Branch name is required."),
});

const otherDetailsSchema = z.object({
    identificationMark1: z.string().min(1, "At least one identification mark is required."),
    identificationMark2: z.string().optional(),
});

const prevSchoolDetailsSchema = z.object({
    schoolName: z.string().optional(),
    slcNo: z.string().optional(),
    certIssueDate: z.date().optional(),
    lastClassStudied: z.string().optional(),
});

const subjectDetailsSchema = z.object({
    // Class 11 Fields
    matricBoard: z.string().optional(),
    matricBoardCode: z.string().optional(),
    matricRollNo: z.string().optional(),
    matricRegNo: z.string().optional(),
    matricPassingYear: z.string().optional(),
    medium: z.enum(["hindi", "english"]).optional(),
    compulsoryGroup1: z.string().optional(),
    compulsoryGroup2: z.string().optional(),
    electives: z.array(z.string()).optional(),
    optionalSubject: z.string().optional(),
    studentSignatureEn: fileSchema.optional().nullable(),
    studentSignatureHi: fileSchema.optional().nullable(),
    parentSignature: fileSchema.optional().nullable(),
    // Class 9 Fields
    mil: z.enum(["hindi", "urdu"]).optional(),
});


export const formSchema = z.object({
    admissionDetails: admissionDetailsSchema,
    studentDetails: studentDetailsSchema,
    contactDetails: contactDetailsSchema,
    addressDetails: addressDetailsSchema,
    bankDetails: bankDetailsSchema,
    otherDetails: otherDetailsSchema,
    prevSchoolDetails: prevSchoolDetailsSchema,
    subjectDetails: subjectDetailsSchema.optional(),
}).superRefine((data, ctx) => {
    if (data.studentDetails.isDifferentlyAbled && !data.studentDetails.disabilityDetails) {
        ctx.addIssue({
            code: "custom",
            message: "Please specify the disability.",
            path: ["studentDetails.disabilityDetails"],
        });
    }

    if (data.admissionDetails.classSelection?.startsWith("11-")) {
        const class11Schema = z.object({
            matricBoard: z.string().min(1, "Board name is required"),
            matricBoardCode: z.string().min(1, "Board code is required"),
            matricRollNo: z.string().min(1, "Roll number is required"),
            matricRegNo: z.string().min(1, "Registration number is required"),
            matricPassingYear: z.string().min(4, "Passing year is required").max(4),
            medium: z.enum(["hindi", "english"], { required_error: "Please select a medium." }),
            compulsoryGroup1: z.string({ required_error: "Please select a subject from Group 1." }),
            compulsoryGroup2: z.string({ required_error: "Please select a subject from Group 2." }),
            electives: z.array(z.string()).min(3, "Please select exactly 3 elective subjects.").max(3, "Please select exactly 3 elective subjects."),
            optionalSubject: z.string().optional(),
            studentSignatureEn: fileSchema.refine((file) => file, "Student's English signature is required."),
            studentSignatureHi: fileSchema.refine((file) => file, "Student's Hindi signature is required."),
            parentSignature: fileSchema.refine((file) => file, "Parent's signature is required."),
        });

        const validationResult = class11Schema.safeParse(data.subjectDetails);
        if (!validationResult.success) {
            validationResult.error.issues.forEach((issue) => {
                ctx.addIssue({
                    ...issue,
                    path: ["subjectDetails", ...issue.path],
                });
            });
        } else {
             if (validationResult.data.compulsoryGroup1 && validationResult.data.compulsoryGroup1 === validationResult.data.compulsoryGroup2) {
                ctx.addIssue({
                    code: "custom",
                    message: "Group 2 subject must be different from Group 1.",
                    path: ["subjectDetails.compulsoryGroup2"],
                });
            }
        }
    } else if (data.admissionDetails.classSelection === "9") {
        const class9Schema = z.object({
            mil: z.enum(["hindi", "urdu"], { required_error: "Please select MIL." }),
        });
        const validationResult = class9Schema.safeParse(data.subjectDetails);
        if (!validationResult.success) {
            validationResult.error.issues.forEach((issue) => {
                ctx.addIssue({ ...issue, path: ["subjectDetails", ...issue.path] });
            });
        }
    }
});

export type FormValues = z.infer<typeof formSchema>;
