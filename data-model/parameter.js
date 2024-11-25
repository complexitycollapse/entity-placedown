export default function Parameter(value) {
  const obj = {
    leafType: "parameter",
    value,
    denotesSame: other => other.leafType === obj.leafType && other.value === obj.value,
    overlaps: other => other.denotesSame(obj),
    hashableName: "param:" + value
  };

  return obj;
}
