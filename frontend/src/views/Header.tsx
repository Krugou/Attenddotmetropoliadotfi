import React, {useContext, useEffect, useState} from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import logo from '../assets/images/metropolia_s_oranssi_en.png';
import ErrorAlert from '../components/main/ErrorAlert';
import NavigationButton from '../components/main/buttons/NavigationButton';
import {UserContext} from '../contexts/UserContext';
import apiHooks from '../hooks/ApiHooks';

// Define the props for the Header component
interface HeaderProps {
	title: string;
}
const Header: React.FC<HeaderProps> = () => {
	// Get the current location and navigation function from react-router
	const location = useLocation();
	const navigate = useNavigate();

	// State for storing any alert messages
	const [alert, setAlert] = useState<string | null>('');

	// Get the current user and the setUser function from the UserContext
	const {user, setUser} = useContext(UserContext);

	// Function to get the user info based on the token stored in localStorage
	const getUserInfo = async () => {
		// If the current path is '/logout', don't try to get the user info
		if (location.pathname === '/logout') return;

		// Get the user token from localStorage
		const userToken = localStorage.getItem('userToken');

		// If the user token exists, try to get the user info
		if (userToken) {
			try {
				const user = await apiHooks.getUserInfoByToken(userToken);

				// If the user info is successfully fetched, set the user
				if (user) {
					setUser(user);
					if (location.pathname === '/') {
						navigate(`/${user.role.toLowerCase()}/mainview`);
					}
					return;
				}
			} catch (error) {
				// If the user info cannot be fetched, remove the token and set the user to null
				setAlert('Your session has expired, please login again.');
				localStorage.removeItem('userToken');

				// Set the user in the UserContext to null
				setUser(null);
			}
		} else {
			if (location.pathname !== '/' && location.pathname !== '/login') {
				navigate('/login');
			}
		}
	};
	useEffect(() => {
		getUserInfo();
	}, [location]); // jos taulukko tyhjä, ajetaan vain kerran

	return (
		<header
			className={`flex items-center ${
				user ? 'sm:flex-row flex-col' : ''
			} sm:p-4 p-0 m-4 justify-between`}
		>
			{alert && <ErrorAlert onClose={() => setAlert(null)} alert={alert} />}
			<Link to={user ? `/${user.role.toLowerCase()}/mainview` : '/'}>
				<img
					src={logo}
					alt="Logo"
					className={`w-48 mb-5 sm:w-32 md:w-48 lg:w-64 h-auto mr-4 ${
						user ? '' : 'w-24'
					}`}
				/>
			</Link>
			{user && (
				<div className="flex w-full gap-10 justify-center sm:w-fit items-center m-2 p-2">
					<NavigationButton
						user={user}
						path={`/${user.role.toLowerCase()}/profile`}
						label={user.username}
					/>
					<NavigationButton user={user} path="/logout" label="Logout" />
				</div>
			)}
		</header>
	);
};

export default Header;
