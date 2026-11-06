import React from 'react';
import { Providers } from './providers';
import { Layout } from './layout';

export const App: React.FC = () => {
  return (
    <Providers>
      <Layout />
    </Providers>
  );
};

export default App;
