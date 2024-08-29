import { Page } from '@strapi/strapi/admin';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Route, Routes } from 'react-router-dom';

import { HomePage } from './HomePage';

const App = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <Routes>
        <Route path={`/`} index Component={HomePage} />
        <Route path={`/*`} Component={Page.Error} />
      </Routes>
    </DndProvider>
  );
};

export default App;
