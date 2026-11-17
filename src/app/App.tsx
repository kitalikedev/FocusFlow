import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Providers } from './providers';
import { Layout } from './layout';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Providers>
        <Layout />
      </Providers>
    </BrowserRouter>
  );
};

export default App;
