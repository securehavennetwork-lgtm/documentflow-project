import nodemailer from 'nodemailer';
import { User, Document, Reminder, Deadline } from '@shared/schema';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure nodemailer with environment variables
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
      },
    });
  }

  async sendDocumentUploadNotification(userId: string, document: Document): Promise<void> {
    try {
      // In a real implementation, you would fetch user details from database
      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@documentflow.com',
        to: 'user@example.com', // Would be fetched from user data
        subject: 'Documento subido exitosamente - DocumentFlow',
        html: this.getDocumentUploadTemplate(document),
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Document upload notification sent successfully');
    } catch (error) {
      console.error('Error sending document upload notification:', error);
      throw error;
    }
  }

  async sendReminderNotification(reminder: Reminder, deadline: Deadline): Promise<void> {
    try {
      // In a real implementation, you would determine recipients based on deadline settings
      const recipients = deadline.isGlobal 
        ? ['all-users@example.com'] // Would fetch all user emails
        : ['specific-user@example.com']; // Would fetch specific user emails

      for (const recipient of recipients) {
        const mailOptions = {
          from: process.env.FROM_EMAIL || 'noreply@documentflow.com',
          to: recipient,
          subject: `Recordatorio: ${deadline.title} - DocumentFlow`,
          html: this.getReminderTemplate(reminder, deadline),
        };

        await this.transporter.sendMail(mailOptions);
      }

      console.log('Reminder notifications sent successfully');
    } catch (error) {
      console.error('Error sending reminder notifications:', error);
      throw error;
    }
  }

  async sendDeadlineNotification(userId: string, deadline: any): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@documentflow.com',
        to: 'user@example.com', // Would be fetched from user data
        subject: `Fecha límite próxima: ${deadline.title} - DocumentFlow`,
        html: this.getDeadlineTemplate(deadline),
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Deadline notification sent successfully');
    } catch (error) {
      console.error('Error sending deadline notification:', error);
      throw error;
    }
  }

  private getDocumentUploadTemplate(document: Document): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Documento Subido - DocumentFlow</title>
          <style>
              body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #2563eb 0%, #059669 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
              .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
              .footer { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; font-size: 14px; color: #6b7280; }
              .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .document-info { background: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>🎉 Documento Subido Exitosamente</h1>
              </div>
              <div class="content">
                  <p>¡Hola!</p>
                  <p>Te confirmamos que tu documento ha sido subido exitosamente a DocumentFlow.</p>
                  
                  <div class="document-info">
                      <h3>Detalles del documento:</h3>
                      <p><strong>Nombre:</strong> ${document.originalName}</p>
                      <p><strong>Tipo:</strong> ${document.documentType}</p>
                      <p><strong>Tamaño:</strong> ${(document.fileSize / (1024 * 1024)).toFixed(2)} MB</p>
                      <p><strong>Estado:</strong> ${document.status === 'pending' ? 'Pendiente de revisión' : 'Procesado'}</p>
                  </div>
                  
                  <p>Tu documento está siendo procesado y recibirás una notificación cuando esté listo.</p>
                  
                  <a href="${process.env.APP_URL || 'http://localhost:5000'}/documents" class="button">Ver mis documentos</a>
              </div>
              <div class="footer">
                  <p>DocumentFlow - Sistema de gestión de archivos inteligente</p>
                  <p>Este es un correo automático, por favor no responder.</p>
              </div>
          </div>
      </body>
      </html>
    `;
  }

  private getReminderTemplate(reminder: Reminder, deadline: Deadline): string {
    const dueDate = new Date(reminder.reminderTime);
    const formattedDate = dueDate.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Recordatorio - DocumentFlow</title>
          <style>
              body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #f59e0b 0%, #dc2626 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
              .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
              .footer { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; font-size: 14px; color: #6b7280; }
              .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .reminder-info { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; }
              .urgent { background: #fee2e2; border-left-color: #dc2626; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>⏰ Recordatorio Importante</h1>
              </div>
              <div class="content">
                  <p>¡Hola!</p>
                  <p>Te recordamos que tienes una fecha límite próxima para subir documentos.</p>
                  
                  <div class="reminder-info">
                      <h3>${deadline.title}</h3>
                      <p><strong>Fecha límite:</strong> ${formattedDate}</p>
                      <p><strong>Descripción:</strong> ${deadline.description || 'No hay descripción adicional'}</p>
                  </div>
                  
                  <p><strong>¡No olvides subir tus documentos antes de la fecha límite!</strong></p>
                  <p>Puedes subir tus archivos directamente desde nuestro sitio web o usar la función de cámara para capturar documentos desde tu dispositivo móvil.</p>
                  
                  <a href="${process.env.APP_URL || 'http://localhost:5000'}/upload" class="button">Subir documentos ahora</a>
              </div>
              <div class="footer">
                  <p>DocumentFlow - Sistema de gestión de archivos inteligente</p>
                  <p>Este es un correo automático, por favor no responder.</p>
              </div>
          </div>
      </body>
      </html>
    `;
  }

  private getDeadlineTemplate(deadline: any): string {
    const dueDate = new Date(deadline.dueDate);
    const formattedDate = dueDate.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Fecha Límite Próxima - DocumentFlow</title>
          <style>
              body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #dc2626 0%, #7c2d12 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
              .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
              .footer { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; font-size: 14px; color: #6b7280; }
              .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .deadline-info { background: #fee2e2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>🚨 Fecha Límite Próxima</h1>
              </div>
              <div class="content">
                  <p>¡Atención!</p>
                  <p>Se acerca la fecha límite para subir los siguientes documentos:</p>
                  
                  <div class="deadline-info">
                      <h3>${deadline.title}</h3>
                      <p><strong>Fecha límite:</strong> ${formattedDate}</p>
                      <p><strong>Descripción:</strong> ${deadline.description}</p>
                  </div>
                  
                  <p><strong>¡Es importante que subas tus documentos antes de la fecha límite!</strong></p>
                  <p>Evita retrasos y asegúrate de completar tu documentación a tiempo.</p>
                  
                  <a href="${process.env.APP_URL || 'http://localhost:5000'}/upload" class="button">Subir documentos ahora</a>
              </div>
              <div class="footer">
                  <p>DocumentFlow - Sistema de gestión de archivos inteligente</p>
                  <p>Este es un correo automático, por favor no responder.</p>
              </div>
          </div>
      </body>
      </html>
    `;
  }
}

export const emailService = new EmailService();
