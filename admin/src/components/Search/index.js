import React, { useRef, useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { IconButton } from '@strapi/design-system/IconButton';
import { Searchbar, SearchForm } from '@strapi/design-system/Searchbar';
import SearchIcon from "@strapi/icons/Search";
import { getTradId } from '../../translations';

const Search = ({ value, setValue }) => {
	const [isOpen, setIsOpen] = useState(!!value);
	const wrapperRef = useRef(null);
	const { formatMessage } = useIntl();

	useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        wrapperRef.current.querySelector('input').focus();
      }, 0);
    }
	}, [isOpen]);
	
	if (isOpen) {
		return (
			<div ref={wrapperRef}>
				<SearchForm>
					<Searchbar
						name="searchbar"
						onClear={() => setValue('')}
						value={value}
						size="S"
						onChange={(e) => setValue(e.target.value)}
						clearLabel="Clearing the search"
						placeholder={formatMessage({
							id: getTradId('popup.item.form.audience.placeholder'),
							defaultMessage: 'Type to start searching...',
						})}
					>
						Search for navigation items
					</Searchbar>
				</SearchForm>
			</div>
		);
	} else {
		return (
			<IconButton icon={<SearchIcon />} onClick={() => setIsOpen(!isOpen)} />
		);
	}
}

export default Search;
