import useSubscriber from "../common/use-subscriber";
import { createSubscriber } from "../common/use-subscriber";

export function EventLogComponent({ doc }) {

  const subscriber = () => createSubscriber(
    doc.eventLog.subscribe,
    doc.eventLog.unsubscribe,
    () => doc.eventLog.getLog());

  const log = useSubscriber(subscriber);

  return (<div>
    <h1>Event Log</h1>
    <ul style={{listStyle: "none", paddingLeft: "0.5em"}}>
      { log.map(([key, event]) => (<EventLogEntry key={key} event={event}/>)) }
    </ul>
    </div>);
}

function EventLogEntry({event}) {
  return (<li><span style={{fontWeight: "bold" }}>{event.type}</span>{" " + JSON.stringify(event) }</li>);
}

function formatEntry(entry) {
  return [entry[0], Object.fromEntries(Object.entries(entry[1]).filter(([key]) => key !== "entity" && key !== "document" && key !== "components"))];
}
