import React from 'react'
import { useAuthStore } from '../store/authStore';
import { Navigate } from 'react-router-dom';

export const AdminRoute = ({children}) => {
   const { user  } = useAuthStore();
    
   if ( user?.isVerified && user?.isAdmin) {
     return children
   }

   return <Navigate to="/auth/login" replace />;
  
}
