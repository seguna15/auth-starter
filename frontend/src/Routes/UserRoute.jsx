import React from 'react'
import { useAuthStore } from '../store/authStore'
import { Navigate } from 'react-router-dom';

export const UserRoute = ({children}) => {
    const {user} = useAuthStore();
   
    if(user?.isVerified) {
        return children
    }

    return <Navigate to="/auth/login" replace />;
  
}
