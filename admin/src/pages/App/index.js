/**
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 */

import React, { Suspense, lazy } from "react";
import { Switch, Route } from "react-router-dom";
import { NotFound, LoadingIndicatorPage } from "@strapi/helper-plugin";
// Utils
import DataManagerProvider from "../DataManagerProvider";
import pluginId from "../../pluginId";
import { ActiveNavigationProvider } from "../../hooks/useActiveNavigation";
import { NavigationItemPopupProvider } from "../../hooks/useNavigationItemPopup";
// Containers
const View = lazy(() => import("../View"));

const App = () => {
  return (
    <NavigationItemPopupProvider>
      <ActiveNavigationProvider>
        <DataManagerProvider>
          {/* TODO: [@ltsNotMike] To const */}
          <Suspense fallback={<LoadingIndicatorPage />}>
            <Switch>
              <Route path={`/plugins/${pluginId}`} component={View} exact />
              <Route component={NotFound} />
            </Switch>
          </Suspense>
        </DataManagerProvider>
      </ActiveNavigationProvider>
    </NavigationItemPopupProvider>
  );
};

export default App;
