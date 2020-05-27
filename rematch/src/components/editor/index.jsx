import React, {Component} from 'react';
import CodeMirror from 'codemirror';
import 'codemirror/addon/mode/simple';


const MARKCOLORS = [
    "m0",
    "m1",
    "m2",
    "m3", 
    "m4",
];

/* MODE DEFINITION */
CodeMirror.defineSimpleMode("rematchQuery", {
    start: [
        { regex: /(\.\+|\.\*|\.|\+)/, token: "keyword" },
        { regex: /(\\d)|(\\w)|(\\s)|(\\t)|(\\r)|(\\n)|(\\\()|(\\\))|(\\\[)|(\\\])|(\\\{)|(\\\})|(\\\.)|(\\-)|(\\_)/i, token: "string" },
        { regex: /(![A-Za-z0-9]+\{|\})/, token: "number" },
        { regex: /(\(|\)|\||\[|\]|-)/, token: "operator" }
    ]
});

/* GENERAL EDITOR CONFIGURATION */
class Editor extends Component {
    componentDidMount() {
        this.editor = CodeMirror(document.getElementById(this.props.label), {
            mode: this.props.mode,
            theme: this.props.theme,
            lineNumbers: this.props.lineNumbers,
            scrollbarStyle: this.props.scrollbarStyle,
            smartIndent: false,
            indentWithTabs: true,
            showInvisibles: false,
            undoDepth: 100,
            viewportMargin: 10, // Lines rendered up and down [MEMORY]
        });
        this.editor.setValue(this.props.value);

        if (this.props.disableNewLine) {
            this.editor.on('beforeChange', function(instance, change) {
                var line = change.text.join("").replace(/\n/g, "");
                change.update(change.from, change.to, [line]);
                return true;
            });
        }
    }
    render() {
        return <div id={this.props.label}></div>;
    }
}

/* TEXT EDITOR */
export class TextEditor extends Editor {
    componentDidUpdate(prevProps) {
        if (this.props.marks.length !== 0) {
            this.props.marks.forEach((m, idx) => {
                this.editor.markText(
                    this.editor.posFromIndex(m.s),
                    this.editor.posFromIndex(m.e),
                    { className: MARKCOLORS[idx]},
                )
            })
        }
    }
}

/* QUERY EDITOR */
export class QueryEditor extends Editor {
}

//export default Editor;