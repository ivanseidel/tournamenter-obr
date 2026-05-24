import type { ReactNode } from 'react';

export function Thumbnail({ children }: { children: ReactNode }) {
  return <div className="thumbnail">{children}</div>;
}

export function LoadingAlert({ children = 'Carregando...' }: { children?: ReactNode }) {
  return (
    <div className="alert alert-warning" role="status">
      {children}
    </div>
  );
}

export function ErrorAlert({ error }: { error?: string | null }) {
  if (!error) return null;
  return (
    <div className="alert alert-danger" role="alert">
      {error}
    </div>
  );
}

export function SuccessAlert({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div className="alert alert-success" role="status">
      {message}
    </div>
  );
}
