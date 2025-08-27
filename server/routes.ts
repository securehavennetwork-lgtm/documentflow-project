import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { emailService } from "./services/emailService";
import { z } from "zod";
import { insertUserSchema, insertDocumentSchema, insertDeadlineSchema, insertNotificationSchema, insertReminderSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import express from "express";

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'video/mp4', 'video/quicktime'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files statically
  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

  // Authentication & User routes
  app.post('/api/users', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get('/api/users/profile/:firebaseUid', async (req, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.params.firebaseUid);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/users/stats/:userId', async (req, res) => {
    try {
      const stats = await storage.getUserStats(req.params.userId);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/users/activity/:userId', async (req, res) => {
    try {
      const activity = await storage.getUserActivity(req.params.userId);
      res.json(activity);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch('/api/users/notification-settings', async (req, res) => {
    try {
      // TODO: Implement notification settings update
      res.json({ message: 'Settings updated successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Document routes
  app.post('/api/documents', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const { userId, documentType, originalName } = req.body;
      
      if (!userId || !documentType || !originalName) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const extension = path.extname(originalName);
      const filename = `${timestamp}-${originalName}`;

      // Save file to local storage
      const storageUrl = await storage.saveFile(req.file.buffer, filename, userId);

      // Determine file type
      let fileType = 'other';
      if (req.file.mimetype.startsWith('image/')) fileType = 'image';
      else if (req.file.mimetype.startsWith('video/')) fileType = 'video';
      else if (req.file.mimetype === 'application/pdf') fileType = 'pdf';

      const documentData = {
        userId,
        filename: storageUrl,
        originalName,
        fileType,
        documentType,
        fileSize: req.file.size,
        storageUrl,
        status: 'pending'
      };

      const document = await storage.createDocument(documentData);
      
      // Send notification
      try {
        await emailService.sendDocumentUploadNotification(userId, document);
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
      }
      
      res.json(document);
    } catch (error: any) {
      console.error('Document upload error:', error);
      res.status(400).json({ message: error.message });
    }
  });

  app.get('/api/documents/:userId', async (req, res) => {
    try {
      const { search, type, status, date } = req.query;
      const documents = await storage.getUserDocuments(req.params.userId, {
        search: search as string,
        type: type as string,
        status: status as string,
        date: date as string,
      });
      res.json(documents);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/documents/recent/:userId', async (req, res) => {
    try {
      const documents = await storage.getUserDocuments(req.params.userId, { limit: 5 });
      res.json(documents);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch('/api/documents/:documentId/status', async (req, res) => {
    try {
      const { status } = req.body;
      const document = await storage.updateDocumentStatus(req.params.documentId, status);
      res.json(document);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete('/api/documents/:documentId', async (req, res) => {
    try {
      await storage.deleteDocument(req.params.documentId);
      res.json({ message: 'Document deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Deadline routes
  app.post('/api/deadlines', async (req, res) => {
    try {
      const deadlineData = insertDeadlineSchema.parse(req.body);
      const deadline = await storage.createDeadline(deadlineData);
      res.json(deadline);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get('/api/deadlines/:userId', async (req, res) => {
    try {
      const deadlines = await storage.getUserDeadlines(req.params.userId);
      res.json(deadlines);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/deadlines/upcoming/:userId', async (req, res) => {
    try {
      const deadlines = await storage.getUpcomingDeadlines(req.params.userId);
      res.json(deadlines);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch('/api/deadlines/:deadlineId', async (req, res) => {
    try {
      const updates = req.body;
      const deadline = await storage.updateDeadline(req.params.deadlineId, updates);
      res.json(deadline);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete('/api/deadlines/:deadlineId', async (req, res) => {
    try {
      await storage.deleteDeadline(req.params.deadlineId);
      res.json({ message: 'Deadline deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Notification routes
  app.post('/api/notifications', async (req, res) => {
    try {
      const notificationData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(notificationData);
      res.json(notification);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get('/api/notifications/:userId', async (req, res) => {
    try {
      const notifications = await storage.getUserNotifications(req.params.userId);
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch('/api/notifications/:notificationId/read', async (req, res) => {
    try {
      await storage.markNotificationAsRead(req.params.notificationId);
      res.json({ message: 'Notification marked as read' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete('/api/notifications/:notificationId', async (req, res) => {
    try {
      await storage.deleteNotification(req.params.notificationId);
      res.json({ message: 'Notification deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin routes
  app.get('/api/admin/stats', async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/admin/compliance-by-department', async (req, res) => {
    try {
      const compliance = await storage.getComplianceByDepartment();
      res.json(compliance);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/admin/document-types', async (req, res) => {
    try {
      const types = await storage.getDocumentTypeStats();
      res.json(types);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/admin/users-status', async (req, res) => {
    try {
      const users = await storage.getUsersWithStatus();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/admin/users', async (req, res) => {
    try {
      const { search, department } = req.query;
      const users = await storage.getAllUsers({
        search: search as string,
        department: department as string,
      });
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/admin/departments', async (req, res) => {
    try {
      const departments = await storage.getDepartments();
      res.json(departments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin document management - VER TODOS LOS DOCUMENTOS
  app.get('/api/admin/documents', async (req, res) => {
    try {
      const { search, type, status, userId } = req.query;
      const documents = await storage.getAllDocuments({
        search: search as string,
        type: type as string,
        status: status as string,
        userId: userId as string,
      });
      
      // Include user information for each document
      const documentsWithUsers = await Promise.all(
        documents.map(async (doc) => {
          const user = await storage.getUser(doc.userId);
          return {
            ...doc,
            user: user ? {
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              department: user.department
            } : null
          };
        })
      );
      
      res.json(documentsWithUsers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/admin/users', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch('/api/admin/users/:userId', async (req, res) => {
    try {
      const updates = req.body;
      const user = await storage.updateUser(req.params.userId, updates);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete('/api/admin/users/:userId', async (req, res) => {
    try {
      await storage.deleteUser(req.params.userId);
      res.json({ message: 'User deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Reminder routes
  app.get('/api/admin/reminders', async (req, res) => {
    try {
      const reminders = await storage.getAllReminders();
      res.json(reminders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/admin/reminders', async (req, res) => {
    try {
      const reminderData = insertReminderSchema.parse(req.body);
      const reminder = await storage.createReminder(reminderData);
      res.json(reminder);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch('/api/admin/reminders/:reminderId', async (req, res) => {
    try {
      const updates = req.body;
      const reminder = await storage.updateReminder(req.params.reminderId, updates);
      res.json(reminder);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete('/api/admin/reminders/:reminderId', async (req, res) => {
    try {
      await storage.deleteReminder(req.params.reminderId);
      res.json({ message: 'Reminder deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/admin/reminders/:reminderId/send', async (req, res) => {
    try {
      const reminder = await storage.getReminder(req.params.reminderId);
      if (!reminder) {
        return res.status(404).json({ message: 'Reminder not found' });
      }

      // Get the associated deadline and send reminder notifications
      const deadline = await storage.getDeadline(reminder.deadlineId);
      if (!deadline) {
        return res.status(404).json({ message: 'Associated deadline not found' });
      }
      await emailService.sendReminderNotification(reminder, deadline);
      
      res.json({ message: 'Reminder sent successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/admin/export/compliance-report', async (req, res) => {
    try {
      // TODO: Generate and export compliance report
      res.json({ message: 'Report export feature coming soon' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}