import React, { useState, useEffect } from 'react';
import { Canvas } from "@react-three/fiber";
import { ErrorBoundary } from 'react-error-boundary';
import { useProgress } from "@react-three/drei";
import Experience from './Experience';

function ErrorFallback({error}) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre style={{color: 'red'}}>{error.message}</pre>
    </div>
  )
}

function LoadingScreen({ progress }) {
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      color: 'white',
      fontSize: '24px'
    }}>
      Loading... {progress.toFixed(2)}%
    </div>
  );
}

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const { progress, loaded } = useProgress();

  useEffect(() => {
    if (loaded && progress === 100) {
      setIsLoaded(true);
    }
  }, [progress, loaded]);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      {!isLoaded && <LoadingScreen progress={progress} />}
      <Canvas>
        <Experience />
      </Canvas>
    </ErrorBoundary>
  );
}

export default App;