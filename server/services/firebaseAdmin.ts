import admin from 'firebase-admin';


// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  // For production, use service account key
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
    });
  } else {
    // For development, you can use application default credentials
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
    });
  }
}

export const adminAuth = admin.auth();

export const adminFirestore = admin.firestore();
export const adminStorage = admin.storage();


export class FirebaseAdminService {
  async verifyToken(idToken: string) {
    try {
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      console.error('Error verifying Firebase token:', error);
      throw error;
    }
  }

  async createCustomToken(uid: string) {
    try {
      const customToken = await adminAuth.createCustomToken(uid);
      return customToken;
    } catch (error) {
      console.error('Error creating custom token:', error);
      throw error;
    }
  }

  async createUser(userData: {
    email: string;
    password: string;
    displayName: string;
  }) {
    try {
      const userRecord = await adminAuth.createUser({
        email: userData.email,
        password: userData.password,
        displayName: userData.displayName,
      });
      return userRecord;
    } catch (error) {
      console.error('Error creating Firebase user:', error);
      throw error;
    }
  }

  async updateUser(uid: string, userData: any) {
    try {
      const userRecord = await adminAuth.updateUser(uid, userData);
      return userRecord;
    } catch (error) {
      console.error('Error updating Firebase user:', error);
      throw error;
    }
  }

  async deleteUser(uid: string) {
    try {
      await adminAuth.deleteUser(uid);
    } catch (error) {
      console.error('Error deleting Firebase user:', error);
      throw error;
    }
  }

  async saveDocumentMetadata(documentId: string, metadata: any) {
    try {
      await adminFirestore.collection('documents').doc(documentId).set({
        ...metadata,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error('Error saving document metadata:', error);
      throw error;
    }
  }

  async getDocumentMetadata(documentId: string) {
    try {
      const doc = await adminFirestore.collection('documents').doc(documentId).get();
      return doc.exists ? doc.data() : null;
    } catch (error) {
      console.error('Error getting document metadata:', error);
      throw error;
    }
  }

  async getUserDocuments(userId: string) {
    try {
      const snapshot = await adminFirestore
        .collection('documents')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error getting user documents:', error);
      throw error;
    }
  }

  async createDeadline(deadlineData: any) {
    try {
      const docRef = await adminFirestore.collection('deadlines').add({
        ...deadlineData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating deadline:', error);
      throw error;
    }
  }

  async getDeadlines(userId?: string) {
    try {
      let query = adminFirestore.collection('deadlines') as any;
      
      if (userId) {
        query = query.where('userId', '==', userId);
      }
      
      const snapshot = await query.orderBy('dueDate', 'asc').get();
      
      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error getting deadlines:', error);
      throw error;
    }
  }

  async createNotification(notificationData: any) {
    try {
      const docRef = await adminFirestore.collection('notifications').add({
        ...notificationData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        isRead: false,
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async getUserNotifications(userId: string) {
    try {
      const snapshot = await adminFirestore
        .collection('notifications')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  async markNotificationAsRead(notificationId: string) {
    try {
      await adminFirestore.collection('notifications').doc(notificationId).update({
        isRead: true,
        readAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async uploadFile(buffer: Buffer, filename: string, metadata?: any) {
    try {
      const bucket = adminStorage.bucket();
      const file = bucket.file(`documents/${filename}`);
      
      const stream = file.createWriteStream({
        metadata: {
          contentType: metadata?.contentType || 'application/octet-stream',
          metadata: metadata?.customMetadata || {},
        },
      });

      return new Promise((resolve, reject) => {
        stream.on('error', reject);
        stream.on('finish', async () => {
          try {
            await file.makePublic();
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
            resolve(publicUrl);
          } catch (error) {
            reject(error);
          }
        });
        stream.end(buffer);
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async deleteFile(filename: string) {
    try {
      const bucket = adminStorage.bucket();
      await bucket.file(`documents/${filename}`).delete();
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }
}

export const firebaseAdminService = new FirebaseAdminService();
