import React from 'react';
import {TextEditor, QueryEditor} from './components/editor'

const App = () => {
  const [marks, setMarks] = React.useState(null);
  const markUpdate = () => {
    setMarks([
      { s: 1, e: 9 }
    ]);
  }
  return (
    <div>
      <h1 onClick={() => console.log}>REmatch test!</h1>
      <QueryEditor
        label="queryEditor"
        mode="rematchQuery"
        value="!x{query}" 
        theme="monokai"
        lineNumbers={false}
        disableNewLine={true}
      />
      <TextEditor 
        label="textEditor"
        mode="text/plain"
        value="REmatch React is cool!" 
        theme="monokai"
        lineNumbers={true}
        disableNewLine={false}
        marks={marks}
      />
      <button onClick={markUpdate}>Switch mark!</button>
    </div>
  )
}

export default App;
