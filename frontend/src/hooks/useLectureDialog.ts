import { useState } from 'react';

type DialogAction = 'close' | 'delete' | null;

interface UseLectureDialogParams {
  onConfirm: (lectureId: string, action: Exclude<DialogAction, null>) => Promise<void>;
}

export const useLectureDialog = ({ onConfirm }: UseLectureDialogParams) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState<string | null>(null);
  const [dialogAction, setDialogAction] = useState<DialogAction>(null);

  const handleDialogOpen = (lectureId: string, action: Exclude<DialogAction, null>) => {
    setSelectedLecture(lectureId);
    setDialogAction(action);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedLecture(null);
    setDialogAction(null);
  };

  const handleDialogConfirm = async () => {
    if (!selectedLecture || !dialogAction) return;
    await onConfirm(selectedLecture, dialogAction);
    handleDialogClose();
  };

  return {
    dialogOpen,
    dialogAction,
    handleDialogOpen,
    handleDialogClose,
    handleDialogConfirm,
  };
};

