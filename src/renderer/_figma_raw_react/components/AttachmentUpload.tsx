import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Upload, FileText, Image, FileCheck, X, Download, Eye } from 'lucide-react';
import { toast } from "sonner@2.0.3";

interface AttachmentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

interface AttachmentUploadProps {
  label?: string;
  maxFiles?: number;
  maxSizePerFile?: number; // in MB
  acceptedTypes?: string[];
  existingFiles?: AttachmentFile[];
  onFilesChange?: (files: AttachmentFile[]) => void;
  className?: string;
}

export function AttachmentUpload({
  label = "إرفاق ملفات",
  maxFiles = 5,
  maxSizePerFile = 10,
  acceptedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png'],
  existingFiles = [],
  onFilesChange,
  className = ""
}: AttachmentUploadProps) {
  const [files, setFiles] = useState<AttachmentFile[]>(existingFiles);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const fileArray = Array.from(selectedFiles);
    
    // Validation
    if (files.length + fileArray.length > maxFiles) {
      toast.error(`يمكن رفع ${maxFiles} ملفات كحد أقصى`);
      return;
    }

    const newFiles: AttachmentFile[] = [];
    
    for (const file of fileArray) {
      // Check file size
      if (file.size > maxSizePerFile * 1024 * 1024) {
        toast.error(`حجم الملف ${file.name} كبير جداً. الحد الأقصى ${maxSizePerFile}MB`);
        continue;
      }

      // Check file type
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!acceptedTypes.includes(fileExtension || '')) {
        toast.error(`نوع الملف ${file.name} غير مدعوم`);
        continue;
      }

      // Create file object (in real app, this would upload to server)
      const newFile: AttachmentFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file), // Mock URL - in real app would be server URL
        uploadedAt: new Date().toISOString()
      };

      newFiles.push(newFile);
    }

    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
    
    if (newFiles.length > 0) {
      toast.success(`تم رفع ${newFiles.length} ملف بنجاح`);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    const updatedFiles = files.filter(file => file.id !== fileId);
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
    toast.success('تم حذف الملف');
  };

  const handleDownloadFile = (file: AttachmentFile) => {
    // In a real app, this would download from server
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.click();
    toast.success('جاري تحميل الملف...');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) {
      return <Image className="w-4 h-4" />;
    }
    
    return <FileText className="w-4 h-4" />;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Label className="block">{label}</Label>
      
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${files.length >= maxFiles ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 mb-2">
          اسحب وأفلت الملفات هنا أو 
          <span className="text-blue-600 font-medium"> اختر ملفات</span>
        </p>
        <p className="text-sm text-gray-400">
          أنواع مدعومة: {acceptedTypes.join(', ')} | حد أقصى: {maxSizePerFile}MB لكل ملف
        </p>
        <p className="text-sm text-gray-400">
          ({files.length}/{maxFiles} ملفات مرفوعة)
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
        disabled={files.length >= maxFiles}
      />

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm text-gray-600">الملفات المرفقة ({files.length})</Label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center space-x-reverse space-x-3 flex-1 min-w-0">
                  {getFileIcon(file.name)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-reverse space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownloadFile(file)}
                    className="text-blue-600 hover:text-blue-700"
                    title="تحميل الملف"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(file.id)}
                    className="text-red-600 hover:text-red-700"
                    title="حذف الملف"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}