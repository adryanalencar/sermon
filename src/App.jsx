
import React from 'react';
import { Helmet } from 'react-helmet';
import Dashboard from '@/components/Dashboard';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <>
      <Helmet>
        <title>PulpitGraph - Knowledge Management for Spiritual Reflection</title>
        <meta name="description" content="A serene knowledge management system designed for organizing thoughts, notes, and spiritual reflections with visual graph connections and mind mapping capabilities." />
      </Helmet>
      <Dashboard />
      <Toaster />
    </>
  );
}

export default App;
