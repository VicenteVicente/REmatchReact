import CodeMirror from 'codemirror';
import 'codemirror/theme/dracula.css';
import 'codemirror/addon/mode/simple';

import React, {useEffect, useState, useRef, Component} from 'react';
//import {TextEditor, QueryEditor} from './components/Editor';
import DynamicResults from './components/DynamicResults';
import {Button} from '@material-ui/core';
import {PlayArrow, Publish} from '@material-ui/icons';


const WORKPATH = `${process.env.PUBLIC_URL}/work.js`;
const CHUNKSIZE = 1*10**8; // 100MB
let worker;

/* CODEMIRROR MODE DEFINITION */
CodeMirror.defineSimpleMode("rematchQuery", {
  start: [
      { regex: /(\.\+|\.\*|\.|\+)/, token: "keyword" },
      { regex: /(\\d)|(\\w)|(\\s)|(\\t)|(\\r)|(\\n)|(\\\()|(\\\))|(\\\[)|(\\\])|(\\\{)|(\\\})|(\\\.)|(\\-)|(\\_)/i, token: "string" },
      { regex: /(![A-Za-z0-9]+\{|\})/, token: "number" },
      { regex: /(\(|\)|\||\[|\]|-)/, token: "operator" }
  ]
});
/*
const App = () => {
  const [marks, setMarks] = useState([]);
  const [spanList, setSpanList] = useState([]);
  const queryEditorRef = useRef();
  const textEditorRef = useRef();
  let queryEditor, textEditor;

  // WASM 
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
      text:   textEditor.getValue(),
      query:  queryEditor.getValue(),
    });
  }
  // FILE UPLOAD 
  const handleFile = async (file) => {
    if (!file) {return};
    textEditor.setValue("");
    let start = 0;
    let end = CHUNKSIZE;
    while (start < file.size) {
        await file.slice(start, end).text()
          // eslint-disable-next-line no-loop-func
          .then((textChunk) => {
            textEditor.replaceRange(textChunk, { line: Infinity });
            start = end;
            end += CHUNKSIZE;
          });
    }
    console.log("upload done");
  }
  // RUN THIS ONCE
  useEffect(() => {
    queryEditor = CodeMirror(document.getElementById('queryEditor'), {
      mode: 'rematchQuery',
      theme: 'default',
      lineNumbers: false,
      scrollbarStyle: 'native',
      smartIndent: false,
      indentWithTabs: true,
      showInvisibles: false,
      undoDepth: 100,
      viewportMargin: 10, // Lines rendered up and down [MEMORY]
    });
    textEditor = CodeMirror(document.getElementById('textEditor'), {
      mode: 'text/plain',
      theme: 'default',
      lineNumbers: true,
      scrollbarStyle: 'native',
      smartIndent: false,
      indentWithTabs: true,
      showInvisibles: true,
      undoDepth: 100,
      viewportMargin: 10, // Lines rendered up and down [MEMORY]
    });
    initWorker();
  }, []);
  let dom = document.createElement("div");
  const test = CodeMirror(dom, {});
  document.body.appendChild(dom);
  return (
    <div style={{backgroundColor: 'rgb(55,55,55)'}}>
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
      <div id="queryEditor"></div>
      <div id="textEditor"></div>
      {<DynamicResults setMarks={setMarks} list={spanList} textEditorRef={textEditorRef}/>}      
    </div>
  )
}*/

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      schema: [],
      spanList: [],
      worker: new Worker(WORKPATH),
    };
  }
  componentDidMount() {
    let queryEditor = CodeMirror(document.getElementById('queryEditor'), {
      value: '!x{abc}',
      mode: 'rematchQuery',
      theme: 'dracula',
      lineNumbers: false,
      scrollbarStyle: 'native',
      smartIndent: false,
      indentWithTabs: true,
      showInvisibles: false,
      undoDepth: 100,
      viewportMargin: 10,
    });
    let textEditor = CodeMirror(document.getElementById('textEditor'), {
      value: 'abcabcabcabc',
      mode: 'text/plain',
      theme: 'dracula',
      lineNumbers: true,
      scrollbarStyle: 'native',
      smartIndent: false,
      indentWithTabs: true,
      showInvisibles: true,
      undoDepth: 100,
      viewportMargin: 10,
    });
    this.setState({queryEditor, textEditor});
  }
  handleFile = async (event) => {
    console.log(this.queryEditor);
    let file = event.target.files[0];
    if (!file) {return};
    this.state.textEditor.setValue('');
    let start = 0;
    let end = CHUNKSIZE;
    while (start < file.size) {
        await file.slice(start, end).text()
          // eslint-disable-next-line no-loop-func
          .then((textChunk) => {
            this.state.textEditor.replaceRange(textChunk, { line: Infinity });
            start = end;
            end += CHUNKSIZE;
          });
    }
    console.log('upload done');
  }
  runWorker = () => {
    console.log('STARTED');
    this.setState({spanList: []});
    this.state.worker.postMessage({
      text:   this.state.textEditor.getValue(),
      query:  this.state.queryEditor.getValue(),
    });
    this.state.worker.onmessage = (m) => {
      switch(m.data.type) {
        case 'SCHEMA':
          this.setState({schema: m.data.schema});
          break;
        case 'SPANS':
          this.setState((prevState, _) => ({spanList: [...prevState.spanList, ...m.data.spans]}));
          break;
        case 'LAST_SPANS':
          this.state.worker.terminate();
          this.setState((prevState, _) => ({
            spanList: [...prevState.spanList, ...m.data.spans],
            worker: new Worker(WORKPATH)
          }));
          console.log("FINISHED (NO MORE SPANS)");
          break;
        case 'ERROR':
          console.log("FINISHED (ERROR)");
          console.log(m.data.error);
          this.state.worker.terminate();
          this.setState({worker: new Worker(WORKPATH)});
          break;
        case 'NO_MATCHES':
          console.log("FINISHED (NO MATCHES)");
          this.state.worker.terminate();
          this.setState({worker: new Worker(WORKPATH)});
          break;
        default:
          break;
      }
    }
  }

  render() {
    let test = this.state.spanList.map( (elem, idx) => <div key={idx}>{JSON.stringify(elem)}</div>);
    return (
      <>
        <Button color="secondary" variant="outlined"startIcon={<PlayArrow/>} onClick={this.runWorker} >
            Run Query
        </Button>
        <input accept="text/*" id="fileInput" type="file" style={{display: 'none'}} onChange={this.handleFile}/>
        <label htmlFor="fileInput">
          <Button color="primary" variant="outlined" component="span" startIcon={<Publish/>}>
            Upload file
          </Button>
        </label>
        <div id="queryEditor"></div>
        <div id="textEditor"></div>
        {test}
      </>
    )
  }
}

export default App;
