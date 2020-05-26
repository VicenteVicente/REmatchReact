import React, {useEffect} from 'react';
import {TextEditor, QueryEditor} from './components/editor'


const WORKPATH = `${process.env.PUBLIC_URL}/work.js`;
let worker;

const App = () => {
  const [marks, setMarks] = React.useState(null);
  const queryEditorRef = React.useRef();
  const textEditorRef = React.useRef();

  /* MARKS */
  const markUpdate = () => {
    setMarks([
      { s: 1, e: 9 }
    ]);
  }
  /* WASM */  
  const initWorker = () => {
    worker = new Worker(WORKPATH);
    worker.onmessage = (m) => {
      if (m.data.type === "SCHEMA") {
        console.log(m.data.schema)
      } else
      if (m.data.type === "RESULT") {
        console.log(m.data.results);
      } else 
      if (m.data.type === "LASTRESULT") {
        console.log(m.data.results);
        console.log("FINISHED");
        worker.terminate();
        initWorker();
      } else 
      if (m.data.type === "ERROR") {
        alert(m.data.error);
      }
    }
  }
  const runWorker = () => {
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
      <h1 onClick={() => console.log}>REmatch test!</h1>
      <QueryEditor
        ref={queryEditorRef}
        label="queryEditor"
        mode="rematchQuery"
        value="!x{.+}" 
        theme="monokai"
        lineNumbers={false}
        disableNewLine={true}
      />
      <TextEditor
        ref={textEditorRef}
        label="textEditor"
        mode="text/plain"
        value="REmatch React is cool!REmatch React is cool!REmatch React is cool!" 
        theme="monokai"
        lineNumbers={true}
        disableNewLine={false}
        marks={marks}
      />
    </div>
  )
}

export default App;
