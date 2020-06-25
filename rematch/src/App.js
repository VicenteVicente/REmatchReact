/**
 * TODO:
 * pagination
 * fixed editor and resizable layout
 * color scheme
 * hover
 * background color differed
 * bug pagination
 * cortar match con (...)
 * botón con más informacion (span, linea, char)
 * alertas material
 * Early outputs
 * download results
 */
import Logo from './assets/logo-dark.png';

import CodeMirror from 'codemirror';
import 'codemirror/theme/material-darker.css';
import 'codemirror/addon/mode/simple';

import React, { Component } from 'react';

import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from "@material-ui/core/CssBaseline";
import Button from '@material-ui/core/Button';
import { PlayArrow, Publish } from '@material-ui/icons';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import CircularProgress from '@material-ui/core/CircularProgress';
import Backdrop from '@material-ui/core/Backdrop';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import Pagination from '@material-ui/lab/Pagination';

const WORKPATH = `${process.env.PUBLIC_URL}/work.js`;
const CHUNKSIZE = 1*10**8; // 100MB
let worker = new Worker(WORKPATH);

/* CODEMIRROR MODE DEFINITION */
CodeMirror.defineSimpleMode('rematchQuery', {
  start: [
      { 
        regex: /(![A-Za-z0-9]+\{|\})/, 
        token: 'm0' 
      },
      { 
        regex: /(\\d)|(\\w)|(\\s)|(\\t)|(\\r)|(\\n)|(\\\()|(\\\))|(\\\[)|(\\\])|(\\\{)|(\\\})|(\\\.)|(\\-)|(\\_)/i,
        token: 'm2' 
      },
      { 
        regex: /(\(|\)|\||\[|\]|-)/, 
        token: 'm3'
      },
      { 
        regex: /(\.\+|\.\*|\.|\+)/, 
        token: 'm1' 
      },
  ]
});

/* MATERIAL UI DARK THEME */
const darkTheme = createMuiTheme({
  palette: {
      type: 'dark',
      primary: {
        main: '#03DAC6',
      },
      background: {
        paper: '#212121',
        default: '#2c2c2c',
      }
    },
});

const SectionTitle = ({title}) => (
  <div className="sectionTitle" style={{backgroundColor: '#03DAC6'}}>{title}</div>
)

class ResultsTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 0,
      rowsPerPage: 25,
    }
  }

  handleChangePage = (_, newPage) => {
    this.setState({page: newPage-1});
  }

  handleChangeRowsPerPage = (event) => {
    this.setState({
      rowsPerPage: event.target.value,
      page: 0,
    });
  }

  handleMarkText = (row) => {
    this.props.clearMarks();
    this.props.addMarks(row);
  }

  UNSAFE_componentWillReceiveProps(_) {
    this.setState({page: 0});
  }

  render() {
    const {schema, spanList, textEditor} = this.props;
    return ([
      <Grid container spacing={0}>
        <Grid item xs={10} style={{display: 'flex', alignItems: 'center', margin: '.25rem 0'}}>
          <Pagination
            page={this.state.page+1}
            style={{display: 'block'}}
            count={Math.ceil(spanList.length/this.state.rowsPerPage)} 
            onChange={this.handleChangePage}
            showFirstButton 
            showLastButton/>
        </Grid>
        <Grid item xs={2} style={{display: 'flex', alignItems: 'center'}}>
            <Select
                style={{width: '100%'}}
                value={this.state.rowsPerPage}
                labelId="demo-simple-select-label"
                onChange={this.handleChangeRowsPerPage}>
                <MenuItem value={10}>10 rows per page</MenuItem>
                <MenuItem value={25}>25 rows per page</MenuItem>
                <MenuItem value={50}>50 rows per page</MenuItem>
                <MenuItem value={100}>100 rows per page</MenuItem>
            </Select>
        </Grid>
      </Grid>,
      <TableContainer style={{height: '40vh', oveflow: 'auto'}}>
        <Table stickyHeader size="small">
          <colgroup>
            {schema.map((_, schIdx) => (
              <col key={schIdx} style={{width: `${100*1/schema.length}%`}}/>
            ))}          
          </colgroup>
          <TableHead>
            {(spanList.length>0)
            ? <TableRow>
                {schema.map((name, idxHead) => (
                  <TableCell className={`th${idxHead}`} key={idxHead}>
                    {name}
                  </TableCell>
                ))}
              </TableRow>
            : <TableRow>
                <TableCell>
                  No matches
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
                  <TableCell
                    key={idxCol}>
                    {textEditor.getRange(
                      textEditor.posFromIndex(col.s),
                      textEditor.posFromIndex(col.e))}
                  </TableCell>
                ))}
              </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>]
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
      uploadingFile: false,
      fileProgress: 0,
    };
  }
  componentDidMount() {
    let queryEditor = CodeMirror(document.getElementById('queryEditor'), {
      value: '!a{RE}!b{[a-z]+} !c{[a-z]+}!d{!}',
      mode: 'rematchQuery',
      theme: 'material-darker',
      lineNumbers: false,
      scrollbarStyle: null,
      smartIndent: false,
      indentWithTabs: true,
      showInvisibles: false,
      undoDepth: 100,
      viewportMargin: 10,
      extraKeys: {
        'Enter': this.runWorker,
      }
    });
    queryEditor.on('beforeChange', (instance, change) => {
      if (!["undo", "redo"].includes(change.origin)) {
        let line = change.text.join("").replace(/\n/g, "");
        change.update(change.from, change.to, [line]);
      }
      return true;
    });
    let textEditor = CodeMirror(document.getElementById('textEditor'), {
      value: 
`REmatch cool!
REmatch awesome!
REmatch nice!
REmatch best!
`,
      mode: 'text/plain',
      theme: 'material-darker',
      lineNumbers: true,
      scrollbarStyle: 'native',
      smartIndent: false,
      indentWithTabs: true,
      showInvisibles: true,
      undoDepth: 100,
      viewportMargin: 15,
    });
    this.setState({
      queryEditor, 
      textEditor,
    });
  }

  addMarks = (spans) => {
    let start, end;
    spans.forEach((span, idx) => {
      start = this.state.textEditor.posFromIndex(span.s);
      end = this.state.textEditor.posFromIndex(span.e);
      
      this.state.textEditor.markText(start, end, {
          className: `m${idx}`,
        }
      );
    });
    this.state.textEditor.scrollIntoView(start, 200);
  }
  clearMarks = () => {
    this.state.textEditor.getAllMarks().forEach((mark) => {
      mark.clear();
    });
  }
  handleFile = async (event) => {
    let file = event.target.files[0];
    if (!file) {return};
    this.state.textEditor.setValue('');
    this.clearMarks();
    this.setState({spanList: [], schema: [], uploadingFile: true, fileProgress: 0});
    let start = 0;
    let end = CHUNKSIZE;
    while (start < file.size) {
        await file.slice(start, end).text()
          // eslint-disable-next-line no-loop-func
          .then((textChunk) => {
            this.setState({fileProgress: Math.round(100*100*start/file.size)/100})
            this.state.textEditor.replaceRange(textChunk, { line: Infinity });
            start = end;
            end += CHUNKSIZE;
          });
    }
    console.log('upload done');
    this.setState({uploadingFile: false})
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
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
          <Container className="container">
           <img className="logo" src={Logo} alt="REmatch"/>
            <Paper elevation={3}>
              <Backdrop open={this.state.uploadingFile} style={{zIndex: 10000, display: 'flex', flexDirection: 'column'}}>
                <CircularProgress size='3rem'/>
                <h2 style={{color: '#fff'}}>Loading ({this.state.fileProgress}%)</h2>
              </Backdrop>
              <Grid container spacing={0}>
                {/* Expression */}
                <Grid item xs={12}>
                  <SectionTitle title="Expression"/>
                </Grid>
                <Grid item xs={11}>
                  <div id="queryEditor"></div>
                </Grid>
                <Grid item xs={1}>
                  <Button color="primary" startIcon={<PlayArrow/>} onClick={this.runWorker} style={{width: '100%', background: 'none !important'}}>
                      Run
                  </Button>
                </Grid>
                {/* EDITOR */}
                <Grid item xs={12}>
                  <SectionTitle title="Text"/>
                </Grid>
                <Grid item xs={12}>
                  <div id="textEditor">
                    <input accept="*" id="fileInput" type="file" style={{display: 'none'}} onChange={this.handleFile}/>
                    <label htmlFor="fileInput">
                      <Tooltip title="Upload a file">
                        <Button size="medium" variant="contained" component="span" color="primary" className="uploadButton">
                          <Publish/>
                        </Button>
                      </Tooltip>
                    </label>
                  </div>
                </Grid>
                {/* RESULTS */}
                <Grid item xs={12}>
                  <SectionTitle title="Matches"/>
                </Grid>
                <Grid item xs={12}>
                  <ResultsTable 
                    spanList={this.state.spanList} 
                    schema={this.state.schema} 
                    textEditor={this.state.textEditor} 
                    addMarks={this.addMarks}
                    clearMarks={this.clearMarks}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Container>
      </ThemeProvider>
    )
  }
}

export default App;
