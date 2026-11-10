import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { JourneyPoint } from "./journeyPath";

const EMPTY_POINTS: JourneyPoint[] = [];
const EMPTY_DAYS: number[] = [];

type Props = {
  kind: string;
  className?: string;
  points?: JourneyPoint[];
  currentDay?: number;
  completedDays?: number[];
};

const realmColors: Record<string, number> = {
  fitness: 0x66d8ff,
  study: 0xbba3ff,
  career: 0xffc26e,
  nutrition: 0x84e2a0,
  hydration: 0x63d9ff,
  sleep: 0xa8a1ff,
  self_control: 0xf2a0bc,
  digital: 0x9de783,
  home: 0xb6a0ff,
  challenges: 0x73dfff,
  quests: 0x8dafff,
  government: 0xffc26e,
  profile: 0xb9a4ff,
  progress: 0xf2c878,
  inventory: 0x8be0ad,
};

function makeMaterial(color: number, metalness = 0.42) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness,
    roughness: 0.38,
    emissive: color,
    emissiveIntensity: 0.12,
  });
}

function addCapsule(
  parent: THREE.Group,
  material: THREE.Material,
  radius: number,
  length: number,
  position: [number, number, number],
) {
  const mesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(radius, length, 3, 6),
    material,
  );
  mesh.position.set(...position);
  parent.add(mesh);
  return mesh;
}

function makeClimber() {
  const root = new THREE.Group();
  const armor = makeMaterial(0x25375d, 0.72);
  const dark = makeMaterial(0x111827, 0.45);
  const trim = makeMaterial(0x77dfff, 0.78);
  const skin = makeMaterial(0xd6b7a1, 0.12);

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.42, 4, 8), armor);
  torso.position.y = 0.08;
  root.add(torso);
  const chest = new THREE.Mesh(new THREE.BoxGeometry(0.33, 0.2, 0.075), trim);
  chest.position.set(0, 0.14, 0.17);
  root.add(chest);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), skin);
  head.position.set(0.015, 0.49, 0.025);
  root.add(head);
  const hair = new THREE.Mesh(new THREE.IcosahedronGeometry(0.17, 1), dark);
  hair.scale.set(1.05, 0.75, 1);
  hair.position.set(-0.015, 0.58, -0.015);
  root.add(hair);

  const capeShape = new THREE.Shape();
  capeShape.moveTo(-0.15, 0.3);
  capeShape.lineTo(0.16, 0.3);
  capeShape.lineTo(0.31, -0.42);
  capeShape.lineTo(-0.28, -0.36);
  capeShape.closePath();
  const cape = new THREE.Mesh(
    new THREE.ShapeGeometry(capeShape),
    new THREE.MeshStandardMaterial({
      color: 0x392c65,
      side: THREE.DoubleSide,
      metalness: 0.35,
      roughness: 0.48,
      emissive: 0x191235,
    }),
  );
  cape.position.set(-0.05, -0.1, -0.16);
  root.add(cape);

  const limbs: THREE.Group[] = [];
  for (const side of [-1, 1]) {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.23, 0.24, 0);
    addCapsule(shoulder, armor, 0.065, 0.27, [side * 0.035, -0.12, 0]);
    const pauldron = new THREE.Mesh(new THREE.SphereGeometry(0.105, 7, 6), trim);
    pauldron.scale.set(1.2, 0.76, 0.85);
    pauldron.position.set(side * 0.03, -0.015, 0.015);
    shoulder.add(pauldron);
    root.add(shoulder);
    limbs.push(shoulder);

    const hip = new THREE.Group();
    hip.position.set(side * 0.105, -0.22, 0);
    addCapsule(hip, dark, 0.082, 0.29, [0, -0.14, 0]);
    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.11, 0.24), armor);
    boot.position.set(0, -0.34, 0.04);
    hip.add(boot);
    root.add(hip);
    limbs.push(hip);
  }

  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.34, 0.18), dark);
  pack.position.set(0, 0.13, -0.21);
  root.add(pack);
  const belt = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.055, 0.24), trim);
  belt.position.y = -0.13;
  root.add(belt);
  return { root, limbs };
}

function addRealmObject(scene: THREE.Scene, group: THREE.Group, kind: string) {
  const accent = makeMaterial(realmColors[kind] ?? 0xb09aff, 0.62);
  const dark = makeMaterial(0x202b45, 0.4);
  const cream = makeMaterial(0xd8d1c1, 0.24);
  const addBox = (size: [number, number, number], material: THREE.Material, y: number) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
    mesh.position.y = y;
    group.add(mesh);
    return mesh;
  };

  if (kind === "ambient") {
    const stone = new THREE.MeshStandardMaterial({ color: 0x31384f, metalness: 0.65, roughness: 0.42, transparent: true, opacity: 0.52, emissive: 0x121a33, emissiveIntensity: 0.38 });
    const crystalMat = new THREE.MeshStandardMaterial({ color: 0x8a78e8, metalness: 0.75, roughness: 0.24, transparent: true, opacity: 0.62, emissive: 0x4034a0, emissiveIntensity: 0.72 });
    for (const side of [-1, 1]) {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.56, 10, 5), stone);
      pillar.position.set(side * 5.1, 0.05, -1.6);
      pillar.rotation.z = side * -0.035;
      group.add(pillar);
      const capital = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.42, 1.1), dark);
      capital.position.set(side * 5.1, 4.95, -1.35);
      group.add(capital);
      const foot = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.45, 1.2), stone);
      foot.position.set(side * 5.1, -4.8, -1.35);
      group.add(foot);
      for (let index = 0; index < 3; index++) {
        const shard = new THREE.Mesh(new THREE.OctahedronGeometry(0.32 + index * 0.08, 0), crystalMat);
        shard.position.set(side * (3.7 + index * 0.55), -3.1 + index * 2.7, -0.7);
        shard.rotation.set(0.4 * index, side * 0.3, 0.2);
        group.add(shard);
      }
    }
    for (let index = 0; index < 5; index++) {
      const slab = new THREE.Mesh(new THREE.BoxGeometry(1.65 - index * 0.12, 0.12, 0.82), index === 2 ? accent : stone);
      slab.position.set((index - 2) * 0.9, -4.45 + index * 0.38, -0.9 + index * 0.08);
      slab.rotation.z = index % 2 ? 0.05 : -0.05;
      group.add(slab);
    }
    return;
  }

  if (kind === "home") {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.055, 8, 28), accent);
    ring.rotation.x = 0.45;
    group.add(ring);
    const inner = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.025, 6, 24), cream);
    inner.rotation.y = 0.75;
    inner.rotation.x = -0.35;
    group.add(inner);
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 1), dark);
    group.add(core);
    const sparkle = new THREE.Mesh(new THREE.OctahedronGeometry(0.08, 0), cream);
    sparkle.position.set(0.52, 0.42, 0.08);
    group.add(sparkle);
    return;
  }

  if (kind === "profile") {
    const bust = new THREE.Mesh(new THREE.SphereGeometry(0.31, 14, 12), accent);
    bust.position.y = 0.14;
    group.add(bust);
    const face = new THREE.Mesh(new THREE.SphereGeometry(0.19, 12, 10), cream);
    face.position.set(0, 0.25, 0.24);
    group.add(face);
    const shoulders = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.24, 3, 8), dark);
    shoulders.scale.z = 0.68;
    shoulders.position.y = -0.25;
    group.add(shoulders);
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.035, 7, 32), accent);
    halo.rotation.x = 0.72;
    halo.rotation.y = 0.18;
    halo.position.y = 0.12;
    group.add(halo);
    return;
  }

  if (kind === "quests") {
    const pages = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.16, 0.6), cream);
    pages.position.y = -0.1;
    pages.rotation.z = -0.05;
    group.add(pages);
    const cover = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.12, 0.64), accent);
    cover.position.set(0, -0.22, -0.02);
    cover.rotation.z = -0.05;
    group.add(cover);
    const rune = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 1), cream);
    rune.position.set(0.1, 0.2, 0.08);
    group.add(rune);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.025, 6, 28), accent);
    ring.rotation.x = 0.9;
    ring.rotation.y = 0.4;
    ring.position.y = 0.02;
    group.add(ring);
    return;
  }

  if (kind === "challenges") {
    const portal = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.07, 9, 28), accent);
    portal.rotation.x = 0.32;
    portal.position.y = 0.18;
    group.add(portal);
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.21, 1), cream);
    core.position.y = 0.18;
    group.add(core);
    [-0.48, 0, 0.48].forEach((x, index) => {
      const tile = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.1, 0.42), index === 1 ? accent : dark);
      tile.position.set(x, -0.42 + Math.abs(x) * 0.26, 0.04);
      tile.rotation.z = index === 0 ? -0.08 : index === 2 ? 0.08 : 0;
      group.add(tile);
    });
    return;
  }

  if (kind === "progress") {
    [-0.38, 0, 0.38].forEach((x, index) => {
      const height = 0.38 + index * 0.2;
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.2, height, 0.22), index === 2 ? accent : dark);
      bar.position.set(x, -0.25 + height / 2, 0);
      group.add(bar);
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 6), cream);
      cap.position.set(x, -0.25 + height + 0.06, 0.02);
      group.add(cap);
    });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.74, 0.12, 24), dark);
    base.position.y = -0.33;
    group.add(base);
    return;
  }

  if (kind === "inventory") {
    addBox([0.82, 0.52, 0.55], dark, -0.1);
    const lid = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.22, 0.62), accent);
    lid.position.set(0, 0.23, 0);
    lid.rotation.x = -0.18;
    group.add(lid);
    const lock = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.035, 7, 14, Math.PI), cream);
    lock.position.set(0, 0.04, 0.3);
    lock.rotation.x = Math.PI;
    group.add(lock);
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), accent);
    gem.position.set(0, 0.17, 0.2);
    group.add(gem);
    return;
  }

  if (kind === "fitness") {
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.25, 10), accent);
    bar.rotation.z = Math.PI / 2;
    group.add(bar);
    for (const x of [-0.52, 0.52]) {
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.19, 12), dark);
      plate.rotation.z = Math.PI / 2;
      plate.position.x = x;
      group.add(plate);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.025, 5, 14), accent);
      ring.position.x = x + (x < 0 ? -0.11 : 0.11);
      ring.rotation.y = Math.PI / 2;
      group.add(ring);
    }
    return;
  }

  if (kind === "study") {
    const bookA = addBox([0.94, 0.17, 0.62], accent, -0.24);
    bookA.rotation.z = -0.08;
    const bookB = addBox([0.82, 0.18, 0.56], cream, -0.05);
    bookB.rotation.z = 0.07;
    const bookC = addBox([0.72, 0.16, 0.5], dark, 0.13);
    bookC.rotation.z = -0.04;
    [bookA, bookB, bookC].forEach((book) => {
      const line = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.11, 0.45), accent);
      line.position.set(-0.29, 0, 0.02);
      book.add(line);
    });
    return;
  }

  if (kind === "career" || kind === "government") {
    addBox([0.95, 0.62, 0.35], dark, -0.03);
    const flap = addBox([0.98, 0.22, 0.39], accent, 0.31);
    flap.rotation.x = -0.08;
    const clasp = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.07), cream);
    clasp.position.set(0, 0.17, 0.23);
    group.add(clasp);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.035, 7, 16, Math.PI), accent);
    handle.position.set(0, 0.39, -0.02);
    group.add(handle);
    return;
  }

  if (kind === "nutrition") {
    const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.47, 14, 10, 0, Math.PI * 2, 0.5, 1.15), accent);
    bowl.scale.set(1.2, 0.7, 0.8);
    bowl.position.y = -0.12;
    group.add(bowl);
    for (const [x, y, z, color] of [
      [-0.19, 0.16, 0.04, 0xe88e62],
      [0.12, 0.19, 0.08, 0x81c977],
      [0.28, 0.12, -0.02, 0xf1ce6e],
      [-0.03, 0.25, -0.1, 0x9e79d2],
    ] as number[][]) {
      const fruit = new THREE.Mesh(new THREE.IcosahedronGeometry(0.14, 1), makeMaterial(color, 0.2));
      fruit.position.set(x, y, z);
      group.add(fruit);
    }
    return;
  }

  if (kind === "hydration") {
    const drop = new THREE.Mesh(new THREE.SphereGeometry(0.37, 14, 12), accent);
    drop.scale.set(0.75, 1.15, 0.65);
    drop.position.y = -0.02;
    group.add(drop);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.35, 12), accent);
    tip.position.y = 0.4;
    group.add(tip);
    const shine = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), cream);
    shine.position.set(-0.12, 0.07, 0.22);
    group.add(shine);
    return;
  }

  if (kind === "sleep") {
    const moon = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.14, 8, 24, Math.PI * 1.55), accent);
    moon.rotation.z = -0.65;
    moon.position.set(-0.04, 0.02, 0);
    group.add(moon);
    for (const [x, y, scale] of [[0.5, 0.36, 0.07], [-0.48, 0.3, 0.05], [0.42, -0.33, 0.045]]) {
      const star = new THREE.Mesh(new THREE.IcosahedronGeometry(scale, 1), cream);
      star.position.set(x, y, 0.05);
      group.add(star);
    }
    return;
  }

  const shield = new THREE.Shape();
  shield.moveTo(-0.42, 0.45);
  shield.lineTo(0.42, 0.45);
  shield.lineTo(0.36, -0.16);
  shield.lineTo(0, -0.53);
  shield.lineTo(-0.36, -0.16);
  shield.closePath();
  const shieldMesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shield, { depth: 0.16, bevelEnabled: true, bevelSegments: 2, bevelSize: 0.03, bevelThickness: 0.03 }),
    accent,
  );
  shieldMesh.position.z = -0.08;
  group.add(shieldMesh);
  const rune = new THREE.Mesh(new THREE.OctahedronGeometry(0.17, 0), cream);
  rune.position.set(0, 0.03, 0.2);
  group.add(rune);
}

export default function InteractiveWorld3D({
  kind,
  className = "",
  points = EMPTY_POINTS,
  currentDay = 1,
  completedDays = EMPTY_DAYS,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentDayRef = useRef(currentDay);
  const completedRef = useRef(completedDays);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    currentDayRef.current = currentDay;
    completedRef.current = completedDays;
  }, [currentDay, completedDays]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let renderer: THREE.WebGLRenderer;
    let frame = 0;
    let disposed = false;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-8, 8, 4.5, -4.5, 0.1, 60);
    camera.position.set(0, 1.5, 22);
    camera.lookAt(0, 0, 0);
    const ambient = new THREE.HemisphereLight(0xbad9ff, 0x222036, 2.1);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xffffff, 2.5);
    key.position.set(-4, 8, 12);
    scene.add(key);
    const fill = new THREE.PointLight(kind === "journey" ? 0x46cfff : realmColors[kind] ?? 0xb09aff, 22, 12);
    fill.position.set(0, 1.8, 5);
    scene.add(fill);
    const animated: THREE.Object3D[] = [];
    let climber: THREE.Group | undefined;
    let limbs: THREE.Group[] = [];
    const target = new THREE.Vector3();
    const viewport = { width: 1, height: 1, worldHeight: kind === "journey" ? 10 : 2.6 };
    let environment: THREE.Group | undefined;
    if (kind === "ambient") viewport.worldHeight = 12;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isSmallScreen = window.matchMedia("(max-width: 620px)").matches;

    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        powerPreference: "low-power",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSmallScreen ? 1.15 : 1.4));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      setFailed(false);
    } catch {
      setFailed(true);
      return;
    }

    const measure = () => {
      const rect = canvas.getBoundingClientRect();
      viewport.width = Math.max(1, rect.width);
      viewport.height = Math.max(1, rect.height);
      const aspect = viewport.width / viewport.height;
      viewport.worldHeight = kind === "journey" ? 10 : kind === "ambient" ? 12 : 2.6;
      camera.left = (-viewport.worldHeight * aspect) / 2;
      camera.right = (viewport.worldHeight * aspect) / 2;
      camera.top = viewport.worldHeight / 2;
      camera.bottom = -viewport.worldHeight / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(viewport.width, viewport.height, false);
      if (kind === "ambient" && environment)
        environment.scale.x = (viewport.worldHeight * aspect) / 12;
      if (kind === "journey" && climber && points.length) {
        const point = points[Math.max(0, Math.min(points.length - 1, currentDayRef.current - 1))];
        target.set(
          ((point.x / 100) - 0.5) * viewport.worldHeight * aspect,
          (0.5 - point.y / 100) * viewport.worldHeight + 0.6,
          1,
        );
      }
      renderer.render(scene, camera);
    };

    if (kind === "journey" && points.length) {
      const aspect = canvas.clientWidth / Math.max(1, canvas.clientHeight);
      const worldWidth = viewport.worldHeight * aspect;
      const toWorld = (point: JourneyPoint) =>
        new THREE.Vector3(((point.x / 100) - 0.5) * worldWidth, (0.5 - point.y / 100) * viewport.worldHeight, 0);
      const vertices = points.map(toWorld);
      const path = new THREE.CatmullRomCurve3(vertices);
      const rail = new THREE.Mesh(
        new THREE.TubeGeometry(path, 100, 0.025, 5, false),
        new THREE.MeshStandardMaterial({ color: 0x5cd9ff, emissive: 0x25b9ff, emissiveIntensity: 0.6, transparent: true, opacity: 0.48, metalness: 0.7, roughness: 0.3 }),
      );
      scene.add(rail);
      const stepWidth = Math.max(0.34, Math.min(0.92, worldWidth * 0.035));
      points.forEach((point, index) => {
        const complete = completedRef.current.includes(index + 1);
        const current = index + 1 === currentDayRef.current;
        const color = current ? 0x61dcff : complete ? 0xe7b664 : 0x8fa4c6;
        const material = new THREE.MeshStandardMaterial({
          color,
          metalness: 0.55,
          roughness: 0.34,
          emissive: color,
          emissiveIntensity: current ? 0.48 : complete ? 0.24 : 0.08,
          transparent: true,
          opacity: current ? 0.78 : complete ? 0.64 : 0.4,
          depthWrite: false,
        });
        const stone = new THREE.Mesh(new THREE.BoxGeometry(stepWidth, 0.11, 0.64), material);
        const position = toWorld(point);
        stone.position.copy(position);
        stone.position.z = index * 0.012;
        stone.rotation.z = index % 2 ? 0.025 : -0.025;
        stone.rotation.y = 0.08;
        scene.add(stone);
        const edge = new THREE.LineSegments(
          new THREE.EdgesGeometry(stone.geometry),
          new THREE.LineBasicMaterial({ color: current ? 0x93edff : complete ? 0xffd790 : 0x9fb4d3, transparent: true, opacity: current ? 0.8 : 0.28 }),
        );
        edge.position.copy(stone.position);
        edge.rotation.copy(stone.rotation);
        scene.add(edge);
        if (current) {
          const beacon = new THREE.Mesh(
            new THREE.TorusGeometry(stepWidth * 0.48, 0.025, 5, 24),
            new THREE.MeshStandardMaterial({ color: 0x61dcff, emissive: 0x2bcaff, emissiveIntensity: 1.8 }),
          );
          beacon.position.set(position.x, position.y + 0.09, 0.05);
          beacon.rotation.x = Math.PI / 2;
          scene.add(beacon);
          animated.push(beacon);
        }
      });

      const built = makeClimber();
      climber = built.root;
      limbs = built.limbs;
      climber.scale.setScalar(Math.min(1.1, Math.max(0.66, viewport.worldHeight * aspect * 0.055)));
      const initial = points[Math.max(0, Math.min(points.length - 1, currentDayRef.current - 1))];
      const position = toWorld(initial);
      climber.position.set(position.x, position.y + 0.65, 0.85);
      target.copy(climber.position);
      scene.add(climber);

      const motePositions = new Float32Array(42);
      for (let i = 0; i < motePositions.length; i += 3) {
        motePositions[i] = (Math.random() - 0.5) * worldWidth;
        motePositions[i + 1] = (Math.random() - 0.5) * viewport.worldHeight;
        motePositions[i + 2] = -0.3;
      }
      const moteGeometry = new THREE.BufferGeometry();
      moteGeometry.setAttribute("position", new THREE.BufferAttribute(motePositions, 3));
      const motes = new THREE.Points(moteGeometry, new THREE.PointsMaterial({ color: 0x91e9ff, size: 0.045, transparent: true, opacity: 0.56, sizeAttenuation: true }));
      scene.add(motes);
      animated.push(motes);
    } else {
      const artifact = new THREE.Group();
      addRealmObject(scene, artifact, kind);
      if (kind === "ambient") {
        environment = artifact;
        artifact.scale.set(viewport.worldHeight * (canvas.clientWidth / Math.max(1, canvas.clientHeight)) / 12, 1, 1);
      }
      else artifact.scale.setScalar(0.95);
      scene.add(artifact);
      animated.push(artifact);
      if (kind !== "ambient") {
      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(0.78, 0.018, 6, 36),
        new THREE.MeshStandardMaterial({ color: realmColors[kind] ?? 0xb09aff, emissive: realmColors[kind] ?? 0xb09aff, emissiveIntensity: 0.6, transparent: true, opacity: 0.48 }),
      );
      halo.position.z = -0.15;
      scene.add(halo);
      animated.push(halo);
      const platform = new THREE.Mesh(
        new THREE.CylinderGeometry(0.72, 0.83, 0.12, 28),
        new THREE.MeshStandardMaterial({ color: 0x202b45, metalness: 0.55, roughness: 0.36, emissive: realmColors[kind] ?? 0xb09aff, emissiveIntensity: 0.12 }),
      );
      platform.position.y = -0.62;
      scene.add(platform);
      }
    }

    const resize = new ResizeObserver(measure);
    resize.observe(canvas);
    measure();
    let inViewport = true;
    const pointer = { x: 0, y: 0 };
    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) return;
      pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    const timer = new THREE.Timer();
    timer.connect(document);
    let lastFrameTime = 0;
    const render = () => {
      if (disposed) return;
      frame = 0;
      if (document.visibilityState === "hidden" || !inViewport) return;
      const now = performance.now();
      const frameInterval = isSmallScreen ? 1000 / 30 : 0;
      if (frameInterval && now - lastFrameTime < frameInterval) {
        frame = window.requestAnimationFrame(render);
        return;
      }
      lastFrameTime = now;
      timer.update(now);
      const time = timer.getElapsed();
      if (!reducedMotion) {
        for (const item of animated) {
          item.rotation.y = kind === "journey" ? Math.sin(time * 0.6) * 0.025 : kind === "ambient" ? Math.sin(time * 0.22) * 0.012 : time * 0.24;
          if (kind !== "journey" && kind !== "ambient") item.position.y = Math.sin(time * 1.4) * 0.07;
        }
        if (climber) {
          const point = points[Math.max(0, Math.min(points.length - 1, currentDayRef.current - 1))];
          const aspect = viewport.width / Math.max(1, viewport.height);
          target.set(((point.x / 100) - 0.5) * viewport.worldHeight * aspect, (0.5 - point.y / 100) * viewport.worldHeight + 0.65 + Math.sin(time * 4.2) * 0.025, 0.85);
          climber.position.lerp(target, 0.065);
          climber.rotation.y = THREE.MathUtils.lerp(climber.rotation.y, pointer.x * 0.17, 0.035);
          limbs.forEach((limb, index) => {
            limb.rotation.z = Math.sin(time * 3.1 + index * Math.PI) * (index < 2 ? 0.11 : 0.14);
          });
        }
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.13, 0.025);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, 1.5 + pointer.y * 0.08, 0.025);
        camera.lookAt(0, 0, 0);
      }
      renderer.render(scene, camera);
      if (!reducedMotion) frame = window.requestAnimationFrame(render);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && inViewport && !reducedMotion && !frame)
        frame = window.requestAnimationFrame(render);
    };
    const intersection = new IntersectionObserver(([entry]) => {
      inViewport = entry.isIntersecting;
      if (inViewport && document.visibilityState === "visible" && !reducedMotion && !frame)
        frame = window.requestAnimationFrame(render);
    }, { rootMargin: "120px" });
    intersection.observe(canvas);
    document.addEventListener("visibilitychange", onVisibilityChange);
    if (reducedMotion) renderer.render(scene, camera);
    else frame = window.requestAnimationFrame(render);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      intersection.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pointermove", onPointerMove);
      resize.disconnect();
      timer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments || object instanceof THREE.Points) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
    };
  }, [kind, points, currentDay, completedDays]);

  return (
    <div className={`world3d ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} className="world3d-canvas" />
      {failed && kind === "journey" && (
        <img
          className="world3d-fallback"
          src="/journey-climber-v1-small.png"
          alt=""
          style={{
            left: `${points[Math.max(0, Math.min(points.length - 1, currentDay - 1))]?.x ?? 12}%`,
            top: `${points[Math.max(0, Math.min(points.length - 1, currentDay - 1))]?.y ?? 86}%`,
          }}
        />
      )}
    </div>
  );
}
