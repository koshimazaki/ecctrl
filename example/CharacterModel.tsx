import {
  useAnimations,
  useGLTF,
  Trail,
  SpriteAnimator
} from "@react-three/drei";
import { Suspense, useEffect, useRef, useMemo, useState } from "react";
import * as THREE from "three";
import { useGame } from "../src/stores/useGame";
import { BallCollider, RapierCollider, vec3 } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";

export default function CharacterModel({ modelUrl = "/models/PastelAnim.glb", ...props }) {
  const group = useRef<THREE.Group>(null);
  const rightHandColliderRef = useRef<RapierCollider>(null);
  const leftHandColliderRef = useRef<RapierCollider>(null);

  const { nodes, materials, animations } = useGLTF(modelUrl);
  const { actions, names } = useAnimations(animations, group);

  const rightHandPos = useMemo(() => new THREE.Vector3(), []);
  const bodyPos = useMemo(() => new THREE.Vector3(), []);
  const bodyRot = useMemo(() => new THREE.Quaternion(), []);

  const [punchEffectProps, setPunchEffectProp] = useState({
    visible: false,
    scale: [1, 1, 1],
    play: false,
    position: [-0.2, -1, 0.5],
    startFrame: 0,
  });

  const curAnimation = useGame((state) => state.curAnimation);
  const resetAnimation = useGame((state) => state.reset);
  const initializeAnimationSet = useGame((state) => state.initializeAnimationSet);

  const animationSet = {
    idle: "ninja_idle",
    walk: "walk",
    run: "run",
    jump: "twistflip",
    jumpIdle: "twistflip",
    jumpLand: "twistflip",
    fall: "fly",
    action1: "fly",
    action2: "fireball",
    action3: "twistflip",
    action4: "sit_idle",
  };

  useEffect(() => {
    initializeAnimationSet(animationSet);
  }, [initializeAnimationSet]);

  useFrame(() => {
    if (curAnimation === animationSet.action4 && rightHandColliderRef.current) {
      const rightHand = group.current?.getObjectByName("RightHand");
      if (rightHand) {
        rightHand.getWorldPosition(rightHandPos);
        group.current?.getWorldPosition(bodyPos);
        group.current?.getWorldQuaternion(bodyRot);
        rightHandColliderRef.current.setTranslationWrtParent(
          rightHandPos.sub(bodyPos).applyQuaternion(bodyRot.conjugate())
        );
      }
    }
  });

  useEffect(() => {
    if (!actions) return;

    const action = actions[curAnimation ? curAnimation : animationSet.jumpIdle];
    if (!action) {
      console.warn(`Animation ${curAnimation} not found`);
      return;
    }

    // Stop all current animations
    Object.values(actions).forEach(action => action.stop());

    if (
      curAnimation === animationSet.jump ||
      curAnimation === animationSet.jumpLand ||
      curAnimation === animationSet.action1 ||
      curAnimation === animationSet.action2 ||
      curAnimation === animationSet.action3 ||
      curAnimation === animationSet.action4
    ) {
      action
        .reset()
        .fadeIn(0.2)
        .setLoop(THREE.LoopOnce, undefined as unknown as number)
        .play();
      action.clampWhenFinished = true;
    } else {
      action.reset().fadeIn(0.2).play();
    }

    const handleActionFinished = () => resetAnimation();

    action._mixer.addEventListener("finished", handleActionFinished);

    return () => {
      action.fadeOut(0.2);
      action._mixer.removeEventListener("finished", handleActionFinished);
      action._mixer._listeners = [];

      if (curAnimation === animationSet.action4) {
        if (rightHandColliderRef.current) {
          rightHandColliderRef.current.setTranslationWrtParent(
            vec3({ x: 0, y: 0, z: 0 })
          );
        }
      }
    };
  }, [actions, curAnimation, resetAnimation, animationSet]);

  return (
    <Suspense fallback={null}>
      <group ref={group} {...props} dispose={null}>
        <primitive object={nodes.Scene} />
        <Trail
          width={1.5}
          color="violet"
          length={3}
          decay={2}
          attenuation={(width) => width}
        >
          <primitive object={nodes.Scene} />
        </Trail>
      </group>
      <SpriteAnimator
        visible={punchEffectProps.visible}
        scale={punchEffectProps.scale as any}
        position={punchEffectProps.position as any}
        startFrame={punchEffectProps.startFrame}
        loop={true}
        onLoopEnd={() => {
          setPunchEffectProp((prev) => ({
            ...prev,
            visible: false,
            play: false,
          }));
        }}
        play={punchEffectProps.play}
        numberOfFrames={7}
        alphaTest={0.01}
        textureImageURL={"./punchEffect.png"}
      />
    </Suspense>
  );
}

useGLTF.preload("/models/PastelAnim.glb");
useGLTF.preload("/models/NeonAnim2.glb");
useGLTF.preload("/models/OGanim.glb");

export type CharacterModelProps = JSX.IntrinsicElements["group"] & {
  modelUrl: string;
};