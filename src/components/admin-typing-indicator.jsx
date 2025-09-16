import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import PropTypes from 'prop-types';

const AdminTypingIndicator = ({ isVisible, typingUsers = [] }) => {
  if (!isVisible || typingUsers.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-2"
      >
        <div className="flex -space-x-2">
          {typingUsers.slice(0, 3).map((user, index) => (
            <Avatar key={user.id || index} className="h-6 w-6 border-2 border-white dark:border-gray-800">
              <AvatarImage src={`https://api.dicebear.com/9.x/glass/svg?seed=${user.id}`} />
              <AvatarFallback className="text-xs bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          ))}
          {typingUsers.length > 3 && (
            <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center border-2 border-white dark:border-gray-800">
              <span className="text-xs text-gray-600 dark:text-gray-300">
                +{typingUsers.length - 3}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {typingUsers.length === 1 
              ? `${typingUsers[0].name || 'Someone'} is typing`
              : `${typingUsers.length} people are typing`
            }
          </span>
          <div className="flex space-x-1">
            <motion.div
              className="w-1 h-1 bg-gray-400 rounded-full"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="w-1 h-1 bg-gray-400 rounded-full"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div
              className="w-1 h-1 bg-gray-400 rounded-full"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

AdminTypingIndicator.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  typingUsers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
    })
  ),
};

AdminTypingIndicator.defaultProps = {
  typingUsers: [],
};

export default AdminTypingIndicator;
