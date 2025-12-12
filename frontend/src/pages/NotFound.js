import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Search, ArrowLeft, Home } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4">
          <div className="text-center max-w-md">
            {/* 404 Number */}
            <div className="mb-8">
              <span className="text-9xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                404
              </span>
            </div>

            {/* Illustration */}
            <div className="mb-8">
              <Search className="w-24 h-24 mx-auto text-gray-700 opacity-50" />
            </div>

            {/* Error Message */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
            <p className="text-lg text-gray-600 mb-4">
              Sorry, the page you're looking for doesn't exist or has been moved.
            </p>
            <p className="text-sm text-gray-800 mb-8">
              Please check the URL and try again, or use the buttons below to navigate.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </Button>
              <Link to="/">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 w-full">
                  <Home className="w-4 h-4" />
                  Back to Home
                </Button>
              </Link>
            </div>

            {/* Help Section */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-3">Need help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Here are some helpful links:
              </p>
              <div className="space-y-2">
                <Link to="/" className="block text-sm text-blue-600 hover:text-blue-700 font-medium">
                  → Home Page
                </Link>
                <Link to="/about" className="block text-sm text-blue-600 hover:text-blue-700 font-medium">
                  → About Us
                </Link>
                <Link to="/contact" className="block text-sm text-blue-600 hover:text-blue-700 font-medium">
                  → Contact Support
                </Link>
                <Link to="/faq" className="block text-sm text-blue-600 hover:text-blue-700 font-medium">
                  → FAQ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
