"use client";
import { useState } from "react";

interface ImageSelectorProps {
  onImageSelect?: (base64: string) => void;
  onImageRemove?: () => void;
  initialImage?: string;
  className?: string;
}

const ImageSelector: React.FC<ImageSelectorProps> = ({
  onImageSelect,
  onImageRemove,
  initialImage = "",
  className = ""
}) => {
  const [base64Image, setBase64Image] = useState<string>(initialImage);
  const [preview, setPreview] = useState<string>(initialImage);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setBase64Image(base64String);
        setPreview(base64String);
        console.log("Base64:", base64String);
        if (onImageSelect) {
          onImageSelect(base64String);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setBase64Image("");
    setPreview("");
    if (onImageRemove) {
      onImageRemove();
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div>
        <label
          htmlFor="image-uploader"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Upload an image:
        </label>
        <input
          id="image-uploader"
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
        />
      </div>

      {preview && (
        <div className="relative inline-block">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Preview:</h3>
          <div className="relative">
            {" "}
            <img
              src={preview}
              alt="Preview"
              className="max-w-xs max-h-64 rounded-lg border border-gray-200 shadow-sm object-contain"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
              aria-label="Remove image"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageSelector;
