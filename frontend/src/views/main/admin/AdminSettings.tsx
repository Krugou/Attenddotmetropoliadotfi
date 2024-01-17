import {
	Button,
	CircularProgress,
	Container,
	Grid,
	TextField,
	Typography,
} from '@mui/material';
import {toast} from 'react-toastify';

import React, {useEffect, useState} from 'react';
import apiHooks from '../../../hooks/ApiHooks';
/**
 * AdminSettings component.
 * This component is responsible for rendering and managing server settings for an admin.
 * It fetches the server settings from the API, and allows the admin to update them.
 * If the data is loading, it renders a loading spinner.
 *
 * @returns {JSX.Element} The rendered AdminSettings component.
 */
const AdminSettings = () => {
	const [settings, setSettings] = useState(null);
	const [speedofhash, setSpeedofhash] = useState(0);
	const [leewayspeed, setLeewayspeed] = useState(0);
	const [timeouttime, setTimeouttime] = useState(0);
	const [attendancethreshold, setAttendancethreshold] = useState(0);

	useEffect(() => {
		const fetchSettings = async () => {
			const token: string | null = localStorage.getItem('userToken');
			if (!token) {
				throw new Error('No token available');
			}
			const serverSettings = await apiHooks.fetchServerSettings(token);
			setSpeedofhash(serverSettings.speedofhash);
			setLeewayspeed(serverSettings.leewayspeed);
			setTimeouttime(serverSettings.timeouttime);
			setAttendancethreshold(serverSettings.attendancethreshold);
			setSettings(serverSettings);
		};

		fetchSettings();
	}, []);

	const handleUpdate = async () => {
		try {
			const token: string | null = localStorage.getItem('userToken');
			if (!token) {
				throw new Error('No token available');
			}
			await apiHooks.updateServerSettings(
				speedofhash,
				leewayspeed,
				timeouttime,
				attendancethreshold,
				token,
			);
			toast.success('Server settings updated successfully');
		} catch (error) {
			toast.error('Failed to update server settings');
		}
	};

	if (!settings) {
		return (
			<div className="flex items-center justify-center h-screen">
				<CircularProgress />
			</div>
		);
	}

	return (
		<Container maxWidth="md" className="my-8 bg-white rounded-lg p-4 md:p-8">
			<Grid container spacing={3}>
				<Grid item xs={12}>
					<Typography variant="h4" className="mb-4">
						Server Settings
					</Typography>
					<Typography variant="body1" className="mb-4">
						Welcome to the settings section. Here, you can configure the parameters
						that govern the attendance gathering page settings and set the attendance
						requirement threshold. Adjust these settings to best suit your needs.
					</Typography>
				</Grid>
				<Grid item xs={12}>
					<Typography variant="h6" className="mb-4">
						Current Settings:
					</Typography>
					<Typography variant="body1" className="mb-4">
						Speed of Hash: {(speedofhash / 1000).toFixed(2)} seconds
					</Typography>

					<Typography variant="body1" className="mb-4">
						Hash Speed Multiplier for Network Catch-up: {leewayspeed}
					</Typography>
					<Typography variant="body1" className="mb-4">
						Leeway time:
						{Math.floor((speedofhash * leewayspeed) / 3600000) > 0 &&
							`${Math.floor((speedofhash * leewayspeed) / 3600000)} hours `}
						{Math.floor(((speedofhash * leewayspeed) % 3600000) / 60000) > 0 &&
							`${Math.floor(
								((speedofhash * leewayspeed) % 3600000) / 60000,
							)} minutes `}
						{Number((((speedofhash * leewayspeed) % 60000) / 1000).toFixed(2)) > 0 &&
							`${(((speedofhash * leewayspeed) % 60000) / 1000).toFixed(2)} seconds`}
					</Typography>
					<Typography variant="body1" className="mb-4">
						Timeout Time:
						{Math.floor(timeouttime / 3600000) > 0 &&
							`${Math.floor(timeouttime / 3600000)} hours `}
						{Math.floor((timeouttime % 3600000) / 60000) > 0 &&
							`${Math.floor((timeouttime % 3600000) / 60000)} minutes `}
						{Number(((timeouttime % 60000) / 1000).toFixed(2)) > 0 &&
							`${((timeouttime % 60000) / 1000).toFixed(2)} seconds`}
					</Typography>
					<Typography variant="body1" className="mb-4">
						Attendance Threshold: {attendancethreshold}%
					</Typography>
				</Grid>
				<Grid item xs={12} sm={6}>
					<TextField
						type="number"
						value={speedofhash}
						onChange={e => setSpeedofhash(Number(e.target.value))}
						label="Speed of Hash"
						variant="outlined"
						fullWidth
						className="mb-4"
						inputProps={{step: 100}}
						size="medium"
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<TextField
						type="number"
						value={leewayspeed}
						onChange={e => setLeewayspeed(Number(e.target.value))}
						label="Hash speed multiplier for network catch-up"
						variant="outlined"
						fullWidth
						className="mb-4"
						size="medium"
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<TextField
						type="number"
						value={timeouttime}
						onChange={e => setTimeouttime(Number(e.target.value))}
						label="Timeout Time in milliseconds"
						variant="outlined"
						fullWidth
						className="mb-4"
						inputProps={{step: 60000}}
						size="medium"
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<TextField
						type="number"
						value={attendancethreshold}
						onChange={e => setAttendancethreshold(Number(e.target.value))}
						label="Attendance Threshold %"
						variant="outlined"
						fullWidth
						className="mb-4"
						size="medium"
					/>
				</Grid>
				<Grid item xs={12}>
					<Button
						variant="contained"
						color="primary"
						onClick={handleUpdate}
						fullWidth
					>
						Update Settings
					</Button>
				</Grid>
			</Grid>
		</Container>
	);
};

export default AdminSettings;
