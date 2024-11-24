export function arraysShallowEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false; // Arrays have different lengths
  }

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false; // Arrays have different elements
    }
  }

  return true; // Arrays are shallowly equal
}

export function joinPath(...parts) {
  return parts.join("/").replace(/\/+/g, "/");
}

export function removeItem(array, item) {
  const index = array.indexOf(item);
  if (index > -1) {
    array.splice(index, 1); // Removes the item at the found index
  }
}
