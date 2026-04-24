"use client";

import { useState } from "react";
import { Button } from "./button";
import { AlertCircleIcon, RefreshIcon } from "./icons";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  return (
    <ErrorBoundaryWrapper>
      {children}
      {fallback}
    </ErrorBoundaryWrapper>
  );
}

function ErrorBoundaryWrapper({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  if (hasError) {
    return (
      <ErrorFallback
        error={error}
        onReset={() => {
          setHasError(false);
          setError(null);
        }}
      />
    );
  }

  return <>{children}</>;
}

interface ErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

export function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center">
      <AlertCircleIcon className="h-12 w-12 text-destructive" />
      <h2 className="mt-4 text-xl font-semibold">Something went wrong</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        We encountered an unexpected error. Please try again or contact support if the problem persists.
      </p>
      {error && (
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="mt-2 text-xs text-muted-foreground underline"
        >
          {showDetails ? "Hide details" : "Show details"}
        </button>
      )}
      {showDetails && error && (
        <pre className="mt-2 max-w-lg overflow-auto rounded bg-muted p-2 text-xs">
          {error.message}
        </pre>
      )}
      <div className="mt-6 flex gap-3">
        <Button variant="outline" onClick={onReset}>
          <RefreshIcon className="mr-2 h-4 w-4" />
          Try Again
        </Button>
        <Button variant="default" onClick={() => window.location.href = "/"}>
          Go Home
        </Button>
      </div>
    </div>
  );
}

export function ApiError({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
      <AlertCircleIcon className="h-8 w-8 text-destructive" />
      <p className="mt-2 text-sm text-destructive">{message}</p>
    </div>
  );
}

export function NotFoundError({ title = "Not Found" }: { title?: string }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border p-8 text-center">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        The resource you're looking for doesn't exist or has been removed.
      </p>
      <Button className="mt-6" onClick={() => window.location.href = "/"}>
        Go Home
      </Button>
    </div>
  );
}