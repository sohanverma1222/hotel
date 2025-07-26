'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Filter, X } from 'lucide-react';

type FilterType = 'status' | 'floor' | 'type';

interface ActiveFilter {
  type: FilterType;
  value: string;
  label: string;
}

interface RoomFiltersProps {
  activeFilters: ActiveFilter[];
  addFilter: (type: FilterType, value: string, label: string) => void;
  removeFilter: (filter: ActiveFilter) => void;
  clearAllFilters: () => void;
}

export default function RoomFilters({ activeFilters, addFilter, removeFilter, clearAllFilters }: RoomFiltersProps) {

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => addFilter('status', 'available', 'Available')}>
            Available
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => addFilter('status', 'occupied', 'Occupied')}>
            Occupied
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => addFilter('status', 'cleaning', 'Cleaning')}>
            Cleaning
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => addFilter('status', 'maintenance', 'Maintenance')}>
            Maintenance
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuLabel>Filter by Floor</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => addFilter('floor', '1', 'Floor 1')}>
            Floor 1
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => addFilter('floor', '2', 'Floor 2')}>
            Floor 2
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => addFilter('floor', '3', 'Floor 3')}>
            Floor 3
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => addFilter('type', 'Single', 'Single')}>
            Single
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => addFilter('type', 'Double', 'Double')}>
            Double
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => addFilter('type', 'Suite', 'Suite')}>
            Suite
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => addFilter('type', 'Deluxe', 'Deluxe')}>
            Deluxe
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Active Filters */}
      {activeFilters.map((filter) => (
        <Badge
          key={`${filter.type}-${filter.value}`}
          variant="secondary"
          className="cursor-pointer hover:bg-secondary/80"
          onClick={() => removeFilter(filter)}
        >
          {filter.label}
          <X className="h-3 w-3 ml-1" />
        </Badge>
      ))}

      {/* Clear All Filters */}
      {activeFilters.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="text-muted-foreground hover:text-foreground"
        >
          Clear all
        </Button>
      )}
    </div>
  );
}