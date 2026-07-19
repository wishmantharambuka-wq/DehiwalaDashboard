import * as THREE from "three";
import type { Origin } from "./geo";
import { project } from "./geo";

type Ring = number[][];
type Polygon = Ring[];
type MultiPolygon = Polygon[];

/** Build one THREE.Shape per polygon part of a MultiPolygon (holes supported). */
export function buildShapesFromMultiPolygon(mp: MultiPolygon, origin: Origin): THREE.Shape[] {
  const shapes: THREE.Shape[] = [];

  for (const polygon of mp) {
    const [outer, ...holes] = polygon;
    const outerPts = outer.map(([lon, lat]) => {
      const [x, z] = project(lon, lat, origin);
      return new THREE.Vector2(x, z);
    });
    const shape = new THREE.Shape(outerPts);

    for (const hole of holes) {
      const holePts = hole.map(([lon, lat]) => {
        const [x, z] = project(lon, lat, origin);
        return new THREE.Vector2(x, z);
      });
      shape.holes.push(new THREE.Path(holePts));
    }

    shapes.push(shape);
  }

  return shapes;
}

/** Build an extruded, centered-on-origin geometry from a set of shapes.
 * Note: THREE.Shape lives in XY; ExtrudeGeometry extrudes along +Z, so we
 * rotate the resulting geometry -90deg around X to lay it flat (Y = up).
 */
export function buildExtrudedGeometry(shapes: THREE.Shape[], depth: number): THREE.BufferGeometry {
  const geometries = shapes.map(
    (shape) =>
      new THREE.ExtrudeGeometry(shape, {
        depth,
        bevelEnabled: false,
        curveSegments: 6,
      })
  );

  const merged =
    geometries.length === 1
      ? geometries[0]
      : mergeBufferGeometries(geometries);

  merged.rotateX(-Math.PI / 2);
  merged.translate(0, depth, 0); // extrusion goes -Z->rotated to -Y, lift back up
  return merged;
}

/** Minimal buffer geometry merge (position + normal + uv), no groups needed
 * since all our extrusions share one material per mesh.
 *
 * IMPORTANT: source geometries (ExtrudeGeometry / ShapeGeometry) are INDEXED
 * — they store a small unique-vertex array plus a separate index buffer that
 * groups them into triangles. Naively concatenating just the `position`
 * arrays (ignoring `.index`) produces a meaningless, non-multiple-of-3
 * triangle soup, which corrupts rendering and can even NaN-out downstream
 * geometry (e.g. WireframeGeometry) for any division with more than one
 * polygon part. Converting to non-indexed first flattens each geometry into
 * a valid, already-triangulated (3 verts per triangle) buffer, so
 * concatenating multiple of them stays valid. */
function mergeBufferGeometries(geoms: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const flattened = geoms.map((g) => (g.index ? g.toNonIndexed() : g));

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];

  for (const g of flattened) {
    const pos = g.getAttribute("position");
    const norm = g.getAttribute("normal");
    const uv = g.getAttribute("uv");
    for (let i = 0; i < pos.count; i++) {
      positions.push(pos.getX(i), pos.getY(i), pos.getZ(i));
      if (norm) normals.push(norm.getX(i), norm.getY(i), norm.getZ(i));
      if (uv) uvs.push(uv.getX(i), uv.getY(i));
    }
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  if (normals.length) merged.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  if (uvs.length) merged.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  return merged;
}

/** Paint a "color" vertex attribute onto an extruded geometry, blending from
 * `colorBottom` at y=0 to `colorTop` at y=depth — gives each land block a
 * glowing, gem-like vertical gradient instead of a flat fill. Geometry must
 * already be rotated/translated so Y is up. */
export function applyHeightGradient(
  geometry: THREE.BufferGeometry,
  _depth: number,
  colorBottom: THREE.Color,
  colorTop: THREE.Color,
): void {
  const pos = geometry.getAttribute("position");
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const rangeY = maxY - minY || 1;
  const colors = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const t = THREE.MathUtils.clamp((pos.getY(i) - minY) / rangeY, 0, 1);
    c.copy(colorBottom).lerp(colorTop, t);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
}

/** Build a flat (non-extruded) triangulated geometry at a given height from a
 * set of shapes — used to derive a faceted wireframe pattern across the top
 * surface (thin internal triangulation lines + outer boundary), matching a
 * stylised digital-terrain look. */
export function buildFlatTopGeometry(shapes: THREE.Shape[], height: number): THREE.BufferGeometry {
  const geometries = shapes.map((shape) => new THREE.ShapeGeometry(shape, 4));
  const merged =
    geometries.length === 1 ? geometries[0] : mergeBufferGeometries(geometries);
  merged.rotateX(-Math.PI / 2);
  merged.translate(0, height, 0);
  return merged;
}

/** Build a THREE.BufferGeometry of line segments tracing the outer ring(s)
 * of a MultiPolygon, at a given height — used for the glowing edge outline. */
export function buildEdgeGeometry(
  mp: MultiPolygon,
  origin: Origin,
  height: number
): THREE.BufferGeometry {
  const points: number[] = [];

  for (const polygon of mp) {
    for (const ring of polygon) {
      for (let i = 0; i < ring.length - 1; i++) {
        const [lon1, lat1] = ring[i];
        const [lon2, lat2] = ring[i + 1];
        const [x1, z1] = project(lon1, lat1, origin);
        const [x2, z2] = project(lon2, lat2, origin);
        points.push(x1, height, -z1, x2, height, -z2);
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  return geometry;
}
