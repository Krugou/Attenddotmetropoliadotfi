import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import SortIcon from '@mui/icons-material/Sort';
import {IconButton} from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import InputField from './coursedetails/InputField';

/**
 * Component for displaying and managing a list of students.
 *
 * @param {Object} props - Component props
 * @param {Array} props.studentList - List of students
 * @param {Function} props.setStudentList - Setter for the student list
 */
const StudentList = ({studentList, setStudentList}) => {
	const {t} = useTranslation();
	// State for various component features
	const [lastStudentNumber, setLastStudentNumber] = useState(777);
	const [lastEmailNumber, setLastEmailNumber] = useState(1);
	const [sortAscending, setSortAscending] = useState(true);
	const [hiddenColumns, setHiddenColumns] = useState<Record<string, boolean>>({
		admingroups: true,
		arrivalgroup: true,
		educationform: true,
		evaluation: true,
		program: true,
		registration: true,
		name: true,
	});
	const [open, setOpen] = useState(false);
	const [toBeDeleted, setToBeDeleted] = useState<number | null>(null);
	const [hideExtraColumns, setHideExtraColumns] = useState(true);
	const [lockedFields, setLockedFields] = useState<boolean[]>(
		new Array(studentList.length).fill(true),
	);
	// Handlers for dialog open/close
	const handleClickOpen = (index: number) => {
		setToBeDeleted(index);
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};
	// Handler for deleting a student
	const handleDelete = () => {
		if (toBeDeleted !== null) {
			deleteStudent(toBeDeleted);
		}
		setOpen(false);
	};
	// Handler for toggling a student's locked status
	const toggleLock = (index: number) => {
		setLockedFields(prevLockedFields => {
			const newLockedFields = [...prevLockedFields];
			newLockedFields[index] = !newLockedFields[index];
			return newLockedFields;
		});
	};
	// Handler for adding a new student

	const addStudent = event => {
		event.preventDefault();
		const newStudent = {
			last_name: 'Meikäläinen',
			first_name: 'Matti',
			name: 'Meikäläinen Matti',
			email: `Matti.meikalainen${lastEmailNumber}@metropolia.com`,
			studentnumber: lastStudentNumber.toString(),
			admingroups: 'tvt19spo',
			arrivalgroup: 'xyz',
			educationform: 'Päivätoteutus',
			evaluation: '1',
			program: 'Degree Programme in Information Technology',
			registration: 'Hyväksytty',
		};
		setStudentList([...studentList, newStudent]);
		setLastStudentNumber(lastStudentNumber + 1);
		setLastEmailNumber(lastEmailNumber + 1);
	};
	// Handler for sorting students
	const sortStudents = event => {
		event.preventDefault();
		const sortedStudentList = [...studentList].sort((a, b) =>
			sortAscending
				? a.last_name.localeCompare(b.last_name)
				: b.last_name.localeCompare(a.last_name),
		);
		setStudentList(sortedStudentList);
		setSortAscending(!sortAscending); // Toggle the sort direction for the next sort
	};
	// Handler for deleting a student
	const deleteStudent = index => {
		const newStudentList = [...studentList];
		newStudentList.splice(index, 1);
		setStudentList(newStudentList);
	};
	// Effect for adding a student if the list is empty
	useEffect(() => {
		if (studentList.length === 0) {
			addStudent(event);
		}
	}, []); // Empty dependency array means this effect runs once on mount
	// Handler for toggling extra columns
	const toggleExtraColumns = () => {
		setHiddenColumns(() =>
			hideExtraColumns
				? {}
				: ({
						admingroups: true,
						arrivalgroup: true,
						educationform: true,
						evaluation: true,
						program: true,
						registration: true,
						name: true,
				  } as Record<string, boolean>),
		);
		setHideExtraColumns(!hideExtraColumns);
	};

	return (
		<div className="relative">
			<div className="h-1/2 relative overflow-x-scroll">
				<button
					aria-label={hideExtraColumns ? t('teacher.studentList.buttons.showAllColumns') : t('teacher.studentList.buttons.hideExtraColumns')}
					className="p-1 bg-metropoliaMainOrange text-sm text-white transition font-bold rounded-xl hover:bg-metropoliaSecondaryOrange focus:outline-none mb-4 sticky top-0 left-0"
					onClick={event => {
						event.preventDefault();
						toggleExtraColumns();
					}}
				>
					{hideExtraColumns ? t('teacher.studentList.buttons.showAllColumns') : t('teacher.studentList.buttons.hideExtraColumns')}
				</button>
				<div className="max-h-96 h-96 overflow-y-scroll relative">
					<table className="table-auto w-full">
						<thead className="sticky top-0 bg-white z-10">
							<tr>
								{studentList.length > 0 &&
									Object.keys(studentList[0]).map(
										(key, index) =>
											!hiddenColumns[key] && (
												<th key={index} className="px-4 py-2">
													{key}
													{key === 'last_name' && (
														<button
															aria-label={t('teacher.studentList.aria.sortColumn')}
															className="ml-2 bg-metropoliaMainOrange text-sm text-white font-bold transition rounded hover:bg-metropoliaMainOrangeDark focus:outline-none focus:ring-2 focus:ring-metropoliaMainOrangeDark p-1"
															onClick={sortStudents}
														>
															<SortIcon />
														</button>
													)}
												</th>
											),
									)}
								{studentList.length > 1 && <th className="px-4 py-2">Actions</th>}
							</tr>
						</thead>
						<tbody>
							{studentList.map(
								(student: Record<string, string | number>, index: number) => (
									<tr
										key={index}
										className={`border ${
											lockedFields[index] ? '' : 'bg-metropoliaMainGrey bg-opacity-50  '
										}`}
									>
										{Object.entries(student).map(
											([key, value], innerIndex) =>
												!hiddenColumns[key] && (
													<td key={innerIndex}>
														<InputField
															type="text"
															name={key}
															value={value.toString()}
															onChange={e => {
																const newStudentList = [...studentList];
																newStudentList[index][key] = e.target.value;
																setStudentList(newStudentList);
															}}
															disabled={lockedFields[index]}
														/>
													</td>
												),
										)}
										{studentList.length > 1 && (
											<td className="border px-4 py-2">
												<IconButton onClick={() => toggleLock(index)}>
													{lockedFields[index] ? <LockOpenIcon /> : <LockIcon />}
												</IconButton>
												<IconButton
													aria-label={t('teacher.studentList.aria.deleteStudent')}
													color="error"
													onClick={() => handleClickOpen(index)}
												>
													<DeleteIcon />
												</IconButton>
												<Dialog
													open={open}
													onClose={handleClose}
													aria-labelledby="alert-dialog-title"
													aria-describedby="alert-dialog-description"
												>
													<DialogTitle id="alert-dialog-title">
														{t('teacher.studentList.dialog.title')}
													</DialogTitle>
													<DialogContent>
														<DialogContentText id="alert-dialog-description">
															{t('teacher.studentList.dialog.message')}
														</DialogContentText>
													</DialogContent>
													<DialogActions>
														<Button onClick={handleClose}>{t('teacher.studentList.buttons.cancel')}</Button>
														<Button onClick={handleDelete} color="error" autoFocus>
															{t('teacher.studentList.buttons.delete')}
														</Button>
													</DialogActions>
												</Dialog>
											</td>
										)}
									</tr>
								),
							)}
						</tbody>
					</table>
				</div>
				<button
					className="p-1 mt-2 text-sm sticky top-0 left-0 bg-metropoliaMainOrange text-white font-bold rounded-xl hover:bg-metropoliaSecondaryOrange focus:outline-none mb-4"
					onClick={event => addStudent(event)}
				>
					{t('teacher.studentList.buttons.addStudent')}
				</button>
			</div>
		</div>
	);
};

export default StudentList;
