'use client'
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Mail, Lock, Eye, EyeClosed, ArrowRight, AlertCircle, User, UserCircle } from 'lucide-react';

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                className
            )}
            {...props}
        />
    )
}

function Select({ className, children, ...props }) {
    return (
        <select
            className={cn(
                "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        >
            {children}
        </select>
    )
}

export function SignUpCard({ onSignUp, isLoading: externalLoading, error: externalError }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        role: 'student'
    });

    const [localLoading, setLocalLoading] = useState(false);
    const isLoading = externalLoading !== undefined ? externalLoading : localLoading;

    const [focusedInput, setFocusedInput] = useState(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // For 3D card effect
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
    const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left - rect.width / 2);
        mouseY.set(e.clientY - rect.top - rect.height / 2);
        setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (onSignUp) {
            onSignUp(formData);
        } else {
            setLocalLoading(true);
            setTimeout(() => setLocalLoading(false), 2000);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none overflow-y-auto py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-2xl relative z-10 pointer-events-auto my-auto"
                style={{ perspective: 1500 }}
            >
                <motion.div
                    className="relative"
                    style={{ rotateX, rotateY }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    whileHover={{ z: 10 }}
                >
                    <div className="relative group">
                        {/* Card glow effect */}
                        <motion.div
                            className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-70 transition-opacity duration-700"
                            animate={{
                                boxShadow: [
                                    "0 0 10px 2px rgba(255,255,255,0.03)",
                                    "0 0 15px 5px rgba(255,255,255,0.05)",
                                    "0 0 10px 2px rgba(255,255,255,0.03)"
                                ],
                                opacity: [0.2, 0.4, 0.2]
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                                repeatType: "mirror"
                            }}
                        />

                        {/* Traveling light beam effect */}
                        <div className="absolute -inset-[1px] rounded-2xl overflow-hidden">
                            {/* Top light beam */}
                            <motion.div
                                className="absolute top-0 left-0 h-[3px] w-[50%] bg-gradient-to-r from-transparent via-white to-transparent opacity-70"
                                initial={{ filter: "blur(2px)" }}
                                animate={{
                                    left: ["-50%", "100%"],
                                    opacity: [0.3, 0.7, 0.3],
                                    filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"]
                                }}
                                transition={{
                                    left: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 },
                                    opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror" },
                                    filter: { duration: 1.5, repeat: Infinity, repeatType: "mirror" }
                                }}
                            />

                            {/* Right light beam */}
                            <motion.div
                                className="absolute top-0 right-0 h-[50%] w-[3px] bg-gradient-to-b from-transparent via-white to-transparent opacity-70"
                                initial={{ filter: "blur(2px)" }}
                                animate={{
                                    top: ["-50%", "100%"],
                                    opacity: [0.3, 0.7, 0.3],
                                    filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"]
                                }}
                                transition={{
                                    top: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 0.6 },
                                    opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 0.6 },
                                    filter: { duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: 0.6 }
                                }}
                            />

                            {/* Bottom light beam */}
                            <motion.div
                                className="absolute bottom-0 right-0 h-[3px] w-[50%] bg-gradient-to-r from-transparent via-white to-transparent opacity-70"
                                initial={{ filter: "blur(2px)" }}
                                animate={{
                                    right: ["-50%", "100%"],
                                    opacity: [0.3, 0.7, 0.3],
                                    filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"]
                                }}
                                transition={{
                                    right: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 1.2 },
                                    opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 1.2 },
                                    filter: { duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: 1.2 }
                                }}
                            />

                            {/* Left light beam */}
                            <motion.div
                                className="absolute bottom-0 left-0 h-[50%] w-[3px] bg-gradient-to-b from-transparent via-white to-transparent opacity-70"
                                initial={{ filter: "blur(2px)" }}
                                animate={{
                                    bottom: ["-50%", "100%"],
                                    opacity: [0.3, 0.7, 0.3],
                                    filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"]
                                }}
                                transition={{
                                    bottom: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 1.8 },
                                    opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 1.8 },
                                    filter: { duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: 1.8 }
                                }}
                            />
                        </div>

                        {/* Card border glow */}
                        <div className="absolute -inset-[0.5px] rounded-2xl bg-gradient-to-r from-white/3 via-white/7 to-white/3 opacity-0 group-hover:opacity-70 transition-opacity duration-500" />

                        {/* Glass card background */}
                        <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/[0.05] shadow-2xl overflow-hidden">
                            {/* Subtle card inner patterns */}
                            <div className="absolute inset-0 opacity-[0.03]"
                                style={{
                                    backgroundImage: `linear-gradient(135deg, white 0.5px, transparent 0.5px), linear-gradient(45deg, white 0.5px, transparent 0.5px)`,
                                    backgroundSize: '30px 30px'
                                }}
                            />

                            {/* Logo and header */}
                            <div className="text-center space-y-1 mb-5">
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", duration: 0.8 }}
                                    className="mx-auto w-10 h-10 rounded-full border border-white/10 flex items-center justify-center relative overflow-hidden"
                                >
                                    <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">S</span>
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
                                </motion.div>

                                <motion.h1
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80"
                                >
                                    Create Your Account
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-white/60 text-xs"
                                >
                                    Start your learning journey with us
                                </motion.p>
                            </div>

                            {externalError && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-200 text-sm"
                                >
                                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                                    <p>{externalError}</p>
                                </motion.div>
                            )}

                            {/* Registration form */}
                            <form onSubmit={handleSubmit} className="space-y-3">
                                {/* Name fields */}
                                <div className="grid grid-cols-2 gap-3">
                                    {/* First Name */}
                                    <motion.div
                                        className={`relative ${focusedInput === "first_name" ? 'z-10' : ''}`}
                                        whileFocus={{ scale: 1.02 }}
                                        whileHover={{ scale: 1.01 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    >
                                        <div className="relative flex items-center overflow-hidden rounded-lg">
                                            <User className={`absolute left-3 w-4 h-4 transition-all duration-300 ${focusedInput === "first_name" ? 'text-white' : 'text-white/40'
                                                }`} />

                                            <Input
                                                type="text"
                                                name="first_name"
                                                placeholder="First Name"
                                                value={formData.first_name}
                                                onChange={handleChange}
                                                onFocus={() => setFocusedInput("first_name")}
                                                onBlur={() => setFocusedInput(null)}
                                                className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-3 focus:bg-white/10"
                                            />
                                        </div>
                                    </motion.div>

                                    {/* Last Name */}
                                    <motion.div
                                        className={`relative ${focusedInput === "last_name" ? 'z-10' : ''}`}
                                        whileFocus={{ scale: 1.02 }}
                                        whileHover={{ scale: 1.01 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    >
                                        <div className="relative flex items-center overflow-hidden rounded-lg">
                                            <User className={`absolute left-3 w-4 h-4 transition-all duration-300 ${focusedInput === "last_name" ? 'text-white' : 'text-white/40'
                                                }`} />

                                            <Input
                                                type="text"
                                                name="last_name"
                                                placeholder="Last Name"
                                                value={formData.last_name}
                                                onChange={handleChange}
                                                onFocus={() => setFocusedInput("last_name")}
                                                onBlur={() => setFocusedInput(null)}
                                                className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-3 focus:bg-white/10"
                                            />
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Email */}
                                <motion.div
                                    className={`relative ${focusedInput === "email" ? 'z-10' : ''}`}
                                    whileFocus={{ scale: 1.02 }}
                                    whileHover={{ scale: 1.01 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                >
                                    <div className="relative flex items-center overflow-hidden rounded-lg">
                                        <Mail className={`absolute left-3 w-4 h-4 transition-all duration-300 ${focusedInput === "email" ? 'text-white' : 'text-white/40'
                                            }`} />

                                        <Input
                                            type="email"
                                            name="email"
                                            placeholder="Email Address"
                                            value={formData.email}
                                            onChange={handleChange}
                                            onFocus={() => setFocusedInput("email")}
                                            onBlur={() => setFocusedInput(null)}
                                            className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-3 focus:bg-white/10"
                                        />
                                    </div>
                                </motion.div>

                                {/* Username */}
                                <motion.div
                                    className={`relative ${focusedInput === "username" ? 'z-10' : ''}`}
                                    whileFocus={{ scale: 1.02 }}
                                    whileHover={{ scale: 1.01 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                >
                                    <div className="relative flex items-center overflow-hidden rounded-lg">
                                        <UserCircle className={`absolute left-3 w-4 h-4 transition-all duration-300 ${focusedInput === "username" ? 'text-white' : 'text-white/40'
                                            }`} />

                                        <Input
                                            type="text"
                                            name="username"
                                            placeholder="Username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            onFocus={() => setFocusedInput("username")}
                                            onBlur={() => setFocusedInput(null)}
                                            className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-3 focus:bg-white/10"
                                        />
                                    </div>
                                </motion.div>

                                {/* Password */}
                                <motion.div
                                    className={`relative ${focusedInput === "password" ? 'z-10' : ''}`}
                                    whileFocus={{ scale: 1.02 }}
                                    whileHover={{ scale: 1.01 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                >
                                    <div className="relative flex items-center overflow-hidden rounded-lg">
                                        <Lock className={`absolute left-3 w-4 h-4 transition-all duration-300 ${focusedInput === "password" ? 'text-white' : 'text-white/40'
                                            }`} />

                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            placeholder="Password (min 6 characters)"
                                            value={formData.password}
                                            onChange={handleChange}
                                            onFocus={() => setFocusedInput("password")}
                                            onBlur={() => setFocusedInput(null)}
                                            className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-10 focus:bg-white/10"
                                        />

                                        <div
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 cursor-pointer"
                                        >
                                            {showPassword ? (
                                                <Eye className="w-4 h-4 text-white/40 hover:text-white transition-colors duration-300" />
                                            ) : (
                                                <EyeClosed className="w-4 h-4 text-white/40 hover:text-white transition-colors duration-300" />
                                            )}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Confirm Password */}
                                <motion.div
                                    className={`relative ${focusedInput === "confirmPassword" ? 'z-10' : ''}`}
                                    whileFocus={{ scale: 1.02 }}
                                    whileHover={{ scale: 1.01 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                >
                                    <div className="relative flex items-center overflow-hidden rounded-lg">
                                        <Lock className={`absolute left-3 w-4 h-4 transition-all duration-300 ${focusedInput === "confirmPassword" ? 'text-white' : 'text-white/40'
                                            }`} />

                                        <Input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            placeholder="Confirm Password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            onFocus={() => setFocusedInput("confirmPassword")}
                                            onBlur={() => setFocusedInput(null)}
                                            className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-10 focus:bg-white/10"
                                        />

                                        <div
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 cursor-pointer"
                                        >
                                            {showConfirmPassword ? (
                                                <Eye className="w-4 h-4 text-white/40 hover:text-white transition-colors duration-300" />
                                            ) : (
                                                <EyeClosed className="w-4 h-4 text-white/40 hover:text-white transition-colors duration-300" />
                                            )}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Role Selection */}
                                <motion.div
                                    className={`relative ${focusedInput === "role" ? 'z-10' : ''}`}
                                    whileFocus={{ scale: 1.02 }}
                                    whileHover={{ scale: 1.01 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                >
                                    <Select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedInput("role")}
                                        onBlur={() => setFocusedInput(null)}
                                        className="w-full bg-white/5 border-transparent focus:border-white/20 text-white h-10 transition-all duration-300 px-3 focus:bg-white/10"
                                    >
                                        <option value="student" className="bg-gray-900">Student</option>
                                        <option value="instructor" className="bg-gray-900">Instructor</option>
                                    </Select>
                                </motion.div>

                                {/* Create Account button */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full relative group/button mt-5"
                                >
                                    <div className="absolute inset-0 bg-white/10 rounded-lg blur-lg opacity-0 group-hover/button:opacity-70 transition-opacity duration-300" />

                                    <div className="relative overflow-hidden bg-white text-black font-medium h-10 rounded-lg transition-all duration-300 flex items-center justify-center">
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -z-10"
                                            animate={{ x: ['-100%', '100%'] }}
                                            transition={{
                                                duration: 1.5,
                                                ease: "easeInOut",
                                                repeat: Infinity,
                                                repeatDelay: 1
                                            }}
                                            style={{
                                                opacity: isLoading ? 1 : 0,
                                                transition: 'opacity 0.3s ease'
                                            }}
                                        />

                                        <AnimatePresence mode="wait">
                                            {isLoading ? (
                                                <motion.div
                                                    key="loading"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="flex items-center justify-center"
                                                >
                                                    <div className="w-4 h-4 border-2 border-black/70 border-t-transparent rounded-full animate-spin" />
                                                </motion.div>
                                            ) : (
                                                <motion.span
                                                    key="button-text"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="flex items-center justify-center gap-1 text-sm font-medium"
                                                >
                                                    Create Account
                                                    <ArrowRight className="w-3 h-3 group-hover/button:translate-x-1 transition-transform duration-300" />
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.button>

                                {/* Sign in link */}
                                <motion.p
                                    className="text-center text-xs text-white/60 mt-4"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    Already have an account?{' '}
                                    <Link
                                        to="/login"
                                        className="relative inline-block group/signin"
                                    >
                                        <span className="relative z-10 text-white group-hover/signin:text-white/70 transition-colors duration-300 font-medium">
                                            Sign in
                                        </span>
                                        <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-white group-hover/signin:w-full transition-all duration-300" />
                                    </Link>
                                </motion.p>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
