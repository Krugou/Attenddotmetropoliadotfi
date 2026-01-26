import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import SortIcon from '@mui/icons-material/Sort';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

import {IconButton} from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import TextInputField from '../../../ui/inputs/TextInputField.tsx';

type Student = {
  [key: string]: string | number | undefined | boolean;
  __isNew?: boolean;
};

interface StudentListProps {
  studentList: any[];
  setStudentList: React.Dispatch<React.SetStateAction<any[]>>;
}

/**
 * Järjestää opiskelijalistan annetun sarakkeen ja suunnan mukaan.
 * Uudet rivit (__isNew) pidetään aina ylimpänä.
 */
const sortStudentList = (
  list: Student[],
  column: string | null,
  ascending: boolean,
): Student[] => {
  if (!column) return list;

  return [...list].sort((a, b) => {
    const aNew = Boolean((a as any).__isNew);
    const bNew = Boolean((b as any).__isNew);

    // Uudet rivit aina ylimmäksi sortista huolimatta
    if (aNew && !bNew) return -1;
    if (!aNew && bNew) return 1;

    const A = String((a as any)[column] ?? '').toLowerCase();
    const B = String((b as any)[column] ?? '').toLowerCase();

    return ascending ? A.localeCompare(B) : B.localeCompare(A);
  });
};

const StudentList: React.FC<StudentListProps> = ({
                                                   studentList,
                                                   setStudentList,
                                                 }) => {
  const {t} = useTranslation(['common']);

  const [lastStudentNumber, setLastStudentNumber] = useState(777);
  const [lastEmailNumber, setLastEmailNumber] = useState(1);

  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortAscending, setSortAscending] = useState(true);

  const [hiddenColumns, setHiddenColumns] = useState<Record<string, boolean>>({
    admingroups: true,
    arrivalgroup: true,
    educationform: true,
    evaluation: true,
    program: true,
    registration: true,
    name: true,
  });

  const [open, setOpen] = useState(false);
  const [toBeDeleted, setToBeDeleted] = useState<number | null>(null);
  const [hideExtraColumns, setHideExtraColumns] = useState(true);

  const [lockedFields, setLockedFields] = useState<boolean[]>(
    new Array(studentList.length).fill(true),
  );

  // Helpers
  const isJunkColumn = (key: string) =>
    key.startsWith(':') || key === '__isNew';

  const headerLabels: Record<string, string> = {
    last_name: t('common:studentList.headers.lastName'),
    first_name: t('common:studentList.headers.firstName'),
    email: t('common:studentList.headers.email'),
    studentnumber: t('common:studentList.headers.studentnumber'),
    admingroups: t('common:studentList.headers.admingroups'),
    arrivalgroup: t('common:studentList.headers.arrivalgroup'),
    educationform: t('common:studentList.headers.educationform'),
    evaluation: t('common:studentList.headers.evaluation'),
    program: t('common:studentList.headers.program'),
    registration: t('common:studentList.headers.registration'),
    name: t('common:studentList.headers.name'),
  };

  // Määritellään haluttu sarakejärjestys tunnetuille kentille
  const columnPriority: Record<string, number> = {
    last_name: 1,
    first_name: 2,
    name: 3,
    email: 4,
    studentnumber: 5,
    admingroups: 6,
    arrivalgroup: 7,
    educationform: 8,
    evaluation: 9,
    program: 10,
    registration: 11,
  };

  // Yhtenäinen sarakejärjestys, riippumatta siitä mikä rivi on ensimmäisenä
  const orderedKeys: string[] = React.useMemo(() => {
    if (!studentList.length) return [];

    const keys = Object.keys(studentList[0]).filter(
      (key) => !isJunkColumn(key),
    );

    keys.sort((a, b) => {
      const pa = columnPriority[a] ?? 999;
      const pb = columnPriority[b] ?? 999;
      if (pa !== pb) return pa - pb;
      return a.localeCompare(b);
    });

    return keys;
  }, [studentList]); // hiddenColumns ei vaikuta itse järjestykseen

  const getStudentFullName = (index: number | null): string => {
    if (index === null) return '';
    const s = studentList[index];
    if (!s) return '';
    const first = String((s as any).first_name ?? '');
    const last = String((s as any).last_name ?? '');
    const full = `${first} ${last}`.trim();
    return full || String((s as any).name ?? '');
  };

  // Dialog handlers
  const handleClickOpen = (index: number) => {
    setToBeDeleted(index);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleDelete = () => {
    if (toBeDeleted !== null) {
      deleteStudent(toBeDeleted);
    }
    setOpen(false);
  };

  // Lock / unlock row
  const toggleLock = (index: number) => {
    setLockedFields((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  // Add student (uusi rivi)
  const addStudent = (event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault();

    const newStudent: Student = {
      first_name: 'Etunimi',
      last_name: 'Sukunimi',
      name: 'Sukunimi Etunimi',
      email: `etunimi.sukunimi${lastEmailNumber}@example.com`,
      studentnumber: lastStudentNumber.toString(),

      admingroups: '',
      arrivalgroup: '',
      educationform: '',
      evaluation: '',
      program: '',
      registration: '',

      __isNew: true,
    };

    setStudentList((prev) => {
      const withNew = [newStudent, ...prev] as Student[];
      return sortStudentList(withNew, sortColumn, sortAscending);
    });

    setLastStudentNumber((n) => n + 1);
    setLastEmailNumber((n) => n + 1);

    setLockedFields((prev) => [false, ...prev]);
  };

  // Vahvista uusi rivi
  const confirmNewStudent = (index: number) => {
    setStudentList((prev) => {
      const next = [...prev];
      const student = {...next[index]};
      delete (student as any).__isNew;
      next[index] = student;
      return next;
    });

    setLockedFields((prev) => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
  };

  // Sort students (kaikki sarakkeet)
  const sortStudents = (column: string) => {
    const isSameColumn = sortColumn === column;
    const nextAscending = isSameColumn ? !sortAscending : true;

    setStudentList((prev) =>
      sortStudentList(prev as Student[], column, nextAscending),
    );
    setSortColumn(column);
    setSortAscending(nextAscending);
  };

  // Delete student
  const deleteStudent = (index: number) => {
    setStudentList((prev) => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });

    setLockedFields((prev) => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  };

  // Auto-add if list empty on mount
  useEffect(() => {
    if (studentList.length === 0) {
      addStudent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Toggle extra columns
  const toggleExtraColumns = () => {
    setHiddenColumns(() =>
      hideExtraColumns
        ? {}
        : ({
          admingroups: true,
          arrivalgroup: true,
          educationform: true,
          evaluation: true,
          program: true,
          registration: true,
          name: true,
        } as Record<string, boolean>),
    );
    setHideExtraColumns(!hideExtraColumns);
  };

  return (
    <div className="space-y-4">
      {/* Otsikko + selite */}
      <div>
        <h2 className="text-xl font-heading text-metropolia-main-grey mb-1">
          {t('common:createCourseEasy.students.title')}
        </h2>
        <p className="text-sm text-gray-600">
          {t('common:createCourseEasy.students.description')}
        </p>
      </div>

      {/* Kortti taulukolle */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5">
        {/* Yläpalkki */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <button
            className="px-3 py-1.5 bg-metropolia-main-orange text-white rounded-xl text-xs sm:text-sm"
            onClick={(event) => {
              event.preventDefault();
              toggleExtraColumns();
            }}
          >
            {hideExtraColumns
              ? t('common:studentList.buttons.showAllColumns')
              : t('common:studentList.buttons.hideExtraColumns')}
          </button>

          <button
            className="px-3 py-1.5 bg-metropolia-main-orange text-white rounded-xl text-xs sm:text-sm"
            onClick={(event) => addStudent(event)}
          >
            {t('common:studentList.buttons.addStudent')}
          </button>
        </div>

        {/* Taulukko */}
        <div className="max-h-96 overflow-y-auto overflow-x-auto border border-gray-100 rounded-xl">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-gray-100 z-10">
            <tr className="text-left text-gray-600 border-b border-gray-200">
              {studentList.length > 0 &&
                orderedKeys.map(
                  (key, index) =>
                    !hiddenColumns[key] && (
                      <th
                        key={index}
                        className="px-4 py-2 font-semibold whitespace-nowrap"
                      >
                          <span className="align-middle">
                            {headerLabels[key] ?? key}
                          </span>

                        {/* Sort-ikoni */}
                        <button
                          aria-label={t(
                            'common:studentList.aria.sortColumn',
                          )}
                          className="inline-flex items-center justify-center ml-1 align-middle"
                          type="button"
                          onClick={() => sortStudents(key)}
                          style={{
                            verticalAlign: 'middle',
                            lineHeight: 1,
                          }}
                        >
                          {sortColumn === key ? (
                            sortAscending ? (
                              <ArrowUpwardIcon
                                fontSize="inherit"
                                style={{
                                  fontSize: 16,
                                  transform: 'translateY(-1px)',
                                }}
                              />
                            ) : (
                              <ArrowDownwardIcon
                                fontSize="inherit"
                                style={{
                                  fontSize: 16,
                                  transform: 'translateY(-1px)',
                                }}
                              />
                            )
                          ) : (
                            <SortIcon
                              fontSize="inherit"
                              style={{
                                opacity: 0.35,
                                fontSize: 16,
                                transform: 'translateY(-1px)',
                              }}
                            />
                          )}
                        </button>
                      </th>
                    ),
                )}

              {studentList.length > 1 && (
                <th className="px-4 py-2 font-semibold text-right whitespace-nowrap">
                  {t('common:studentList.headers.actions')}
                </th>
              )}
            </tr>
            </thead>

            <tbody>
            {studentList.map((student, index) => {
              const isNewRow = Boolean((student as any).__isNew);

              return (
                <tr
                  key={index}
                  className={`border-b border-gray-100 last:border-0 ${
                    isNewRow
                      ? 'bg-orange-50'
                      : lockedFields[index]
                        ? 'bg-white'
                        : 'bg-gray-50'
                  }`}
                >
                  {orderedKeys.map(
                    (key, innerIndex) =>
                      !hiddenColumns[key] && (
                        <td
                          key={innerIndex}
                          className="px-4 py-2 align-top whitespace-nowrap"
                          style={{
                            minWidth:
                              key === 'email'
                                ? '220px'
                                : key === 'program' ||
                                key === 'educationform'
                                  ? '200px'
                                  : key === 'name'
                                    ? '160px'
                                    : '140px',
                          }}
                        >
                          <TextInputField
                            type="text"
                            name={key}
                            value={student[key]?.toString() ?? ''}
                            onChange={(e) => {
                              const newList = [...studentList];
                              newList[index][key] = e.target.value;
                              setStudentList(newList);
                            }}
                            disabled={lockedFields[index] && !isNewRow}
                          />
                        </td>
                      ),
                  )}

                  {studentList.length > 1 && (
                    <td className="px-4 py-2 align-top text-right whitespace-nowrap">
                      {isNewRow ? (
                        <>
                          {/* Hyväksy uusi rivi */}
                          <IconButton
                            aria-label={t(
                              'common:studentList.aria.confirmNewStudent',
                            )}
                            color="primary"
                            onClick={() => confirmNewStudent(index)}
                          >
                            <CheckIcon />
                          </IconButton>

                          {/* Peru uusi rivi */}
                          <IconButton
                            aria-label={t(
                              'common:studentList.aria.cancelNewStudent',
                            )}
                            color="error"
                            onClick={() => deleteStudent(index)}
                          >
                            <CloseIcon />
                          </IconButton>
                        </>
                      ) : (
                        <>
                          <IconButton onClick={() => toggleLock(index)}>
                            {lockedFields[index] ? (
                              <LockIcon />
                            ) : (
                              <LockOpenIcon />
                            )}
                          </IconButton>

                          <IconButton
                            aria-label={t(
                              'common:studentList.aria.deleteStudent',
                            )}
                            color="error"
                            onClick={() => handleClickOpen(index)}
                          >
                            <DeleteIcon />
                          </IconButton>

                          {/* Poistodialogi */}
                          <Dialog
                            open={open}
                            onClose={handleClose}
                            PaperProps={{
                              elevation: 0,
                              style: {
                                borderRadius: 16,
                              },
                            }}
                            BackdropProps={{
                              style: {
                                backgroundColor: 'rgba(0, 0, 0, 0.08)',
                                backdropFilter: 'none',
                              },
                            }}
                          >
                            {toBeDeleted !== null && (
                              <>
                                <DialogTitle>
                                  {t('common:studentList.dialog.title')}
                                </DialogTitle>
                                <DialogContent>
                                  <DialogContentText>
                                    {t(
                                      'common:studentList.dialog.message',
                                      {
                                        name: getStudentFullName(
                                          toBeDeleted,
                                        ),
                                      },
                                    )}
                                  </DialogContentText>
                                </DialogContent>
                                <DialogActions>
                                  <Button onClick={handleClose}>
                                    {t(
                                      'common:studentList.buttons.cancel',
                                    )}
                                  </Button>
                                  <Button
                                    onClick={handleDelete}
                                    color="error"
                                    autoFocus
                                    style={{
                                      backgroundColor: '#ff8200',
                                      color: '#fff',
                                      borderRadius: 9999,
                                      paddingInline: '1.5rem',
                                      textTransform: 'none',
                                      fontWeight: 600,
                                    }}
                                  >
                                    {t(
                                      'common:studentList.buttons.delete',
                                    )}
                                  </Button>
                                </DialogActions>
                              </>
                            )}
                          </Dialog>
                        </>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentList;
