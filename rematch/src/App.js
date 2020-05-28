import React, {useEffect, useState, useRef} from 'react';
import {TextEditor, QueryEditor} from './components/Editor';
import DynamicResults from './components/DynamicResults';
import {Button} from '@material-ui/core';
import {PlayArrow, Publish} from '@material-ui/icons';


const WORKPATH = `${process.env.PUBLIC_URL}/work.js`;
const CHUNKSIZE = 1*10**8; // 100MB
let worker;

const App = () => {
  const [marks, setMarks] = useState([]);
  const [spanList, setSpanList] = useState([]);
  const queryEditorRef = useRef();
  const textEditorRef = useRef();

  /* WASM */
  const initWorker = () => {
    worker = new Worker(WORKPATH);
    worker.onmessage = (m) => {
      if (m.data.type === "SCHEMA") {
      } else
      if (m.data.type === "RESULT") {
        //addMatches(m.data.spans);
        setSpanList((currResults) => [...currResults, ...m.data.spans]);
      } else 
      if (m.data.type === "LASTRESULT") {
        //addMatches(m.data.spans);
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
        alert("No matches found.");
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
  /* FILE UPLOAD */
  const handleFile = async (file) => {
    if (!file) {return};
    textEditorRef.current.editor.setValue("");
    let start = 0;
    let end = CHUNKSIZE;
    while (start < file.size) {
        await file.slice(start, end).text()
          // eslint-disable-next-line no-loop-func
          .then((textChunk) => {
            textEditorRef.current.editor.replaceRange(textChunk, { line: Infinity });
            start = end;
            end += CHUNKSIZE;
          });
    }
    console.log("upload done");
  }
  // RUN THIS ONCE
  useEffect(() => {
    initWorker();
  }, []);

  return (
    <div>
      <Button 
        onClick={runWorker} 
        color="secondary" 
        variant="outlined"
        startIcon={<PlayArrow/>}
        >
          Run Query
      </Button>
      <input
        accept="*"
        id="contained-button-file"
        multiple
        type="file"
        style={{display: 'none'}}
        onChange={(f) => handleFile(f.target.files[0])}
      />
      <label htmlFor="contained-button-file">
        <Button 
          color="primary" 
          variant="outlined" 
          component="span"
          startIcon={<Publish/>}
        >
          Upload file
        </Button>
      </label>
      
      <QueryEditor
        ref={queryEditorRef}
        label="queryEditor"
        mode="rematchQuery"
        scrollbarStyle="null"
        value="!a{RE}!b{match} !c{is} !d{[a-z]+}!e{!}" 
        theme="default"
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
        theme="defalult"
        lineNumbers={true}
        disableNewLine={false}
        marks={marks}
      />
      <DynamicResults setMarks={setMarks} list={spanList} textEditorRef={textEditorRef}/>
    </div>
  )
}

export default App;
