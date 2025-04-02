import React, { useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import './styles.css';

const App = () => {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [images, setImages] = useState([]);  // For reference images
  const [descriptors, setDescriptors] = useState([]);
  const [matchResult, setMatchResult] = useState(null);
  const [compareImage, setCompareImage] = useState(null); // Store the image for "Upload Face to Compare"
  const MODEL_URL = window.location.origin + '/models';

  useEffect(() => {
    const loadModels = async () => {
      try {
        console.log("Loading models from:", MODEL_URL);
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        setModelsLoaded(true);
        console.log("✅ Models Loaded Successfully");
      } catch (error) {
        console.error("❌ Error Loading Models:", error);
        alert("Error loading models. Check console for details.");
      }
    };
    loadModels();
  }, []);

  const handleImageUpload = async (event) => {
    if (!modelsLoaded) {
      alert("❌ Models are still loading, please wait...");
      return;
    }
    
    const file = event.target.files[0];
    if (!file) return;
    console.log("Uploading image:", file.name);

    const imageUrl = URL.createObjectURL(file);
    setImages((prev) => [...prev, imageUrl]);

    const image = await faceapi.fetchImage(imageUrl);
    const detection = await faceapi
      .detectSingleFace(image)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      console.warn("⚠️ No face detected in:", file.name);
      alert("⚠️ No face detected. Try another image.");
      return;
    }

    console.log("✅ Face detected in:", file.name);
    setDescriptors((prev) => [...prev, { descriptor: detection.descriptor, imageUrl }]);
  };

  const handleCompare = async (event) => {
    if (!modelsLoaded) {
      alert("❌ Models are still loading, please wait...");
      return;
    }

    const file = event.target.files[0];
    if (!file) return;
    console.log("Comparing image:", file.name);

    const imageUrl = URL.createObjectURL(file);
    setCompareImage(imageUrl); // Store the uploaded image dynamically

    const image = await faceapi.fetchImage(imageUrl);
    const detection = await faceapi
      .detectSingleFace(image)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      console.warn("⚠️ No face detected in:", file.name);
      setMatchResult("⚠️ No face detected.");
      return;
    }

    if (descriptors.length === 0) {
      console.warn("⚠️ No reference images available.");
      setMatchResult("⚠️ No reference images available.");
      return;
    }

    const faceMatcher = new faceapi.FaceMatcher(
      descriptors.map((d) => new faceapi.LabeledFaceDescriptors(d.imageUrl, [d.descriptor])),
      0.5
    );

    const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
    console.log("Match Result:", bestMatch.toString());
    setMatchResult(bestMatch.label !== "unknown" ? "✅ Match Found!" : "❌ No match found.");
  };

  return (
    <div className="grid-container">
      <div className="grid-item">
        <h3>Upload Reference Faces</h3>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        <div className="image-grid">
          {images.map((img, index) => (
            <a key={index} href={img} target="_blank" rel="noopener noreferrer">
            <img key={index} src={img} alt="Uploaded Face" className="thumbnail" />
            </a>
          ))}
          
</div>

        </div>


      <div className="grid-item">
        <h3>Upload Face to Compare</h3>
        <input type="file" accept="image/*" onChange={handleCompare} />
        {compareImage && (
          <a href={compareImage} target="_blank" rel="noopener noreferrer">
            <img src={compareImage} alt="Comparison Image" className="thumbnail" />
          </a>
        )}
      </div>

      <div className="grid-item">
        <h3>Match Result</h3>
        {matchResult ? <p>{matchResult}</p> : <p>No comparison done yet.</p>}
      </div>
    </div>
  );
};

export default App;
