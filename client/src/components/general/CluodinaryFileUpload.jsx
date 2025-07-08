import React, { useState, useRef } from "react";
import { Cloudinary } from "@cloudinary/url-gen";
import { AdvancedImage } from "@cloudinary/react";
import { fill } from "@cloudinary/url-gen/actions/resize";
import { Image, Upload, X } from "lucide-react";

const CloudinaryFileUpload = ({ onImageUpload, folderPath, rollNo }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const imageInputRef = useRef(null);
  const cld = new Cloudinary({ cloud: { cloudName: "dnez6l71o" } });

  const handleFileUpload = async (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload only image files (JPG, PNG, GIF)");
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "hrms_preset");
    formData.append("cloud_name", "dnez6l71o");

    // Add folder path for organization
    const fullPath = `${folderPath}/${rollNo}`;
    formData.append("folder", fullPath);
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dnez6l71o/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Upload failed");
      }

      const data = await response.json();
      setSelectedImage(data.public_id);
      setImageUrl(data.secure_url);

      if (onImageUpload) {
        onImageUpload({
          url: data.secure_url,
          format: data.format,
          resourceType: "image",
        });
      }
    } catch (error) {
      setError(error.message);
      console.error("Error uploading file:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImageUrl(null);
    setError(null);
  };

  return (
    <div className="w-full">
      <div className="space-y-4">
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif"
          onChange={(e) => handleFileUpload(e.target.files[0])}
          className="hidden"
        />

        {!selectedImage && !isUploading && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-blue-500"
            }`}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-full">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                  Drag and drop your image here, or
                </p>
                <button
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isUploading}
                  className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  browse to choose a file
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Supported formats: JPG, PNG, GIF
              </p>
            </div>
          </div>
        )}

        {isUploading && (
          <div className="flex items-center justify-center p-4 space-x-3">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {selectedImage && imageUrl && (
          <div className="relative mt-4 bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">Preview</p>
              <button
                onClick={clearImage}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>
            <AdvancedImage
              cldImg={cld
                .image(selectedImage)
                .resize(fill().width(300).height(200))}
              className="rounded-lg shadow-sm mx-auto"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CloudinaryFileUpload;
