import useEntitySubcription from "../ui/use-entity-subscriber";

export function DocumentComponent({doc}) {
  const root = doc.getComponents("root")[0];
  return <div><EdlComponent entity={root.entity}/></div>;
}

export function EdlComponent({entity}) {
  useEntitySubcription(entity);

  return <span>
    { entity.get("edl").clips.map(clip => {
        if (clip.get("span")) {
          return <SpanComponent key={clip.id} entity={clip} />;
        }
        if (clip.get("edl")) {
          return <EdlComponent key={clip.id} entity={clip} />;
        }
      })
    }
  </span>;
}

export function SpanComponent({entity}) {
  const spanContent = useEntitySubcription(entity, () => entity.get("span").clippedContent);

  return <span>{spanContent}</span>
}
