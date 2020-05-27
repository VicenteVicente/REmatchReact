import React, {Component} from 'react';

const PAGESIZE = 100;

const Result = (props) => {
    const spans = props.spans;
    const mapping = props.spans.map( (span, idx) => (
        <span key={idx}>{span.m}</span>
    ));
    return (
        <button className="resultLine" onClick={() => props.setMarks(props.spans)}>{mapping}</button>
    )
}

const PageButtons = (props) => {
    console.log("render buttons");
    const buttons = [];
    console.log(props.total);
    for (let i=1; i<props.total+1; i++) {
        console.log(i);
        buttons.push(<button onClick={() => props.handlePage(i)}>{i}</button>);
    }
    return buttons;
}

class DynamicResults extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currPage: 1,
        };
    }
    handlePage(n) {
        this.setState({currPage: n});
    }
    render() {
        this.matches = this.props.list.slice(
            (this.state.currPage - 1)*PAGESIZE,
            (this.state.currPage)*PAGESIZE).map( (spans, idx) => (
            <Result key={idx} spans={spans} setMarks={this.props.setMarks}/>
        ))
        return (
            <div style={{backgroundColor: 'gray'}}>
                <PageButtons total={Math.ceil(this.props.list.length/PAGESIZE)} handlePage={this.handlePage.bind(this)}/>
                {this.matches}
            </div>
        )
    }
}

export default DynamicResults;