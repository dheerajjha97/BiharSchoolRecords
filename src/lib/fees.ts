
export interface FeeHead {
  id: number;
  name_en: string;
  name_hi: string;
  class9: number;
  class11: number;
}

// This now serves as the default/fallback structure.
// The primary source of truth will be the Firestore database.
export const DEFAULT_FEE_STRUCTURE: FeeHead[] = [
  // Student Fund
  { id: 1, name_en: "Admission Fee", name_hi: "प्रवेश शुल्क", class9: 50, class11: 50 },
  { id: 2, name_en: "Tuition Fee", name_hi: "शिक्षण शुल्क", class9: 240, class11: 240 },
  { id: 3, name_en: "Development Fee", name_hi: "विकास शुल्क", class9: 480, class11: 480 },
  { id: 4, name_en: "Transfer Fee", name_hi: "स्थानांतरण शुल्क", class9: 100, class11: 100 },

  // Development Fund
  { id: 5, name_en: "Science Fee", name_hi: "विज्ञान शुल्क", class9: 0, class11: 20 },
  { id: 6, name_en: "Absence Fee", name_hi: "अनुपस्थिति शुल्क", class9: 0, class11: 0 },
  { id: 7, name_en: "Late Fine", name_hi: "विलंब दंड शुल्क", class9: 0, class11: 0 },
  { id: 8, name_en: "Migration Fee", name_hi: "पलायन शुल्क", class9: 0, class11: 0 },
  { id: 9, name_en: "Re-admission Fee", name_hi: "पुन: प्रवेश शुल्क", class9: 0, class11: 0 },
  { id: 10, name_en: "Sports Fee", name_hi: "क्रीड़ा शुल्क", class9: 40, class11: 40 },
  { id: 11, name_en: "Entertainment Fee", name_hi: "मनोरंजन शुल्क", class9: 0, class11: 0 },
  { id: 12, name_en: "Poor Student Fund", name_hi: "निर्धन छात्रा कोश", class9: 10, class11: 10 },
  { id: 13, name_en: "Electricity Fee", name_hi: "विद्युत शुल्क", class9: 20, class11: 20 },
  { id: 14, name_en: "Library Fee", name_hi: "पुस्तकालय शुल्क", class9: 10, class11: 10 },
  { id: 15, name_en: "Maintenance Fee", name_hi: "विद्यालय रख-रखाव शुल्क", class9: 20, class11: 20 },
  { id: 16, name_en: "Lab Fee", name_hi: "प्रयोगशाला शुल्क", class9: 20, class11: 20 },
  { id: 17, name_en: "Remedial Class Fee", name_hi: "अतिरिक्त कक्षा शुल्क", class9: 0, class11: 0 },
  { id: 18, name_en: "Exam Fee", name_hi: "परीक्षा शुल्क", class9: 150, class11: 150 },
  { id: 19, name_en: "Certificate Fee", name_hi: "प्रमाण पत्र शुल्क", class9: 0, class11: 0 },
  { id: 20, name_en: "ID Card Fee", name_hi: "पहचान पत्र शुल्क", class9: 20, class11: 20 },
];

// For quick lookup
export const FEE_HEADS_MAP = new Map(DEFAULT_FEE_STRUCTURE.map(item => [item.id, item]));
