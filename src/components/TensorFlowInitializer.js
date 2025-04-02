import React, { useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';

const TensorFlowInitializer = ({ children }) => {
  const [backendInitialized, setBackendInitialized] = useState(false);

  useEffect(() => {
    const initializeTensorFlow = async () => {
      try {
        await tf.setBackend('webgl');
        setBackendInitialized(true);
        console.log('TensorFlow Backend Initialized');
      } catch (error) {
        console.error('Error initializing TensorFlow backend:', error);
      }
    };

    initializeTensorFlow();
  }, []);

  if (!backendInitialized) {
    return <div>Loading...</div>;
  }

  return children; // Render child components once backend is initialized
};

export default TensorFlowInitializer;
