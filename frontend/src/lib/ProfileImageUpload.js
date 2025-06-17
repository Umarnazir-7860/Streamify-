import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { useDropzone } from 'react-dropzone';
import getCroppedImg from './utils/cropImage'; // You’ll create this

const ProfileImageUpload = ({ onImageCropped }) => {
  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    const url = URL.createObjectURL(file);
    setImage(url);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleCrop = async () => {
    const croppedImage = await getCroppedImg(image, croppedAreaPixels);
    onImageCropped(croppedImage); // send to parent
    setImage(null); // close crop
  };

  return (
    <div>
      {!image ? (
        <div {...getRootProps()} className="border p-4 text-center cursor-pointer">
          <input {...getInputProps()} />
          <p>Click or drag to upload image</p>
        </div>
      ) : (
        <>
          <div className="relative w-full h-64 bg-gray-200">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <button onClick={handleCrop} className="mt-2 bg-blue-500 text-white px-4 py-2">
            Crop & Save
          </button>
        </>
      )}
    </div>
  );
};

export default ProfileImageUpload;
