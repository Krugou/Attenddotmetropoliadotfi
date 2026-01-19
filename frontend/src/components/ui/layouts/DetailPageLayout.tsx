import React from 'react';
import Tooltip from '@mui/material/Tooltip';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';

type Props = {
  title: string;
  backLabel: string;
  onBack: () => void;
  children: React.ReactNode;
  maxWidthClassName?: string;
};

const DetailPageLayout: React.FC<Props> = ({title, backLabel, onBack, children, maxWidthClassName = 'max-w-[900px]',}) => {
  return (
    <div className="w-full flex justify-center">
      <div className={`w-full ${maxWidthClassName} px-2 sm:px-4 lg:px-6`}>
        <section className="w-full bg-gray-100 rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm">
          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute left-0">
              <Tooltip title={backLabel}>
                <button
                  onClick={onBack}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full text-metropolia-main-orange hover:bg-metropolia-main-orange/10 transition-colors"
                  aria-label={backLabel}
                >
                  <ArrowBackRoundedIcon />
                </button>
              </Tooltip>
            </div>

            <h2 className="text-2xl sm:text-3xl font-heading text-metropolia-main-grey">
              {title}
            </h2>
          </div>

          {children}
        </section>
      </div>
    </div>
  );
};

export default DetailPageLayout;
