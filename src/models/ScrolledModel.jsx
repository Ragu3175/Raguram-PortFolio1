import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';

const ScrolledModel = forwardRef((props, ref) => {
  const group = useRef();
  const { scene, animations } = useGLTF('/models/scrolling animation.glb');
  const { actions, names } = useAnimations(animations, group);

  // Expose scrub function to parent via ref
  useImperativeHandle(ref, () => ({
    actions,
    names,
    scrub: (progress) => {
      if (names.length > 0) {
        const action = actions[names[0]];
        if (action) {
          action.paused = true;
          action.play();
          action.time = progress * action.getClip().duration;
        }
      }
    }
  }));

  useEffect(() => {
    if (names.length > 0) {
      actions[names[0]].play().paused = true;
    }
  }, [names, actions]);

  return (
    <group ref={group} {...props} dispose={null}>
      <primitive object={scene} scale={1} position={[0, -2, 0]} />
    </group>
  );
});

export default ScrolledModel;

useGLTF.preload('/models/scrolling animation.glb');
