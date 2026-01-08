import React, {
  useMemo,
  useState,
  useRef,
  useLayoutEffect,
  useEffect,
  JSX,
} from 'react';
import {
  MenuBook,
  School,
  People,
  HelpOutline,
  Home,
} from '@mui/icons-material';
import {useLocation, useNavigate} from 'react-router-dom';
import {createPortal} from 'react-dom';

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

type NavItem = {
  path: string;
  label: string;
};

type NavGroupId = 'lectures' | 'courses' | 'students' | 'help';

type NavGroup = {
  id: NavGroupId;
  label: string;
  icon: JSX.Element;
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

/** Border radius -tokenit tälle naville */
//const R_PILL = 'rounded-full';
const R_CONTAINER = 'rounded-2xl';
const R_DROPDOWN = 'rounded-md';

const TeacherTopNav: React.FC<TeacherTopNavProps> = ({t}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const HOME_PATH = '/teacher/mainview';

  const [openGroup, setOpenGroup] = useState<NavGroupId | null>(null);
  const [anchorRect, setAnchorRect] = useState<AnchorRect | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        icon: <MenuBook fontSize="small" />,
        items: [
          // Etusivu poistettu täältä (on nyt oma ylävalinta)
          {
            path: '/teacher/attendance/createlecture',
            label: t('teacher:mainView.cards.createLecture.title'),
          },
          {
            path: '/teacher/lectures',
            label: t('teacher:mainView.cards.lectureStats.title'),
          },
        ],
      },
      {
        id: 'courses',
        label: t('teacher:toasts.topNav.courses'),
        icon: <School fontSize="small" />,
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
            path: '/teacher/courses/stats',
            label: t('teacher:mainView.cards.attendanceStats.title'),
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
        ],
      },
      {
        id: 'students',
        label: t('teacher:toasts.topNav.students'),
        icon: <People fontSize="small" />,
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
        icon: <HelpOutline fontSize="small" />,
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

  const normalizePath = (p: string) => (p.endsWith('/') ? p.slice(0, -1) : p);

  const isPathMatch = (pathname: string, itemPath: string) => {
    const a = normalizePath(pathname);
    const b = normalizePath(itemPath);
    return a === b || a.startsWith(`${b}/`);
  };

  const getVirtualPathname = (pathname: string) => {
    if (pathname.startsWith('/teacher/courses/create/worklog')) {
      return '/teacher/worklog/create';
    }

    if (pathname.startsWith('/teacher/courses/create/practicum')) {
      return '/teacher/practicum/create';
    }

    return pathname;
  };

  const virtualPathname = useMemo(
    () => getVirtualPathname(location.pathname),
    [location.pathname],
  );

  const isHomeActive = useMemo(
    () => isPathMatch(virtualPathname, HOME_PATH),
    [virtualPathname],
  );

  const activeGroupId: NavGroupId = useMemo(() => {
    const pathname = getVirtualPathname(location.pathname);

    let best: { groupId: NavGroupId; pathLen: number } | null = null;

    for (const group of navGroups) {
      for (const item of group.items) {
        if (isPathMatch(pathname, item.path)) {
          const len = normalizePath(item.path).length;
          if (!best || len > best.pathLen) {
            best = { groupId: group.id, pathLen: len };
          }
        }
      }
    }
    return best?.groupId ?? 'lectures';
  }, [location.pathname, navGroups]);

  const activeItemPathByGroup = useMemo(() => {
    const result: Record<NavGroupId, string | null> = {
      lectures: null,
      courses: null,
      students: null,
      help: null,
    };

    for (const group of navGroups) {
      let bestPath: string | null = null;
      let bestLen = -1;

      for (const item of group.items) {
        if (isPathMatch(virtualPathname, item.path)) {
          const len = normalizePath(item.path).length;
          if (len > bestLen) {
            bestLen = len;
            bestPath = item.path;
          }
        }
      }

      result[group.id] = bestPath;
    }

    return result;
  }, [navGroups, virtualPathname]);

  useEffect(() => {
    setOpenGroup(null);
    setMobileMenuOpen(false);
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
    setOpenGroup(groupId);
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

  const handleDropdownMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
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
      {/* DESKTOP / TABLET NAV (≥ sm) */}
      <nav
        className="hidden sm:block w-full mb-4"
        onMouseLeave={handleNavMouseLeave}
      >
        <div className="flex justify-center">
          <div className="w-full max-w-5xl px-4">
            <div
              className={`bg-white/95 ${R_CONTAINER} shadow-md border border-white/60`}
            >
              <ul className="flex flex-nowrap justify-center gap-8 px-10 sm:px-12 py-3">
                {/* ETUSIVU (oma päävalinta) */}
                <li className="flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      navigate(HOME_PATH);
                      setOpenGroup(null);
                    }}
                    className={[
                      'px-4 pt-[12px] pb-[6px] leading-tight text-sm sm:text-[15px] font-medium whitespace-nowrap border-b-2 transition-colors',
                      isHomeActive
                        ? 'border-metropolia-main-orange text-metropolia-main-orange'
                        : 'border-transparent text-gray-800 hover:text-metropolia-main-orange hover:border-metropolia-main-orange',
                    ].join(' ')}
                    aria-label={t('teacher:toasts.topNav.home')}
                  >
                    <span className="inline-flex items-center gap-2">
                      <span className="flex items-center">
                        <Home fontSize="small" />
                      </span>
                      <span>{t('teacher:toasts.topNav.home')}</span>
                    </span>
                  </button>
                </li>

                {navGroups.map(group => {
                  const isOpen = group.id === openGroup;

                  // Etusivulla ei haluta et luennot aktivoituu
                  const isActive = !isHomeActive && group.id === activeGroupId;

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
                          'px-4 pt-[12px] pb-[6px] leading-tight text-sm sm:text-[15px] font-medium whitespace-nowrap border-b-2 transition-colors',
                          isActive || isOpen
                            ? 'border-metropolia-main-orange text-metropolia-main-orange'
                            : 'border-transparent text-gray-800 hover:text-metropolia-main-orange hover:border-metropolia-main-orange',
                        ].join(' ')}
                      >
                        <span className="inline-flex items-center gap-2">
                          <span className="flex items-center">{group.icon}</span>
                          <span>{group.label}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* MOBIILI NAV (< sm) */}
      <nav className="sm:hidden w-full mb-4">
        <div className="flex justify-center px-4">
          <div
            className="
              w-full max-w-5xl
              bg-white
              rounded-2xl
              shadow-md
              border border-white/60
              px-5 py-3
              flex justify-between items-center
            "
          >
            <span className="font-medium text-gray-800 text-base">
              {t('teacher:toasts.topNav.menuLabel')}
            </span>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(open => !open)}
              aria-label="Avaa päävalikko"
              aria-expanded={mobileMenuOpen}
              className="flex flex-col justify-center w-7 gap-[4px]"
            >
              <span className="h-[3px] w-full bg-black rounded-full" />
              <span className="h-[3px] w-full bg-black rounded-full" />
              <span className="h-[3px] w-full bg-black rounded-full" />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="mt-3 w-full max-w-5xl mx-auto px-4">
            <div className="rounded-2xl bg-white shadow-lg border border-gray-200 overflow-hidden">
              {/* ETUSIVU (mobiilissa “samalla tavalla kuin muut”) */}
              <div className="pt-2 pb-2">
                <div className="px-4 pb-1 text-[15px] font-semibold tracking-wide text-gray-500 uppercase">
                  {t('teacher:toasts.topNav.home')}
                </div>
                <div className="mt-1 space-y-1">
                  <button
                    type="button"
                    className={[
                      'block w-full text-left px-4 py-2 text-sm rounded-md',
                      isHomeActive
                        ? 'bg-metropolia-main-orange text-white'
                        : 'text-gray-800 hover:bg-gray-100',
                    ].join(' ')}
                    onClick={() => {
                      navigate(HOME_PATH);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <span className="inline-flex items-center gap-2">
                      <span className="flex items-center">
                        <Home fontSize="small" />
                      </span>
                      <span>{t('teacher:toasts.topNav.home')}</span>
                    </span>
                  </button>
                </div>
              </div>

              {navGroups.map((group, index) => (
                <div
                  key={group.id}
                  className={`pb-2 ${
                    index !== 0 ? 'border-t border-gray-200 mt-2 pt-2' : ''
                  }`}
                >
                  <div className="px-4 pb-1 text-[15px] font-semibold tracking-wide text-gray-500 uppercase">
                    {group.label}
                  </div>
                  <div className="mt-1 space-y-1">
                    {group.items.map(item => {
                      const isItemActive =
                        item.path === activeItemPathByGroup[group.id];

                      return (
                        <button
                          key={`${group.id}-${item.path}`}
                          type="button"
                          className={[
                            'block w-full text-left px-4 py-2 text-sm rounded-md',
                            isItemActive
                              ? 'bg-metropolia-main-orange text-white'
                              : 'text-gray-800 hover:bg-gray-100',
                          ].join(' ')}
                          onClick={() => {
                            navigate(item.path);
                            setMobileMenuOpen(false);
                          }}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* DESKTOP DROPDOWN */}
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
            <div
              className={`bg-gray-100 shadow-md ${R_DROPDOWN} min-w-[180px] border border-gray-200 dropdown-enter`}
            >
              <ul className="py-1">
                {currentGroup.items.map(item => {
                  const isItemActive =
                    item.path === activeItemPathByGroup[currentGroup.id];

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
