import React, {Component} from 'react';

const Result = (props) => {
    const spans = props.spans;
    const mapping = props.spans.map( (span, idx) => (
        <span key={idx}>{span.m}</span>
    ));
    return (
        <button onClick={() => props.test(props.spans)}>{mapping}</button>
    )
}

class DynamicResults extends Component {    
    render() {
        const test = this.props.list.map( (spans, idx) => (
            <Result key={idx} spans={spans} test={this.props.test}/>
        ))
        return (
            <div style={{backgroundColor: 'gray'}}>
                {test}
            </div>
        )
    }
}

export default DynamicResults;