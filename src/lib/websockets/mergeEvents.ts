import type { StreamEvent, Item } from './types';
/**
 * Applies a list of DynamoDB stream events to an existing array of items.
 *
 * For MODIFY, it finds the item with the same projectId+createdAt and replaces it.
 * For INSERT, it appends the new item.
 */
export function mergeEvents(initialItems: Item[], events: StreamEvent[]): Item[] {
	return events.reduce((items, event) => {
		switch (event.event) {
			case 'MODIFY':
				return items.map((existing) => {
					let match = true;
					Object.keys(event.keys).forEach(key => {
						if (existing[key as keyof Item] !== event.keys[key as keyof typeof event.keys]) {
							match = false;
						}
					});
					return match ? { ...existing, ...event.item } : existing;
				});

			case 'INSERT':
				return [...items, event.item];

			case 'REMOVE':
				return items.filter(
					(existing) =>
						existing.projectId !== event.keys.projectId || existing.userId !== event.keys.userId
				);

			default:
				return items;
		}
	}, initialItems);
}
