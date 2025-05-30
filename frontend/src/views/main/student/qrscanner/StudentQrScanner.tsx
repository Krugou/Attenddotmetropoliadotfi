import {
  Scanner,
  IDetectedBarcode,
  IScannerComponents,
} from '@yudiel/react-qr-scanner';
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {useNavigate} from 'react-router-dom';
import {toast} from 'react-toastify';
import io, {Socket} from 'socket.io-client';
import {UserContext} from '../../../../contexts/UserContext.tsx';
import {useTranslation} from 'react-i18next';
/**
 * StudentQrScanner component.
 *
 * This component is responsible for scanning QR codes for students. It performs the following operations:
 *
 * 1. Sets up a QR scanner.
 * 2. Decodes the scanned QR code and splits it into a secure hash and a lecture ID.
 * 3. Validates the decoded QR code.
 * 4. Sets up a WebSocket connection.
 * 5. Sends a message to the server indicating that the student has arrived at the lecture.
 * 6. Handles server responses, including successful scan and too slow scan.
 * 7. Navigates to the main view after a successful scan.
 *
 * @returns A JSX element representing the QR scanner component.
 */
const StudentQrScanner: React.FC = () => {
  const {t} = useTranslation(['student']);
  const navigate = useNavigate();
  const {user} = useContext(UserContext);
  const [scanned, setScanned] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(false);
  const [successState, setSuccessState] = useState(false);
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  const decodedTextCheck = useRef('');

  const onNewScanResult = useCallback((detectedCodes: IDetectedBarcode[]) => {
    if (!detectedCodes.length || !detectedCodes[0].rawValue) {
      return;
    }

    const decodedText = detectedCodes[0].rawValue;
    setLoading(true);

    if (decodedText === decodedTextCheck.current) {
      setLoading(false);
      return;
    }
    const [baseUrl, secureHash, lectureid] = decodedText.split('#');
    if (!secureHash || !lectureid || !baseUrl) {
      toast.error(t('student:toasts.errors.invalidQr'));
      setLoading(false);
      return;
    }
    if (!socket) {
      const socketURL =
        import.meta.env.MODE === 'development' ? 'http://localhost:3002' : '/';
      const socketPath =
        import.meta.env.MODE === 'development' ? '' : '/api/socket.io';
      const token: string | null = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No token available');
      }
      if (!user) {
        throw new Error('No user available');
      }
      const newSocket = io(socketURL, {
        path: socketPath,
        transports: ['websocket'],
        auth: {
          token: `${token}`,
          userId: `${user.userid}`,
        },
      });
      setSocket(newSocket);
      newSocket.on('connect', () => {
        console.log('Socket connected');
      });

      if (!scanned) {
        console.log('scanned');
        console.log('secureHash', secureHash);
        console.log('lectureid', lectureid);
        let studentId;
        if (user && user.studentnumber) {
          studentId = user.studentnumber;
        } else {
          toast.error(t('student:toasts.errors.noStudent'));
          navigate('/login');
          setLoading(false);
          return;
        }

        const unixtime = Date.now();
        newSocket.emit(
          'inputThatStudentHasArrivedToLecture',
          secureHash,
          studentId,
          unixtime,
          lectureid,
        );

        setScanned(true);
      }
      newSocket.on('youHaveBeenSavedIntoLecture', (lectureid) => {
        toast.success(t('student:toasts.success.savedToLecture'));
        setSuccessState(true);
        console.log('youHaveBeenSavedIntoLecture ', lectureid);
        navigate('/student/mainview');
      });
      newSocket.on('youHaveBeenSavedIntoLectureAlready', (lectureid) => {
        toast.error(t('student:toasts.success.alreadySaved'));
        setSuccessState(true);
        console.log('youHaveBeenSavedIntoLectureAlready ', lectureid);
        navigate('/student/mainview');
      });
      newSocket.on(
        'inputThatStudentHasArrivedToLectureTooSlow',
        (studentId2) => {
          toast.error(
            t('student:toasts.errors.tooSlow', {studentId: studentId2}),
          );
          setScanned(false);
        },
      );
    }
    decodedTextCheck.current = decodedText;

    setLoading(false);
  }, []);

  useEffect(() => {
    return () => {
      // Disconnect the socket when the component unmounts
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  const handleError = (error: any) => {
    console.log('error', error);
    if (!successState) {
      toast.error(t('student:toasts.errors.scanError'));
    }
  };

  // Define scanner components configuration
  const scannerComponents: IScannerComponents = {
    zoom: true, // Enable zoom controls
    finder: true, // Optional: enable finder overlay
  };

  return (
    <>
      {loading ? (
        <p>{t('student:qrScanner.loading')}</p>
      ) : (
        user &&
        user.studentnumber && (
          <Scanner
            components={scannerComponents}
            onScan={onNewScanResult}
            onError={handleError}
            scanDelay={200}
          />
        )
      )}
    </>
  );
};

export default StudentQrScanner;
