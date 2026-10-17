export const BOARD_LENGTH = 3.2;
export const CORNER_RADIUS = 5.6;
export const CORNER_SEGMENTS = 4;
export const CORNER_SWEEP = Math.PI / 2 / CORNER_SEGMENTS;
export const LONG_SIDE_BOARDS = 4;
export const SHORT_SIDE_BOARDS = 2;

export type Point = { x: number; z: number };
export type BoardPose = {
  kind: 'straight' | 'curve';
  x: number;
  z: number;
  heading: number;
  start: Point;
  end: Point;
};

const advanceStraight = (point: Point, heading: number, distance: number): Point => ({
  x: point.x + Math.cos(heading) * distance,
  z: point.z - Math.sin(heading) * distance
});

const advanceCurve = (point: Point, heading: number, sweep: number): Point => ({
  x: point.x + CORNER_RADIUS * (Math.sin(heading + sweep) - Math.sin(heading)),
  z: point.z + CORNER_RADIUS * (Math.cos(heading + sweep) - Math.cos(heading))
});

export function buildBoardPath() {
  const poses: BoardPose[] = [];
  const joints: Point[] = [];
  const start = {
    x: -LONG_SIDE_BOARDS * BOARD_LENGTH / 2,
    z: SHORT_SIDE_BOARDS * BOARD_LENGTH / 2 + CORNER_RADIUS
  };
  let point = start;
  let heading = 0;
  joints.push(point);

  const addStraightRun = (count: number) => {
    for (let index = 0; index < count; index += 1) {
      const end = advanceStraight(point, heading, BOARD_LENGTH);
      const centre = advanceStraight(point, heading, BOARD_LENGTH / 2);
      poses.push({ kind: 'straight', ...centre, heading, start: point, end });
      point = end;
      joints.push(point);
    }
  };

  const addCorner = () => {
    for (let index = 0; index < CORNER_SEGMENTS; index += 1) {
      const end = advanceCurve(point, heading, CORNER_SWEEP);
      const centre = advanceCurve(point, heading, CORNER_SWEEP / 2);
      poses.push({ kind: 'curve', ...centre, heading: heading + CORNER_SWEEP / 2, start: point, end });
      point = end;
      heading += CORNER_SWEEP;
      joints.push(point);
    }
  };

  addStraightRun(LONG_SIDE_BOARDS);
  addCorner();
  addStraightRun(SHORT_SIDE_BOARDS);
  addCorner();
  addStraightRun(LONG_SIDE_BOARDS);
  addCorner();
  addStraightRun(SHORT_SIDE_BOARDS);
  addCorner();

  poses.slice(1).forEach((pose, index) => {
    const previous = poses[index].end;
    if (Math.hypot(pose.start.x - previous.x, pose.start.z - previous.z) > 1e-9) throw new Error('Disconnected rink path');
  });
  if (Math.hypot(point.x - start.x, point.z - start.z) > 1e-9 || Math.abs(heading - Math.PI * 2) > 1e-9) {
    throw new Error('Rink path does not close');
  }

  return { poses, joints };
}

export function sampleBoardPath() {
  const { poses } = buildBoardPath();
  const points: Point[] = [];
  poses.forEach((pose) => {
    if (pose.kind === 'straight') {
      if (points.length === 0) points.push(pose.start);
      points.push(pose.end);
      return;
    }
    for (let step = 0; step <= 8; step += 1) {
      const startHeading = pose.heading - CORNER_SWEEP / 2;
      points.push(advanceCurve(pose.start, startHeading, CORNER_SWEEP * step / 8));
    }
  });
  return points;
}
