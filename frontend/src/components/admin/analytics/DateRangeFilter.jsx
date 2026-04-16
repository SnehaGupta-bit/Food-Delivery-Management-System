import { useState } from 'react';
import { 
  FormControl, 
  Select, 
  MenuItem, 
  Box, 
  Typography,
  Popover,
  Button
} from '@mui/material';
import { DateRange, CalendarToday } from '@mui/icons-material';
import { motion } from 'framer-motion';

const DateRangeFilter = ({ value, onChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [customRange, setCustomRange] = useState({
    start: '',
    end: ''
  });

  const dateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const handleCustomRangeClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCustomRangeClose = () => {
    setAnchorEl(null);
  };

  const handleRangeChange = (newValue, event) => {
    if (newValue === 'custom') {
      handleCustomRangeClick(event);
    } else {
      onChange(newValue);
    }
  };

  const applyCustomRange = () => {
    if (customRange.start && customRange.end) {
      onChange(`${customRange.start}_${customRange.end}`);
      handleCustomRangeClose();
    }
  };

  return (
    <Box className="date-range-filter">
      <FormControl size="small" className="date-range-select">
        <Select
          value={value}
          onChange={(e) => handleRangeChange(e.target.value, e)}
          displayEmpty
          startAdornment={<CalendarToday style={{ fontSize: '18px', marginRight: '8px' }} />}
          className="date-select"
        >
          {dateRanges.map((range) => (
            <MenuItem key={range.value} value={range.value}>
              {range.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Custom Date Range Popover */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleCustomRangeClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        className="custom-date-popover"
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="custom-date-content"
        >
          <Typography variant="subtitle2" className="custom-date-title">
            Select Custom Date Range
          </Typography>
          
          <Box className="date-inputs">
            <Box className="date-input-group">
              <Typography variant="caption">Start Date</Typography>
              <input
                type="date"
                value={customRange.start}
                onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                className="date-input"
              />
            </Box>
            
            <Box className="date-input-group">
              <Typography variant="caption">End Date</Typography>
              <input
                type="date"
                value={customRange.end}
                onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                className="date-input"
              />
            </Box>
          </Box>
          
          <Box className="date-actions">
            <Button 
              variant="outlined" 
              size="small" 
              onClick={handleCustomRangeClose}
              className="date-cancel-btn"
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              size="small" 
              onClick={applyCustomRange}
              disabled={!customRange.start || !customRange.end}
              className="date-apply-btn"
            >
              Apply
            </Button>
          </Box>
        </motion.div>
      </Popover>
    </Box>
  );
};

export default DateRangeFilter;