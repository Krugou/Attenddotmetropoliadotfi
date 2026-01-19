/* WAITING DELETION import React from 'react';

interface ProgressProps {
  currentStep: number;
  createCourseMode: string;
}

const CreateCourseProgress: React.FC<ProgressProps> = ({
                                                         currentStep,
                                                         createCourseMode,
                                                       }) => {
  const totalSteps = createCourseMode === 'easy' ? 5 : 4;

  // clamp varmuuden vuoksi
  const safeStep = Math.min(Math.max(currentStep, 1), totalSteps);

  const progressPct =
    totalSteps <= 1 ? 0 : ((safeStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="w-full mb-6">
      <div className="w-full max-w-3xl mx-auto px-3 sm:px-4">
        <div className="relative w-full">

          <div className="h-2 w-full rounded-full bg-gray-200" />


          <div
            className="absolute left-0 top-0 h-2 rounded-full bg-metropolia-main-orange transition-all duration-300"
            style={{width: `${progressPct}%`}}
          />


          <div className="absolute inset-0 flex items-center justify-between">
            {Array.from({length: totalSteps}).map((_, i) => {
              const stepNumber = i + 1;
              const isDone = stepNumber < safeStep;
              const isCurrent = stepNumber === safeStep;

              return (
                <div
                  key={stepNumber}
                  className={[
                    'flex items-center justify-center',
                    'rounded-full font-semibold',
                    'transition-all duration-300',
                    'border',
                    isDone
                      ? 'h-7 w-7 bg-metropolia-main-orange border-metropolia-main-orange text-white'
                      : isCurrent
                        ? 'h-9 w-9 bg-[#FFE6D1] border-metropolia-main-orange text-metropolia-main-orange'
                        : 'h-7 w-7 bg-gray-100 border-gray-300 text-gray-500',
                  ].join(' ')}
                >
                  {stepNumber}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCourseProgress;*/
