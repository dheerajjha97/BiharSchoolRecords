'use client';

export const DebugEnvVars = () => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const envVars = {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'undefined',
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'undefined',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'undefined',
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'undefined',
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'undefined',
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'undefined',
  };

  return (
    <div className="fixed bottom-0 left-0 bg-yellow-200 text-black p-4 m-4 rounded-lg shadow-lg z-50 max-w-full overflow-x-auto border-2 border-yellow-400">
      <h3 className="font-bold text-lg">Firebase कॉन्फ़िग डीबग बॉक्स</h3>
      <p className="text-sm mb-2">
        यह बॉक्स आपको यह देखने में मदद करने के लिए है कि आपका ऐप कौन सी कॉन्फ़िगरेशन वैल्यू पढ़ रहा है। कृपया नीचे दी गई वैल्यू की तुलना अपनी <code>.env.local</code> फ़ाइल से करें।
        <br />
        अगर वैल्यू <strong>'undefined'</strong> दिख रही है या गलत है, तो कृपया अपनी फ़ाइल में स्पेलिंग जाँचें और सर्वर को रीस्टार्ट करें।
      </p>
      <pre className="text-xs bg-gray-800 text-white p-2 rounded overflow-auto">
        {JSON.stringify(envVars, null, 2)}
      </pre>
    </div>
  );
};
