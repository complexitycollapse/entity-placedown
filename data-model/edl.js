export default function Edl(type, clips, links) {
  return {
    leafType: "edl",
    type,
    clips,
    links
  };
}
