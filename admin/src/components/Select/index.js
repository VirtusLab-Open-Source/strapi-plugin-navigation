import React from 'react';
import PropTypes from 'prop-types';
import ReactSelect from 'react-select';
import { Padded } from '@buffetjs/core';
import styles from './utils/styles';
import ClearIndicator from './ClearIndicator';
import DropdownIndicator from './DropdownIndicator';
import ErrorMessage from './ErrorMessage';
import IndicatorSeparator from './IndicatorSeparator';
import MultiValueContainer from './MultiValueContainer';
import { useIntl } from 'react-intl';

const Select = ({ error, isDisabled, isMulti, isLoading, name, onChange, onInputChange, value, inputValue, defaultValue, options }) => {
  const { formatMessage } = useIntl();
  const translatedError = error && error.id ? formatMessage(error) : null;

  return (
    <>
      <ReactSelect
        components={{
          ClearIndicator,
          DropdownIndicator,
          IndicatorSeparator,
          MultiValueContainer,
        }}
        error={error}
        getOptionLabel={option => option ? option.label : undefined}
        getOptionValue={option => option ? option.value : undefined}
        onChange={data => {
          onChange({ target: { name, value: data } });
        }}
        onInputChange={onInputChange}
        isClearable
        isDisabled={isDisabled}
        isLoading={isLoading}
        isMulti={isMulti}
        options={isLoading ? [] : options}
        styles={styles}
        defaultValue={defaultValue}
        inputValue={inputValue}
        value={isLoading ? undefined : value}
      />
      {error && (!value || value.length === 0) ? (
        <ErrorMessage>{translatedError}</ErrorMessage>
      ) : (
        <Padded top size="11px" />
      )}
    </>
  );
};

Select.defaultProps = {
  error: null,
  isDisabled: false,
  value: [],
};

Select.propTypes = {
  error: PropTypes.shape({
    id: PropTypes.string,
  }),
  isDisabled: PropTypes.bool,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.array,
};

export default Select;
