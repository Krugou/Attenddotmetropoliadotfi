import {CircularProgress} from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import React, {useContext, useEffect, useState} from 'react';
import {toast} from 'react-toastify';
import {UserContext} from '../../../../contexts/UserContext';
import apiHooks from '../../../../api';
import ConfirmDialog from '../../modals/ConfirmDialog';
import {useTranslation} from 'react-i18next';

/**
 * Props interface represents the properties of the TopicGroupAndTopicsSelector component.
 * It includes a function to set the topics form data.
 */
interface Props {
	setTopicsFormData: (data: any) => void;
	isCustomGroup: boolean;
	setIsCustomGroup: (isCustom: boolean) => void;
}
/**
 * TopicGroup interface represents the structure of a topic group.
 * It includes properties for the topics and topic group name.
 */
interface TopicGroup {
	topics: string;
	// define the properties of TopicGroup here
	topicgroupname: string;
	// other properties...
}
/**
 * TopicGroupAndTopicsSelector component.
 * This component is used for selecting topic groups and topics.
 *
 * @component
 * @param {Props} props - The component props.
 * @param {React.Dispatch<React.SetStateAction<unknown>>} props.setTopicsFormData - The function to set the topics form data.
 */
const TopicGroupAndTopicsSelector: React.FC<Props> = ({
	setTopicsFormData,
	isCustomGroup,
	setIsCustomGroup,
}) => {
	const {t} = useTranslation();
	const {user} = useContext(UserContext);
	const [topicData, setTopicData] = useState<TopicGroup[]>([]);
	const [courseTopicGroup, setCourseTopicGroup] = useState('');
	const [selectedGroupTopics, setSelectedGroupTopics] = useState<string[]>([]);
	const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
	const [customTopics, setCustomTopics] = useState<string[]>(['']);
	const [customTopicGroup, setCustomTopicGroup] = useState('');
	const [customTopic, setCustomTopic] = useState('');
	const [courseTopics, setCourseTopics] = useState<string[]>([]);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [loading, setLoading] = useState(true);
	const [topicGroupExists, setTopicGroupExists] = useState(false);
	/**
	 * Handles the change of a topic.
	 *
	 * @param {string} topic - The topic that changed.
	 * @param {boolean} isChecked - Whether the topic is checked.
	 */
	const handleTopicChange = (topic: string, isChecked: boolean) => {
		let updatedTopics;
		if (isChecked) {
			updatedTopics = [...courseTopics, topic];
		} else {
			updatedTopics = courseTopics.filter(t => t !== topic);
		}
		setCourseTopics(updatedTopics);

		let topicGroup = '';
		let topics = '';
		if (isCustomGroup) {
			topicGroup = customTopicGroup;
			topics = JSON.stringify(customTopics);
		} else {
			topicGroup = courseTopicGroup;
			topics = JSON.stringify(updatedTopics);
		}

		interface FormData {
			topicgroup: string;
			topics: string;
			//include other properties of form data here
		}

		setTopicsFormData((prevFormData: FormData) => ({
			...prevFormData,
			topicgroup: topicGroup,
			topics: topics,
		}));
	};

	useEffect(() => {
		const token: string | null = localStorage.getItem('userToken');
		if (!token) {
			throw new Error('No token available');
		}
		if (user && customTopicGroup) {
			// Introduce a delay of 0.5 seconds before making the API call
			const timeoutId = setTimeout(() => {
				apiHooks
					.checkIfTopicGroupWithEmailExists(token, user.email, customTopicGroup)
					.then(data => {
						setTopicGroupExists(data);
						if (data) {
							toast.error('Topic group with this name already exists.');
						}
					})
					.catch(error => {
						console.error(error);
						toast.error('Error checking topic group existence');
					});
			}, 500);

			// Clear the timeout when the component unmounts or when user or customTopicGroup changes
			return () => clearTimeout(timeoutId);
		}
		return;
	}, [user, customTopicGroup]);
	/**
	 * Handles the change of a custom topic.
	 *
	 * @param {number} index - The index of the custom topic that changed.
	 * @param {string} value - The new value of the custom topic.
	 */
	const handleCustomTopicChange = (index: number, value: string) => {
		const newTopics = [...customTopics];
		newTopics[index] = value;
		setCustomTopics(newTopics);
	};
	useEffect(() => {
		const token: string | null = localStorage.getItem('userToken');
		if (!token) {
			throw new Error('No token available');
		}
		if (user) {
			apiHooks
				.getAllTopicGroupsAndTopicsInsideThemByUserid(user.email, token)
				.then(data => {
					setTopicData(data);
					if (data.length > 0) {
						setCourseTopicGroup(data[data.length - 1].topicgroupname);
					} else {
						setIsCustomGroup(true);
					}
					setLoading(false);
				});
		}
	}, [user, isCustomGroup]);
	/**
	 * Handles the apply action.
	 * This function is called when the user clicks the apply button.
	 */
	const handleApply = () => {
		event?.preventDefault();
		const topics = customTopics;
		const topicGroup = customTopicGroup;
		const token: string | null = localStorage.getItem('userToken');
		if (!token) {
			throw new Error('No token available');
		}
		if (user) {
			// Check if any of the custom topics are empty
			const emptyTopic = topics.find(topic => topic.trim() === '');
			if (emptyTopic !== undefined) {
				toast.error('Please fill all empty custom topics before applying.');
				return;
			}
			apiHooks
				.updateOwnedTopicgroupandtheirtopics(topicGroup, topics, user.email, token)
				.then(response => {
					if (response.state === 'success') {
						toast.success('Topic group saved successfully for ' + response.email);
						setIsCustomGroup(false);
						setCustomTopics(['']);
						setCustomTopicGroup('');
					}
				})
				.catch(error => {
					error.message
						? toast.error(error.message)
						: toast.error('Error updating topic group');
					console.error(error);
				});
		}
	};

	useEffect(() => {
		const selectedGroup = topicData.find(
			(group: TopicGroup) => group.topicgroupname === courseTopicGroup,
		);
		const selectedTopics = selectedGroup ? selectedGroup.topics.split(',') : [];
		setSelectedGroup(selectedGroup ? selectedGroup.topicgroupname : null);
		setSelectedGroupTopics(selectedTopics);
		setCourseTopics(selectedTopics);
		let topicGroup = '';
		let topics = '';
		if (isCustomGroup) {
			topicGroup = customTopicGroup;
			topics = JSON.stringify(customTopics);
		} else {
			topicGroup = courseTopicGroup;
			topics = JSON.stringify(selectedTopics);
		}

		interface FormData {
			topicgroup: string;
			topics: string;
			// other properties...
		}

		setTopicsFormData((prevFormData: FormData) => ({
			...prevFormData,
			topicgroup: topicGroup,
			topics: topics,
		}));
	}, [
		courseTopicGroup,
		isCustomGroup,
		customTopicGroup,
		customTopics,
		topicData,
	]);
	if (loading) {
		return <CircularProgress />;
	}
	/**
	 * Handles the deletion of a group.
	 * This function is called when the user clicks the delete button.
	 */
	const handleDeleteGroup = async () => {
		if (user) {
			try {
				const token: string | null = localStorage.getItem('userToken');
				if (!token) {
					throw new Error('No token available');
				}
				await apiHooks.deleteTopicGroupAndTopicsByUserid(selectedGroup, token);

				toast.success('Topic group deleted successfully');
				setIsCustomGroup(true);
				setCustomTopics(['']);
				setCustomTopicGroup('');
				setConfirmOpen(false);
			} catch (error) {
				if (error instanceof Error) {
					error.message
						? toast.error(error.message)
						: toast.error('Error deleting topic group');
				}
			}
		}
	};

	return (
		<fieldset>
			<div className="flex justify-between items-center">
				<h2 className="text-xl mb-3">{t('teacher.topicsGroup.title')}</h2>

				{topicData.length > 0 && (
					<>
						{!isCustomGroup && (
							<button
								type="button"
								onClick={() => setConfirmOpen(true)}
								className="mb-3 w-fit text-sm p-2 bg-red-500 transition text-white rounded-3xl hover:bg-red-700"
							>
								{t('teacher.topicsGroup.buttons.deleteGroup')}
							</button>
						)}
						<ConfirmDialog
							title={t('teacher.topicsGroup.dialog.title')}
							open={confirmOpen}
							setOpen={setConfirmOpen}
							onConfirm={() => {
								handleDeleteGroup();
							}}
						>
							{t('teacher.topicsGroup.dialog.message')}: {courseTopicGroup}?
						</ConfirmDialog>
						<button
							type="button"
							onClick={() => setIsCustomGroup(!isCustomGroup)}
							className="mb-3 w-fit text-sm p-2 bg-metropoliaMainOrange transition text-white rounded-3xl hover:bg-metropoliaSecondaryOrange mr-2"
						>
							{isCustomGroup
								? t('teacher.topicsGroup.buttons.selectExisting')
								: t('teacher.topicsGroup.buttons.createCustom')}
						</button>
					</>
				)}
			</div>

			{isCustomGroup ? (
				<>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-dashed border-2 bg-gray-200 p-3 border-metropoliaMainOrange">
						<div>
							<label htmlFor="customTopicGroup" className="block font-semibold mb-1">
								{t('teacher.topicsGroup.labels.customTopicGroup')}
							</label>
							<input
								required
								id="customTopicGroup"
								type="text"
								placeholder={t('teacher.topicsGroup.placeholders.customTopicGroup')}
								value={customTopicGroup}
								onChange={e => setCustomTopicGroup(e.target.value)}
								className="w-full mb-3 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-metropoliaMainOrange"
								title={t('teacher.topicsGroup.tooltips.customGroup')}
							/>
							{topicGroupExists && (
								<p className="text-red-500">{t('teacher.topicsGroup.errors.groupExists')}</p>
							)}
							<button
								className="mb-3 w-fit p-2 bg-metropoliaMainOrange transition text-white text-sm rounded-3xl hover:bg-metropoliaSecondaryOrange"
								onClick={handleApply}
								disabled={topicGroupExists}
							>
								{t('teacher.topicsGroup.buttons.apply')}
							</button>
						</div>
						<div>
							<label htmlFor="customTopics" className="block font-semibold mb-1">
								{t('teacher.topicsGroup.labels.customTopics')}
							</label>
							<div className="flex flex-col gap-4 w-full">
								{customTopics.map((topic, index) => (
									<div key={index} className="flex items-center">
										<input
											required
											id={`customTopics-${index}`}
											type="text"
											placeholder={t('teacher.topicsGroup.placeholders.customTopic')}
											value={topic}
											onChange={e => handleCustomTopicChange(index, e.target.value)}
											className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-metropoliaMainOrange mr-2"
											title={t('teacher.topicsGroup.tooltips.customTopic')}
										/>
										{customTopics.length > 1 && (
											<button
												type="button"
												onClick={() => {
													setCustomTopics(prevTopics =>
														prevTopics.filter((_, i) => i !== index),
													);
												}}
												className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
												title={t('teacher.topicsGroup.tooltips.removeCustomTopic')}
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 20 20"
													fill="currentColor"
													className="w-4 h-4"
												>
													<path
														fillRule="evenodd"
														d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L10 8.586l-2.293-2.293a1 1 0 00-1.414 1.414L8.586 10l-2.293 2.293a1 1 0 001.414 1.414L10 11.414l2.293 2.293a1 1 0 001.414-1.414L11.414 10l2.293-2.293z"
														clipRule="evenodd"
													/>
												</svg>
											</button>
										)}
									</div>
								))}
								<button
									type="button"
									onClick={() => {
										setCustomTopics(prevTopics => [...prevTopics, customTopic]);
										setCustomTopic('');
									}}
									className="mb-3 w-fit p-2 bg-metropoliaMainOrange transition text-white text-sm rounded-3xl hover:bg-metropoliaSecondaryOrange"
								>
									{t('teacher.topicsGroup.buttons.addNewTopic')}
								</button>
							</div>
						</div>
					</div>
				</>
			) : (
				// Form fields for selecting an existing group
				<>
					<select
						title={t('teacher.topicsGroup.tooltips.selectCourseGroup')}
						value={courseTopicGroup}
						onChange={e => setCourseTopicGroup(e.target.value)}
						className="w-full mb-3 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-metropoliaMainOrange"
					>
						{topicData.map((group, index) => (
							<option key={index} value={group.topicgroupname}>
								{group.topicgroupname}
							</option>
						))}
					</select>
					<div className="border border-gray-200 ">
						<List>
							{selectedGroupTopics.map((topic, index) => (
								<ListItem key={index}>
									<FormControlLabel
										control={
											<Checkbox
												checked={courseTopics.includes(topic)}
												onChange={e => handleTopicChange(topic, e.target.checked)}
											/>
										}
										label={topic}
									/>
								</ListItem>
							))}
						</List>
					</div>
				</>
			)}
		</fieldset>
	);
};

export default TopicGroupAndTopicsSelector;
