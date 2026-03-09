import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* 404 Icon/Illustration */}
        <div className="mx-auto w-48 h-48 text-indigo-500">
          <svg
            className="w-full h-full"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Main Content */}
        <div className="text-center">
          <h1 className="text-9xl font-bold text-indigo-600">404</h1>
          <h2 className="mt-3 text-3xl font-bold text-gray-900">
            Oops! Page not found
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            The page you're looking for doesn't seem to exist
          </p>
        </div>

        {/* Helpful Navigation */}
        <div className="space-y-4">
          <div className="text-gray-600">
            You might want to check out:
            <ul className="mt-2 space-y-1 text-indigo-600">
              <li>
                <Link
                  to="/"
                  className="hover:text-indigo-500 transition-colors duration-200"
                >
                  → Home Page
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="hover:text-indigo-500 transition-colors duration-200"
                >
                  → Our Products
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-indigo-500 transition-colors duration-200"
                >
                  → Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Back to Home Button */}
          <Link
            to="/"
            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
          >
            Back to Home
          </Link>
        </div>

        {/* Additional Help */}
        <p className="text-sm text-gray-500 mt-8">
          Need help? {' '}
          <Link
            to="/help"
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            Visit our help center
          </Link>
        </p>
      </div>
    </div>
  );
};

export default NotFound;