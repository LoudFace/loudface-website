'use client';

import { useState, FormEvent } from 'react';
import { getNewsletterContent } from '@/lib/content-utils';

interface NewsletterFormProps {
  className?: string;
  variant?: 'light' | 'dark';
  placeholder?: string;
  buttonText?: string;
  loadingText?: string;
  successMessage?: string;
  errorMessage?: string;
  networkErrorMessage?: string;
}

export function NewsletterForm({
  className = '',
  variant = 'dark',
  placeholder,
  buttonText,
  loadingText,
  successMessage,
  errorMessage,
  networkErrorMessage,
}: NewsletterFormProps) {
  const content = getNewsletterContent();

  // Use props or fall back to content defaults
  const finalPlaceholder = placeholder ?? content.placeholder;
  const finalButtonText = buttonText ?? content.buttonText;
  const finalLoadingText = loadingText ?? content.loadingText;
  const finalSuccessMessage = successMessage ?? content.successMessage;
  const finalErrorMessage = errorMessage ?? content.errorMessage;
  const finalNetworkErrorMessage = networkErrorMessage ?? content.networkErrorMessage;

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorText, setErrorText] = useState('');

  const inputClasses =
    variant === 'dark'
      ? 'bg-transparent text-surface-400 placeholder:text-surface-500 border-surface-700 focus:border-primary-500'
      : 'bg-white text-surface-900 placeholder:text-surface-400 border-surface-200 focus:border-primary-500';

  const buttonClasses =
    variant === 'dark'
      ? 'bg-surface-50 text-surface-900 hover:bg-surface-200'
      : 'bg-surface-900 text-white hover:bg-surface-800';

  const successClasses =
    variant === 'dark' ? 'bg-success-dark text-white' : 'bg-success-light text-success-dark';

  const errorClasses =
    variant === 'dark' ? 'bg-error-dark text-surface-100' : 'bg-error-light text-error-dark';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('idle');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setStatus('success');
      } else {
        setErrorText(result.message || finalErrorMessage);
        setStatus('error');
      }
    } catch {
      setErrorText(finalNetworkErrorMessage);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {status !== 'success' && (
        <form className="flex flex-col sm:flex-row gap-3" onSubmit={handleSubmit}>
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            className={`flex-1 px-4 py-3 rounded-lg border text-base font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${inputClasses}`}
            maxLength={256}
            name="email"
            placeholder={finalPlaceholder}
            type="email"
            id="newsletter-email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="submit"
            className={`px-6 py-3 rounded-lg text-base font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${buttonClasses}`}
            disabled={isLoading}
          >
            {isLoading ? finalLoadingText : finalButtonText}
          </button>
        </form>
      )}

      {status === 'success' && (
        <div className={`p-3 rounded text-sm ${successClasses}`}>
          <div>{finalSuccessMessage}</div>
        </div>
      )}

      {status === 'error' && (
        <div className={`mt-3 p-3 rounded text-xs ${errorClasses}`}>
          <div>{errorText}</div>
        </div>
      )}
    </div>
  );
}
