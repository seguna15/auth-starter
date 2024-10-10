import React, { useState } from "react";
import { motion } from "framer-motion";
import { Input, PasswordMeterStrength } from "../../components";
import {Mail, User, Lock, Loader} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";


const Register = () => {

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate()
    const { signup, error, isLoading, isGoogleLoading, googleLogin} = useAuthStore();
    const [googleLoading, setGoogleLoading] = useState(false);

    //local registration
    const handelSignUp = async (e) => {
        e.preventDefault();
        try {
            await signup(username, email, password);
            navigate("/auth/verify-email")
        } catch (error) {
            console.log(error)
        }
    }

  // google login
  const handleGoogleLogin = async (e) => {
    e.preventDefault();

    try {
      await googleLogin();
    } catch (error) {
      console.log(error);
      toast.error("Error login in through google");
    }
  };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md overflow-hidden bg-gray-800 bg-opacity-50 shadow-xl backdrop-filter backdrop-blur-xl rounded-2xl"
      >
        <div className="p-8">
          <h2 className="mb-6 text-3xl font-bold text-center text-transparent bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text">
            Create Account
          </h2>
          {error && (
            <p className="mt-2 mb-2 font-semibold text-red-500">{error}</p>
          )}
          <form onSubmit={handelSignUp}>
            <Input
              icon={User}
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
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

            <PasswordMeterStrength password={password} />

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
                "Sign Up"
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
            Already have an account?{" "}
            <Link to={"/auth/login"} className="text-green-400 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    );
};

export default Register;
