import React, { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from './screens/auth/Login'
import { FloatingShape } from './components'
import HomePage from './screens/home/HomePage'
import Register from './screens/auth/Register'
import EmailVerification from './screens/auth/EmailVerification'
import {Toaster} from "react-hot-toast"
import { useAuthStore } from './store/authStore'
import { RedirectAuthenticatedUser, UserRoute, AdminRoute } from './Routes'
import UserDashboard from './screens/user/UserDashboard'
import { AdminDashboard } from './screens/admin/AdminDashboard'
import ForgotPassword from './screens/auth/ForgotPassword'
import ResetPassword from './screens/auth/ResetPassword'
import OauthSuccess from './screens/auth/OauthSuccess'

function App() {
   const { isAuthenticated, checkAuth, user} = useAuthStore();
   useEffect(() => {
      checkAuth();
   },[checkAuth])
   
  return (
    <main className="relative flex items-center justify-center min-h-screen overflow-hidden font-nunitoSans bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900">
      <FloatingShape
        color="bg-green-500"
        size="w-64 h-64"
        top="-5%"
        left="10%"
        delay={0}
      />
      <FloatingShape
        color="bg-emerald-500"
        size="w-48 h-48"
        top="70%"
        left="80%"
        delay={5}
      />
      <FloatingShape
        color="bg-lime-500"
        size="w-32 h-32"
        top="40%"
        left="-10%"
        delay={2}
      />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth/oauth-success/:email" element={<OauthSuccess />} />
        <Route
          path="/auth/login"
          element={
            <RedirectAuthenticatedUser>
              <Login />
            </RedirectAuthenticatedUser>
          }
        />
        <Route
          path="/auth/register"
          element={
            <RedirectAuthenticatedUser>
              <Register />
            </RedirectAuthenticatedUser>
          }
        />
        <Route 
         path='/auth/forgot-password' 
         element={
            <RedirectAuthenticatedUser>
               <ForgotPassword/>
            </RedirectAuthenticatedUser>
         }
        />
        <Route 
         path='/auth/reset-password/:token' 
         element={
            <RedirectAuthenticatedUser>
               <ResetPassword/>
            </RedirectAuthenticatedUser>
         }
        />

        <Route
          path="/user/dashboard"
          element={
            <UserRoute>
              <UserDashboard />
            </UserRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route path="/auth/verify-email" element={<EmailVerification />} />
      </Routes>
      <Toaster />
    </main>
  );
}

export default App
