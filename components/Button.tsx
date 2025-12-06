import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'ghost';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-6 py-3 rounded-full font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg";
  
  const variants = {
    primary: "bg-pink-500 text-white hover:bg-pink-600 border-b-4 border-pink-700",
    danger: "bg-red-500 text-white hover:bg-red-600 border-b-4 border-red-700",
    ghost: "bg-white/50 text-gray-800 hover:bg-white/80 backdrop-blur-sm"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};