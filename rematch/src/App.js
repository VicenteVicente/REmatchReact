import React, { Component } from 'react';
import Editor from './components/editor'

const App = () => {
  const [marks, setMarks] = React.useState([
    {s: 0, e: 1}
  ]);
  const handleMarkUpdate = () => {
    setMarks([
      {s: 1, e: 3}
    ]);
  }
  return (
    <div>
      <h1 onClick={() => console.log}>REmatch test!</h1>
      <Editor label="textEditor" marks={marks} value="REmatch React is cool!"/>
      <Editor label="textEditor2" marks={marks} value="REmatch React is better!"/>
      <Editor label="textEditor2" marks={marks} value="REmatch React is easier!"/>
      <button onClick={handleMarkUpdate}>Switch mark!</button>
    </div>
  )
}

export default App;
