
export interface School {
    name: string;
    address: string;
    udise: string;
}

// In a real application, this would be an API call to a central database.
// For this prototype, we'll use a hardcoded list of schools.
const MOCK_SCHOOL_DATABASE: { [key: string]: School } = {
    "10070100101": {
        udise: "10070100101",
        name: "उच्च माध्यमिक विद्यालय बेरुआ",
        address: "ग्राम –चोरनियां, पोस्ट – चिरैला, प्रखंड –गायघाट, जिला –मुजफ्फरपुर",
    },
    "27270801804": {
        udise: "27270801804",
        name: "राजकीय आदर्श संस्कृति वरिष्ठ माध्यमिक विद्यालय",
        address: "मॉडल टाउन, अम्बाला शहर, हरियाणा"
    },
    "10141201505": {
        udise: "10141201505",
        name: "उत्क्रमित मध्य विद्यालय बेलहिया",
        address: "बेलहिया, कांटी, मुजफ्फरपुर, बिहार",
    }
};

/**
 * Fetches school data by UDISE code.
 * This is a mock function that simulates a network request.
 * @param udise The 11-digit UDISE code of the school.
 * @returns A Promise that resolves to the School data or null if not found.
 */
export const getSchoolByUdise = async (udise: string): Promise<School | null> => {
    console.log(`Searching for UDISE code: ${udise}`);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (MOCK_SCHOOL_DATABASE[udise]) {
        console.log("School found:", MOCK_SCHOOL_DATABASE[udise]);
        return MOCK_SCHOOL_DATABASE[udise];
    }

    console.log("School not found.");
    return null;
};
