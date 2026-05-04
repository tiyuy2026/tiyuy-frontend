'use client';

import { Group, Channel, ViewType } from '../types';
import { ListItem } from './ListItem';

interface ItemListProps {
  items: (Group | Channel)[];
  viewType: ViewType;
  onReactivate: (item: Group | Channel) => void;
  onViewDetails: (item: Group | Channel) => void;
  onToggleStatus: (item: Group | Channel) => void;
  onSuspend: (item: Group | Channel) => void;
  onViolation: (item: Group | Channel) => void;
}

export function ItemList({
  items,
  viewType,
  onReactivate,
  onViewDetails,
  onToggleStatus,
  onSuspend,
  onViolation,
}: ItemListProps) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <ListItem
          key={item.id}
          item={item}
          viewType={viewType}
          onReactivate={onReactivate}
          onViewDetails={onViewDetails}
          onToggleStatus={onToggleStatus}
          onSuspend={onSuspend}
          onViolation={onViolation}
        />
      ))}
    </div>
  );
}
