import { BadRequestException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tfhlqsdjoblfxnghuumq.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmaGxxc2Rqb2JsZnhuZ2h1dW1xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5MjYxNDE4MCwiZXhwIjoyMDA4MTkwMTgwfQ.nekrhi4zLog1VN-0D9UO2f57oM4RUjy9BSdO6fhfMgM';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export const getUrl = (bucket: string, filename: string) => {
  if (!filename) return '';
  return `${supabaseUrl}/storage/v1/object/public${bucket}/${filename}`;
};

const generateUniqueFileName = (originalFileName: string) => {
  const timestamp = Date.now();
  const fileExtension = originalFileName.split('.').pop();
  return `photo-${timestamp}.${fileExtension}`;
};

export const upload = async (file: Express.Multer.File, bucket: string) => {
  const maxSize = 15 * 1024 * 1024; // 15 MB
  if (file.size > maxSize) {
    throw new BadRequestException('Размер файла превышает ограничение в 15 МБ');
  }

  try {
    const filename = generateUniqueFileName(file.originalname);

    const { data } = await supabase.storage
      .from(bucket)
      .upload(filename, file.buffer, {
        upsert: true,
      });

    return data.path;
  } catch (e) {
    throw new Error('Error uploading file to supabase', e);
  }
};
