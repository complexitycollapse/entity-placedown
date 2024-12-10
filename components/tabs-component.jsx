import { StrictMode, useState } from 'react'
import { Document } from "../interpreter/entities.js";
import CacheListComponent from './cache-list-component';
import { DocumentRoot, eventLoop } from '../window/window';
import { ComponentListComponent } from './component-list-component.jsx';
import { EventLogComponent } from './event-log-component.jsx';
import { DocumentComponent } from './document-component.jsx';

export default function TabsComponent() {

  const [doc] = useState(() => {
    const pointer = { type:"edl", origin: "example-edl.json" };
    const doc = Document();
    DocumentRoot(doc, pointer);
    eventLoop(doc);
    return doc;
  });

  return (
    <StrictMode>
        <div className="tab-bar">
          <div id="editor-tab" className="tab active" onClick={() => openTab("editor-tab", "editor-panel")}>Editor</div>
          <div id="components-tab" className="tab" onClick={() => openTab("components-tab", "components-panel")}>Components</div>
          <div id="cache-tab" className="tab" onClick={() => openTab("cache-tab", "cache-panel")}>Cache</div>
          <div id="events-tab" className="tab" onClick={() => openTab("events-tab", "events-panel")}>Event Log</div>
        </div>
        <div id="editor-panel" className="panel">
          <DocumentComponent doc={doc}/>
        </div>
        <div id="components-panel" className="panel hidden">
          <div className="tab-bar">
            {Object.keys(doc.components).map(type => 
              <div id={type + "-tab"} key={type} className="tab" onClick={() => openTab(type + "-tab", type + "-panel")}>{type}</div>
            )}
          </div>
          {Object.keys(doc.components).map(type => 
            <div id = {type + "-panel"} key={type} className="panel hidden">
              <h1>{type}</h1>
              <ComponentListComponent key={type} doc={doc} componentType={type} />
            </div>
          )}
        </div>
        <div id="cache-panel" className="panel hidden">
          <CacheListComponent/>
        </div>
        <div id="events-panel" className="panel hidden">
          <EventLogComponent doc={doc}/>
        </div>
    </StrictMode>
  );
}

export function openTab(tabId, panelId) {
  const panel = document.getElementById(panelId);
  const tab = document.getElementById(tabId);
  const tabBar = tab.parentNode;
  const panelContainer = panel.parentNode;
  [...panelContainer.getElementsByClassName("panel")].forEach(tab => tab.classList.add("hidden"));
  [...tabBar.getElementsByClassName("tab")].forEach(tab => tab.classList.remove("active"));
  panel.classList.remove("hidden");
  tab.classList.add("active");
}
