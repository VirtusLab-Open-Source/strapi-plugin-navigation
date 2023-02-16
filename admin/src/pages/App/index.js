/**
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 */

import React, { Suspense, lazy } from "react";
import { Switch, Route } from "react-router-dom";
import { NotFound, LoadingIndicatorPage } from "@strapi/helper-plugin";
import DataManagerProvider from "../DataManagerProvider";
import pluginId from "../../pluginId";
import { ActiveNavigationProvider } from "../../hooks/useActiveNavigation";
import { NavigationItemPopupProvider } from "../../hooks/useNavigationItemPopup";

const View = lazy(() => import("../View"));
const loadingIndicatorPage = <LoadingIndicatorPage />;

const App = () => {
  return (
    <NavigationItemPopupProvider>
      <ActiveNavigationProvider>
        <DataManagerProvider>
          <Suspense fallback={loadingIndicatorPage}>
            <Switch>
              <Route path={`/plugins/${pluginId}`} component={View} />
              <Route component={NotFound} />
            </Switch>
          </Suspense>
        </DataManagerProvider>
      </ActiveNavigationProvider>
    </NavigationItemPopupProvider>
  );
};

export default App;
