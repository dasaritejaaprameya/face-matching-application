import React, { useState } from 'react';
import * as faceapi from 'face-api.js';

const FaceUpload = ({ onDescriptors }) => {
  const [images, setImages] = useState([]);
  const [descriptors, setDescriptors] = useState([]);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setImages([...images, imageUrl]);

    const image = await faceapi.fetchImage(imageUrl);
    const detection = await faceapi
      .detectSingleFace(image)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detection) {
      const newDescriptors = [...descriptors, { descriptor: detection.descriptor, imageUrl }];
      setDescriptors(newDescriptors);
      onDescriptors(newDescriptors);
    }
  };

  return (
    <div>
      <h3>Upload Reference Images</h3>
      <input type="file" onChange={handleImageUpload} />
      <div className="image-grid">
        {images.map((img, index) => (
          <img key={index} src={img} alt="Uploaded Face" className="thumbnail" />
        ))}
      </div>
    </div>
  );
};

export default FaceUpload;
