import {
  Scanner,
  IDetectedBarcode,
  IScannerComponents,
} from '@yudiel/react-qr-scanner';
import React, {useCallback, useEffect, useState} from 'react';
import {toast} from 'react-toastify';

/**
 * QrSelectScannerTester component.
 * A simplified version of QR scanner for testing purposes.
 * Only handles scanning and displaying QR code data without socket connections or user authentication.
 */
const QrSelectScannerTester: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [lastScanned, setLastScanned] = useState<string>('');
  const [decodedData, setDecodedData] = useState<{
    baseUrl?: string;
    secureHash?: string;
    lectureId?: string;
  }>({});
  const [initError, setInitError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  // Handle available video devices
  type Device = {
    deviceId: string;
    label: string;
  };
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  const initializeCamera = async (deviceId: string) => {
    setLoading(true);
    setInitError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {deviceId: deviceId ? {exact: deviceId} : undefined},
      });

      // Test if we can actually get video
      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack) {
        throw new Error('No video track available');
      }

      // Check if the track is actually active
      if (!videoTrack.enabled) {
        throw new Error('Video track is not enabled');
      }

      // Cleanup test stream
      stream.getTracks().forEach((track) => track.stop());

      setSelectedDevice(deviceId);
      setInitError(null);
      toast.success('Camera initialized successfully');
    } catch (error) {
      console.error('Camera initialization error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      setInitError(errorMessage);

      toast.error(
        <div>
          <h4 className='font-bold'>Camera Error</h4>
          <p>{errorMessage}</p>
          {retryCount < MAX_RETRIES && (
            <button
              className='mt-2 text-blue-500 underline'
              onClick={() => handleRetry(deviceId)}>
              Retry
            </button>
          )}
        </div>,
        {
          autoClose: false,
          position: 'top-center',
        },
      );

      if (retryCount >= MAX_RETRIES) {
        toast.error(
          'Maximum retry attempts reached. Please check your camera settings.',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (deviceId: string) => {
    setIsRetrying(true);
    setRetryCount((prev) => prev + 1);
    await initializeCamera(deviceId);
    setIsRetrying(false);
  };

  useEffect(() => {
    const detectCameras = async () => {
      try {
        // Check if we're in a secure context (HTTPS or localhost)
        if (!window.isSecureContext) {
          toast.error('Camera access requires HTTPS or localhost');
          console.error('Not in secure context - camera requires HTTPS');
          return;
        }

        // Check if mediaDevices API is available
        if (!navigator.mediaDevices?.getUserMedia) {
          toast.error('Camera API is not supported in your browser');
          return;
        }

        // Request camera permission first
        await navigator.mediaDevices.getUserMedia({video: true});

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(
          (device) => device.kind === 'videoinput',
        );

        if (videoDevices.length === 0) {
          toast.error('No cameras found on your device');
          return;
        }

        // Log devices for debugging
        console.log('Available video devices:', videoDevices);

        setDevices(videoDevices);
        setSelectedDevice(videoDevices[0].deviceId);
        toast.success(
          `Found ${videoDevices.length} camera${
            videoDevices.length > 1 ? 's' : ''
          }`,
        );
      } catch (error) {
        console.error('Camera access error:', error);
        if (error instanceof DOMException && error.name === 'NotAllowedError') {
          toast.error('Camera access was denied. Please allow camera access.');
        } else if (
          error instanceof DOMException &&
          error.name === 'NotFoundError'
        ) {
          toast.error('No camera device found.');
        } else {
          toast.error('Failed to access camera: ' + (error as Error).message);
        }
      }
    };

    detectCameras();

    // Cleanup function
    return () => {
      // Stop any active media tracks
      navigator.mediaDevices
        ?.getUserMedia({video: true})
        .then((stream) => {
          stream.getTracks().forEach((track) => track.stop());
        })
        .catch(() => {});
    };
  }, []);

  const handleDeviceChange = async (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const newDeviceId = event.target.value;
    await initializeCamera(newDeviceId);
  };

  const onNewScanResult = useCallback(
    (detectedCodes: IDetectedBarcode[]) => {
      if (!detectedCodes.length || !detectedCodes[0].rawValue) {
        toast.warning('No QR code detected, please try again');
        return;
      }
      const decodedText = detectedCodes[0].rawValue;

      // Prevent processing the same code multiple times
      if (decodedText === lastScanned) {
        return;
      }

      setLoading(true);
      setLastScanned(decodedText);

      // Parse QR code data
      const [baseUrl, secureHash, lectureId] = decodedText.split('#');

      if (!secureHash || !lectureId || !baseUrl) {
        toast.error('Invalid QR code format', {
          autoClose: 3000,
          position: 'top-center',
          hideProgressBar: false,
        });
        setDecodedData({});
      } else {
        setDecodedData({
          baseUrl,
          secureHash,
          lectureId,
        });
        toast.success(
          <div>
            <h4 className='font-bold'>QR Code Scanned!</h4>
            <p>Lecture ID: {lectureId}</p>
            <p className='text-xs truncate'>
              Hash: {secureHash.slice(0, 10)}...
            </p>
          </div>,
          {
            autoClose: 5000,
            position: 'top-center',
            hideProgressBar: false,
          },
        );
      }

      setLoading(false);
    },
    [lastScanned],
  );

  const handleError = (error: any) => {
    console.error('Scanner error:', error);
    toast.error(`Scanner error: ${error.message || 'Unknown error'}`, {
      autoClose: false,
      position: 'top-center',
      closeButton: true,
    });
  };

  // Scanner components configuration
  const scannerComponents: IScannerComponents = {
    zoom: true,
    finder: true,
  };

  return (
    <div className='container p-4 mx-auto'>
      <h1 className='mb-4 text-2xl font-heading'>QR Scanner Tester</h1>

      {/* Add security context status */}
      <div className='p-2 mb-4 text-sm bg-gray-100 rounded'>
        <p>Secure Context: {window.isSecureContext ? 'Yes ✅' : 'No ❌'}</p>
        <p>Protocol: {window.location.protocol}</p>
        <p>Environment: {import.meta.env.MODE}</p>
      </div>

      {/* Error Status */}
      {initError && (
        <div className='p-4 mb-4 text-red-700 bg-red-100 border-l-4 border-red-500'>
          <h3 className='font-bold'>Camera Error</h3>
          <p>{initError}</p>
          {retryCount < MAX_RETRIES && !isRetrying && (
            <button
              onClick={() => handleRetry(selectedDevice || '')}
              className='mt-2 text-red-600 underline hover:text-red-800'
              disabled={isRetrying}>
              {isRetrying ? 'Retrying...' : 'Retry Camera'}
            </button>
          )}
        </div>
      )}

      {/* Camera selection */}
      <div className='p-2 mb-4 border rounded'>
        <label className='block mb-2' htmlFor='cameraSelect'>
          Select Camera:
        </label>
        <select
          className='w-full p-2 border rounded'
          id='cameraSelect'
          onChange={handleDeviceChange}
          value={selectedDevice || ''}>
          {devices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Camera ${device.deviceId}`}
            </option>
          ))}
        </select>
      </div>

      {/* Scanner */}
      {loading ? (
        <div className='p-4 text-center'>Initializing camera...</div>
      ) : !initError && selectedDevice ? (
        <div className='mb-4'>
          <Scanner
            onScan={onNewScanResult}
            onError={handleError}
            components={scannerComponents}
            scanDelay={200}
            constraints={{
              deviceId: selectedDevice,
              aspectRatio: 1,
              //@ts-expect-error - Not in the types yet
              focusMode: 'continuous',
            }}
          />
        </div>
      ) : null}

      {/* Display decoded data */}
      {Object.keys(decodedData).length > 0 && (
        <div className='p-4 mt-4 border rounded'>
          <h2 className='mb-2 text-xl font-heading'>Last Scanned Data:</h2>
          <pre className='p-2 bg-gray-100 rounded'>
            {JSON.stringify(decodedData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default QrSelectScannerTester;
