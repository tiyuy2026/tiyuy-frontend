'use client';

import { Group, Channel, ViewType } from '../types';
import { GridCard } from './GridCard';

interface ItemGridProps {
  items: (Group | Channel)[];
  viewType: ViewType;
  onReactivate: (item: Group | Channel) => void;
  onViewDetails: (item: Group | Channel) => void;
  onToggleStatus: (item: Group | Channel) => void;
  onSuspend: (item: Group | Channel) => void;
  onViolation: (item: Group | Channel) => void;
}

export function ItemGrid({
  items,
  viewType,
  onReactivate,
  onViewDetails,
  onToggleStatus,
  onSuspend,
  onViolation,
}: ItemGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <GridCard
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
