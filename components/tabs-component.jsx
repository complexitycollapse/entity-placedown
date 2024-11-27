import { StrictMode, useState } from 'react'
import { Document } from "../interpreter/entities.js";
import CacheListComponent from './cache-list-component';
import { DownloaderComponent, openTab } from '../window/window';
import { ComponentListComponent } from './component-list-component.jsx';

export default function TabsComponent() {

  const [doc] = useState(() => {
    const doc = Document();
    doc.add(obj => {
      obj.add(DownloaderComponent());
    });
    return doc;
  });

  return (
    <StrictMode>
        <div className="button-bar">
          <input type="button" value="Downloads" onClick={() => openTab('downloads-tab')}></input>
          <input type="button" value="Cache" onClick={() => openTab('cache-tab')}></input>
        </div>
        <div id="downloads-tab" className="tab">
          <h1>Downloads</h1>
          <ComponentListComponent doc={doc} componentType={"downloader"} elementToNode={downloaderToNode} />
        </div>
        <div id="cache-tab" className="tab hidden">
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
      label: component.entity.id,
      children: []
    })
  });
}
