import React from 'react';
import StepButton from '../buttons/StepButton';
import { useTranslation } from 'react-i18next';

/**
 * Properties for the PracticumStepButtons component
 */
interface PracticumStepButtonsProps {
  currentStep: number;
  onPrevClick: () => void;
  onNextClick: () => void;
  onSubmitClick: () => void;
  extraStep?: boolean;
  customNextLabel?: string;
  nextDisabled?: boolean;
  totalSteps?: number;
}

/**
 * PracticumStepButtons is a component that renders navigation buttons for a multi-step process.
 *
 * @param props - The component properties
 * @returns A React component with navigation buttons
 */
const PracticumStepButtons: React.FC<PracticumStepButtonsProps> = ({
  currentStep,
  onPrevClick,
  onNextClick,
  onSubmitClick,
  extraStep = false,
  customNextLabel,
  nextDisabled = false,
  totalSteps,
}) => {
  const { t } = useTranslation(['teacher']);


  const steps = totalSteps ? totalSteps : (extraStep ? 4 : 3);
  const isLastStep = currentStep === steps;

  return (
    <div className={`flex items-center ${currentStep === 1 ? 'justify-end' : 'justify-between'}`}>
      {currentStep > 1 && (
        <StepButton
          text={t('teacher:practicum.stepButtons.previous')}
          type="button"
          onClick={onPrevClick}
        />
      )}

      {!isLastStep ? (
        <StepButton
          text={customNextLabel || t('teacher:practicum.stepButtons.next')}
          type="button"
          onClick={onNextClick}
          disabled={nextDisabled}
        />
      ) : (
        <StepButton
          text={t('teacher:practicum.create')}
          type="submit"
          onClick={onSubmitClick}
          marginTop="mt-2"
          disabled={nextDisabled}
        />
      )}
    </div>
  );
};

export default PracticumStepButtons;
