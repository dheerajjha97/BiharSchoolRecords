# **App Name**: EduAssist Forms

## Core Features:

- Admission Data Entry: Admission Form: Capture student details, class selection (9 or 11-Arts), personal information (name, DOB, gender, caste, religion, address, contact info), and previous school details. All data saved locally.
- Subject Selection Input: Subject Selection Form: Dynamically display required fields (Matric details) and Class 11 Arts-specific subject choices. Supports multiple compulsory and elective subject selection
- Admission Number Generator: Auto-generate a unique admission number upon form creation.
- PDF Formatter: PDF Generator tool: Generate print-ready PDFs of both forms in a layout matching the provided samples, store it to cloud storage, if there is network connection, otherwise, wait to connect to the internet to upload the files.
- Data Persistence: Save submitted form data to Firebase Realtime Database or Firestore and also store locally via RoomDB for offline availability.
- Admin Authentication: User authentication via email/password for admin access to manage submitted forms.

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) to convey trust and stability in an educational context.
- Background color: Very light blue (#E8EAF6), nearly white to keep focus on form content.
- Accent color: Orange (#FF9800) to highlight important actions or form elements and create an engaging experience.
- Body and headline font: 'PT Sans', a humanist sans-serif for readability and a modern look, used both for headings and body text
- Use clear, simple icons to represent form sections and actions. Employ a consistent style throughout the application.
- Maintain a clean and responsive form layout that adapts well to different screen sizes. Ensure consistent spacing and alignment.