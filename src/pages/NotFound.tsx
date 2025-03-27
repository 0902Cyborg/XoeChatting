
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="text-center">
        <h1 className="text-9xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          This page doesn't exist or has been moved
        </p>
        <Button onClick={() => navigate('/')} className="elegant-button">
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
