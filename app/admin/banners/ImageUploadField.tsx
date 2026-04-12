'use client';

import { supabase } from '@/lib/supabaseClient'
import { Upload } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { toast } from 'sonner'

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  branchId: string;
}

export default function ImageUploadField({ value, onChange, branchId }: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPG, PNG, WebP formats are supported');
      return;
    }

    setIsUploading(true);
    try {
      const timestamp = Date.now();
      const filename = `${branchId}/${timestamp}-${file.name.replace(/\s+/g, '_')}`;

      const { data, error } = await supabase.storage
        .from('banners')
        .upload(filename, file, { cacheControl: '3600', upsert: false });

      if (error) throw error;

      const { data: publicUrl } = supabase.storage
        .from('banners')
        .getPublicUrl(data.path);

      onChange(publicUrl.publicUrl);
      toast.success('Image uploaded successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

   return (
     <div>
       <label
         onDragEnter={handleDrag}
         onDragLeave={handleDrag}
         onDragOver={handleDrag}
         onDrop={handleDrop}
         className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition ${
           dragActive
             ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/10'
             : 'border-gray-300 dark:border-[#3a3a3a] bg-gray-50 dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-[#2e2e2e}'
         }`}
       >
         <div className="flex flex-col items-center justify-center pt-5 pb-6">
           <Upload className="w-8 h-8 text-gray-400 dark:text-[#888] mb-2" />
           <p className="text-sm text-gray-500 dark:text-[#888] text-center">
             <span className="font-semibold">Click to upload</span> or drag and drop
           </p>
           <p className="text-xs text-gray-500 dark:text-[#888] mt-1">
             JPG, PNG, WebP (Max 5MB) • Recommended: 1200x400px
           </p>
         </div>
         <input
           type="file"
           accept="image/jpeg,image/png,image/webp"
           onChange={handleChange}
           disabled={isUploading}
           className="hidden"
         />
       </label>

       {value && (
         <div className="mt-4">
           <p className="text-sm font-medium mb-2 text-gray-500 dark:text-[#888]">Preview:</p>
           <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900/10">
             <Image
               src={value}
               alt="Banner preview"
               fill
               className="object-cover"
               sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
             />
           </div>
         </div>
       )}

       {isUploading && (
         <div className="mt-2 text-center">
           <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 mb-1">
             <div className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full w-1/2 animate-pulse"></div>
           </div>
           <p className="text-xs text-gray-500 dark:text-[#888]">Uploading image...</p>
         </div>
       )}
     </div>
   );
}