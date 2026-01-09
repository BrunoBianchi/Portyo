import { useRouteError, isRouteErrorResponse, Link } from "react-router";

export default function CatchAll() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-black text-gray-200">404</h1>
        <p className="text-2xl font-bold text-gray-900 mt-4">Page not found</p>
        <p className="text-gray-500 mt-2 mb-8">Sorry, we couldn't find the page you're looking for.</p>
        <Link 
          to="/" 
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-black hover:bg-gray-800 transition-colors"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}
