import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

export class SupabaseStorageService {
  private supabase: SupabaseClient;
  private bucketName: string = 'documents';

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase URL and Service Key are required');
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  /**
   * Upload a file to Supabase Storage
   */
  async uploadFile(buffer: Buffer, filename: string, userId: string, contentType?: string): Promise<string> {
    try {
      // Create unique path: userId/timestamp-filename
      const timestamp = Date.now();
      const fileExtension = filename.split('.').pop();
      const uniqueFilename = `${timestamp}-${randomUUID()}.${fileExtension}`;
      const filePath = `${userId}/${uniqueFilename}`;

      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(filePath, buffer, {
          contentType: contentType || 'application/octet-stream',
          upsert: false
        });

      if (error) {
        console.error('Supabase upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      console.log('✅ File uploaded to Supabase:', data.path);
      return data.path;
    } catch (error) {
      console.error('Error uploading file to Supabase:', error);
      throw error;
    }
  }

  /**
   * Delete a file from Supabase Storage
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        console.error('Supabase delete error:', error);
        throw new Error(`Delete failed: ${error.message}`);
      }

      console.log('✅ File deleted from Supabase:', filePath);
    } catch (error) {
      console.error('Error deleting file from Supabase:', error);
      throw error;
    }
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(filePath: string): string {
    const { data } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  }

  /**
   * Create a signed URL with expiration (for private files)
   */
  async createSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        throw new Error(`Failed to create signed URL: ${error.message}`);
      }

      return data.signedUrl;
    } catch (error) {
      console.error('Error creating signed URL:', error);
      throw error;
    }
  }

  /**
   * Initialize storage bucket (create if doesn't exist)
   */
  async initializeBucket(): Promise<void> {
    try {
      // Check if bucket exists
      const { data: buckets, error: listError } = await this.supabase.storage.listBuckets();
      
      if (listError) {
        console.error('Error listing buckets:', listError);
        return;
      }

      const bucketExists = buckets?.some(bucket => bucket.name === this.bucketName);
      
      if (!bucketExists) {
        const { error: createError } = await this.supabase.storage.createBucket(this.bucketName, {
          public: true, // Set to false for private files
          allowedMimeTypes: [
            'image/jpeg',
            'image/png', 
            'image/gif',
            'application/pdf',
            'video/mp4',
            'video/quicktime'
          ],
          fileSizeLimit: 52428800 // 50MB limit
        });

        if (createError) {
          console.error('Error creating bucket:', createError);
        } else {
          console.log('✅ Supabase bucket created:', this.bucketName);
        }
      } else {
        console.log('✅ Supabase bucket already exists:', this.bucketName);
      }
    } catch (error) {
      console.error('Error initializing bucket:', error);
    }
  }

  /**
   * Check if Supabase connection is working
   */
  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.storage.listBuckets();
      
      if (error) {
        console.error('❌ Supabase Storage connection failed:', error);
        return false;
      }

      console.log('✅ Supabase Storage connection successful');
      return true;
    } catch (error) {
      console.error('❌ Supabase Storage test failed:', error);
      return false;
    }
  }
}

export const supabaseStorage = new SupabaseStorageService();