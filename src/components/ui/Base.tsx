import React from 'react';
import { cn } from '../../lib/utils';

export const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("bg-brand-card border border-brand-border rounded-xl shadow-lg overflow-hidden", className)} {...props}>
    {children}
  </div>
);

export const Button = ({ 
  className, 
  variant = 'primary', 
  size = 'md',
  isLoading,
  children,
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger',
  size?: 'sm' | 'md' | 'lg',
  isLoading?: boolean
}) => {
  const variants = {
    primary: 'bg-brand-accent text-white hover:opacity-90 shadow-brand-accent/20',
    secondary: 'bg-brand-border text-brand-text hover:bg-opacity-80',
    outline: 'border border-brand-border bg-transparent text-brand-text hover:bg-brand-card',
    ghost: 'bg-transparent text-brand-dim hover:text-brand-text',
    danger: 'bg-brand-danger text-white hover:opacity-90 shadow-brand-danger/20'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-xs font-semibold',
    md: 'px-6 py-2.5 text-sm font-bold',
    lg: 'px-8 py-3.5 text-base font-bold'
  };

  return (
    <button 
      className={cn(
        "inline-flex items-center justify-center rounded-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-wide",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export const Input = ({ label, error, className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string, error?: string }) => (
  <div className="flex flex-col gap-2 w-full">
    {label && <label className="text-[10px] font-bold text-brand-dim uppercase tracking-wider">{label}</label>}
    <input 
      className={cn(
        "bg-brand-card border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text transition-all focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/50 placeholder:text-brand-dim/50",
        error ? "border-brand-danger focus:ring-brand-danger/50" : "",
        className
      )}
      {...props}
    />
    {error && <span className="text-[10px] text-brand-danger mt-0.5">{error}</span>}
  </div>
);

export const Select = ({ label, options, className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string, options: Array<{ label: string, value: string }> }) => (
  <div className="flex flex-col gap-2 w-full">
    {label && <label className="text-[10px] font-bold text-brand-dim uppercase tracking-wider">{label}</label>}
    <select 
      className={cn(
        "bg-brand-card border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text transition-all focus:outline-none focus:border-brand-accent appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')] bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat",
        className
      )}
      {...props}
    >
      {options.map(opt => <option key={opt.value} value={opt.value} className="bg-brand-card text-brand-text">{opt.label}</option>)}
    </select>
  </div>
);
