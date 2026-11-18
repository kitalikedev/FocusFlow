import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Providers } from './providers';
import { Layout } from './layout';
import { PageTracker } from './PageTracker';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <PageTracker />
      <Providers>
        <Layout />
      </Providers>
    </BrowserRouter>
  );
};

export default App;
