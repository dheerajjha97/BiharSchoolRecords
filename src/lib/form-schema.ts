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
  classSelection: z.enum(["9", "11-arts"], { required_error: "Please select a class." }),
});

const studentDetailsSchema = z.object({
    studentPhoto: fileSchema,
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
    village: z.string().min(1, "Village/Town is required."),
    post: z.string().min(1, "Post office is required."),
    block: z.string().min(1, "Block is required."),
    district: z.string().min(1, "District is required."),
    ps: z.string().min(1, "Police station is required."),
    pin: z.string().regex(/^\d{6}$/, "Please enter a valid 6-digit PIN code."),
    area: z.enum(["rural", "urban"], { required_error: "Please select an area." }),
});

const bankDetailsSchema = z.object({
    accountNo: z.string().min(1, "Bank account number is required."),
    ifsc: z.string().min(1, "IFSC code is required."),
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

const subjectDetailsBaseSchema = z.object({
    matricBoard: z.string().min(1, "Board name is required"),
    matricBoardCode: z.string().min(1, "Board code is required"),
    matricRollNo: z.string().min(1, "Roll number is required"),
    matricRegNo: z.string().min(1, "Registration number is required"),
    matricPassingYear: z.string().min(4, "Passing year is required").max(4),
    medium: z.enum(["hindi", "english"], { required_error: "Please select a medium." }),
});

const class11SubjectSchema = subjectDetailsBaseSchema.extend({
    compulsoryGroup1: z.string({ required_error: "Please select a subject from Group 1." }),
    compulsoryGroup2: z.string({ required_error: "Please select a subject from Group 2." }),
    electives: z.array(z.string()).min(3, "Please select exactly 3 elective subjects.").max(3, "Please select exactly 3 elective subjects."),
    optionalSubject: z.string().optional(),
    studentSignatureEn: fileSchema,
    studentSignatureHi: fileSchema,
    parentSignature: fileSchema,
});


export const formSchema = z.object({
    admissionDetails: admissionDetailsSchema,
    studentDetails: studentDetailsSchema,
    contactDetails: contactDetailsSchema,
    addressDetails: addressDetailsSchema,
    bankDetails: bankDetailsSchema,
    otherDetails: otherDetailsSchema,
    prevSchoolDetails: prevSchoolDetailsSchema,
    subjectDetails: z.union([class11SubjectSchema, subjectDetailsBaseSchema.optional()]),
}).superRefine((data, ctx) => {
    if (data.studentDetails.isDifferentlyAbled && !data.studentDetails.disabilityDetails) {
        ctx.addIssue({
            code: "custom",
            message: "Please specify the disability.",
            path: ["studentDetails.disabilityDetails"],
        });
    }
    if (data.admissionDetails.classSelection === "11-arts") {
        const subjectDetails = data.subjectDetails as z.infer<typeof class11SubjectSchema>;
        if(!subjectDetails) {
             ctx.addIssue({ code: "custom", message: "Subject details are required for Class 11", path: ["subjectDetails"] });
             return;
        }
        if (subjectDetails.compulsoryGroup1 && subjectDetails.compulsoryGroup1 === subjectDetails.compulsoryGroup2) {
            ctx.addIssue({
                code: "custom",
                message: "Group 2 subject must be different from Group 1.",
                path: ["subjectDetails.compulsoryGroup2"],
            });
        }
    }
});

export type FormValues = z.infer<typeof formSchema>;
