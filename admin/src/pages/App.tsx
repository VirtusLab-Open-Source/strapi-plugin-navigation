import { Page } from '@strapi/strapi/admin';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Route, Routes } from 'react-router-dom';

import { useConfig } from '../hooks';
import { DetailPage } from './DetailPage';
import { HomePage } from './HomePage';
import { OverviewPage } from './OverviewPage';

const queryClient = new QueryClient();

const AppRoutes = () => {
  const configQuery = useConfig();

  if (configQuery.isPending) {
    return <Page.Loading />;
  }

  if (configQuery.data?.isOverviewUiEnabled) {
    return (
      <Routes>
        <Route path={`/`} index Component={OverviewPage} />
        <Route path={`/:documentId`} Component={DetailPage} />
        <Route path={`/*`} Component={Page.Error} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path={`/`} index Component={HomePage} />
      <Route path={`/*`} Component={Page.Error} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <DndProvider backend={HTML5Backend}>
        <AppRoutes />
      </DndProvider>
    </QueryClientProvider>
  );
};

export default App;
