import React from 'react';
/**
 * CreateCourseProgress component properties
 */
interface ProgressProps {
  currentStep: number;
  createCourseMode: string;
}
/**
 * CreateCourseProgress is a functional component that renders a progress bar for course creation.
 * The progress bar is divided into steps based on the course creation mode.
 * The current step is highlighted in the progress bar.
 *
 * @param props - The properties of the progress bar.
 * @returns A JSX element.
 */
const CreateCourseProgress: React.FC<ProgressProps> = ({
  currentStep,
  createCourseMode,
}) => {
  const totalSteps = createCourseMode === 'easy' ? 4 : 3;

  return (
    <div className='relative w-full h-4 mb-6 bg-gray-200 rounded-full'>
      {[...Array(totalSteps)].map((_, step) => (
        <div
          key={step}
          className={`absolute top-0 h-4 ${
            createCourseMode === 'easy' ? 'w-1/4' : 'w-1/3'
          }  rounded-full ${
            step < currentStep ? 'bg-metropolia-main-orange' : 'bg-gray-200'
          }`}
          style={{left: `${(step / totalSteps) * 100}%`}}>
          <div
            className={`absolute top-0  transform -translate-x-1/2 -translate-y-1/2 bg-white text-black rounded border border-black text-xs leading-none px-2 py-1 sm:px-3 sm:py-1.5 left-2/4	 ${
              step === currentStep - 1 ? 'block' : 'hidden'
            }`}>
            {step + 1}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CreateCourseProgress;
