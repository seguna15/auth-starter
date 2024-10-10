import React, { useEffect } from 'react'
import { motion } from "framer-motion";
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate()
    

    
    const handleRedirect = (e, url) => {
        e.preventDefault();
        navigate(url)
    }
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-lg p-8 mx-auto mt-10 bg-gray-900 border border-gray-800 shadow-2xl bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl"
    >
      <h2 className="mb-6 text-3xl font-bold text-center text-transparent bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text">
        Home Page
      </h2>
      <div className="space-y-6">
        <motion.div
          className="p-4 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="mb-3 text-xl font-semibold text-green-400">
            Profile Information
          </h3>
          <p className="text-gray-300">
            This project allows your start MERN Stack without worrying about
            authentication
          </p>
          <p className="text-gray-300">
            The backend was built with nodeJS, express, & Mongo DB
          </p>
          <p className="text-gray-300">
            The frontend was built with React (vite) & Zustand for state
            management
          </p>
        </motion.div>
        <motion.div
          className="p-4 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="mb-3 text-xl font-semibold text-green-400">
            Features
          </h3>
          <p className="text-gray-300">
            <span className="font-bold">JWT Refresh and Access Token </span>
          </p>
          <p className="text-gray-300">
            <span className="font-bold">Email Verification </span>
          </p>
          <p className="text-gray-300">
            <span className="font-bold">Password Reset </span>
          </p>
          <p className="text-gray-300">
            <span className="font-bold">Registration, Login, Logout </span>
          </p>
          <p className="text-gray-300">
            <span className="font-bold">Google Oauth </span>
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex gap-2 mt-4"
      >
        {user?.isVerified  && user?.isAdmin &&
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full px-4 py-3 font-bold text-white rounded-lg shadow-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            onClick={(e) => {
              handleRedirect(e, "/admin/dashboard");
            }}
          >
            Admin Dashboard
          </motion.button>
        }     
        {user?.isVerified  && !user?.isAdmin &&
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full px-4 py-3 font-bold text-white rounded-lg shadow-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            onClick={(e) => {
              handleRedirect(e, "/user/dashboard");
            }}
          >
            User Dashboard
          </motion.button>
        }     

        {!user?.isVerified &&
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full px-4 py-3 font-bold text-white rounded-lg shadow-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              onClick={(e) => {
                handleRedirect(e, "/auth/login");
              }}
            >
              Login
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full px-4 py-3 font-bold text-gray-900 rounded-lg shadow-lg bg-gradient-to-r from-white to-gray-600 hover:from-gray-400 hover:to-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              onClick={(e) => {
                handleRedirect(e, "/auth/register");
              }}
            >
              Register
            </motion.button>
          </>
        }
      </motion.div>
    </motion.div>
  );
}

export default HomePage