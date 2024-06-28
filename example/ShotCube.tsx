import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { useRef, useMemo, useState, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useGame } from "../src/stores/useGame";

export default function ShotCube({ characterRef }) {
  const { scene, camera } = useThree();
  const [cubeMesh, setCubeMesh] = useState([]);
  const position = useMemo(() => new THREE.Vector3(), []);
  const direction = useMemo(() => new THREE.Vector3(), []);
  const { scene: candyScene } = useGLTF("/models/candy1.glb");
  const curAnimation = useGame((state) => state.curAnimation);
  const animationSet = useGame((state) => state.animationSet);

  const bodyPosition = useMemo(() => new THREE.Vector3(), []);
  const headPosition = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    console.log("Scene structure:", scene);
  }, [scene]);

  const getBodyAndHeadPositions = () => {
    const body = scene.getObjectByName("GlitchCandyCreature_Body001");
    const head = scene.getObjectByName("GlitchCandyCreature_Head001");

    if (body) {
      body.getWorldPosition(bodyPosition);
    } else {
      console.log("Body not found");
    }

    if (head) {
      head.getWorldPosition(headPosition);
    } else {
      console.log("Head not found");
    }

    return { bodyPosition, headPosition };
  };

  const getShootingPosition = () => {
    if (characterRef && characterRef.current) {
      const characterPosition = new THREE.Vector3();
      const characterDirection = new THREE.Vector3();

      characterRef.current.getWorldPosition(characterPosition);
      characterRef.current.getWorldDirection(characterDirection);

      position.copy(characterPosition);
      position.y += 2; // Raise it above the character's "head"

      // Adjust based on current animation
      switch(curAnimation) {
        case 'running':
          position.add(characterDirection.multiplyScalar(1.5));
          break;
        case 'jumping':
          position.y += 1;
          break;
        case 'fireball':
          position.y -= 1;
          break;
        // Add more cases as needed
      }

      return { position: position.clone(), direction: characterDirection.clone() };
    } else {
      // Fallback to previous method if characterRef is not available
      const { bodyPosition, headPosition } = getBodyAndHeadPositions();
      
      if (bodyPosition.lengthSq() > 0 && headPosition.lengthSq() > 0) {
        position.addVectors(bodyPosition, headPosition).multiplyScalar(0.5);
        position.x += 0.3; // Offset to the right
        position.y += 2; // Spawn higher
      } else if (bodyPosition.lengthSq() > 0) {
        position.copy(bodyPosition);
        position.y += 3; // Spawn even higher from body
      } else {
        camera.getWorldPosition(position);
        position.y += 2; // Spawn higher from camera
      }

      camera.getWorldDirection(direction);
      position.add(direction.clone().multiplyScalar(1));

      return { position: position.clone(), direction: direction.clone() };
    }
  };

  const shootCube = () => {
    console.log("Shoot cube called");
    
    const { position, direction } = getShootingPosition();

    console.log("Shooting from:", position.toArray());
    console.log("Shooting in direction:", direction.toArray());

    const newMesh = {
      position: position.toArray(),
      direction: direction.toArray(),
      key: Date.now(),
    };

    setCubeMesh((prevMeshes) => {
      console.log("Adding new cube, total cubes:", prevMeshes.length + 1);
      return [...prevMeshes, newMesh];
    });
  };

  const shootTwoCubes = () => {
    console.log("Shoot two cubes called");
    shootCube();
    setTimeout(() => {
      shootCube();
    }, 2000);
  };

  useEffect(() => {
    console.log("Setting up event listeners");
    const handleKeyPress = (event) => {
      if (event.key === "r") {
        console.log("R key pressed");
        shootCube();
      } else if (event.key === "2") {
        console.log("2 key pressed");
        shootTwoCubes();
      } else if (event.key === "l") {
        const { bodyPosition, headPosition } = getBodyAndHeadPositions();
        console.log("Character position - Body:", bodyPosition.toArray());
        console.log("Character position - Head:", headPosition.toArray());
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  console.log("Rendering ShotCube, total cubes:", cubeMesh.length);

  return (
    <>
      {cubeMesh.map((item) => {
        console.log("Rendering cube at position:", item.position);
        return (
          <RigidBody
            key={item.key}
            mass={0.6}
            position={item.position}
            ref={(ref) => {
              if (ref) {
                const tempDirection = new THREE.Vector3().fromArray(item.direction);
                ref.setLinvel(
                  new THREE.Vector3(
                    tempDirection.x * 15,
                    tempDirection.y * 15 + 2,
                    tempDirection.z * 15
                  ),
                  false
                );
              }
            }}
          >
            <primitive object={candyScene.clone()} scale={[0.3, 0.3, 0.3]} />
          </RigidBody>
        );
      })}
    </>
  );
}