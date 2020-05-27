import React, {useEffect, useState, useRef} from 'react';
import {TextEditor, QueryEditor} from './components/Editor';
import DynamicResults from './components/DynamicResults';


const WORKPATH = `${process.env.PUBLIC_URL}/work.js`;
let worker;

const App = () => {
  const [marks, setMarks] = useState([]);
  const [spanList, setSpanList] = useState([]);
  const queryEditorRef = useRef();
  const textEditorRef = useRef();

  /* WASM */
  const addMatches = (results) => {
    results.forEach((result) => {
      result.forEach((span) => {
        span.m = textEditorRef.current.editor.getRange(
          textEditorRef.current.editor.posFromIndex(span.s),
          textEditorRef.current.editor.posFromIndex(span.e)
        );
      })
    })
  }
  const initWorker = () => {
    worker = new Worker(WORKPATH);
    worker.onmessage = (m) => {
      if (m.data.type === "SCHEMA") {
      } else
      if (m.data.type === "RESULT") {
        addMatches(m.data.spans);
        setSpanList((currResults) => [...currResults, ...m.data.spans]);
      } else 
      if (m.data.type === "LASTRESULT") {
        addMatches(m.data.spans);
        setSpanList((currResults) => [...currResults, ...m.data.spans]);

        console.log("FINISHED");
        worker.terminate();
        initWorker();
      } else 
      if (m.data.type === "ERROR") {
        alert(m.data.error);
        worker.terminate();
        initWorker();
      } else 
      if (m.data.type === "NORESULTS") {
        console.log("No matches found.");
        worker.terminate();
        initWorker();
      }
    }
  }
  const runWorker = () => {
    setSpanList([]);
    worker.postMessage({
      text:   textEditorRef.current.editor.getValue(),
      query:  queryEditorRef.current.editor.getValue(),
    });
  }
  // RUN THIS ONCE
  useEffect(() => {
    initWorker();
  }, []);

  return (
    <div>
      <button onClick={runWorker}>Run Query</button>      
      <QueryEditor
        ref={queryEditorRef}
        label="queryEditor"
        mode="rematchQuery"
        scrollbarStyle="null"
        value="!a{RE}!b{match} !c{is} !d{[a-z]+}!e{!}" 
        theme="monokai"
        lineNumbers={false}
        disableNewLine={true}
      />
      <TextEditor
        ref={textEditorRef}
        label="textEditor"
        mode="text/plain"
        scrollbarStyle="native"
        value={
`REmatch is cool!
REmatch is awesome!
REmatch is pretty!
REmatch is useful!
REmatch is cool!
REmatch is awesome!
REmatch is pretty!
REmatch is useful!
REmatch is cool!
REmatch is awesome!
REmatch is pretty!
REmatch is useful!`}
        theme="monokai"
        lineNumbers={true}
        disableNewLine={false}
        marks={marks}
      />
      <DynamicResults setMarks={setMarks} list={spanList}/>
    </div>
  )
}

export default App;
