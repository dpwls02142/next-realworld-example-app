import { StrictMode } from 'react';

import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => (
  <>
    <StrictMode>
      <Navbar />
      {children}
      <Footer />
    </StrictMode>
  </>
);

export default Layout;
