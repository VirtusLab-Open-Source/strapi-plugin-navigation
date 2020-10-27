import React from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink, faGlobe, faSitemap } from "@fortawesome/free-solid-svg-icons";
import CardItemRelation from "./CardItemRelation";
import CardItemType from "./CardItemType";
import Wrapper from "./Wrapper";
import { isNil, upperFirst } from "lodash";
import { navigationItemType } from "../../containers/View/utils/enums";

const ENTITY_NAME_PARAMS = [
  "title",
  "Title",
  "subject",
  "Subject",
  "name",
  "Name",
];
const resolveEntityName = (entity) =>
  ENTITY_NAME_PARAMS.map((_) => entity[_]).filter((_) => _)[0] || "";

const ItemFooter = ({ type, removed, relatedRef, attachButtons }) => {
  const formatRelationType = () =>
    !isNil(relatedRef) ? relatedRef.__contentType : "";

  const formatRelationName = () =>
    !isNil(relatedRef) ? resolveEntityName(relatedRef) : "";

  return (
    <Wrapper removed={removed} attachButtons={attachButtons}>
      <CardItemType>
        <FontAwesomeIcon
          icon={type === navigationItemType.EXTERNAL ? faGlobe : faSitemap}
        />{" "}
        {upperFirst(type.toLowerCase())}
      </CardItemType>
      {!isNil(relatedRef) && (
        <CardItemRelation title={formatRelationName()}>
          <FontAwesomeIcon icon={faLink} />{" "}
          {`(${formatRelationType()}) ${formatRelationName()}`}
        </CardItemRelation>
      )}
    </Wrapper>
  );
};

ItemFooter.propTypes = {
  type: PropTypes.string.isRequired,
  menuAttached: PropTypes.bool,
  removed: PropTypes.bool,
  relatedRef: PropTypes.object,
  attachButtons: PropTypes.bool,
};

export default ItemFooter;
