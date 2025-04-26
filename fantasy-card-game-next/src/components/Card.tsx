import React from 'react';

interface CardProps {
  name: string;
  image: string;
}

const Card: React.FC<CardProps> = ({ name, image }) => {
  return (
    <div className="border rounded p-2 bg-gray-700 text-white w-32">
      <img src={image} alt={name} className="w-full h-32 object-cover rounded" />
      <div className="mt-2 text-center font-semibold">{name}</div>
    </div>
  );
};

export default Card;
