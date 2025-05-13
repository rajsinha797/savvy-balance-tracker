
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const Index = () => {
  // Later, we can add authentication checks here before redirecting
  return <Navigate to="/" replace />;
};

export default Index;
