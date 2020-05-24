import React from 'react';
import CodeMirror from 'codemirror';

class Editor extends React.Component {
    componentDidUpdate(prevProps) {
        //this.editor.setValue(this.props.value);
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
    componentDidMount() {
        this.editor = CodeMirror(document.getElementById(this.props.label));
        this.editor.setValue(this.props.value);

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
    render() {
        return <div id={this.props.label}></div>;
    }
}
export default Editor;