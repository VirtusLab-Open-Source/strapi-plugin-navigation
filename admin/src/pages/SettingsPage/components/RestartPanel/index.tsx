import { Box, Button } from '@strapi/design-system';
import { Play } from '@strapi/icons';

import { useIntl } from 'react-intl';
import { getTrad } from '../../../../translations';
import { BOX_DEFAULT_PROPS } from '../../common';
import { RestartAlert } from '../../../../components/RestartAlert';
import { waitForServerRestart } from '../../utils';
import { useRestart } from '../../hooks';
import { useSettingsContext } from '../../context';

type RestartPanelProps = {
  setIsReloading: (isReloading: boolean) => void;
};

export const RestartPanel: React.FC<RestartPanelProps> = ({ setIsReloading }) => {
  const { formatMessage } = useIntl();
  const restartMutation = useRestart();

  const { restartStatus, setRestartStatus } = useSettingsContext();

  const handleRestart = async () => {
    restartMutation.mutate(undefined, {
      onSuccess() {
        setIsReloading(true);

        waitForServerRestart(true).then((isReady) => {
          if (isReady) {
            window.location.reload();
          }
        });
      },
      onError() {
        setRestartStatus({ required: false });
      },
    });
  };

  const handleRestartDiscard = () => setRestartStatus({ required: false });

  if (!restartStatus.required) {
    return null;
  }

  return (
    <Box {...BOX_DEFAULT_PROPS} width="100%">
      <RestartAlert
        closeLabel={formatMessage(getTrad('pages.settings.actions.restart.alert.cancel'))}
        title={formatMessage(getTrad('pages.settings.actions.restart.alert.title'))}
        action={
          <Box>
            <Button onClick={handleRestart} startIcon={<Play />}>
              {formatMessage(getTrad('pages.settings.actions.restart.label'))}
            </Button>
          </Box>
        }
        onClose={handleRestartDiscard}
      >
        <>
          <Box paddingBottom={1}>
            {formatMessage(getTrad('pages.settings.actions.restart.alert.description'))}
          </Box>
          {restartStatus.reasons?.map((reason, i) => (
            <Box
              paddingBottom={1}
              key={i}
              children={formatMessage(
                getTrad(`pages.settings.actions.restart.alert.reason.${reason}`)
              )}
            />
          ))}
        </>
      </RestartAlert>
    </Box>
  );
};
