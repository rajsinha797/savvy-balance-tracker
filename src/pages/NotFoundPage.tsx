
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFoundPage = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-fintrack-bg-dark p-4 text-center">
      <div>
        <h1 className="text-5xl font-bold text-fintrack-purple mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
        <p className="text-fintrack-text-secondary mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button className="bg-fintrack-purple hover:bg-fintrack-purple/90" asChild>
          <Link to="/">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
