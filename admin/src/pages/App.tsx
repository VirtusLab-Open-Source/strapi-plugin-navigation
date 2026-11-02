import { Page } from '@strapi/strapi/admin';
import { Route, Routes } from 'react-router-dom';

import { NavigationDndProvider } from '../components/NavigationDndProvider';
import { HomePage } from './HomePage';

const App = () => {
  return (
    <NavigationDndProvider>
      <Routes>
        <Route path={`/`} index Component={HomePage} />
        <Route path={`/*`} Component={Page.Error} />
      </Routes>
    </NavigationDndProvider>
  );
};

export default App;
