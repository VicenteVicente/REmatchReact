import React from 'react';

import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

const SectionTitle = ({ title }) => (
  <Typography variant="body2" component="div" style={{
    color: '#000000',
    backgroundColor: '#03DAC6',
    padding: '.4rem 0 .4rem 1rem',
  }}>
    <Box fontWeight="fontWeightBold">
      {title}
    </Box>
  </Typography>
)

export default SectionTitle;