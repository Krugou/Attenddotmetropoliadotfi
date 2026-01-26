import React from 'react';

export type BaseCourseCardProps = {
  title?: string;
  isEnded?: boolean;

  /** Kortin yläoikean kulman ikonit (edit/delete tms) */
  actions?: React.ReactNode;

  /** Custom-headeri */
  header?: React.ReactNode;

  /** Kortin pääsisältö */
  children: React.ReactNode;

  /** Alareunan CTA/Linkit */
  footer?: React.ReactNode;

  /** Footerin sijoittelu */
  footerAlign?: 'stack' | 'auto';

  /** Hover-animaatio */
  disableHover?: boolean;

  /** Mahdolliset lisäluokat */
  className?: string;
};

const BaseCourseCard: React.FC<BaseCourseCardProps> = ({
                                                         title,
                                                         isEnded = false,
                                                         actions,
                                                         header,
                                                         children,
                                                         footer,
                                                         footerAlign = 'stack',
                                                         disableHover = false,
                                                         className,
                                                       }) => {
  return (
    <div
      className={[
        'relative p-5 rounded-2xl shadow-md border flex flex-col',
        'min-h-[320px]',
        disableHover
          ? '' // ei hover/transform animaatioita
          : 'transition-shadow transition-transform duration-200 ease-out will-change-transform hover:shadow-lg hover:-translate-y-1',
        isEnded
          ? 'bg-gray-100 border-gray-300 opacity-70'
          : 'bg-white border-metropolia-main-orange/30',
        className ?? '',
      ].join(' ')}
    >
      {/* Header */}
      {header ? (
        <div>{header}</div>
      ) : (
        <div className="flex items-center justify-between gap-4">
          {title ? <p className="text-gray-800 text-lg font-heading">{title}</p> : null}
          {actions ? <div className="flex gap-5">{actions}</div> : null}
        </div>
      )}

      <div className="mt-3 flex-1">{children}</div>

      {footer ? (
        <div className={footerAlign === 'auto' ? 'mt-auto pt-4' : 'mt-4'}>
          {footer}
        </div>
      ) : null}
    </div>
  );
};

export default BaseCourseCard;
