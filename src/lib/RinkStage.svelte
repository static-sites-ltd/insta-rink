<script lang="ts">
  import { onMount } from 'svelte';
  import * as THREE from 'three';
  import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
  import { BOARD_LENGTH, CORNER_RADIUS, CORNER_SWEEP, buildBoardPath, sampleBoardPath } from './rinkModel';

  let { interactive = false, debug = false, label = true }: { interactive?: boolean; debug?: boolean; label?: boolean } = $props();
  let canvas: HTMLCanvasElement;
  let zoomIn = $state(() => {});
  let zoomOut = $state(() => {});
  let resetView = $state(() => {});

  onMount(() => {
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xe9edef, 22, 42);

    const viewPosition = new THREE.Vector3(18, 16, 21);
    const viewTarget = new THREE.Vector3(0, 0.4, 0);
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.copy(viewPosition);
    camera.lookAt(viewTarget);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const controls = interactive ? new OrbitControls(camera, canvas) : undefined;
    if (controls) {
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.enableZoom = true;
      controls.zoomToCursor = true;
      controls.minDistance = 5;
      controls.maxDistance = 48;
      controls.maxPolarAngle = Math.PI / 2.03;
      controls.target.copy(viewTarget);
      controls.update();
    }

    const moveCamera = (factor: number) => {
      if (!controls) return;
      const offset = camera.position.clone().sub(controls.target).multiplyScalar(factor);
      camera.position.copy(controls.target).add(offset);
      controls.update();
    };
    zoomIn = () => moveCamera(0.78);
    zoomOut = () => moveCamera(1.28);
    resetView = () => {
      if (!controls) return;
      camera.position.copy(viewPosition);
      controls.target.copy(viewTarget);
      controls.update();
    };

    scene.add(new THREE.HemisphereLight(0xffffff, 0x5b6870, 2.7));
    const sun = new THREE.DirectionalLight(0xffffff, 4.2);
    sun.position.set(-5, 13, 9);
    sun.castShadow = true;
    scene.add(sun);

    const ice = new THREE.Mesh(
      new THREE.BoxGeometry(26, 0.18, 20),
      new THREE.MeshPhysicalMaterial({ color: 0xdffaff, roughness: 0.26, metalness: 0.05 })
    );
    ice.receiveShadow = true;
    scene.add(ice);

    const lineMaterial = new THREE.MeshBasicMaterial({ color: 0x21c8f6, transparent: true, opacity: 0.42 });
    for (const x of [-4.2, 4.2]) {
      const line = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.015, 19.6), lineMaterial);
      line.position.set(x, 0.105, 0);
      scene.add(line);
    }

    const centre = new THREE.Mesh(
      new THREE.RingGeometry(1.35, 1.4, 64),
      new THREE.MeshBasicMaterial({ color: 0x21c8f6, side: THREE.DoubleSide, transparent: true, opacity: 0.42 })
    );
    centre.rotation.x = -Math.PI / 2;
    centre.position.y = 0.115;
    scene.add(centre);

    const boardMaterial = new THREE.MeshPhysicalMaterial({ color: 0xf8fbfc, roughness: 0.35 });
    const capMaterial = new THREE.MeshStandardMaterial({ color: 0x2456b8, roughness: 0.55 });
    const accentMaterial = new THREE.MeshStandardMaterial({ color: 0xffce16, roughness: 0.4 });
    const connectorMaterial = new THREE.MeshStandardMaterial({ color: 0xf8fbfc, roughness: 0.5 });

    function addConnectors(group: THREE.Group, left: THREE.Vector3, right: THREE.Vector3, leftHeading = 0, rightHeading = 0) {
      const male = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.34, 20), connectorMaterial);
      male.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(Math.cos(leftHeading), 0, -Math.sin(leftHeading)));
      male.position.copy(left);
      group.add(male);

      const female = new THREE.Mesh(new THREE.TorusGeometry(0.23, 0.065, 12, 28, Math.PI * 1.5), connectorMaterial);
      female.rotation.set(0, rightHeading, Math.PI / 4);
      female.position.copy(right);
      group.add(female);
    }

    function makeStraightBoard() {
      const group = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(BOARD_LENGTH, 1.32, 0.28), boardMaterial);
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);

      const cap = new THREE.Mesh(new THREE.BoxGeometry(BOARD_LENGTH, 0.1, 0.34), capMaterial);
      cap.position.y = 0.7;
      cap.castShadow = true;
      group.add(cap);

      const kick = new THREE.Mesh(new THREE.BoxGeometry(BOARD_LENGTH, 0.16, 0.03), accentMaterial);
      kick.position.set(0, -0.57, -0.145);
      group.add(kick);
      addConnectors(group, new THREE.Vector3(-BOARD_LENGTH / 2, 0, 0), new THREE.Vector3(BOARD_LENGTH / 2, 0, 0));
      return group;
    }

    function curvedStrip(height: number, depth: number, radialOffset = 0) {
      const steps = 24;
      const vertices: number[] = [];
      const point = (angle: number, offset: number, y: number) => [
        (CORNER_RADIUS + offset) * Math.sin(angle),
        y,
        (CORNER_RADIUS + offset) * Math.cos(angle) - CORNER_RADIUS
      ];
      const quad = (a: number[], b: number[], c: number[], d: number[]) => vertices.push(...a, ...b, ...d, ...b, ...c, ...d);
      const inner = radialOffset - depth / 2;
      const outer = radialOffset + depth / 2;

      for (let index = 0; index < steps; index += 1) {
        const a = -CORNER_SWEEP / 2 + CORNER_SWEEP * index / steps;
        const b = -CORNER_SWEEP / 2 + CORNER_SWEEP * (index + 1) / steps;
        const low = -height / 2;
        const high = height / 2;
        quad(point(a, outer, low), point(b, outer, low), point(b, outer, high), point(a, outer, high));
        quad(point(b, inner, low), point(a, inner, low), point(a, inner, high), point(b, inner, high));
        quad(point(a, inner, high), point(a, outer, high), point(b, outer, high), point(b, inner, high));
        quad(point(a, outer, low), point(a, inner, low), point(b, inner, low), point(b, outer, low));
      }

      for (const angle of [-CORNER_SWEEP / 2, CORNER_SWEEP / 2]) {
        const reverse = angle > 0;
        const points = [
          point(angle, inner, -height / 2),
          point(angle, outer, -height / 2),
          point(angle, outer, height / 2),
          point(angle, inner, height / 2)
        ];
        if (reverse) points.reverse();
        quad(points[0], points[1], points[2], points[3]);
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.computeVertexNormals();
      return geometry;
    }

    function makeCurvedBoard() {
      const group = new THREE.Group();
      const body = new THREE.Mesh(curvedStrip(1.32, 0.28), boardMaterial);
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);

      const cap = new THREE.Mesh(curvedStrip(0.1, 0.34), capMaterial);
      cap.position.y = 0.7;
      cap.castShadow = true;
      group.add(cap);

      const kick = new THREE.Mesh(curvedStrip(0.16, 0.03, -0.145), accentMaterial);
      kick.position.y = -0.57;
      group.add(kick);

      const endpoint = (angle: number) => new THREE.Vector3(
        CORNER_RADIUS * Math.sin(angle),
        0,
        CORNER_RADIUS * Math.cos(angle) - CORNER_RADIUS
      );
      addConnectors(group, endpoint(-CORNER_SWEEP / 2), endpoint(CORNER_SWEEP / 2), -CORNER_SWEEP / 2, CORNER_SWEEP / 2);
      return group;
    }

    if (debug) {
      const pathPoints = sampleBoardPath().map(({ x, z }) => new THREE.Vector3(x, 0.17, z));
      const path = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pathPoints),
        new THREE.LineBasicMaterial({ color: 0x111517, transparent: true, opacity: 0.42 })
      );
      scene.add(path);
      buildBoardPath().joints.forEach(({ x, z }) => {
        const marker = new THREE.Mesh(
          new THREE.RingGeometry(0.12, 0.17, 24),
          new THREE.MeshBasicMaterial({ color: 0x111517, side: THREE.DoubleSide })
        );
        marker.rotation.x = -Math.PI / 2;
        marker.position.set(x, 0.18, z);
        scene.add(marker);
      });
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const poses = buildBoardPath().poses;
    let nextCue = 0;
    const boards = poses.map((pose, index) => {
      const intensity = index / (poses.length - 1);
      const board = pose.kind === 'straight' ? makeStraightBoard() : makeCurvedBoard();
      board.userData.startY = 8 + Math.min(index * 0.06, 1.2);
      board.position.set(pose.x, board.userData.startY, pose.z);
      board.rotation.y = pose.heading;
      board.userData.targetY = 0.76;
      board.userData.delay = nextCue;
      board.userData.duration = THREE.MathUtils.lerp(0.62, 0.34, intensity);
      board.userData.intensity = intensity;
      board.visible = false;
      nextCue += THREE.MathUtils.lerp(0.38, 0.09, Math.pow(intensity, 0.8));
      scene.add(board);
      return board;
    });
    const assemblyEnd = Math.max(...boards.map((board) => board.userData.delay + board.userData.duration));
    const cycleDuration = assemblyEnd + 3.2;

    const resize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    let frame = 0;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = reducedMotion ? cycleDuration : ((now - start) / 1000) % cycleDuration;
      boards.forEach((board) => {
        const active = reducedMotion || elapsed >= board.userData.delay;
        board.visible = active;
        if (!active) {
          board.position.y = board.userData.startY;
          return;
        }
        const progress = THREE.MathUtils.clamp((elapsed - board.userData.delay) / board.userData.duration, 0, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        const settleStrength = THREE.MathUtils.lerp(0.12, 0.24, board.userData.intensity);
        const settle = progress > 0.78 && progress < 1 ? Math.sin(progress * Math.PI * 8) * (1 - progress) * settleStrength : 0;
        board.position.y = THREE.MathUtils.lerp(board.userData.startY, board.userData.targetY, eased) + settle;
      });
      controls?.update();
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls?.dispose();
      renderer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
    };
  });
</script>

<div class:interactive class="stage-wrap">
  <canvas bind:this={canvas} aria-label="Rink boards assembling along a mathematically continuous path"></canvas>
  {#if interactive}
    <div class="view-controls" aria-label="Camera controls">
      <button type="button" onclick={zoomIn} aria-label="Zoom in">+</button>
      <button type="button" onclick={zoomOut} aria-label="Zoom out">−</button>
      <button class="reset" type="button" onclick={resetView}>Reset</button>
    </div>
  {/if}
  {#if label}
    <div class="stage-label"><span>Assembly study 04</span><span>Closed continuous rink path</span></div>
  {/if}
</div>

<style>
  .stage-wrap { position: relative; width: 100%; height: 100%; min-height: 34rem; overflow: hidden; }
  canvas { display: block; width: 100%; height: 100%; }
  .interactive canvas { cursor: grab; touch-action: none; }
  .interactive canvas:active { cursor: grabbing; }
  .view-controls { position: absolute; z-index: 3; right: 1.5rem; bottom: 1.5rem; display: flex; box-shadow: 0 0 0 1px #111517; }
  .view-controls button { min-width: 2.7rem; height: 2.7rem; padding: 0; border: 0; border-right: 1px solid #111517; color: #111517; background: rgba(245, 247, 247, 0.92); font-size: 1.2rem; cursor: pointer; }
  .view-controls button:hover { background: #b8f0ff; }
  .view-controls .reset { min-width: 4.5rem; border-right: 0; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
  .stage-label { position: absolute; right: max(1.25rem, calc((100vw - 90rem) / 2)); bottom: 1.5rem; display: flex; gap: 1.5rem; font-size: 0.62rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; pointer-events: none; }
  .stage-label span:first-child { color: #687175; }
  @media (max-width: 42rem) {
    .stage-wrap { min-height: 27rem; }
    .stage-label { right: 1rem; left: 1rem; justify-content: space-between; }
    .view-controls { right: 1rem; bottom: 1rem; }
  }
</style>
