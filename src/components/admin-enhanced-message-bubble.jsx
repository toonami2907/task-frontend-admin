import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Play, Pause, Download, FileText, Image as ImageIcon, Trash2, MoreVertical } from 'lucide-react';
import PropTypes from 'prop-types';

const AdminEnhancedMessageBubble = ({ message, isAdmin, showAvatar, formatTimeAgo, onDeleteMessage, canDelete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const audioRef = useRef(null);
  const { toast } = useToast();
  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressClick = (e) => {
    if (audioRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time) || time === 0) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (duration === 0) return 0;
    return (currentTime / duration) * 100;
  };

  const handleDeleteMessage = async () => {
    if (!canDelete || !onDeleteMessage) return;
    
    try {
      setIsDeleting(true);
      setShowDeleteDialog(false);
      await onDeleteMessage(message.id);
      toast({
        title: 'Success',
        description: 'Message deleted successfully',
        variant: 'success'
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const renderMessageContent = () => {
    switch (message.messageType) {
      case 'voice':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Button
                onClick={handlePlayPause}
                size="sm"
                className="h-8 w-8 rounded-full p-0 bg-blue-500 hover:bg-blue-600"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Voice Message
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {message.fileName || 'Voice recording'}
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <div 
                className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 cursor-pointer"
                onClick={handleProgressClick}
              >
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-100"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{formatTime(currentTime)}</span>
                <span>{duration > 0 ? formatTime(duration) : '--:--'}</span>
              </div>
            </div>
            
            <audio
              ref={audioRef}
              src={message.fileUrl}
              onEnded={handleAudioEnded}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onCanPlay={handleLoadedMetadata}
              onLoadedData={handleLoadedMetadata}
              crossOrigin="anonymous"
              onError={(e) => {
                console.error('Audio error:', e);
                toast({
                  title: 'Audio Error',
                  description: 'Failed to load audio file',
                  variant: 'destructive',
                });
              }}
            />
          </div>
        );

      case 'image':
        return (
          <div className="space-y-2">
            <img
              src={message.fileUrl}
              alt={message.fileName || 'Image'}
              className="max-w-full h-auto rounded-lg cursor-pointer"
              onClick={() => window.open(message.fileUrl, '_blank')}
            />
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {message.fileName}
            </div>
          </div>
        );

      case 'file':
        return (
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex-shrink-0">
              {message.mimeType?.startsWith('image/') ? (
                <ImageIcon className="h-8 w-8 text-blue-500" />
              ) : (
                <FileText className="h-8 w-8 text-gray-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                {message.fileName}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {message.fileSize ? `${(message.fileSize / 1024).toFixed(1)} KB` : 'Unknown size'}
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(message.fileUrl, '_blank')}
              className="flex-shrink-0"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        );

      default:
        return (
          <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {message.text}
          </div>
        );
    }
  };

  const isOwnMessage = isAdmin;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start gap-3 mb-4 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
    >
      {showAvatar && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={`https://api.dicebear.com/9.x/glass/svg?seed=${message.senderId}`} />
          <AvatarFallback className={`text-xs font-semibold ${
            isAdmin 
              ? 'bg-gradient-to-br from-orange-400 to-red-500' 
              : 'bg-gradient-to-br from-blue-400 to-purple-500'
          } text-white text-xs font-semibold`}>
            {isAdmin ? 'AD' : message.senderName?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`max-w-[80%] ${isOwnMessage ? 'flex flex-col items-end' : ''}`}>
        <div className={`px-4 py-3 rounded-2xl shadow-sm ${
          isAdmin
            ? 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-tl-md'
            : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-tl-md'
        }`}>
          {renderMessageContent()}
        </div>
        
        <div className={`flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400 ${
          isOwnMessage ? 'flex-row-reverse' : ''
        }`}>
          <span>{message.senderName}</span>
          {message.type === 'team' && (
            <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium">
              Team
            </span>
          )}
          <span>•</span>
          <span>{formatTimeAgo(message.createdAt)}</span>
          {canDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-600"
                  disabled={isDeleting}
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isOwnMessage ? "end" : "start"}>
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      disabled={isDeleting}
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {isDeleting ? 'Deleting...' : 'Delete Message'}
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Message</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this message? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteMessage}
                        className="bg-red-600 hover:bg-red-700 text-white"
                        disabled={isDeleting}
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </motion.div>
  );
};

AdminEnhancedMessageBubble.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.string.isRequired,
    sender: PropTypes.string.isRequired,
    senderId: PropTypes.string,
    senderName: PropTypes.string,
    type: PropTypes.oneOf(['individual', 'team']),
    text: PropTypes.string,
    messageType: PropTypes.oneOf(['text', 'voice', 'file', 'image']),
    fileUrl: PropTypes.string,
    fileName: PropTypes.string,
    fileSize: PropTypes.number,
    mimeType: PropTypes.string,
    createdAt: PropTypes.string.isRequired,
  }).isRequired,
  isAdmin: PropTypes.bool.isRequired,
  showAvatar: PropTypes.bool.isRequired,
  formatTimeAgo: PropTypes.func.isRequired,
  onDeleteMessage: PropTypes.func,
  canDelete: PropTypes.bool,
};

AdminEnhancedMessageBubble.defaultProps = {
  onDeleteMessage: null,
  canDelete: false,
};

export default AdminEnhancedMessageBubble;
