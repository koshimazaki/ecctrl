import { useAnimations, useGLTF, Stars } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { useEffect, useRef } from "react";

export const Map = ({ model, ...props }) => {
  const { scene, animations } = useGLTF(model);
  const group = useRef();
  const { actions } = useAnimations(animations, group);

  <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
 

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return () => {
      // Cleanup function
      scene.traverse((object) => {
        if (object.isMesh) {
          object.geometry.dispose();
          if (object.material.isMaterial) {
            object.material.dispose();
          } else {
            // Handle multi-materials
            for (const material of object.material) {
              material.dispose();
            }
          }
        }
      });
    };
  }, [scene]);



  useEffect(() => {
    if (actions && animations.length > 0) {
      const firstAnimationName = animations[0].name;
      if (actions[firstAnimationName] && typeof actions[firstAnimationName].play === 'function') {
        actions[firstAnimationName].play();
      }
    }
  
    return () => {
    
      if (!animations || animations.length === 0) {
        console.warn('No animations found for this model');
        return;
      } // check for undefined 
     
      if (actions) {
        Object.values(actions).forEach(action => {
          if (action && typeof action.stop === 'function') {
            action.stop();
          }
        });
      }
    };
  }, [actions, animations]);

  return (
    <group>
      <RigidBody type="fixed" colliders="trimesh">
        <primitive object={scene} {...props} ref={group} />
      </RigidBody>
    </group>
  );
};