import React, {useEffect} from 'react';
import {TextEditor, QueryEditor} from './components/editor'


const WORKPATH = `${process.env.PUBLIC_URL}/work.js`;

const App = () => {
  /* MARKS */
  const [marks, setMarks] = React.useState(null);
  
  const markUpdate = () => {
    setMarks([
      { s: 1, e: 9 }
    ]);
  }

  /* WASM */
  const queryEditorRef = React.useRef();
  const textEditorRef = React.useRef();
  // RUN THIS ONCE
  useEffect(() => {
    const worker = new Worker(WORKPATH);
    worker.onmessage = (m) => {
      console.log(JSON.stringify(m.data, null, 2));
    }
  }, []);
  

  const runWorker = () => {
    console.log("%cWork started!", "color: red");
    console.log(textEditorRef.current.editor.getValue(),
    queryEditorRef.current.editor.getValue());
    //worker.postMessage({text: TextEditor.editor.getValue(), query: `.*${QueryEditor.editor.getValue()}.*`});
  }

  return (
    <div>
      <button onClick={runWorker}>Run Query</button>
      <h1 onClick={() => console.log}>REmatch test!</h1>
      <QueryEditor
        ref={queryEditorRef}
        label="queryEditor"
        mode="rematchQuery"
        value="!x{query}" 
        theme="monokai"
        lineNumbers={false}
        disableNewLine={true}
      />
      <TextEditor
        ref={textEditorRef}
        label="textEditor"
        mode="text/plain"
        value="REmatch React is cool!" 
        theme="monokai"
        lineNumbers={true}
        disableNewLine={false}
        marks={marks}
      />
    </div>
  )
}

export default App;
