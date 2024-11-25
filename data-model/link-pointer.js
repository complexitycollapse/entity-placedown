export default function LinkPointer(origin) {
  const obj = {
    leafType: "link pointer",
    isPointer: true,
    origin,
    denotesSame: other => other.leafType === obj.leafType && other.origin === obj.origin,
    overlaps: other => obj.denotesSame(other),
    hashableName: `edl:${origin}`
  };

  return Object.freeze(obj);
};
