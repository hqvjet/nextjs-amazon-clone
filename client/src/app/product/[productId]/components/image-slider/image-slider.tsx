import Image from "next/image";
import React, { useEffect, useState } from "react";

const ImageSlider = ({ images }: { images: string[] }) => {
  const safeImages = Array.isArray(images) ? images.filter(Boolean) : [];
  const [selected, setSelected] = useState(safeImages[0]);
  useEffect(() => {
    if (!safeImages.includes(selected)) {
      setSelected(safeImages[0]);
    }
  }, [safeImages.join(",")]);
  return (
    <div className="flex gap-5">
      <ul className="flex flex-col gap-2">
        {safeImages.map((image) => (
          <li
            className={`p-2 bg-gray-200 rounded-sm w-max cursor-pointer`}
            key={image}
            onClick={() => setSelected(image)}
          >
            <div className="relative h-10 w-16">
              <Image src={image} alt="product" fill />
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-center w-full">
        <div className="h-[500px] w-full relative">
          <Image src={selected} alt="product" fill />
        </div>
      </div>
    </div>
  );
};

export default ImageSlider;
