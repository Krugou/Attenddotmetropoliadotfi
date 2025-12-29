import React, {
  useMemo,
  useState,
  useRef,
  useLayoutEffect,
  useEffect,
} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {createPortal} from 'react-dom';

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

type NavItem = {
  path: string;
  label: string;
};

// HUOM: stats poistettu tyypistä
type NavGroupId = 'lectures' | 'courses' | 'students' | 'help';

type NavGroup = {
  id: NavGroupId;
  label: string;
  items: NavItem[];
};

type TeacherTopNavProps = {
  t: TranslateFn;
};

type AnchorRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

const TeacherTopNav: React.FC<TeacherTopNavProps> = ({t}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [openGroup, setOpenGroup] = useState<NavGroupId | null>(null);
  const [anchorRect, setAnchorRect] = useState<AnchorRect | null>(null);

  // stats-avainta ei enää ole
  const tabRefs = useRef<Record<NavGroupId, HTMLButtonElement | null>>({
    lectures: null,
    courses: null,
    students: null,
    help: null,
  });

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const navGroups: NavGroup[] = useMemo(
    () => [
      {
        id: 'lectures',
        label: t('teacher:toasts.topNav.lectures'),
        items: [
          {
            path: '/teacher/mainview',
            label: t('teacher:toasts.topNav.lecturesHome'),
          },
          {
            path: '/teacher/attendance/createlecture',
            label: t('teacher:mainView.cards.createLecture.title'),
          },
          // TÄMÄ OLI ENNEN stats-ryhmässä → nyt Luennot alle
          {
            path: '/teacher/lectures',
            label: t('teacher:mainView.cards.lectureStats.title'),
          },
        ],
      },
      {
        id: 'courses',
        label: t('teacher:toasts.topNav.courses'),
        items: [
          {
            path: '/teacher/courses/',
            label: t('teacher:mainView.cards.yourCourses.title'),
          },
          {
            path: '/teacher/courses/create',
            label: t('teacher:mainView.cards.createCourse.title'),
          },
          {
            path: '/teacher/worklog',
            label: t('teacher:mainView.cards.yourWorkLogCourses.title'),
          },
          {
            path: '/teacher/worklog/create',
            label: t('teacher:mainView.cards.createWorkLogCourse.title'),
          },
          {
            path: '/teacher/lateenrollment',
            label: t('teacher:mainView.cards.lateEnrollment.title'),
          },
          // TÄMÄ OLI ENNEN stats-ryhmässä → nyt Kurssit alle
          {
            path: '/teacher/courses/stats',
            label: t('teacher:mainView.cards.attendanceStats.title'),
          },
        ],
      },
      {
        id: 'students',
        label: t('teacher:toasts.topNav.students'),
        items: [
          {
            path: '/teacher/courses/activity',
            label: t('teacher:mainView.cards.studentActivity.title'),
          },
          {
            path: '/teacher/students',
            label: t('teacher:mainView.cards.manageStudents.title'),
          },
        ],
      },
      {
        id: 'help',
        label: t('teacher:toasts.topNav.help'),
        items: [
          {
            path: '/teacher/helpvideos',
            label: t('teacher:mainView.cards.instructions.title'),
          },
          {
            path: '/teacher/feedback',
            label: t('teacher:toasts.topNav.feedback'),
          },
        ],
      },
    ],
    [t],
  );

  const activeGroupId: NavGroupId = useMemo(() => {
    const pathname = location.pathname;
    for (const group of navGroups) {
      for (const item of group.items) {
        if (pathname.startsWith(item.path)) return group.id;
      }
    }
    return 'lectures';
  }, [location.pathname, navGroups]);

  useEffect(() => {
    setOpenGroup(null);
  }, [location.pathname]);

  useLayoutEffect(() => {
    if (!openGroup) {
      setAnchorRect(null);
      return;
    }
    const btn = tabRefs.current[openGroup];
    if (!btn) {
      setAnchorRect(null);
      return;
    }
    const rect = btn.getBoundingClientRect();
    setAnchorRect({
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    });
  }, [openGroup]);

  const handleTabClick = (groupId: NavGroupId) => {
    setOpenGroup(prev => (prev === groupId ? null : groupId));
  };

  const handleTabHover = (groupId: NavGroupId) => {
    setOpenGroup(groupId);
  };

  const handleNavMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    const related = e.relatedTarget as Node | null;
    if (related && dropdownRef.current?.contains(related)) {
      return;
    }
    setOpenGroup(null);
  };

  const handleDropdownMouseLeave = (
    e: React.MouseEvent<HTMLDivElement>,
  ) => {
    const related = e.relatedTarget as Node | null;
    if (!related) {
      setOpenGroup(null);
      return;
    }
    const tabButtons = Object.values(tabRefs.current).filter(
      (b): b is HTMLButtonElement => !!b,
    );
    if (tabButtons.some(btn => btn.contains(related))) return;
    setOpenGroup(null);
  };

  const currentGroup =
    openGroup != null
      ? navGroups.find(group => group.id === openGroup) ?? null
      : null;

  return (
    <>
      <nav className="w-full mb-4" onMouseLeave={handleNavMouseLeave}>
        <div className="overflow-x-auto">
          <ul className="flex flex-nowrap justify-start sm:justify-center gap-4 px-2 py-2">
            {navGroups.map(group => {
              const isActive = group.id === activeGroupId;
              const isOpen = group.id === openGroup;

              return (
                <li key={group.id} className="flex-shrink-0">
                  <button
                    type="button"
                    ref={el => {
                      tabRefs.current[group.id] = el;
                    }}
                    onClick={() => handleTabClick(group.id)}
                    onMouseEnter={() => handleTabHover(group.id)}
                    className={[
                      'px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2',
                      isActive || isOpen
                        ? 'border-metropolia-main-orange text-metropolia-main-orange'
                        : 'border-transparent text-gray-800 hover:text-metropolia-main-orange hover:border-metropolia-main-orange',
                    ].join(' ')}
                  >
                    {group.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {currentGroup &&
        anchorRect &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: 'fixed',
              left: anchorRect.left,
              top: anchorRect.top + anchorRect.height + 4,
              zIndex: 9999,
            }}
            onMouseLeave={handleDropdownMouseLeave}
          >
            <div className="bg-gray-100 shadow-md rounded-sm min-w-[180px] border border-gray-200 dropdown-enter">
              <ul className="py-1">
                {currentGroup.items.map(item => {
                  const isItemActive = location.pathname.startsWith(
                    item.path,
                  );

                  return (
                    <li key={`${currentGroup.id}-${item.path}`}>
                      <button
                        type="button"
                        className={[
                          'block w-full text-left px-4 py-2 text-sm whitespace-nowrap',
                          isItemActive
                            ? 'bg-metropolia-main-orange text-white'
                            : 'text-gray-800 hover:bg-gray-200',
                        ].join(' ')}
                        onClick={() => {
                          navigate(item.path);
                          setOpenGroup(null);
                        }}
                      >
                        {item.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default TeacherTopNav;
