import React, { useCallback, useMemo, useState, VFC } from "react";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import { getMessage } from "../../utils";
// @ts-ignore
import { Formik } from "formik";
// @ts-ignore
import { Check, Refresh, Play, Information } from "@strapi/icons";
// @ts-ignore
import { Form } from "@strapi/helper-plugin";
// @ts-ignore
import { Stack } from "@strapi/design-system/Stack";
// @ts-ignore
import { Box } from "@strapi/design-system/Box";
// @ts-ignore
import { Grid, GridItem } from "@strapi/design-system/Grid";
// @ts-ignore
import { ToggleInput } from "@strapi/design-system/ToggleInput";
// @ts-ignore
import { Typography } from "@strapi/design-system/Typography";
import { ToBeFixed } from "../../../../types";

interface Form {
  pruneNavigations: boolean;
  enabled: boolean;
}

interface FormBooleanItemInput {
  target: { checked: boolean };
}

interface SubmitEffect {
  ({ pruneNavigations }: Form): void;
}

interface CancelEffect {
  (): void;
}

interface DisableI18nModalProps {
  isVisible?: boolean;
  onSubmit: SubmitEffect;
  onCancel: CancelEffect;
}

const refreshIcon = <></>;

const INITIAL_VALUES: Form = { pruneNavigations: false, enabled: true };

export const DisableI18nModal: VFC<DisableI18nModalProps> = ({
  isVisible,
  onSubmit,
  onCancel,
}) => {
  const [state, setState] = useState(INITIAL_VALUES);
  const onConfirm = useCallback(() => {
    onSubmit(state);
  }, [onSubmit, state]);

  return (
    <ConfirmationDialog
      isVisible={isVisible}
      header={getMessage(
        "pages.settings.actions.disableI18n.confirmation.header"
      )}
      labelConfirm={getMessage(
        "pages.settings.actions.disableI18n.confirmation.confirm"
      )}
      iconConfirm={refreshIcon}
      mainIcon={refreshIcon}
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      <Formik initialValues={INITIAL_VALUES} onSubmit={onConfirm}>
        {({ handleSubmit, setFieldValue, values }: ToBeFixed) => (
          <>
            <Grid gap={4}>
              <GridItem col={12}>
                <Box padding={2}>
                  {getMessage(
                    "pages.settings.actions.disableI18n.confirmation.description.line1"
                  )}
                </Box>
                <Box padding={2}>
                  {getMessage(
                    "pages.settings.actions.disableI18n.confirmation.description.line2"
                  )}
                </Box>
                <Box padding={2}>
                  <Typography fontWeight="bold">
                    {getMessage(
                      "pages.settings.actions.disableI18n.confirmation.description.line3"
                    )}
                  </Typography>
                </Box>
              </GridItem>
            </Grid>
            <Form noValidate onSubmit={handleSubmit}>
              <Stack spacing={4}>
                <Grid gap={4}>
                  <GridItem col={12}>
                    <Box padding={2}>
                      <ToggleInput
                        name="audienceFieldChecked"
                        label={getMessage(
                          "pages.settings.actions.disableI18n.prune.label"
                        )}
                        hint={""}
                        checked={values.pruneNavigations}
                        onChange={({
                          target: { checked },
                        }: FormBooleanItemInput) => {
                          setFieldValue("pruneNavigations", checked, false);
                          setState((state) => ({
                            ...state,
                            pruneNavigations: checked,
                          }));
                        }}
                        onLabel={getMessage(
                          "pages.settings.actions.disableI18n.prune.on"
                        )}
                        offLabel={getMessage(
                          "pages.settings.actions.disableI18n.prune.off"
                        )}
                      />
                    </Box>
                  </GridItem>
                </Grid>
              </Stack>
            </Form>
          </>
        )}
      </Formik>
    </ConfirmationDialog>
  );
};

export const useDisableI18nModal = (onSubmit: SubmitEffect) => {
  const [isOpened, setIsOpened] = useState(false);
  const [onCancel, setOnCancel] = useState(() => () => {});
  const onSubmitWithModalClose = useCallback<SubmitEffect>(
    (val) => {
      onSubmit(val);
      setIsOpened(false);
    },
    [onSubmit, setIsOpened]
  );
  const onCancelWithModalClose = () => {
    onCancel();
    setIsOpened(false);
  };
  const modal = isOpened ? (
    <DisableI18nModal
      isVisible={isOpened}
      onSubmit={onSubmitWithModalClose}
      onCancel={onCancelWithModalClose}
    />
  ) : null;

  return useMemo(
    () => ({
      setDisableI18nModalOpened: setIsOpened,
      setI18nModalOnCancel: setOnCancel,
      disableI18nModal: modal,
    }),
    [setIsOpened, modal, setOnCancel]
  );
};
