import React, {useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import apiHooks from '../../../../api';
import TextInputField from '../../../ui/inputs/TextInputField.tsx';
import DeleteIcon from '@mui/icons-material/Delete';
import {IconButton} from '@mui/material';

type Instructor = {
  email: string;
  exists?: boolean;
};

interface AddTeachersProps {
  instructors: Instructor[];
  setInstructors: React.Dispatch<React.SetStateAction<Instructor[]>>;
  instructorEmail: string;
  modify?: boolean;
}

const AddTeachers: React.FC<AddTeachersProps> = ({
                                                   instructors,
                                                   setInstructors,
                                                   instructorEmail,
                                                   modify = false,
                                                 }) => {
  const {t} = useTranslation(['common']);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const timeouts = useRef<(number | null)[]>([]);

  const deleteInstructor = (index: number) => {
    setInstructors((prev) => prev.filter((_, i) => i !== index));
    setErrorMessages((prev) => prev.filter((_, i) => i !== index));
  };

  const addInstructor = (
    event?: React.MouseEvent<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement>,
  ) => {
    event?.preventDefault();
    setInstructors((prev) => [...prev, {email: ''}]);
  };

  const handleInputChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value;

    // Päivitä email heti
    setInstructors((prev) => {
      const next = [...prev];
      next[index] = {...next[index], email: value};
      return next;
    });

    // Clear previous debounce
    if (timeouts.current[index] !== null) {
      window.clearTimeout(timeouts.current[index] as number);
    }

    // Debounce check
    timeouts.current[index] = window.setTimeout(async () => {
      const token = localStorage.getItem('userToken');
      if (!token) return;

      try {
        const response = await apiHooks.checkStaffByEmail(value, token);
        const exists = Boolean(response?.exists);

        setInstructors((prev) => {
          const next = [...prev];
          next[index] = {...next[index], exists};
          return next;
        });

        setErrorMessages((prev) => {
          const next = [...prev];
          next[index] = exists
            ? ''
            : t('common:addTeachers.errors.notFound');
          return next;
        });
      } catch {
        setErrorMessages((prev) => {
          const next = [...prev];
          next[index] = t('common:addTeachers.errors.checkFailed');
          return next;
        });
      }
    }, 500);
  };

  return (
    <fieldset className="mb-5">
      {!modify && (
        <>
          <legend className="mb-1 text-xl font-heading text-metropolia-main-grey">
            {t('common:addTeachers.title')}
          </legend>
          <p className="text-sm text-gray-600 mb-4">
            {t('common:addTeachers.description')}
          </p>
        </>
      )}

      {/* Yksi yhteinen "lista-kortti" */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100">
          {instructors.map((instructor, index) => {
            const canDelete =
              instructors.length > 1 && instructor.email !== instructorEmail;

            return (
              <div key={index} className="flex gap-3 p-4">
                <div className="flex-1">
                  <TextInputField
                    type="text"
                    name="email"
                    label={index === 0 ? t('common:addTeachers.emailLabel') : undefined}
                    value={instructor.email}
                    /* @ts-ignore */
                    onChange={(event) => handleInputChange(index, event)}
                  />

                  {errorMessages[index] && (
                    <p className="mt-2 text-sm text-red-600">{errorMessages[index]}</p>
                  )}
                </div>

                {canDelete && (
                  <div className="flex items-center">
                    <IconButton
                      aria-label={t('common:addTeachers.aria.deleteInstructor')}
                      onClick={() => deleteInstructor(index)}
                      size="small"
                      className="mt-6"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* "Lisää opettaja" osana samaa korttia */}
        <button
          type="button"
          onClick={(event) => addInstructor(event)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-heading text-metropolia-main-orange hover:bg-orange-50 transition border-t border-gray-100">
          <span className="text-lg leading-none">+</span>
          {t('common:addTeachers.addAnother')}
        </button>
      </div>
    </fieldset>
  );
};

export default AddTeachers;
