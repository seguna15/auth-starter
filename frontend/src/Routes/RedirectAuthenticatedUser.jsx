import React from 'react'
import { useAuthStore } from '../store/authStore'
import { Navigate } from 'react-router-dom'

export const RedirectAuthenticatedUser = ({children}) => {
    const { user } = useAuthStore(); 
    
    if( user?.isVerified) {
        return <Navigate to="/" replace />
    }

    
    return children
}
