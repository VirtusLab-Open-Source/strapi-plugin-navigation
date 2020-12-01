import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink, faGlobe, faSitemap } from '@fortawesome/free-solid-svg-icons';
import CardItemRelation from './CardItemRelation';
import CardItemType from './CardItemType';
import Wrapper from './Wrapper';
import { isNil, get, upperFirst } from 'lodash';
import { navigationItemType } from '../../containers/View/utils/enums';
import { extractRelatedItemLabel } from '../../containers/View/utils/parsers';

const ItemFooter = ({ type, removed, relatedRef, attachButtons, contentTypesNameFields }) => {
  const formatRelationType = () =>
    !isNil(relatedRef) ? get(relatedRef, '__contentType') : '';

  const formatRelationName = () =>
    !isNil(relatedRef) ? extractRelatedItemLabel(relatedRef, contentTypesNameFields) : '';

  return (
    <Wrapper removed={removed} attachButtons={attachButtons}>
      <CardItemType>
        <FontAwesomeIcon
          icon={type === navigationItemType.EXTERNAL ? faGlobe : faSitemap}
        />{' '}
        {upperFirst(type.toLowerCase())}
      </CardItemType>
      {!isNil(relatedRef) && (
        <CardItemRelation title={formatRelationName()}>
          <FontAwesomeIcon icon={faLink} />{' '}
          {`(${formatRelationType()}) ${formatRelationName()}`}
        </CardItemRelation>
      )}
    </Wrapper>
  );
};

ItemFooter.propTypes = {
  type: PropTypes.string.isRequired,
  contentTypesNameFields: PropTypes.object.isRequired,
  menuAttached: PropTypes.bool,
  removed: PropTypes.bool,
  relatedRef: PropTypes.object,
  attachButtons: PropTypes.bool,
};

export default ItemFooter;
