import React from "react";
import { pick } from "lodash";

// @ts-ignore
import { SettingsPageTitle } from "@strapi/helper-plugin";

import { getMessage, ResourceState } from "../../utils";
import useSettingsConfig from "../../hooks/useSettingsConfig";
import useAllContentTypes from "../../hooks/useAllContentTypes";
import LoadingView from "../../components/LoadingView";
import ErrorView from "../../components/ErrorView";
import MainSettingsView from "./components/MainSettingsView";

const SettingsPage = () => {
  const navigationConfig = useSettingsConfig();
  const allContentTypes = useAllContentTypes();

  if (
    navigationConfig.state === ResourceState.LOADING ||
    allContentTypes.state === ResourceState.LOADING
  ) {
    return <LoadingView />;
  }

  if (navigationConfig.state === ResourceState.ERROR) {
    return <ErrorView error={navigationConfig.error} />;
  }

  if (allContentTypes.state === ResourceState.ERROR) {
    return <ErrorView error={allContentTypes.error} />;
  }

  return (
    <>
      <SettingsPageTitle
        name={getMessage("Settings.email.plugin.title", "Configuration")}
      />
      <MainSettingsView
        {...pick(
          navigationConfig.value,
          "config",
          "submitConfig",
          "restoreConfig",
          "restartStrapi"
        )}
        allContentTypes={allContentTypes.value}
      />
    </>
  );
};

export default SettingsPage;
