import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Menu,
  MenuItem,
  Checkbox,
  FormControlLabel
} from '@mui/material';

import RefreshIcon from '@mui/icons-material/Refresh';
import SortIcon from '@mui/icons-material/Sort';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';

import { UserContext } from '../../../../contexts/UserContext.tsx';
import apiHooks from '../../../../api';

import Loader from '../../../../utils/Loader.tsx';
import SearchField from '../../../../components/ui/inputs/SearchField.tsx';

import LectureTable from '../../../../components/internal/admin/AdminLectures/LectureTable.tsx';
import LectureStats from '../../../../components/internal/admin/AdminLectures/LectureStats.tsx';
import LectureEmptyState from '../../../../components/internal/admin/AdminLectures/LectureEmptyState.tsx';
import PaginationControls from '../../../../components/internal/admin/AdminLectures/PaginationControls.tsx';
import { getLectureColumns } from '../../../../components/internal/admin/AdminLectures/lectureColumns.ts';
import { Lecture } from '../../../../types/lecture.ts';
import useDebounce from '../../../../hooks/useDebounce.ts';
import { useLectureDialog } from '../../../../hooks/useLectureDialog.ts';

/**
 * AdminLectures view.
 * Displays a paginated and sortable list of all TeacherLectures for admin users,
 * including filtering, searching, statistics, column visibility toggling,
 * and lecture actions (delete, close).
 *
 * Uses: LectureTable, LectureStats, PaginationControls, LectureEmptyState, SearchField, MUI Dialogs.
 * @returns {JSX.Element} The rendered AdminLectures component.
 */

// TODO: siirrä omaksi constantiksi config-kansioon esim. config/constants
const ITEMS_PER_PAGE = 50;

const AdminLectures: React.FC = () => {
  const { t } = useTranslation(['admin']);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(true);
  const [extraStats, setExtraStats] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState<keyof Lecture | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<keyof Lecture>('lectureid');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const getLectures = async () => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      toast.error('No token available');
      return;
    }
    setIsLoading(true);
    try {
      const result = await apiHooks.fetchAllLectures(token);
      setLectures(Array.isArray(result) ? result : []);
    } catch {
      toast.error('Error fetching TeacherLectures');
    } finally {
      setIsLoading(false);
    }
  };

  const {
    dialogOpen,
    dialogAction,
    handleDialogOpen,
    handleDialogClose,
    handleDialogConfirm,
  } = useLectureDialog({
    onConfirm: async (lectureId, action) => {
      const token = localStorage.getItem('userToken');
      if (!token) return;

      try {
        if (action === 'close') {
          await apiHooks.closeLectureByLectureId(lectureId, token);
          toast.success(t('admin:TeacherLectures.toast.closed'));
        } else {
          await apiHooks.deleteLectureByLectureId(lectureId, token);
          toast.success(t('admin:TeacherLectures.toast.deleted'));
        }
        await getLectures();
      } catch (error: any) {
        toast.error(t('admin:TeacherLectures.toast.failed') + error.message);
      }
    }
  });

  useEffect(() => {
    if (!user) return;

    getLectures();
    const interval = setInterval(getLectures, 120000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const defaultCols = getLectureColumns(t)
      .filter((c) => c.defaultVisible)
      .map((c) => c.key);
    setVisibleColumns(new Set(defaultCols));
  }, [t]);

  const handleSort = (key: keyof Lecture) => {
    if (key === sortKey) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const sortedLectures = [...lectures].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (sortKey === 'start_date') {
      return sortOrder === 'asc'
        ? new Date(aVal).getTime() - new Date(bVal).getTime()
        : new Date(bVal).getTime() - new Date(aVal).getTime();
    }
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return sortOrder === 'asc'
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  const filteredLectures = sortedLectures.filter((lecture) => {
    if (!debouncedSearchTerm)
      return filterOpen ? lecture.state === 'open' : true;

    const term = debouncedSearchTerm.toLowerCase();
    if (searchField === 'all') {
      return Object.entries(lecture).some(([key, val]) => {
        if (key === 'lectureid' || !val) return false;
        return val.toString().toLowerCase().includes(term);
      });
    }

    const value = lecture[searchField];
    return value && value.toString().toLowerCase().includes(term);
  });

  const openLectures = lectures.filter((l) => l.state === 'open');

  const paginatedLectures = filteredLectures.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredLectures.length / ITEMS_PER_PAGE);

  const clearSearch = () => {
    setSearchTerm('');
    setSearchField('all');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await getLectures();
    setIsRefreshing(false);
  };

  if (isLoading) return <Loader />;

  return (
    <div className='relative w-full p-5 bg-white rounded-lg'>
      {/* Controls */}
      <div className='flex justify-between mt-4 mb-4 space-x-2'>
        <div className='flex gap-3'>
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className='px-2 py-1 text-white bg-metropolia-main-orange rounded-sm font-heading hover:bg-metropolia-secondary-orange sm:px-4 sm:py-2'>
            {filterOpen
              ? t('admin:TeacherLectures.alternative.showAllLectures')
              : t('admin:TeacherLectures.alternative.showOpenLecture')}
          </button>

          {!(filterOpen && openLectures.length === 0) && (
            <>
              <button
                onClick={(e) => setAnchorEl(e.currentTarget)}
                className='px-2 py-1 text-white bg-metropolia-main-orange rounded-sm font-heading hover:bg-metropolia-secondary-orange sm:px-4 sm:py-2'>
                <ViewColumnIcon className='w-5 h-5 mr-1' />
                {t('admin:TeacherLectures.alternative.columns')}
              </button>
              {!filterOpen && (
                <button
                  onClick={() => setExtraStats(!extraStats)}
                  className='px-2 py-1 text-white bg-metropolia-main-orange rounded-sm font-heading hover:bg-metropolia-secondary-orange sm:px-4 sm:py-2'>
                  {extraStats
                    ? t('admin:TeacherLectures.alternative.hideStats')
                    : t('admin:TeacherLectures.alternative.showStats')}
                </button>
              )}
            </>
          )}
        </div>

        {!(filterOpen && openLectures.length === 0) && (
          <div className='flex gap-2'>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className='p-2 text-white bg-metropolia-main-orange rounded-sm hover:bg-metropolia-secondary-orange disabled:opacity-50'>
              <RefreshIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              className='p-2 text-white bg-metropolia-main-orange rounded-sm hover:bg-metropolia-secondary-orange'>
              <SortIcon className='w-5 h-5' />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className='p-2 text-white bg-metropolia-main-orange rounded-sm hover:bg-metropolia-secondary-orange'>
              {isExpanded ? <UnfoldLessIcon /> : <UnfoldMoreIcon />}
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      {lectures.length > 0 && extraStats && !filterOpen && (
        <LectureStats lectures={lectures} extraStats={extraStats} filterOpen={filterOpen} t={t} />
      )}

      {/* Search */}
      {lectures.length > 0 && !(filterOpen && openLectures.length === 0) && (
        <div className='mt-6 mb-5'>
          <SearchField
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchField={searchField}
            onSearchFieldChange={setSearchField}
            onClearSearch={clearSearch}
            searchFields={[
              { value: 'all', label: t('admin:ui.allFields') },
              { value: 'lectureid', label: t('admin:TeacherLectures.tableContent.lectureId') },
              { value: 'teacheremail', label: t('admin:TeacherLectures.tableContent.teacherEmail') },
              { value: 'coursename', label: t('admin:TeacherLectures.tableContent.courseName') },
              { value: 'coursecode', label: t('admin:TeacherLectures.tableContent.courseCode') },
            ]}
            placeholder={t('admin:ui.searchPlaceholder')}
            searchLabel={t('admin:ui.search')}
            searchInLabel={t('admin:ui.searchIn')}
            resultsCount={filteredLectures.length}
            className='bg-white p-4 rounded-lg shadow-md'
          />
        </div>
      )}

      {/* Table */}
      <LectureTable
        t={t}
        lectures={paginatedLectures}
        columns={getLectureColumns(t)}
        visibleColumns={visibleColumns}
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSort={handleSort}
        onRowClick={(courseId, lectureId) => navigate(`./${courseId}/${lectureId}`)}
        onDialogOpen={handleDialogOpen}
        isExpanded={isExpanded}
      />

      {/* Pagination */}
      {!(filterOpen && openLectures.length === 0) && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredLectures.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPrevious={() => setCurrentPage((p) => Math.max(1, p - 1))}
          onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        />
      )}

      {/* Column menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        {getLectureColumns(t).map((column) => (
          <MenuItem key={column.key} onClick={(e) => e.stopPropagation()}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={visibleColumns.has(column.key)}
                  onChange={() =>
                    setVisibleColumns((prev) =>
                      prev.has(column.key)
                        ? new Set([...prev].filter((k) => k !== column.key))
                        : new Set(prev).add(column.key)
                    )
                  }
                  color='primary'
                />
              }
              label={column.label}
            />
          </MenuItem>
        ))}
      </Menu>

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>{`Are you sure you want to ${dialogAction} the lecture?`}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('admin:TeacherLectures.dialog.dialogText')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color='primary'>
            {t('admin:ui.cancel')}
          </Button>
          <Button onClick={handleDialogConfirm} color='primary' autoFocus>
            {t('admin:ui.confirm')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Empty state */}
      {filteredLectures.length === 0 && (
        <LectureEmptyState
          t={t}
          filterOpen={filterOpen}
          openLecturesCount={openLectures.length}
        />
      )}
    </div>
  );
};

export default AdminLectures;

/*const ITEMS_PER_PAGE = 50;

const AdminLectures: React.FC = () => {
  const { t } = useTranslation(['admin']);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [TeacherLectures, setLectures] = useState<Lecture[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(true);
  const [extraStats, setExtraStats] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState<keyof Lecture | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<keyof Lecture>('lectureid');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState<string | null>(null);
  const [dialogAction, setDialogAction] = useState<'close' | 'delete' | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);


  const getLectures = async () => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      toast.error('No token available');
      return;
    }
    setIsLoading(true);
    try {
      const result = await apiHooks.fetchAllLectures(token);
      setLectures(Array.isArray(result) ? result : []);
    } catch {
      toast.error('Error fetching TeacherLectures');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getLectures();
      const interval = setInterval(getLectures, 120000);
      return () => clearInterval(interval);
    }

    return () => {};
  }, [user]);

  useEffect(() => {
    const defaultCols = getLectureColumns(t).filter((c) => c.defaultVisible).map((c) => c.key);
    setVisibleColumns(new Set(defaultCols));
  }, [t]);

  const handleSort = (key: keyof Lecture) => {
    if (key === sortKey) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handleDialogOpen = (lectureId: string, action: 'close' | 'delete') => {
    setSelectedLecture(lectureId);
    setDialogAction(action);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedLecture(null);
    setDialogAction(null);
  };

  const handleDialogConfirm = async () => {
    const token = localStorage.getItem('userToken');
    if (!token || !selectedLecture || !dialogAction) return;

    try {
      if (dialogAction === 'close') {
        await apiHooks.closeLectureByLectureId(selectedLecture, token);
        toast.success(t('admin:TeacherLectures.toast.closed'));
      } else {
        await apiHooks.deleteLectureByLectureId(selectedLecture, token);
        toast.success(t('admin:TeacherLectures.toast.deleted'));
      }
      await getLectures();
    } catch (error: any) {
      toast.error(t('admin:TeacherLectures.toast.failed') + error.message);
    }
    handleDialogClose();
  };

  const sortedLectures = [...TeacherLectures].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (sortKey === 'start_date') {
      return sortOrder === 'asc'
        ? new Date(aVal).getTime() - new Date(bVal).getTime()
        : new Date(bVal).getTime() - new Date(aVal).getTime();
    }
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return sortOrder === 'asc'
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  const filteredLectures = sortedLectures.filter((lecture) => {
    if (!debouncedSearchTerm)
      return filterOpen ? lecture.state === 'open' : true;

    const term = debouncedSearchTerm.toLowerCase();
    if (searchField === 'all') {
      return Object.entries(lecture).some(([key, val]) => {
        if (key === 'lectureid' || !val) return false;
        return val.toString().toLowerCase().includes(term);
      });
    }

    const value = lecture[searchField];
    return value && value.toString().toLowerCase().includes(term);
  });

  const openLectures = TeacherLectures.filter((l) => l.state === 'open');

  const paginatedLectures = filteredLectures.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredLectures.length / ITEMS_PER_PAGE);

  const clearSearch = () => {
    setSearchTerm('');
    setSearchField('all');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await getLectures();
    setIsRefreshing(false);
  };

  if (isLoading) return <Loader />;

  return (
    <div className='relative w-full p-5 bg-white rounded-lg'>
      <div className='flex justify-between mt-4 mb-4 space-x-2'>
        <div className='flex gap-3'>
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className='px-2 py-1 text-white bg-metropolia-main-orange rounded-sm font-heading hover:bg-metropolia-secondary-orange sm:px-4 sm:py-2'>
            {filterOpen
              ? t('admin:TeacherLectures.alternative.showAllLectures')
              : t('admin:TeacherLectures.alternative.showOpenLecture')}
          </button>
          {!(filterOpen && openLectures.length === 0) && (
            <button
              onClick={(e) => setAnchorEl(e.currentTarget)}
              className='px-2 py-1 text-white bg-metropolia-main-orange rounded-sm font-heading hover:bg-metropolia-secondary-orange sm:px-4 sm:py-2'>
              <ViewColumnIcon className='w-5 h-5 mr-1' />
              {t('admin:TeacherLectures.alternative.columns')}
            </button>
          )}
          {!filterOpen && (
            <button
              onClick={() => setExtraStats(!extraStats)}
              className='px-2 py-1 text-white bg-metropolia-main-orange rounded-sm font-heading hover:bg-metropolia-secondary-orange sm:px-4 sm:py-2'>
              {extraStats
                ? t('admin:TeacherLectures.alternative.hideStats')
                : t('admin:TeacherLectures.alternative.showStats')}
            </button>
          )}
        </div>
        {!(filterOpen && openLectures.length === 0) && (
          <div className='flex gap-2'>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className='p-2 text-white bg-metropolia-main-orange rounded-sm hover:bg-metropolia-secondary-orange disabled:opacity-50'>
              <RefreshIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              className='p-2 text-white bg-metropolia-main-orange rounded-sm hover:bg-metropolia-secondary-orange'>
              <SortIcon className='w-5 h-5' />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className='p-2 text-white bg-metropolia-main-orange rounded-sm hover:bg-metropolia-secondary-orange'>
              {isExpanded ? <UnfoldLessIcon /> : <UnfoldMoreIcon />}
            </button>
          </div>
        )}
      </div>

      {TeacherLectures.length > 0 && extraStats && !filterOpen && (
        <LectureStats
          TeacherLectures={TeacherLectures}
          extraStats={extraStats}
          filterOpen={filterOpen}
          t={t}
        />
      )}

      {TeacherLectures.length > 0 && !(filterOpen && openLectures.length === 0) && (
        <div className='mt-6 mb-5'>
          <SearchField
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchField={searchField}
            onSearchFieldChange={setSearchField}
            onClearSearch={clearSearch}
            searchFields={[
              { value: 'all', label: t('admin:ui.allFields') },
              { value: 'lectureid', label: t('admin:TeacherLectures.tableContent.lectureId') },
              { value: 'teacheremail', label: t('admin:TeacherLectures.tableContent.teacherEmail') },
              { value: 'coursename', label: t('admin:TeacherLectures.tableContent.courseName') },
              { value: 'coursecode', label: t('admin:TeacherLectures.tableContent.courseCode') },
            ]}
            placeholder={t('admin:ui.searchPlaceholder')}
            searchLabel={t('admin:ui.search')}
            searchInLabel={t('admin:ui.searchIn')}
            resultsCount={filteredLectures.length}
            className='bg-white p-4 rounded-lg shadow-md'
          />
        </div>
      )}

      <LectureTable
        t={t}
        TeacherLectures={paginatedLectures}
        columns={getLectureColumns(t)}
        visibleColumns={visibleColumns}
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSort={handleSort}
        onRowClick={(courseId, lectureId) => navigate(`./${courseId}/${lectureId}`)}
        onDialogOpen={handleDialogOpen}
        isExpanded={isExpanded}
      />

      {!(filterOpen && openLectures.length === 0) && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredLectures.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPrevious={() => setCurrentPage((p) => Math.max(1, p - 1))}
          onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        />
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        {getLectureColumns(t).map((column) => (
          <MenuItem key={column.key} onClick={(e) => e.stopPropagation()}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={visibleColumns.has(column.key)}
                  onChange={() =>
                    setVisibleColumns((prev) =>
                      prev.has(column.key)
                        ? new Set([...prev].filter((k) => k !== column.key))
                        : new Set(prev).add(column.key)
                    )
                  }
                  color='primary'
                />
              }
              label={column.label}
            />
          </MenuItem>
        ))}
      </Menu>

      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>{`Are you sure you want to ${dialogAction} the lecture?`}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('admin:TeacherLectures.dialog.dialogText')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color='primary'>
            {t('admin:ui.cancel')}
          </Button>
          <Button onClick={handleDialogConfirm} color='primary' autoFocus>
            {t('admin:ui.confirm')}
          </Button>
        </DialogActions>
      </Dialog>

      {filteredLectures.length === 0 && (
        <LectureEmptyState
          t={t}
          filterOpen={filterOpen}
          openLecturesCount={openLectures.length}
        />
      )}
    </div>
  );
};

export default AdminLectures;*/
