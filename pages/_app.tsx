import Head from 'next/head';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Layout from '../shared/ui/layout/Layout';
import ContextProvider from 'lib/context';
import 'styles.css';
import 'react-quill/dist/quill.snow.css';

if (typeof window !== 'undefined') {
  require('lazysizes/plugins/attrchange/ls.attrchange.js');
  require('lazysizes/plugins/respimg/ls.respimg.js');
  require('lazysizes');
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const MyApp = ({ Component, pageProps }) => (
  <>
    <Head>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
      />
    </Head>
    <QueryClientProvider client={queryClient}>
      <ContextProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ContextProvider>
    </QueryClientProvider>
  </>
);

export default MyApp;
