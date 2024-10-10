import React, { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "../../components";
import { Mail, Loader, Lock } from "lucide-react";
import { Link, } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error, googleLogin, isGoogleLoading } =
    useAuthStore();
  
  //local login
  const handleLogin = async (e) => {
    e.preventDefault();
     try {
        await login(email, password);
        
        toast.success("User logged in successfully");
     } catch (error) {
       console.log(error);
     }
  };

 
  //google oauth
  const handleGoogleLogin = async (e) => {
    e.preventDefault();
    
    try {
      await googleLogin();
    } catch (error) {
      console.log(error);
      toast.error("Error login in through google")
    }
  }


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md overflow-hidden bg-gray-800 bg-opacity-50 shadow-xl backdrop-filter backdrop-blur-xl rounded-2xl"
    >
      <div className="p-8">
        <h2 className="mb-6 text-3xl font-bold text-center text-transparent bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text">
          Welcome Back
        </h2>
        {error && (
          <p className="mt-2 mb-2 font-semibold text-red-500">{error}</p>
        )}
        <form onSubmit={handleLogin}>
          <Input
            icon={Mail}
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            icon={Lock}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex items-center mb-6">
            <Link
              to={"/auth/forgot-password"}
              className="text-green-400 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <motion.button
            className="w-full px-4 py-3 mt-5 font-bold text-white transition duration-200 rounded-lg shadow-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader className="mx-auto size-6 animate-spin" />
            ) : (
              "Login"
            )}
          </motion.button>
          <motion.button
            className="w-full px-4 py-3 mt-5 font-bold text-red-500 transition duration-200 rounded-lg shadow-lg bg-gradient-to-r from-green-200 to-red-200 hover:from-green-300 hover:to-red-300 focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-offset-2 focus:ring-offset-gray-900"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isGoogleLoading}
            onClick={handleGoogleLogin}
          >
            {isGoogleLoading ? (
              <Loader className="mx-auto size-6 animate-spin" />
            ) : (
              "Google Sign in"
            )}
          </motion.button>
        </form>
      </div>
      <div className="flex justify-center px-8 py-4 bg-gray-900 bg-opacity-50">
        <p className="text-sm text-gray-400">
          Don't have an account?{" "}
          <Link
            to={"/auth/register"}
            className="text-green-400 hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default Login;
