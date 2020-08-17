import React, { useState, useEffect } from 'react';

import Grid from '@material-ui/core/Grid';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Pagination from '@material-ui/lab/Pagination';

const ResultsTable = ({
  matches,
  schema,
  textEditor,
  addMarks,
  clearMarks
}) => {
  const [state, setState] = useState({
    page: 0,
    rowsPerPage: 25,
  });

  const handleChangePage = (_, newPage) => {
    setState((prevState) => ({ ...prevState, page: newPage - 1 }));
  }

  const handleChangeRowsPerPage = (e) => {
    setState({ page: 0, rowsPerPage: e.target.value });
  }

  const handleMarkText = (row) => {
    clearMarks();
    addMarks(row);
  }

  useEffect(() => {
    if (matches.length === 0) {
      setState((prevState) => ({ ...prevState, page: 0 }));
    }
  }, [matches]);

  return (
    <>
      <Grid container>
        <Grid item md={10} sm={8} xs={12} style={{ padding: '.5rem 0', display: 'flex', alignItems: 'center' }}>
          <Pagination
            page={state.page + 1}
            style={{ display: 'block' }}
            count={Math.ceil(matches.length / state.rowsPerPage)}
            onChange={handleChangePage}
          />
        </Grid>
        <Grid item md={2} sm={4} xs={12} style={{ padding: '.5rem', display: 'flex', alignItems: 'center' }}>
          <Select
            style={{width: '100%'}}
            value={state.rowsPerPage}
            labelId="demo-simple-select-label"
            onChange={handleChangeRowsPerPage}>
            <MenuItem value={10}>10 rows per page</MenuItem>
            <MenuItem value={25}>25 rows per page</MenuItem>
            <MenuItem value={50}>50 rows per page</MenuItem>
            <MenuItem value={100}>100 rows per page</MenuItem>
          </Select>
        </Grid>
      </Grid>
      <TableContainer style={{ height: '40vh', oveflow: 'auto' }}>
        <Table stickyHeader size="small">
          <colgroup>
            {schema.map((_, schIdx) => (
              <col key={schIdx} style={{ width: `${100 * 1 / schema.length}%` }} />
            ))}
          </colgroup>
          <TableHead>
            {(matches.length > 0)
              ? <TableRow>
                {schema.map((name, idxHead) => (
                  <TableCell className={`th${idxHead}`} key={idxHead}>
                    {name}
                  </TableCell>
                ))}
              </TableRow>
              :
              <TableRow>
                <TableCell style={{ backgroundColor: 'transparent' }}>
                  No matches
                </TableCell>
              </TableRow>
            }
          </TableHead>
          <TableBody>
            {(state.rowsPerPage > 0
              ? matches.slice(
                state.page * state.rowsPerPage,
                state.page * state.rowsPerPage + state.rowsPerPage)
              : matches).map((row, idxRow) => (
                <TableRow key={idxRow} hover style={{ cursor: 'pointer' }} onClick={() => handleMarkText(row)}>
                  {row.map((col, idxCol) => {
                    let match = textEditor.getRange(textEditor.posFromIndex(col[0]), textEditor.posFromIndex(col[1]));
                    return (
                      <TableCell key={idxCol} style={{ padding: 0 }}>
                        <div style={{ padding: '6px 24px 6px 16px' }}>
                          {(match.length > 36)
                            ? match.slice(0, 36) + '...'
                            : match}
                        </div>
                      </TableCell>)
                  }
                  )}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer >
    </>
  )
}

export default ResultsTable;