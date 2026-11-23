import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    ...(process.env.FIREBASE_STORAGE_BUCKET
      ? { storageBucket: process.env.FIREBASE_STORAGE_BUCKET }
      : {}),
    ...(process.env.FIREBASE_DATABASE_URL
      ? { databaseURL: process.env.FIREBASE_DATABASE_URL }
      : {}),
  });
}

export const firebaseAuth = admin.auth();

// Chỉ khởi tạo Storage khi đã có bucket.
export const firebaseBucket = process.env.FIREBASE_STORAGE_BUCKET
  ? admin.storage().bucket()
  : null;

export const firebaseMessaging = admin.messaging();

// Khởi tạo Firebase Realtime Database khi đã có cấu hình databaseURL.
export const firebaseDatabase = process.env.FIREBASE_DATABASE_URL
  ? admin.database()
  : null;
