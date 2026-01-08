import React from 'react';
import {useNavigate} from 'react-router-dom';
import {SvgIconProps} from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

/**
 * Props for the NavigationCard component.
 */
interface CardProps {
  path: string;
  title: string;
  subtitle?: string;
  description: string;
  className?: string;
  icon?: React.ComponentType<SvgIconProps>;
}

// Yhtenäinen border radius kortille
const CARD_RADIUS = 'rounded-2xl';
const CARD_RADIUS_BOTTOM = 'rounded-b-2xl';

const NavigationCard: React.FC<CardProps> = ({
                                               path,
                                               title,
                                               subtitle,
                                               description,
                                               className,
                                               icon: Icon,
                                             }) => {
  const navigate = useNavigate();

  /**
   * Navigates to the specified path when the card is clicked.
   */
  const handleCardClick = () => {
    navigate(path);
  };

  /**
   * A card component that displays a title and description, and navigates to a specified path when clicked.
   */
  return (
    <div
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleCardClick();
      }}
      className={`card-link m-3 cursor-pointer ${className ?? ''}`}
    >
      <div
        className={`
          relative bg-white ${CARD_RADIUS}
          group w-[17rem] h-[11rem]
          overflow-hidden
          border border-metropolia-main-orange/25
          shadow-[0_10px_20px_-12px_rgba(0,0,0,0.35)]
          transition-transform transition-shadow duration-200 ease-out
          hover:-translate-y-0.5 hover:shadow-[0_18px_30px_-18px_rgba(0,0,0,0.45)]
          focus:outline-none focus:ring-2 focus:ring-metropolia-main-orange/40
        `}
      >
        {/* Title + optional subtitle */}
        <div className="p-5 pt-5 flex items-start gap-3">
          {Icon && (
            <div className="shrink-0 -translate-y-0.5">
              <Icon className="text-metropolia-main-orange" />
            </div>
          )}

          <div className="min-w-0">
            <h2 className="text-lg font-heading text-metropolia-support-black leading-snug break-words">
              {title}
            </h2>

            {subtitle ? (
              <p className="text-base font-heading text-metropolia-main-grey/70 leading-snug break-words">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>

        {/* Hover reveal bottom panel */}
        <div
          className={`
            absolute bottom-0 left-0 w-full
            ${CARD_RADIUS_BOTTOM}
            bg-metropolia-main-orange
            px-5 py-7
            transition-transform duration-250 ease-out
            translate-y-full
            sm:group-hover:translate-y-0
          `}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-white font-body leading-snug">
              {description}
            </p>

            <span
              className={`
                shrink-0
                inline-flex items-center justify-center
                w-8 h-8 rounded-full
                bg-white/15
                text-white text-xl
                transition-transform duration-200
                sm:group-hover:translate-x-0.5
              `}
              aria-hidden="true"
            >
              <ArrowForwardRoundedIcon fontSize="small" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationCard;
