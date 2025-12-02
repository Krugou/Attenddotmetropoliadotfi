import { Dispatch, SetStateAction } from 'react';

interface ResetFormArgs {
  setEmail: Dispatch<SetStateAction<string>>;
  setFirstName: Dispatch<SetStateAction<string>>;
  setLastName: Dispatch<SetStateAction<string>>;
  setStudentNumber?: Dispatch<SetStateAction<string>>;
  setStudentGroupId?: Dispatch<SetStateAction<number | null>>;
  setRoleId?: Dispatch<SetStateAction<number | null>>;
  setStaff?: Dispatch<SetStateAction<any>>;
}

export const useResetUserForm = ({
                               setEmail,
                               setFirstName,
                               setLastName,
                               setStudentNumber,
                               setStudentGroupId,
                             }: ResetFormArgs) => {
  const reset = () => {
    setEmail('');
    setFirstName('');
    setLastName('');
    setStudentNumber?.('');
    setStudentGroupId?.(null);
  };

  return { reset };
};
