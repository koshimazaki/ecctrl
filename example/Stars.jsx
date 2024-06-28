import React from 'react';
import { Stars } from '@react-three/drei';

const SkyboxWithStars = () => {
  return (
    <Stars
      radius={100}   // Radius of the inner sphere
      depth={50}     // Depth of area where stars should fit
      count={5000}   // Number of stars
      factor={4}     // Size factor
      saturation={0} // Saturation 0-1
      fade           // Faded dots
      speed={1}      // Animation speed
    />
  );
};

export default SkyboxWithStars;
