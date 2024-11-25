export default function EdlPointer(origin) {
  const obj = {
    leafType: "edl pointer",
    isPointer: true,
    origin,
    denotesSame: other => other.leafType === obj.leafType && other.origin === obj.origin,
    overlaps: other => obj.denotesSame(other),
    hashableName: `edl:${origin}`
  };

  return Object.freeze(obj);
};
