import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const AppContainer = styled.div`
  text-align: center;
`;

const VideoContainer = styled.div`
  width: 100%;
  max-width: 300px; /* 最大幅を指定 */
  height: auto; /* 高さは自動調整 */
  border: 1px solid black;
  overflow: hidden;
  position: relative;
`;

const StyledVideo = styled.video`
  width: 100%; /* 幅を親要素に対して100% */
  height: auto; /* 高さを自動調整 */
  object-fit: contain; /* 映像が要素のサイズに収まるように */
`;

const Controls = styled.div`
  margin-top: 10px;
`;

const Photo = styled.img`
  display: none;
  width: 30%;
  height: auto;
  margin-top: 10px;
`;

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const photoRef = useRef<HTMLImageElement>(null);
  const [useFrontCamera, setUseFrontCamera] = useState(true);
  const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    initCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [useFrontCamera]);

  const initCamera = async () => {
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
    }

    const constraints = {
      video: {
        facingMode: useFrontCamera ? 'user' : 'environment',
        width: { ideal: 640 },
        height: { ideal: 480 }
      }
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCurrentStream(stream);
    } catch (err) {
      console.error('Error accessing the camera', err);
    }
  };

  const capturePhoto = () => {
    if (!canvasRef.current || !videoRef.current || !photoRef.current) return;
    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    photoRef.current.src = canvasRef.current.toDataURL('image/png');
    photoRef.current.style.display = 'block';
  };

  return (
    <AppContainer>
      <h1>カメラ撮影アプリ</h1>
      <VideoContainer>
        <StyledVideo ref={videoRef} autoPlay playsInline></StyledVideo>
      </VideoContainer>
      <Controls>
        <button onClick={() => setUseFrontCamera(prev => !prev)}>カメラ切り替え</button>
        <button onClick={capturePhoto}>撮影</button>
        <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
        <Photo ref={photoRef} alt="撮影した写真" />
      </Controls>
    </AppContainer>
  );
};

export default App;
