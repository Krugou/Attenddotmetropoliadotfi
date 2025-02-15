import React from 'react';
import {Menu, MenuItem, Checkbox, FormControlLabel} from '@mui/material';

interface ColumnVisibilityMenuProps {
  anchorEl: HTMLElement | null;
  columns: Array<{key: string; label: string}>;
  visibleColumns: Set<string>;
  onColumnToggle: (columnKey: string) => void;
  onClose: () => void;
}

export const ColumnVisibilityMenu: React.FC<ColumnVisibilityMenuProps> = ({
  anchorEl,
  columns,
  visibleColumns,
  onColumnToggle,
  onClose,
}) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
      transformOrigin={{vertical: 'top', horizontal: 'right'}}
      PaperProps={{
        className: 'mt-2',
        elevation: 3,
      }}>
      {columns.map((column) => (
        <MenuItem key={column.key} onClick={(e) => e.stopPropagation()}>
          <FormControlLabel
            control={
              <Checkbox
                checked={visibleColumns.has(column.key)}
                onChange={() => onColumnToggle(column.key)}
                className='text-metropolia-main-orange'
              />
            }
            label={column.label}
            className='w-full'
          />
        </MenuItem>
      ))}
    </Menu>
  );
};
