import * as React from "react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Card Component
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border border-gray-200 bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg transition-transform hover:scale-[1.02] min-h-screen w-full overflow-auto",
      "px-4 py-6 md:px-8 lg:px-12", // Add responsive padding
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

// Card Header
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 p-6 border-b border-gray-300 bg-opacity-10 w-full",
      className
    )}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

// Card Title
const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-3xl font-bold leading-tight tracking-wide text-white",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

// Card Description
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-lg text-gray-300 leading-relaxed tracking-wide",
      className
    )}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

// Card Content
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-6 bg-opacity-20 w-full flex-grow", className)}
    {...props}
  />
));
CardContent.displayName = "CardContent";

// Card Footer
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center p-6 border-t border-gray-300 bg-opacity-10 w-full",
      className
    )}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
