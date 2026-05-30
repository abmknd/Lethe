import { isRouteErrorResponse, useRouteError } from "react-router";

export default function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-light mb-4">404</h1>
          <p className="text-white/40">Page not found</p>
        </div>
      </div>
    );
  }

  const message =
    isRouteErrorResponse(error)
      ? `${error.status} ${error.statusText}`
      : error instanceof Error
      ? error.message
      : "Unknown error";

  if (import.meta.env.DEV) {
    console.error("Route error:", error);
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-light mb-3">Something went wrong</h1>
        <p className="text-white/40 mb-6">
          The page hit an unexpected error. Try refreshing — if it keeps happening, let us know.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-full border border-white/20 text-white/80 hover:border-white/40 hover:text-white text-sm tracking-wide"
        >
          Refresh
        </button>
        {import.meta.env.DEV && (
          <pre className="mt-6 text-left text-xs text-white/30 whitespace-pre-wrap break-words">
            {message}
          </pre>
        )}
      </div>
    </div>
  );
}
