import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, Switch } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface AttendanceSettingsProps {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;

  setIsAnimationStopped: (isAnimationStopped: boolean) => void;
  setScrollTabToggle: (scrollTabToggle: boolean) => void;
  setWiderNamesToggle: (widerNamesToggle: boolean) => void;
  setHideQR: (hideQR: boolean) => void;

  latency: number | null;
  stopAnimation: boolean;
  enableScroll: boolean;
  widerNames: boolean;
  hideQR: boolean;
}

const latencyBucket = (latency: number) => {
  if (latency < 100) return 'excellent';
  if (latency < 300) return 'good';
  return 'poor';
};

const latencyBadgeClass = (latency: number) => {
  if (latency < 100) return 'bg-green-100 text-green-800';
  if (latency < 300) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

function GuideContent() {
  const { t } = useTranslation('teacher');
  return (
    <div className="space-y-4">
      <p className="font-body">{t('teacher:attendanceInstructions.intro')}</p>
      <ol className="space-y-4 list-decimal list-inside font-body">
        <li>{t('teacher:attendanceInstructions.instructions.timer')}</li>
        <li>{t('teacher:attendanceInstructions.instructions.studentList')}</li>
        <li>{t('teacher:attendanceInstructions.instructions.navigation')}</li>
        <li>{t('teacher:attendanceInstructions.instructions.manualAttendance')}</li>
        <li>{t('teacher:attendanceInstructions.instructions.finishLecture')}</li>
        <li>{t('teacher:attendanceInstructions.instructions.cancelLecture')}</li>
      </ol>
    </div>
  );
}

function ToggleRow({
                     id,
                     label,
                     checked,
                     onChange,
                   }: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <label className="font-body" htmlFor={id}>
        {label}
      </label>
      <Switch
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        inputProps={{ 'aria-label': label, name: id }}
      />
    </div>
  );
}

function SettingsContent({
                           latency,
                           stopAnimation,
                           enableScroll,
                           widerNames,
                           hideQR,
                           setIsAnimationStopped,
                           setScrollTabToggle,
                           setWiderNamesToggle,
                           setHideQR,
                         }: Pick<
  AttendanceSettingsProps,
  | 'latency'
  | 'stopAnimation'
  | 'enableScroll'
  | 'widerNames'
  | 'hideQR'
  | 'setIsAnimationStopped'
  | 'setScrollTabToggle'
  | 'setWiderNamesToggle'
  | 'setHideQR'
>) {
  const { t } = useTranslation('teacher');

  const latencyInfo = useMemo(() => {
    if (latency == null) return null;
    return { badge: latencyBadgeClass(latency), key: latencyBucket(latency) };
  }, [latency]);

  return (
    <div className="space-y-6">
      {latency != null && latencyInfo && (
        <div className="p-4 mb-4 rounded-lg bg-gray-50">
          <h3 className="mb-2 text-lg font-heading">
            {t('teacher:attendance.settings.networkStatus.title')}
          </h3>
          <div className="flex items-center justify-between">
            <span className="font-body">
              {t('teacher:attendance.settings.networkStatus.connectionLatency')}
            </span>
            <span className={`font-mono px-3 py-1 rounded ${latencyInfo.badge}`}>
              {latency} ms
            </span>
          </div>
          <div className="mt-2 text-sm text-gray-500 font-body">
            {t(`teacher:attendance.settings.networkStatus.${latencyInfo.key}`)}
          </div>
        </div>
      )}

      <ToggleRow
        id="toggle-stop-animation"
        label={t('teacher:attendance.settings.toggles.stopAnimation')}
        checked={stopAnimation}
        onChange={setIsAnimationStopped}
      />

      <ToggleRow
        id="toggle-enable-scroll"
        label={t('teacher:attendance.settings.toggles.enableScroll')}
        checked={enableScroll}
        onChange={setScrollTabToggle}
      />

      <ToggleRow
        id="toggle-wider-names"
        label={t('teacher:attendance.settings.toggles.widerNames')}
        checked={widerNames}
        onChange={setWiderNamesToggle}
      />

      <ToggleRow
        id="toggle-hide-qr"
        label={t('teacher:attendance.settings.toggles.hideQR')}
        checked={hideQR}
        onChange={setHideQR}
      />
    </div>
  );
}

const AttendanceSettings: React.FC<AttendanceSettingsProps> = ({
                                                                 dialogOpen,
                                                                 setDialogOpen,
                                                                 setIsAnimationStopped,
                                                                 setScrollTabToggle,
                                                                 setWiderNamesToggle,
                                                                 setHideQR,
                                                                 latency,
                                                                 stopAnimation,
                                                                 enableScroll,
                                                                 widerNames,
                                                                 hideQR,
                                                               }) => {
  const { t } = useTranslation('teacher');
  const [showGuide, setShowGuide] = useState(false);

  return (
    <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle className="p-4 text-white bg-metropolia-main-orange font-heading">
        {showGuide
          ? t('teacher:attendance.settings.guide')
          : t('teacher:attendance.settings.title')}
      </DialogTitle>

      <div
        className="flex border-b"
        role="tablist"
        aria-label={t('teacher:attendance.settings.title')}
      >
        <button
          role="tab"
          aria-selected={!showGuide}
          onClick={() => setShowGuide(false)}
          className={`flex-1 p-4 font-heading ${
            !showGuide ? 'bg-metropolia-trend-green text-white' : ''
          }`}
        >
          {t('teacher:attendance.settings.showSettings')}
        </button>
        <button
          role="tab"
          aria-selected={showGuide}
          onClick={() => setShowGuide(true)}
          className={`flex-1 p-4 font-heading ${
            showGuide ? 'bg-metropolia-trend-green text-white' : ''
          }`}
        >
          {t('teacher:attendance.settings.showGuide')}
        </button>
      </div>

      <DialogContent>
        {showGuide ? (
          <GuideContent />
        ) : (
          <SettingsContent
            latency={latency}
            stopAnimation={stopAnimation}
            enableScroll={enableScroll}
            widerNames={widerNames}
            hideQR={hideQR}
            setIsAnimationStopped={setIsAnimationStopped}
            setScrollTabToggle={setScrollTabToggle}
            setWiderNamesToggle={setWiderNamesToggle}
            setHideQR={setHideQR}
          />
        )}
      </DialogContent>

      <div className="p-4 border-t">
        <button
          className="w-full p-2 text-white transition rounded-sm font-heading bg-metropolia-main-orange hover:bg-metropolia-secondary-orange"
          onClick={() => setDialogOpen(false)}
        >
          {t('teacher:attendance.settings.close')}
        </button>
      </div>
    </Dialog>
  );
};

export default AttendanceSettings;

/* OLD CODE STARTS HERE
import {Dialog, DialogContent, DialogTitle, Switch} from '@mui/material';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';

interface AttendanceInstructionsProps {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  setIsAnimationStopped: (isAnimationStopped: boolean) => void;
  setScrollTabToggle: (scrollTabToggle: boolean) => void;
  setWiderNamesToggle: (widerNamesToggle: boolean) => void;
  latency: number | null;
  setHideQR: (hideQR: boolean) => void;
  stopAnimation: boolean;
  enableScroll: boolean;
  widerNames: boolean;
  hideQR: boolean;
}

const AttendanceSettings: React.FC<AttendanceInstructionsProps> = ({
  dialogOpen,
  setDialogOpen,
  setIsAnimationStopped,
  setScrollTabToggle,
  setWiderNamesToggle,
  latency,
  setHideQR,
  stopAnimation,
  enableScroll,
  widerNames,
  hideQR,
}) => {
  const {t} = useTranslation(['teacher']);
  const [showGuide, setShowGuide] = useState(false);

  const GuideContent = () => (
    <div className='space-y-4'>
      <p className='font-body'>{t('teacher:attendanceInstructions.intro')}</p>
      <ol className='space-y-4 list-decimal list-inside font-body'>
        <li>{t('teacher:attendanceInstructions.instructions.timer')}</li>
        <li>{t('teacher:attendanceInstructions.instructions.studentList')}</li>
        <li>{t('teacher:attendanceInstructions.instructions.navigation')}</li>
        <li>
          {t('teacher:attendanceInstructions.instructions.manualAttendance')}
        </li>
        <li>
          {t('teacher:attendanceInstructions.instructions.finishLecture')}
        </li>
        <li>
          {t('teacher:attendanceInstructions.instructions.cancelLecture')}
        </li>
      </ol>
    </div>
  );

  const SettingsContent = () => (
    <div className='space-y-6'>
      {latency !== null && latency !== undefined && (
        <div className='p-4 mb-4 rounded-lg bg-gray-50'>
          <h3 className='mb-2 text-lg font-heading'>
            {t('teacher:attendance.settings.networkStatus.title')}
          </h3>
          <div className='flex items-center justify-between'>
            <span className='font-body'>
              {t('teacher:attendance.settings.networkStatus.connectionLatency')}
            </span>
            <span
              className={`font-mono px-3 py-1 rounded ${
                latency < 100
                  ? 'bg-green-100 text-green-800'
                  : latency < 300
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
              {latency} ms
            </span>
          </div>
          <div className='mt-2 text-sm text-gray-500 font-body'>
            {latency < 100
              ? t('teacher:attendance.settings.networkStatus.excellent')
              : latency < 300
              ? t('teacher:attendance.settings.networkStatus.good')
              : t('teacher:attendance.settings.networkStatus.poor')}
          </div>
        </div>
      )}

      <div className='flex items-center justify-between'>
        <label className='font-body'>
          {t('teacher:attendance.settings.toggles.stopAnimation')}
        </label>
        <Switch
          checked={stopAnimation}
          onChange={(e) => setIsAnimationStopped(e.target.checked)}
        />
      </div>
      <div className='flex items-center justify-between'>
        <label className='font-body'>
          {t('teacher:attendance.settings.toggles.enableScroll')}
        </label>
        <Switch
          checked={enableScroll}
          onChange={(e) => setScrollTabToggle(e.target.checked)}
        />
      </div>
      <div className='flex items-center justify-between'>
        <label className='font-body'>
          {t('teacher:attendance.settings.toggles.widerNames')}
        </label>
        <Switch
          checked={widerNames}
          onChange={(e) => setWiderNamesToggle(e.target.checked)}
        />
      </div>
      <div className='flex items-center justify-between'>
        <label className='font-body'>
          {t('teacher:attendance.settings.toggles.hideQR')}
        </label>
        <Switch
          checked={hideQR}
          onChange={(e) => setHideQR(e.target.checked)}
        />
      </div>
    </div>
  );

  return (
    <Dialog
      open={dialogOpen}
      onClose={() => setDialogOpen(false)}
      maxWidth='sm'
      fullWidth>
      <DialogTitle className='p-4 text-white bg-metropolia-main-orange font-heading'>
        {showGuide
          ? t('teacher:attendance.settings.guide')
          : t('teacher:attendance.settings.title')}
      </DialogTitle>

      <div className='flex border-b'>
        <button
          onClick={() => setShowGuide(false)}
          className={`flex-1 p-4 font-heading ${
            !showGuide ? 'bg-metropolia-trend-green text-white' : ''
          }`}>
          {t('teacher:attendance.settings.showSettings')}
        </button>
        <button
          onClick={() => setShowGuide(true)}
          className={`flex-1 p-4 font-heading ${
            showGuide ? 'bg-metropolia-trend-green text-white' : ''
          }`}>
          {t('teacher:attendance.settings.showGuide')}
        </button>
      </div>

      <DialogContent>
        {showGuide ? <GuideContent /> : <SettingsContent />}
      </DialogContent>

      <div className='p-4 border-t'>
        <button
          className='w-full p-2 text-white transition rounded-sm font-heading bg-metropolia-main-orange hover:bg-metropolia-secondary-orange'
          onClick={() => setDialogOpen(false)}>
          {t('teacher:attendance.settings.close')}
        </button>
      </div>
    </Dialog>
  );
};

export default AttendanceSettings;*/
