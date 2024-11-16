import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-lg border border-gray-300 bg-gradient-to-br from-gray-100 to-gray-50 px-4 py-2 text-base text-gray-800 placeholder:text-gray-400 shadow-sm",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white transition-all duration-300",
          "hover:shadow-md hover:ring-1 hover:ring-blue-400",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900 dark:text-gray-200 dark:placeholder:text-gray-500 dark:focus:ring-blue-500 dark:focus:ring-offset-gray-800",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
