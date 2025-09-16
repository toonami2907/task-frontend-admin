import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Paperclip, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Music, 
  Archive,
  X,
  Upload,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PropTypes from 'prop-types';

const AdminFileAttachment = ({ isOpen, onFileSelect, onClose }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const acceptedFileTypes = {
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
    video: ['video/mp4', 'video/webm', 'video/ogg'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'],
    archive: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed']
  };

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const getFileIcon = (file) => {
    if (acceptedFileTypes.image.includes(file.type)) {
      return <ImageIcon className="h-5 w-5 text-green-500" />;
    } else if (acceptedFileTypes.document.includes(file.type)) {
      return <FileText className="h-5 w-5 text-blue-500" />;
    } else if (acceptedFileTypes.video.includes(file.type)) {
      return <Video className="h-5 w-5 text-purple-500" />;
    } else if (acceptedFileTypes.audio.includes(file.type)) {
      return <Music className="h-5 w-5 text-orange-500" />;
    } else if (acceptedFileTypes.archive.includes(file.type)) {
      return <Archive className="h-5 w-5 text-gray-500" />;
    } else {
      return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file) => {
    const allAcceptedTypes = Object.values(acceptedFileTypes).flat();
    
    if (!allAcceptedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not supported`
      };
    }

    if (file.size > maxFileSize) {
      return {
        valid: false,
        error: `File size exceeds ${formatFileSize(maxFileSize)} limit`
      };
    }

    return { valid: true };
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = [];
    const errors = [];

    files.forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push({
          file,
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'ready'
        });
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      toast({
        title: 'Invalid Files',
        description: errors.join(', '),
        variant: 'destructive',
      });
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (fileId) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    try {
      for (const fileData of selectedFiles) {
        await onFileSelect(fileData.file);
      }
      setSelectedFiles([]);
      onClose();
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: 'Upload Error',
        description: 'Failed to upload files. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    const fileEvent = { target: { files } };
    handleFileSelect(fileEvent);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 w-80 max-h-96 overflow-hidden z-50"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Attach Files
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center mb-4 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <Paperclip className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Drag and drop files here, or click to select
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            Select Files
          </Button>
          <Input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept={Object.values(acceptedFileTypes).flat().join(',')}
          />
        </div>

        {selectedFiles.length > 0 && (
          <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
            {selectedFiles.map((fileData) => (
              <div
                key={fileData.id}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  {getFileIcon(fileData)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {fileData.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(fileData.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(fileData.id)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || isUploading}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {isUploading ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload ({selectedFiles.length})
              </>
            )}
          </Button>
        </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

AdminFileAttachment.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onFileSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AdminFileAttachment;
