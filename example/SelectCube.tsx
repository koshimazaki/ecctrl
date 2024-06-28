import React, { useState } from 'react';
import { useSelect } from '@react-three/drei';

export  function SelectCube({ position, color, onClick }) {
  const [hovered, setHover] = useState(false);
  const selected = useSelect().map(sel => sel.userData.store);
  const isSelected = selected.includes(color);

  const handlePointerOver = () => setHover(true);
  const handlePointerOut = () => setHover(false);
  const handleClick = () => onClick(color);

  return (
    <mesh
      position={position}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'orange' : color} />
      {isSelected && (
        <mesh>
          <boxGeometry args={[1.1, 1.1, 1.1]} />
          <meshBasicMaterial color="white" wireframe />
        </mesh>
      )}
    </mesh>
  );
}
