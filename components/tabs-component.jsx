import { StrictMode, useState } from 'react'
import { Document } from "../interpreter/entities.js";
import CacheListComponent from './cache-list-component';
import { DownloaderComponent, openTab } from '../window/window';
import { ComponentListComponent } from './component-list-component.jsx';

export default function TabsComponent() {

  const [doc] = useState(() => {
    const doc = Document();
    doc.add(obj => {
      obj.add(DownloaderComponent("ptr"));
    });
    return doc;
  });

  return (
    <StrictMode>
        <div className="tab-bar">
          <div id="downloads-tab" className="tab active" onClick={() => openTab("downloads-tab", 'downloads-panel')}>Downloads</div>
          <div id="cache-tab" className="tab" onClick={() => openTab("cache-tab", 'cache-panel')}>Cache</div>
        </div>
        <div id="downloads-panel" className="panel">
          <h1>Downloads</h1>
          <ComponentListComponent doc={doc} componentType={"downloader"} elementToNode={downloaderToNode} />
        </div>
        <div id="cache-panel" className="panel hidden">
          <CacheListComponent/>
        </div>
    </StrictMode>
  );
}

function downloaderToNode(component) {
  return ({
    key: component.entity.id,
    element: component,
    formatter: () => ({
      label: component.entity.id + " (" + component.pointer + ")",
      children: [
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
