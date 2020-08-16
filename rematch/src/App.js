import React, { Component } from 'react';

/* MaterialUI */
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from "@material-ui/core/CssBaseline";
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Backdrop from '@material-ui/core/Backdrop';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';

import { PlayArrow, Publish } from '@material-ui/icons';

/* Project Components */
import SectionTitle from './components/SectionTitle';
import ResultsTable from './components/ResultsTable';

/* CodeMirror */
import CodeMirror from 'codemirror';
import 'codemirror/theme/material-darker.css';
import 'codemirror/addon/mode/simple';

/* Assets */
import Logo from './assets/logo-dark.png';

const WORKPATH = `${process.env.PUBLIC_URL}/work.js`;
const CHUNKSIZE = 1 * 10 ** 8; // 100MB
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
      default: '#353535',
    }
  },
});

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
      value: '!a{[A-Z][a-z]+} !b{is} !c{..} !d{ex[a-z]+} !e{.+}!f{!}',
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
      value: 'This is an example text!',
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
    if (!file) { return };
    this.state.textEditor.setValue('');
    this.clearMarks();
    this.setState({ spanList: [], schema: [], uploadingFile: true, fileProgress: 0 });
    let start = 0;
    let end = CHUNKSIZE;
    while (start < file.size) {
      await file.slice(start, end).text()
        // eslint-disable-next-line no-loop-func
        .then((textChunk) => {
          this.setState({ fileProgress: Math.round(100 * 100 * start / file.size) / 100 })
          this.state.textEditor.replaceRange(textChunk, { line: Infinity });
          start = end;
          end += CHUNKSIZE;
        });
    }
    console.log('upload done');
    this.setState({ uploadingFile: false })
  }

  runWorker = () => {
    console.log('STARTED');
    this.clearMarks();
    this.setState({ spanList: [], schema: [] });
    worker.postMessage({
      text: this.state.textEditor.getValue(),
      query: this.state.queryEditor.getValue(),
    });
    worker.onmessage = (m) => {
      switch (m.data.type) {
        case 'SCHEMA':
          this.setState({ schema: m.data.schema });
          break;
        case 'SPANS':
          this.setState((prevState, _) => ({ spanList: [...prevState.spanList, ...m.data.spans] }));
          break;
        case 'LAST_SPANS':
          this.setState((prevState, _) => ({ spanList: [...prevState.spanList, ...m.data.spans] }));
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
          <Backdrop
            open={this.state.uploadingFile} 
            style={{ zIndex: 6000, display: 'flex', flexDirection: 'column' }}
          >
            <CircularProgress color="primary" size="3rem"/>
            <h2 style={{ color: '#fff' }}>Loading ({this.state.fileProgress}%)</h2>
          </Backdrop>
          <img className="logo" src={Logo} alt="REmatch" />
          <Paper elevation={5} style={{ overflow: 'hidden' }}>

            <Grid container>
              {/* Expression */}
              <Grid item xs={12}>
                <SectionTitle title="Expression" />
              </Grid>

              <Grid item sm={10} xs={8}>
                <div id="queryEditor"></div>
              </Grid>

              <Grid item sm={2} xs={4}>
                <Tooltip title="Run query">
                <Button 
                  color="primary" 
                  variant="text"
                  startIcon={<PlayArrow />} 
                  onClick={this.runWorker} 
                  style={{ 
                    width: '100%',
                    height: '100%',
                    }}>
                  Run
                </Button>
                </Tooltip>
              </Grid>

              {/* EDITOR */}
              <Grid item xs={12}>
                <SectionTitle title="Text" />
              </Grid>

              <Grid item xs={12}>
                <div id="textEditor">
                  <input accept="*" id="fileInput" type="file" style={{ display: 'none' }} onChange={this.handleFile} />
                  <label htmlFor="fileInput">
                    <Tooltip title="Upload a file">
                      <Button size="medium" variant="contained" component="span" color="primary" className="uploadButton">
                        <Publish />
                      </Button>
                    </Tooltip>
                  </label>
                </div>
              </Grid>

              {/* RESULTS */}

              <Grid item xs={12}>
                <SectionTitle title="Matches" />
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
