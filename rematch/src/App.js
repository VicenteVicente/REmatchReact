import CodeMirror from 'codemirror';
import 'codemirror/theme/material.css';
import 'codemirror/addon/mode/simple';

import React, {Component, useState} from 'react';

import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import { PlayArrow, Publish, Visibility } from '@material-ui/icons';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import Paper from '@material-ui/core/Paper';

const WORKPATH = `${process.env.PUBLIC_URL}/work.js`;
const CHUNKSIZE = 1*10**8; // 100MB
let worker = new Worker(WORKPATH);
let marks = [];

/* CODEMIRROR MODE DEFINITION */
CodeMirror.defineSimpleMode("rematchQuery", {
  start: [
      { regex: /(\.\+|\.\*|\.|\+)/, token: "keyword" },
      { regex: /(\\d)|(\\w)|(\\s)|(\\t)|(\\r)|(\\n)|(\\\()|(\\\))|(\\\[)|(\\\])|(\\\{)|(\\\})|(\\\.)|(\\-)|(\\_)/i, token: "string" },
      { regex: /(![A-Za-z0-9]+\{|\})/, token: "number" },
      { regex: /(\(|\)|\||\[|\]|-)/, token: "operator" }
  ]
});
/* MATERIAL UI DARK THEME */
const darkTheme = createMuiTheme({
  palette: {
    type: 'dark',
  },
});

class ResultsTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 0,
      rowsPerPage: 25,
    }
  }

  handleChangePage = (_, newPage) => {
    this.setState({page: newPage});
  }

  handleChangeRowsPerPage = (event) => {
    this.setState({
      rowsPerPage: event.target.value,
      page: 0
    });
  }

  handleMarkText = (row) => {
    this.props.clearMarks();
    this.props.addMarks(row);
  }

  componentWillReceiveProps(_) {
    this.setState({page: 0});
  }

  render() {
    const {schema, spanList, textEditor} = this.props;
    return (
      <TableContainer component={Paper} style={{marginTop: '1rem'}}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TablePagination
                labelRowsPerPage="Matches per page:"
                rowsPerPageOptions={[10, 25, 50, 100]}
                colSpan={schema.length}
                count={spanList.length}
                rowsPerPage={this.state.rowsPerPage}
                page={this.state.page}
                onChangePage={this.handleChangePage}
                onChangeRowsPerPage={this.handleChangeRowsPerPage}
              />
            </TableRow>
            {(spanList.length>0)
            ? <TableRow>
                {schema.map((name, idxHead) => (
                  <TableCell key={idxHead}>{name}</TableCell>
                  ))}
              </TableRow>
            : <TableRow>
                <TableCell>
                  No matches.
                </TableCell>
              </TableRow>
            }
          </TableHead>
          <TableBody>
            {(this.state.rowsPerPage > 0
              ? spanList.slice(
                this.state.page * this.state.rowsPerPage,
                this.state.page * this.state.rowsPerPage + this.state.rowsPerPage)
              : spanList).map((row, idxRow) => ( 
              <TableRow key={idxRow} hover style={{cursor: 'pointer'}} onClick={() => this.handleMarkText(row)}>
                {row.map((col, idxCol) => (
                  <TableCell key={idxCol}>{
                    textEditor.getRange(
                      textEditor.posFromIndex(col.s),
                      textEditor.posFromIndex(col.e))}
                  </TableCell>
                ))}
              </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    )
  }
}

/* APP */
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      schema: [],
      spanList: [],
    };
  }
  componentDidMount() {
    let queryEditor = CodeMirror(document.getElementById('queryEditor'), {
      value: '!a{This} !b{is} !c{RE}!d{match}, !e{.+}!',
      mode: 'rematchQuery',
      theme: 'material',
      lineNumbers: false,
      scrollbarStyle: 'native',
      smartIndent: false,
      indentWithTabs: true,
      showInvisibles: false,
      undoDepth: 100,
      viewportMargin: 10,
    });
    queryEditor.on('beforeChange', (instance, change) => {
      let line = change.text.join("").replace(/\n/g, "");
      change.update(change.from, change.to, [line]);
      return true;
    });
    let textEditor = CodeMirror(document.getElementById('textEditor'), {
      value: 
`This is REmatch, cool!
This is REmatch, awesome!
This is REmatch, useful!
This is REmatch, incredible!
This is REmatch, fast!
`,
      mode: 'text/plain',
      theme: 'material',
      lineNumbers: true,
      scrollbarStyle: 'native',
      smartIndent: false,
      indentWithTabs: true,
      showInvisibles: true,
      undoDepth: 100,
      viewportMargin: 10,
    });
    this.setState({
      queryEditor, 
      textEditor,
    });
  }
  addMarks = (spans) => {
    spans.forEach((span, idx) => {
      marks.push(
        this.state.textEditor.markText(
          this.state.textEditor.posFromIndex(span.s),
          this.state.textEditor.posFromIndex(span.e),
          {className: `m${idx}`})
      );
    });
  }
  clearMarks = () => {
    marks.forEach((mark) => {
      mark.clear();
    });
    marks = [];
  }
  handleFile = async (event) => {
    let file = event.target.files[0];
    if (!file) {return};
    this.state.textEditor.setValue('');
    this.clearMarks();
    this.setState({spanList: [], schema: []});
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
    this.clearMarks();
    this.setState({spanList: [], schema: []});
    worker.postMessage({
      text:   this.state.textEditor.getValue(),
      query:  this.state.queryEditor.getValue(),
    });
    worker.onmessage = (m) => {
      switch(m.data.type) {
        case 'SCHEMA':
          this.setState({schema: m.data.schema});
          break;
        case 'SPANS':
          this.setState((prevState, _) => ({spanList: [...prevState.spanList, ...m.data.spans]}));
          break;
        case 'LAST_SPANS':
          this.setState((prevState, _) => ({spanList: [...prevState.spanList, ...m.data.spans]}));
          console.log("FINISHED (NO MORE SPANS)");
          break;
        case 'ERROR':
          console.log("FINISHED (ERROR)");
          console.log(m.data.error);
          break;
        case 'NO_MATCHES':
          console.log("FINISHED (NO MATCHES)");
          break;
        default:
          break;
      }
    }
  }

  render() {
    //let test = this.state.spanList.map( (elem, idx) => <div key={idx}>{JSON.stringify(elem)}</div>);
    return (
      <ThemeProvider theme={darkTheme}>
        <Button variant="outlined" startIcon={<PlayArrow/>} onClick={this.runWorker} >
            Run Query
        </Button>
        <input accept="text/*" id="fileInput" type="file" style={{display: 'none'}} onChange={this.handleFile}/>
        <label htmlFor="fileInput">
          <Button variant="outlined" component="span" startIcon={<Publish/>}>
            Upload file
          </Button>
        </label>
        <div id="queryEditor"></div>
        <div id="textEditor"></div>
        <ResultsTable 
          spanList={this.state.spanList} 
          schema={this.state.schema} 
          textEditor={this.state.textEditor} 
          addMarks={this.addMarks}
          clearMarks={this.clearMarks}
        />
        <div id="test"></div>
      </ThemeProvider>
    )
  }
}

export default App;
