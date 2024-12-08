function downloaderToNode(component) {
  return ({
    key: component.entity.id,
    element: component,
    formatter: () => ({
      label: component.entity.id
      + " (" + JSON.stringify(component.pointer) + ")"
      + (component.state === "complete" ? " ✓" : ""),
      children: [
        property(component, "goal"),
        property(component, "state")
      ]
    })
  });
}

function property(obj, prop, formatter = v => v) {
  return {
    key: prop,
    element: obj[prop],
    formatter: v => ({ label: prop, value: formatter(v) })
  };
}

const componentFormatters = {
  "downloader": downloaderToNode
};

export function getComponentFormatter(componentType) {
  const fn = componentFormatters[componentType];
  return fn ?? (component => ({ 
    key: component.entityId,
    element: component,
    formatter: () => ({
      label: component.entityId,
      value: JSON.stringify(component)
    })
  }));
}
