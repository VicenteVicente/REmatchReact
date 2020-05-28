import React, {Component} from 'react';
import Pagination from '@material-ui/lab/Pagination';

const PAGESIZE = 20;

const PaginationControlled = (props) => {
    const [page, setPage] = React.useState(1);
    const handleChange = (event, value) => {
      setPage(value);
      //props.setMarks
      props.handlePage(value);
    };
    
    return (
      <div>
        <Pagination count={props.total} page={page} onChange={handleChange} />
      </div>
    );
  }

const Result = (props) => {
    const mapping = props.spans.map( (span, idx) => (
        <span key={idx} className={`r${idx}`}>{span.m}</span>
    ));
    return (
        <div className="resultLine" onClick={() => props.setMarks(props.spans)}>{mapping}</div>
    )
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
            <div className="bottomContainer">
                <PaginationControlled className="paginationContainer" total={Math.ceil(this.props.list.length/PAGESIZE)} handlePage={this.handlePage.bind(this)}/>
                <div className="resultContainer">
                    {this.matches}
                </div>
            </div>
        )
    }
}

export default DynamicResults;