
export interface FeeHead {
  id: number;
  name_en: string;
  name_hi: string;
  class9: number;
  class10: number;
  class11ac: number; // Arts & Commerce
  class11s: number;  // Science
  class12ac: number; // Arts & Commerce
  class12s: number;  // Science
}

// This now serves as the default/fallback structure.
// The primary source of truth will be the Firestore database.
export const DEFAULT_FEE_STRUCTURE: FeeHead[] = [
  // Student Fund
  { id: 1, name_en: "Admission Fee", name_hi: "प्रवेश शुल्क", class9: 50, class10: 50, class11ac: 50, class11s: 50, class12ac: 50, class12s: 50 },
  { id: 2, name_en: "Tuition Fee", name_hi: "शिक्षण शुल्क", class9: 240, class10: 240, class11ac: 240, class11s: 240, class12ac: 240, class12s: 240 },
  { id: 3, name_en: "Development Fee", name_hi: "विकास शुल्क", class9: 480, class10: 480, class11ac: 480, class11s: 480, class12ac: 480, class12s: 480 },
  { id: 4, name_en: "Transfer Fee", name_hi: "स्थानांतरण शुल्क", class9: 100, class10: 100, class11ac: 100, class11s: 100, class12ac: 100, class12s: 100 },

  // Development Fund
  { id: 5, name_en: "Science Fee", name_hi: "विज्ञान शुल्क", class9: 0, class10: 0, class11ac: 0, class11s: 20, class12ac: 0, class12s: 20 },
  { id: 6, name_en: "Absence Fee", name_hi: "अनुपस्थिति शुल्क", class9: 0, class10: 0, class11ac: 0, class11s: 0, class12ac: 0, class12s: 0 },
  { id: 7, name_en: "Late Fine", name_hi: "विलंब दंड शुल्क", class9: 0, class10: 0, class11ac: 0, class11s: 0, class12ac: 0, class12s: 0 },
  { id: 8, name_en: "Migration Fee", name_hi: "पलायन शुल्क", class9: 0, class10: 0, class11ac: 0, class11s: 0, class12ac: 0, class12s: 0 },
  { id: 9, name_en: "Re-admission Fee", name_hi: "पुन: प्रवेश शुल्क", class9: 0, class10: 0, class11ac: 0, class11s: 0, class12ac: 0, class12s: 0 },
  { id: 10, name_en: "Sports Fee", name_hi: "क्रीड़ा शुल्क", class9: 40, class10: 40, class11ac: 40, class11s: 40, class12ac: 40, class12s: 40 },
  { id: 11, name_en: "Entertainment Fee", name_hi: "मनोरंजन शुल्क", class9: 0, class10: 0, class11ac: 0, class11s: 0, class12ac: 0, class12s: 0 },
  { id: 12, name_en: "Poor Student Fund", name_hi: "निर्धन छात्रा कोश", class9: 10, class10: 10, class11ac: 10, class11s: 10, class12ac: 10, class12s: 10 },
  { id: 13, name_en: "Electricity Fee", name_hi: "विद्युत शुल्क", class9: 20, class10: 20, class11ac: 20, class11s: 20, class12ac: 20, class12s: 20 },
  { id: 14, name_en: "Library Fee", name_hi: "पुस्तकालय शुल्क", class9: 10, class10: 10, class11ac: 10, class11s: 10, class12ac: 10, class12s: 10 },
  { id: 15, name_en: "Maintenance Fee", name_hi: "विद्यालय रख-रखाव शुल्क", class9: 20, class10: 20, class11ac: 20, class11s: 20, class12ac: 20, class12s: 20 },
  { id: 16, name_en: "Balchar / Scout Fee", name_hi: "बालचर/स्काउट शुल्क", class9: 0, class10: 0, class11ac: 0, class11s: 0, class12ac: 0, class12s: 0 },
  { id: 17, name_en: "Miscellaneous Fee", name_hi: "विविध शुल्क", class9: 0, class10: 0, class11ac: 0, class11s: 0, class12ac: 0, class12s: 0 },
  { id: 18, name_en: "Exam Fee", name_hi: "परीक्षा शुल्क", class9: 150, class10: 150, class11ac: 150, class11s: 150, class12ac: 150, class12s: 150 },
  { id: 19, name_en: "Form / Prospectus Fee", name_hi: "फॉर्म/प्रॉस्पेक्टस शुल्क", class9: 0, class10: 0, class11ac: 0, class11s: 0, class12ac: 0, class12s: 0 },
  { id: 20, name_en: "ID Card Fee", name_hi: "पहचान पत्र शुल्क", class9: 20, class10: 20, class11ac: 20, class11s: 20, class12ac: 20, class12s: 20 },
];

// For quick lookup
export const FEE_HEADS_MAP = new Map(DEFAULT_FEE_STRUCTURE.map(item => [item.id, item]));
