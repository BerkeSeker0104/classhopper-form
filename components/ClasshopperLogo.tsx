import React from 'react';
import Image from 'next/image';

interface ClasshopperLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export const ClasshopperLogo: React.FC<ClasshopperLogoProps> = ({ 
  size = 120, 
  className = '',
  showText = false 
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Image */}
      <div className="relative">
        <Image
          src="/classhopper_logo_transparent.png"
          alt="Classhopper Logo"
          width={size}
          height={size}
          priority
          className="object-contain"
        />
      </div>
      
      {/* Text */}
      {showText && (
        <span className="text-2xl font-bold text-current">
          classhopper
        </span>
      )}
    </div>
  );
};

export default ClasshopperLogo;
