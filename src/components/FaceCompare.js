import React, { useState } from 'react';
import * as faceapi from 'face-api.js';

const FaceCompare = ({ descriptors }) => {
  const [matchResult, setMatchResult] = useState(null);

  const handleCompare = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    const image = await faceapi.fetchImage(imageUrl);
    const detection = await faceapi
      .detectSingleFace(image)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      setMatchResult('No face detected.');
      return;
    }

    let bestMatch = null;
    let minDistance = 1;

    descriptors.forEach((stored) => {
      const distance = faceapi.euclideanDistance(detection.descriptor, stored.descriptor);
      if (distance < minDistance) {
        minDistance = distance;
        bestMatch = stored.imageUrl;
      }
    });

    setMatchResult(minDistance < 0.5 ? bestMatch : 'No match found.');
  };

  return (
    <div>
      <h3>Upload Image to Compare</h3>
      <input type="file" onChange={handleCompare} />
      {matchResult && (
        <div>
          <h3>Match Result:</h3>
          {matchResult !== 'No match found.' ? (
            <img src={matchResult} alt="Matched Face" className="match-image" />
          ) : (
            <p>{matchResult}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default FaceCompare;
