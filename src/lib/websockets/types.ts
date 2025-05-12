// your item shape
export interface Item {
	projectId: string;
	createdAt: string;
	name: string;
	userId: string;
}

interface RemoveEvent {
	event: 'REMOVE';
	keys: {
		projectId: string;
		userId: string;
	};
}

interface InsertEvent {
	event: 'INSERT';
	keys: {
		projectId: string;
		userId: string;
	};
	item: Item;
}

interface ModifyEvent {
	event: 'MODIFY';
	keys: {
		projectId: string;
		userId: string;
	};
	item: Item;
}
// shape of a stream notification
export type StreamEvent = RemoveEvent | InsertEvent | ModifyEvent;
