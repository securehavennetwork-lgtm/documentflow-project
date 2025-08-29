import { type User, type InsertUser, type Document, type InsertDocument, type Deadline, type InsertDeadline, type Notification, type InsertNotification, type Reminder, type InsertReminder } from "@shared/schema";
import { db } from "./database";
import { users, documents, deadlines, notifications, reminders } from "@shared/schema";
import { eq, and, or, like, desc, asc, sql } from "drizzle-orm";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { supabaseStorage } from "./services/supabaseStorage";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  getAllUsers(filters?: { search?: string; department?: string }): Promise<User[]>;
  getDepartments(): Promise<string[]>;
  getUserStats(userId: string): Promise<any>;
  getUserActivity(userId: string): Promise<any[]>;
  getUsersWithStatus(): Promise<any[]>;
  getAdminStats(): Promise<any>;
  getComplianceByDepartment(): Promise<any[]>;

  // Document methods
  createDocument(document: InsertDocument): Promise<Document>;
  getUserDocuments(userId: string, filters?: any): Promise<Document[]>;
  getAllDocuments(filters?: any): Promise<Document[]>;
  getDocument(id: string): Promise<Document | undefined>;
  updateDocumentStatus(id: string, status: string): Promise<Document>;
  deleteDocument(id: string): Promise<void>;
  getDocumentTypeStats(): Promise<any[]>;

  // Deadline methods
  createDeadline(deadline: InsertDeadline): Promise<Deadline>;
  getDeadline(id: string): Promise<Deadline | undefined>;
  getUserDeadlines(userId: string): Promise<Deadline[]>;
  getUpcomingDeadlines(userId: string): Promise<Deadline[]>;
  updateDeadline(id: string, updates: Partial<Deadline>): Promise<Deadline>;
  deleteDeadline(id: string): Promise<void>;

  // Notification methods
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: string): Promise<void>;
  deleteNotification(id: string): Promise<void>;

  // Reminder methods
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  getAllReminders(): Promise<Reminder[]>;
  getReminder(id: string): Promise<Reminder | undefined>;
  updateReminder(id: string, updates: Partial<Reminder>): Promise<Reminder>;
  deleteReminder(id: string): Promise<void>;

  // File storage methods
  saveFile(buffer: Buffer, filename: string, userId: string): Promise<string>;
  deleteFile(filename: string): Promise<void>;
  getFileUrl(filename: string): string;
}

export class DatabaseStorage implements IStorage {
  private uploadsDir: string;

  constructor() {
    // Create uploads directory for file storage
    this.uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    this.ensureDirectories();
    this.initializeSupabase();
    this.initializeSampleData();
  }

  private async initializeSupabase() {
    try {
      // Test Supabase connection
      const isConnected = await supabaseStorage.testConnection();
      if (isConnected) {
        // Initialize bucket
        await supabaseStorage.initializeBucket();
        console.log('✅ Supabase Storage configurado correctamente');
      }
    } catch (error) {
      console.log('⚠️  Supabase Storage no disponible, usando almacenamiento local como respaldo');
    }
  }

  private ensureDirectories() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  private async initializeSampleData() {
    try {
      const existingUsers = await db.select().from(users).limit(1);
      if (existingUsers.length === 0) {
        // Create sample admin user
        await db.insert(users).values({
          email: "admin@documentflow.com",
          firstName: "Admin",
          lastName: "User",
          phone: "+52 55 1234 5678",
          department: "IT",
          role: "admin",
          firebaseUid: "admin-firebase-uid",
        });

        // Create sample regular user
        await db.insert(users).values({
          email: "user@documentflow.com",
          firstName: "Juan",
          lastName: "Pérez",
          phone: "+52 55 8765 4321",
          department: "Recursos Humanos",
          role: "user",
          firebaseUid: "user-firebase-uid",
        });

        console.log('✅ Sample data initialized');
      }
    } catch (error) {
      console.error('Error initializing sample data:', error);
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, username)).limit(1);
    return result[0];
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const result = await db.update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getAllUsers(filters?: { search?: string; department?: string }): Promise<User[]> {
    let query = db.select().from(users);
    
    const conditions = [];
    
    if (filters?.search) {
      const search = `%${filters.search}%`;
      conditions.push(
        or(
          like(users.firstName, search),
          like(users.lastName, search),
          like(users.email, search)
        )
      );
    }
    
    if (filters?.department && filters.department !== 'all') {
      conditions.push(eq(users.department, filters.department));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(asc(users.firstName)).execute();
  }

  async getDepartments(): Promise<string[]> {
    const result = await db.selectDistinct({ department: users.department }).from(users).execute();
    return result.map(r => r.department);
  }

  async getUserStats(userId: string): Promise<any> {
    const userDocs = await db.select().from(documents).where(eq(documents.userId, userId));
    const userDeadlines = await db.select().from(deadlines)
      .where(or(eq(deadlines.userId, userId), eq(deadlines.isGlobal, true)));
    
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return {
      uploaded: userDocs.filter(doc => doc.status === 'processed').length,
      pending: userDocs.filter(doc => doc.status === 'pending').length,
      upcoming: userDeadlines.filter(d => {
        const dueDate = new Date(d.dueDate);
        return dueDate >= now && dueDate <= weekFromNow;
      }).length,
      compliance: userDocs.length > 0 ? Math.round((userDocs.filter(doc => doc.status === 'processed').length / userDocs.length) * 100) : 0,
    };
  }

  async getUserActivity(userId: string): Promise<any[]> {
    const userDocs = await db.select().from(documents)
      .where(eq(documents.userId, userId))
      .orderBy(desc(documents.uploadedAt))
      .limit(5);
    
    return userDocs.map(doc => ({
      type: 'upload',
      title: `${doc.originalName} subido`,
      createdAt: doc.uploadedAt,
    }));
  }

  async getUsersWithStatus(): Promise<any[]> {
    const allUsers = await db.select().from(users);
    const result = [];
    
    for (const user of allUsers) {
      const userDocs = await db.select().from(documents).where(eq(documents.userId, user.id));
      const processedDocs = userDocs.filter(doc => doc.status === 'processed').length;
      const totalRequired = 10; // Assuming 10 required documents
      
      result.push({
        ...user,
        documentsUploaded: processedDocs,
        documentsRequired: totalRequired,
        documentsCount: userDocs.length,
        status: processedDocs === totalRequired ? 'complete' : processedDocs > 0 ? 'incomplete' : 'pending',
        lastActivity: userDocs.length > 0 ? userDocs[userDocs.length - 1].uploadedAt : null,
      });
    }
    
    return result;
  }

  async getAdminStats(): Promise<any> {
    const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
    const totalDocuments = await db.select({ count: sql<number>`count(*)` }).from(documents);
    const processedDocs = await db.select({ count: sql<number>`count(*)` }).from(documents)
      .where(eq(documents.status, 'processed'));
    
    const totalUsersCount = totalUsers[0].count;
    const totalDocsCount = totalDocuments[0].count;
    const processedCount = processedDocs[0].count;
    
    return {
      totalUsers: totalUsersCount,
      newUsersThisMonth: Math.floor(totalUsersCount * 0.1),
      totalDocuments: totalDocsCount,
      newDocumentsThisWeek: Math.floor(totalDocsCount * 0.05),
      compliance: totalDocsCount > 0 ? Math.round((processedCount / totalDocsCount) * 100) : 0,
      complianceChange: Math.floor(Math.random() * 10 - 5),
      overdue: Math.floor(totalDocsCount * 0.02),
    };
  }

  async getComplianceByDepartment(): Promise<any[]> {
    const departments = await this.getDepartments();
    const result = [];
    
    for (const dept of departments) {
      const deptUsers = await db.select().from(users).where(eq(users.department, dept));
      let totalDocs = 0;
      let processedDocs = 0;
      
      for (const user of deptUsers) {
        const userDocs = await db.select().from(documents).where(eq(documents.userId, user.id));
        totalDocs += userDocs.length;
        processedDocs += userDocs.filter(doc => doc.status === 'processed').length;
      }
      
      result.push({
        name: dept,
        percentage: totalDocs > 0 ? Math.round((processedDocs / totalDocs) * 100) : 0,
      });
    }
    
    return result;
  }

  // Document methods
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const result = await db.insert(documents).values(insertDocument).returning();
    return result[0];
  }

  async getUserDocuments(userId: string, filters?: any): Promise<Document[]> {
    let query = db.select().from(documents).where(eq(documents.userId, userId));
    
    const conditions = [eq(documents.userId, userId)];
    
    if (filters?.search) {
      const search = `%${filters.search}%`;
      conditions.push(
        or(
          like(documents.originalName, search),
          like(documents.documentType, search)
        ) ?? sql`1=1`
      );
    }
    
    if (filters?.type && filters.type !== 'all') {
      conditions.push(eq(documents.documentType, filters.type));
    }
    
    if (filters?.status && filters.status !== 'all') {
      conditions.push(eq(documents.status, filters.status));
    }
    
    query = db.select().from(documents).where(and(...conditions));
    
    let result = await query.orderBy(desc(documents.uploadedAt)).execute();
    
    if (filters?.limit) {
      result = result.slice(0, filters.limit);
    }
    
    return result;
  }

  async getAllDocuments(filters?: any): Promise<Document[]> {
    let query = db.select().from(documents);
    
    const conditions = [];
    
    if (filters?.search) {
      const search = `%${filters.search}%`;
      conditions.push(
        or(
          like(documents.originalName, search),
          like(documents.documentType, search)
        )
      );
    }
    
    if (filters?.type && filters.type !== 'all') {
      conditions.push(eq(documents.documentType, filters.type));
    }
    
    if (filters?.status && filters.status !== 'all') {
      conditions.push(eq(documents.status, filters.status));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(documents.uploadedAt));
  }

  async getDocument(id: string): Promise<Document | undefined> {
    const result = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
    return result[0];
  }

  async updateDocumentStatus(id: string, status: string): Promise<Document> {
    const result = await db.update(documents)
      .set({ status, processedAt: status === 'processed' ? new Date() : null })
      .where(eq(documents.id, id))
      .returning();
    return result[0];
  }

  async deleteDocument(id: string): Promise<void> {
    const doc = await this.getDocument(id);
    if (doc) {
      // Delete physical file
      try {
        await this.deleteFile(doc.filename);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
    await db.delete(documents).where(eq(documents.id, id));
  }

  async getDocumentTypeStats(): Promise<any[]> {
    const result = await db.select({
      name: documents.documentType,
      count: sql<number>`count(*)`
    })
    .from(documents)
    .groupBy(documents.documentType)
    .orderBy(desc(sql`count(*)`));
    
    return result;
  }

  // Deadline methods
  async createDeadline(insertDeadline: InsertDeadline): Promise<Deadline> {
    const result = await db.insert(deadlines).values(insertDeadline).returning();
    return result[0];
  }

  async getDeadline(id: string): Promise<Deadline | undefined> {
    const result = await db.select().from(deadlines).where(eq(deadlines.id, id)).limit(1);
    return result[0];
  }

  async getUserDeadlines(userId: string): Promise<Deadline[]> {
    return await db.select().from(deadlines)
      .where(or(eq(deadlines.userId, userId), eq(deadlines.isGlobal, true)))
      .orderBy(asc(deadlines.dueDate));
  }

  async getUpcomingDeadlines(userId: string): Promise<Deadline[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + 30);
    
    return await db.select().from(deadlines)
      .where(
        and(
          or(eq(deadlines.userId, userId), eq(deadlines.isGlobal, true)),
          sql`${deadlines.dueDate} >= ${now}`,
          sql`${deadlines.dueDate} <= ${futureDate}`
        )
      )
      .orderBy(asc(deadlines.dueDate))
      .limit(5);
  }

  async updateDeadline(id: string, updates: Partial<Deadline>): Promise<Deadline> {
    const result = await db.update(deadlines)
      .set(updates)
      .where(eq(deadlines.id, id))
      .returning();
    return result[0];
  }

  async deleteDeadline(id: string): Promise<void> {
    await db.delete(deadlines).where(eq(deadlines.id, id));
  }

  // Notification methods
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const result = await db.insert(notifications).values(insertNotification).returning();
    return result[0];
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.sentAt));
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  async deleteNotification(id: string): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, id));
  }

  // Reminder methods
  async createReminder(insertReminder: InsertReminder): Promise<Reminder> {
    const result = await db.insert(reminders).values(insertReminder).returning();
    return result[0];
  }

  async getAllReminders(): Promise<Reminder[]> {
    return await db.select().from(reminders).orderBy(desc(reminders.createdAt));
  }

  async getReminder(id: string): Promise<Reminder | undefined> {
    const result = await db.select().from(reminders).where(eq(reminders.id, id)).limit(1);
    return result[0];
  }

  async updateReminder(id: string, updates: Partial<Reminder>): Promise<Reminder> {
    const result = await db.update(reminders)
      .set(updates)
      .where(eq(reminders.id, id))
      .returning();
    return result[0];
  }

  async deleteReminder(id: string): Promise<void> {
    await db.delete(reminders).where(eq(reminders.id, id));
  }

  // File storage methods - usando Supabase Storage
  async saveFile(buffer: Buffer, filename: string, userId: string): Promise<string> {
    try {
      // Detectar tipo de contenido basado en la extensión
      const extension = filename.toLowerCase().split('.').pop();
      let contentType = 'application/octet-stream';
      
      switch (extension) {
        case 'jpg':
        case 'jpeg':
          contentType = 'image/jpeg';
          break;
        case 'png':
          contentType = 'image/png';
          break;
        case 'gif':
          contentType = 'image/gif';
          break;
        case 'pdf':
          contentType = 'application/pdf';
          break;
        case 'mp4':
          contentType = 'video/mp4';
          break;
        case 'mov':
          contentType = 'video/quicktime';
          break;
      }

      // Subir a Supabase Storage
      const supabasePath = await supabaseStorage.uploadFile(buffer, filename, userId, contentType);
      
      // Retornar la URL pública
      return supabaseStorage.getPublicUrl(supabasePath);
    } catch (error) {
      console.error('Error uploading to Supabase Storage:', error);
      // Fallback a storage local si Supabase falla
      const userDir = path.join(this.uploadsDir, userId);
      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
      }
      
      const filePath = path.join(userDir, filename);
      fs.writeFileSync(filePath, buffer);
      
      return `/uploads/${userId}/${filename}`;
    }
  }

  async deleteFile(filename: string): Promise<void> {
    try {
      // Si es una URL de Supabase, extraer el path
      if (filename.includes('supabase')) {
        const url = new URL(filename);
        const pathParts = url.pathname.split('/');
        const bucketIndex = pathParts.findIndex(part => part === 'documents');
        if (bucketIndex !== -1 && pathParts[bucketIndex + 1]) {
          const supabasePath = pathParts.slice(bucketIndex + 1).join('/');
          await supabaseStorage.deleteFile(supabasePath);
          return;
        }
      }
      
      // Fallback para archivos locales
      const parts = filename.split('/');
      if (parts.length >= 3) {
        const userId = parts[parts.length - 2];
        const fileName = parts[parts.length - 1];
        const filePath = path.join(this.uploadsDir, userId, fileName);
        
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  getFileUrl(filename: string): string {
    return filename; // Ya incluye la URL completa
  }
}

// Export storage instance - use Database storage for production
export const storage = new DatabaseStorage();