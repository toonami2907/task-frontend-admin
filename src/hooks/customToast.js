import toast from 'react-hot-toast';

export const ErrorToast = (message)=>{
    toast.error(message, {
        position: "top-right",
        duration: 5000,
        style: {
          background: '#1E293B', 
          color: '#FFFFFF',     
          padding: '16px 24px',  
          minWidth: '300px',    
          minHeight: '60px',     
          fontSize: '14px',
          fontWeight: '500',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        },
        iconTheme: {
          primary: '#EF4444',    //
          secondary: '#FFFFFF'   
        }
      });
}