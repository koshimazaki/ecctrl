import React, { Suspense, useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { useProgress, KeyboardControls, Environment, PerspectiveCamera } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { useControls } from "leva";
import Ecctrl from "../src/Ecctrl";
import CharacterModel from "./CharacterModel";
import { Map } from "./Maps";
import Floor from "./Floor";
import Lights from "./Lights";
import FloatingPlatform from "./FloatingPlatform";
import DynamicPlatforms from "./DynamicPlatforms";
import { Perf } from "r3f-perf";
import ShotCube from "./ShotCube";
import { GlowingShapes } from "./GlowingShapes";
import SkyboxWithStars from "./Stars"; // Import the new SkyboxWithStars component


const characterModels = {
  Pastel: "/models/PastelAnim.glb",
  Neon: "/models/NeonAnim2.glb",
  OG: "/models/OGanim.glb",
};

const maps = {
  NFC_Lisbon: { scale: 1, position: [6, -1, -20] },
  Dubai3: { scale: 3, position: [6, -0.99, -20] },
  Dubai2: { scale: 3, position: [6, -0.99, -20] },
  castle_on_hills: { scale: 10, position: [-6, -6, -40] },
  Lisbon: { scale: 1, position: [0, -0.25, -25] },
  city_scene_tokyo: { scale: 2, position: [0, 0.2, -3.5] },
  Candyland: { scale: 1, position: [-14, -0.24, -14] },
  medieval_fantasy_book: { scale: 1, position: [-4, 2, -6] },
};

export default function Experience() {
  const { scene } = useThree();
  const cameraRef = useRef();

  const { selectedCharacter, selectedMap, showShapes } = useControls("Scene Settings", {
    selectedCharacter: {
      value: "Pastel",
      options: Object.keys(characterModels),
    },
    selectedMap: {
      value: "Candyland",
      options: Object.keys(maps),
    },
    showShapes: true,
  });

  const shapeSettings = useControls("Shape Settings", {
    spherePosition: { value: [1, 0.2, 18], step: 0.3 },
    cubePosition: { value: [-5, 1, 25], step: 0.3 },
    tetrahedronPosition: { value: [3, 0.2, 25], step: 0.6 },
  });

  const shapes = [
    {
      type: 'sphere',
      color: 'yellow',
      amount: 150,
      emissive: 'pink',
      glow: 'blue',
      size:0.5,
      rotationSpeed: 0.0001,
      position: shapeSettings.spherePosition,
      thickness: 2,
      metalness: 0.2,
      envMapIntensity: 5,
      transmission: 2,
      resolution: 256,
      samples: 16,
     
    },
    {
      type: 'cube',
      color: 'pink',
      amount: 20,
      emissive: 'blue',
      glow: 'violet',
      size: 1.5,
      rotationSpeed: 0.0004,
      position: shapeSettings.cubePosition,
      thickness: 1,
      metalness: 0.2,
      envMapIntensity: 5,
      transmission: 1.4,
      resolution: 128,
      samples: 16
    },
    {
      type: 'tetrahedron',
      color: 'lightgreen',
      amount: 50,
      emissive: 'green',
      glow: 'blue',
      size: 1,
      rotationSpeed: 0.001,
      position: shapeSettings.tetrahedronPosition,
      thickness: 1,
      metalness: 0.2,
      envMapIntensity: 5,
      transmission: 1.4,
      resolution: 128,
      samples: 16
    },
  ];

  
  const keyboardMap = [
    { name: "forward", keys: ["ArrowUp", "KeyW"] },
    { name: "backward", keys: ["ArrowDown", "KeyS"] },
    { name: "leftward", keys: ["ArrowLeft", "KeyA"] },
    { name: "rightward", keys: ["ArrowRight", "KeyD"] },
    { name: "jump", keys: ["Space"] },
    { name: "run", keys: ["Shift"] },
    { name: "action1", keys: ["1"] },
    { name: "action2", keys: ["2"] },
    { name: "action3", keys: ["3"] },
    { name: "action4", keys: ["KeyF"] },
  ];

  // add fly 

  useEffect(() => {
    console.log("Scene loaded:", scene);
    console.log("Selected character:", selectedCharacter);
    console.log("Selected map:", selectedMap);
  }, [scene, selectedCharacter, selectedMap]);

  return (
    <>
      <Perf position="bottom-left" />
      <Suspense fallback={null}>
        <Environment preset="city" />
        <Lights />
        <SkyboxWithStars />  {/* Add the SkyboxWithStars component here */}

        <Physics gravity={[0, -9.81, 0]}>
          <Map
            key={selectedMap}
            scale={maps[selectedMap].scale}
            position={maps[selectedMap].position}
            model={`models/${selectedMap}.glb`}
          />
          <KeyboardControls map={keyboardMap}>
            <Ecctrl
              animated
              followLight
              capsuleHalfHeight={0.35}
              capsuleRadius={0.3}
              floatHeight={0.3}
              characterInitDir={0}
              camInitDis={-5}
              camMaxDis={-7}
              camMinDis={-0.7}
              position={[0, 5, 0]}
              camera={cameraRef}
            >
              <CharacterModel 
                key={selectedCharacter}
                modelUrl={characterModels[selectedCharacter]} 
                scale={[0.4, 0.4, 0.4]} 
                position={[0, -0.8, 0]} 
                receiveShadow
                castShadow
              />
            </Ecctrl>
          </KeyboardControls>

          <Floor />
          <ShotCube />
          {showShapes && <GlowingShapes shapes={shapes} />}
        </Physics>
      </Suspense>
    </>
  );
}

