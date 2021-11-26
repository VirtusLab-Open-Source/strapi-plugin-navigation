
export const prepareItemToViewPayload = (items = [], viewParentId = null, config = {}) =>
items.map((item, n) => {
	const viewId = uuid();
	return {
		...linkRelations({
			viewId,
			viewParentId,
			...item,
			order: item.order || (n + 1),
			updated: item.updated || isNil(item.order),
		}, config),
		items: prepareItemToViewPayload(item.items, viewId, config),
	};
});