import React from 'react';
import {
  Menu,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from '@mui/material';

import { ColumnConfig } from '../../../../types/lecture.ts'; // Tai missä ikinä säilytät ColumnConfig-tyyppiä

interface LectureVisibilityMenuProps {
  anchorEl: null | HTMLElement;
  onClose: () => void;
  visibleColumns: Set<string>;
  onToggleColumn: (columnKey: string) => void;
  columns: ColumnConfig[];
}

const LectureVisibilityMenu: React.FC<LectureVisibilityMenuProps> = ({
                                                                       anchorEl,
                                                                       onClose,
                                                                       visibleColumns,
                                                                       onToggleColumn,
                                                                       columns,
                                                                     }) => {
  const open = Boolean(anchorEl);

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      {columns.map((column) => (
        <MenuItem key={column.key} onClick={(e) => e.stopPropagation()}>
          <FormControlLabel
            control={
              <Checkbox
                checked={visibleColumns.has(column.key)}
                onChange={() => onToggleColumn(column.key)}
                color="primary"
              />
            }
            label={column.label}
          />
        </MenuItem>
      ))}
    </Menu>
  );
};

export default LectureVisibilityMenu;
