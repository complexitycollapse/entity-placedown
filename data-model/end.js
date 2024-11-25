export default function End(name, pointers) {
  if (!Array.isArray(pointers)) {
    throw new Error("Pointers must be an array: ", JSON.stringify(pointers));
  }

  return {
    name,
    pointers
  };
}
