import React, {Component} from 'react';
import CodeMirror from 'codemirror';
import 'codemirror/addon/mode/simple';

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
        let markTest = this.props.marks[0];
        let markStart = this.editor.posFromIndex(markTest.s);
        let markEnd = this.editor.posFromIndex(markTest.e);
        this.editor.markText(
            markStart,
            markEnd,
            {
                className: 'marker',
            },
        )
    }
}

/* QUERY EDITOR */
export class QueryEditor extends Editor {
}

//export default Editor;