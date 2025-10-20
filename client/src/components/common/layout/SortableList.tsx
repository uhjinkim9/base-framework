"use client";

import {
	DragDropContext,
	Droppable,
	Draggable,
	DropResult,
} from "@hello-pangea/dnd";
import {ReactNode} from "react";

type Props<T> = {
	items: T[];
	getId: (item: T) => string;
	renderItem: (item: T, index: number, dragHandleProps: any) => ReactNode;
	droppableId: string;
	onChange: (items: T[]) => void;
};

export default function SortableList<T>({
	items,
	getId,
	renderItem,
	droppableId,
	onChange,
}: Props<T>) {
	// 드래그 완료 시 정렬 변경 처리
	const handleDragEnd = (result: DropResult) => {
		if (!result.destination) return;

		const reordered = [...items];
		const [moved] = reordered.splice(result.source.index, 1);
		reordered.splice(result.destination.index, 0, moved);

		onChange(reordered);
	};

	return (
		<DragDropContext onDragEnd={handleDragEnd}>
			<Droppable droppableId={droppableId}>
				{(provided) => (
					<div ref={provided.innerRef} {...provided.droppableProps}>
						{items.map((item, index) => {
							const id = getId(item);
							if (!id) return null; // id 없으면 렌더링하지 않음 (에러 방지)

							return (
								<Draggable
									key={getId(item)}
									draggableId={getId(item)}
									index={index}
								>
									{(provided) => (
										<div
											ref={provided.innerRef}
											// 드래그 가능한 전체 영역에 필수적으로 적용되는 props
											{...provided.draggableProps}
											// 드래그 핸들 역할을 하는 영역에 적용되는 props (전체 영역에 같이 적용해도 무방)
											{...provided.dragHandleProps}
										>
											{renderItem(
												item,
												index,
												provided.dragHandleProps
											)}
										</div>
									)}
								</Draggable>
							);
						})}
						{provided.placeholder}
					</div>
				)}
			</Droppable>
		</DragDropContext>
	);
}
