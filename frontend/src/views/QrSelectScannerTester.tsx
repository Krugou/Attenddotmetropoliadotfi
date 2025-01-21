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

  // Handle available video devices
  type Device = {
    deviceId: string;
    label: string;
  };
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

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

  const handleDeviceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDevice(event.target.value);
  };

  const onNewScanResult = useCallback(
    (detectedCodes: IDetectedBarcode[]) => {
      if (!detectedCodes.length || !detectedCodes[0].rawValue) {
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
        toast.error('Invalid QR code format');
        setDecodedData({});
      } else {
        setDecodedData({
          baseUrl,
          secureHash,
          lectureId,
        });
        toast.success('QR code scanned successfully!');
      }

      setLoading(false);
    },
    [lastScanned],
  );

  const handleError = (error: any) => {
    console.error('Scanner error:', error);
    toast.error('Error scanning QR code');
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
        <div className='p-4 text-center'>Loading...</div>
      ) : (
        selectedDevice && (
          <div className='mb-4'>
            <Scanner
              onScan={onNewScanResult}
              onError={handleError}
              components={scannerComponents}
              scanDelay={200}
              constraints={{deviceId: selectedDevice}}
            />
          </div>
        )
      )}

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
