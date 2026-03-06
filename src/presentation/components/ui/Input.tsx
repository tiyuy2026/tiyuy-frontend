import React from 'react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'helperText'> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
  className?: string;
  label?: string;        // ← agregar
  error?: string; 
}

export const Input: React.FC<InputProps> = ({
  leftIcon,
  rightIcon,
  helperText,
  className = '',
  ...props
}) => {
  return (
    <div className="relative">
      {leftIcon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {leftIcon}
        </div>
      )}
      
      <input
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          leftIcon ? 'pl-10' : ''
        } ${rightIcon ? 'pr-10' : ''} ${className}`}
        {...props}
      />
      
      {rightIcon && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {rightIcon}
        </div>
      )}
      
      {helperText && (
        <p className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};
