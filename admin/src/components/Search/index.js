import React, { useRef, useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { IconButton } from '@strapi/design-system/IconButton';
import { Searchbar } from '@strapi/design-system/Searchbar';
import SearchIcon from "@strapi/icons/Search";
import { getMessage } from '../../utils';

const Search = ({ value, setValue }) => {
	const [isOpen, setIsOpen] = useState(!!value);
	const wrapperRef = useRef(null);

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
				<Searchbar
					name="searchbar"
					onClear={() => { setValue(''); setIsOpen(false); }}
					value={value}
					size="S"
					onChange={(e) => setValue(e.target.value)}
					clearLabel="Clearing the search"
					placeholder={getMessage('pages.main.search.placeholder', 'Type to start searching...')}
				>
					Search for navigation items
				</Searchbar>
			</div>
		);
	} else {
		return (
			<IconButton icon={<SearchIcon />} onClick={() => setIsOpen(!isOpen)} />
		);
	}
}

export default Search;
