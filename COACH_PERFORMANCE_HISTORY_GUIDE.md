# AI Coach Performance History System
## Complete User & Developer Guide

> **Track weekly, monthly, and all-time trends for each AI prediction coach**
> 
> **Key Features:**
> - Interactive line charts with customizable time periods
> - Weekly, monthly, and all-time performance tracking
> - Compare multiple coaches simultaneously
> - Detailed statistics and trend analysis
> - Export data functionality
> - Freemium access control integration

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [File Structure](#file-structure)
4. [Integration Guide](#integration-guide)
5. [Usage Examples](#usage-examples)
6. [Customization](#customization)
7. [API Reference](#api-reference)
8. [Data Structure](#data-structure)

---

## Overview

The Coach Performance History system provides comprehensive trend analysis for all 5 AI prediction coaches:

- **Quantum AI** (FREE) - Statistical analysis specialist
- **Sharp Edge AI** (PRO) - Line movement expert
- **Neural Net AI** (PRO) - Deep learning powerhouse
- **Value Hunter AI** (VIP) - Expected value optimizer
- **Momentum AI** (VIP) - Live betting specialist

Users can track performance metrics across different time periods, compare multiple coaches, and identify trends to make informed decisions about which premium coaches to unlock.

---

## Features

### Time Period Selection
- **Weekly View**: Last 12 weeks of performance
- **Monthly View**: Last 6 months of performance
- **All-Time View**: Complete historical statistics

### Performance Metrics
- **Win Rate %**: Percentage of winning predictions
- **ROI %**: Return on investment percentage
- **Units Won**: Total units profit/loss

### Interactive Charts
- Multi-line chart comparing selected coaches
- Color-coded lines for each coach
- Interactive data points with tooltips
- Smooth animations and transitions
- Responsive grid overlay

### Coach Selection
- Checkbox system to toggle coaches on/off
- "Select All" / "Deselect All" functionality
- Visual indicators for locked coaches
- Access control based on subscription tier

### Statistics Cards
- Average win rate with trend indicators
- Average ROI with trend indicators
- Total units won/lost
- Total picks tracked
- "View Details" buttons for deep dives

### Performance Table
- Period-by-period breakdown
- Win/loss records for each period
- Side-by-side coach comparison
- All-time statistics including best/worst weeks
- Sortable columns

### Data Export
- Export performance data as JSON
- Includes selected time period and coaches
- One-click download functionality

---

## File Structure

```
coach-performance-history.js       # Main component logic
coach-performance-history-styles.css   # Styling and animations
coach-performance-demo.html        # Standalone demo page
```

### Dependencies
- `ai-prediction-engine.js` - Coach data and configurations
- `stripe-integration.js` - Subscription tier checking
- `paywall-system.js` - Upgrade prompts for locked features

---

## Integration Guide

### Step 1: Include CSS
Add to your HTML `<head>`:

```html
<link rel="stylesheet" href="coach-performance-history-styles.css">
```

### Step 2: Import Module
In your JavaScript:

```javascript
import { coachPerformanceHistory } from './coach-performance-history.js';
```

### Step 3: Render Component
Render into a container:

```javascript
// By container ID
coachPerformanceHistory.render('container-id');

// Or by element reference
const container = document.getElementById('performance-history');
coachPerformanceHistory.render(container);
```

### Step 4: Add to AI Coaches Page
To integrate with the AI Coaches dashboard:

```javascript
// In ai-coaching-dashboard.js or similar
import { coachPerformanceHistory } from './coach-performance-history.js';

// Add a section to your coaching page
const historySection = document.createElement('div');
historySection.id = 'performance-history-section';
document.getElementById('coaching-content').appendChild(historySection);

// Render the performance history
coachPerformanceHistory.render(historySection);
```

---

## Usage Examples

### Example 1: Basic Rendering
```javascript
import { coachPerformanceHistory } from './coach-performance-history.js';

// Render into page
coachPerformanceHistory.render('performance-container');
```

### Example 2: Access Control Demo
```javascript
import { coachPerformanceHistory } from './coach-performance-history.js';
import { stripeIntegration } from './stripe-integration.js';

// Simulate VIP access for demo
stripeIntegration.simulateSubscription('vip');

// Render - all coaches unlocked
coachPerformanceHistory.render('performance-container');

// Later: Switch to free mode
stripeIntegration.clearSubscription();
coachPerformanceHistory.render('performance-container'); // Re-render
```

### Example 3: Export Data
The export button is built-in, but you can trigger it programmatically:

```javascript
// Export current view data
coachPerformanceHistory.exportData();
```

### Example 4: Change Default View
```javascript
// Set default to monthly view
coachPerformanceHistory.currentView = 'monthly';
coachPerformanceHistory.render('container');
```

---

## Customization

### Change Color Scheme
In `coach-performance-history.js`, modify the `getCoachColor()` method:

```javascript
getCoachColor(coachId) {
    const colors = {
        quantum: '#00d4ff',    // Cyan
        sharp: '#ff6b35',      // Orange
        neural: '#7b2cbf',     // Purple
        value: '#00c853',      // Green
        momentum: '#ffd700'    // Gold
    };
    return colors[coachId] || '#666';
}
```

### Adjust Time Periods
Modify historical data generation:

```javascript
// In constructor
this.historicalData = this.generateHistoricalData();

// Change weeks/months
generateWeeklyData(baseWinRate, baseROI, 24) // 24 weeks instead of 12
generateMonthlyData(baseWinRate, baseROI, 12) // 12 months instead of 6
```

### Custom Metrics
Add new metrics to track:

```javascript
// In generateWeeklyData()
data.push({
    period: this.formatWeek(date),
    date: date,
    winRate: parseFloat(winRate.toFixed(1)),
    roi: parseFloat(roi.toFixed(1)),
    units: parseFloat((roi / 10).toFixed(2)),
    picks: Math.floor(15 + Math.random() * 10),
    // Add custom metric
    avgOdds: parseFloat((Math.random() * 100 + 100).toFixed(0))
});
```

### Change Chart Height
In `renderChart()`:

```javascript
renderChart() {
    const chartHeight = 500; // Change from 400 to 500
    // ... rest of method
}
```

---

## API Reference

### Class: CoachPerformanceHistory

#### Constructor
```javascript
new CoachPerformanceHistory()
```

Initializes the performance history system with:
- Historical data for all 5 coaches
- Default view settings (weekly)
- Default metric (winRate)

#### Properties
- `engine` - Reference to AIPredictionEngine instance
- `historicalData` - Generated historical performance data
- `currentView` - Current time period ('weekly', 'monthly', 'all-time')
- `currentMetric` - Current metric displayed ('winRate', 'roi', 'units')
- `selectedCoaches` - Array of coach IDs currently shown

#### Methods

##### `render(container)`
Renders the complete performance history UI.

**Parameters:**
- `container` (String|Element) - Container ID or DOM element

**Example:**
```javascript
coachPerformanceHistory.render('performance-history');
```

---

##### `generateHistoricalData()`
Generates mock historical data for all coaches.

**Returns:** Object with coach IDs as keys, each containing:
- `weekly` - Array of weekly performance data
- `monthly` - Array of monthly performance data
- `allTime` - Object with aggregate statistics

---

##### `getChartData()`
Gets formatted data for the current chart view.

**Returns:** Array of objects, each containing:
- `coachId` - Coach identifier
- `coach` - Coach object with metadata
- `data` - Array of performance data points

---

##### `getCurrentPeriodData(coachId)`
Gets performance data for a specific coach in the current period.

**Parameters:**
- `coachId` (String) - Coach identifier

**Returns:** Object with:
- `avgWinRate` - Average win rate percentage
- `avgROI` - Average ROI percentage
- `totalUnits` - Total units won/lost
- `totalPicks` - Total number of picks
- `latest` - Most recent period data

---

##### `calculateTrend(coachId)`
Calculates performance trend for a coach.

**Parameters:**
- `coachId` (String) - Coach identifier

**Returns:** Object with:
- `winRate` - Change in win rate from previous period
- `roi` - Change in ROI from previous period

---

##### `exportData()`
Exports current view data as JSON file.

**Example:**
```javascript
coachPerformanceHistory.exportData();
// Downloads: coach-performance-weekly-1704924000000.json
```

---

##### `hasCoachAccess(coach)`
Checks if user has access to a specific coach.

**Parameters:**
- `coach` (Object) - Coach object

**Returns:** Boolean

---

## Data Structure

### Historical Data Format

#### Weekly/Monthly Data Point
```javascript
{
    period: "1/1 - 1/7",        // Human-readable period
    date: Date,                  // JavaScript Date object
    winRate: 68.5,              // Win rate percentage
    roi: 8.3,                   // ROI percentage
    units: 0.83,                // Units won
    picks: 20,                  // Total picks
    wins: 14,                   // Winning picks
    losses: 6                   // Losing picks
}
```

#### All-Time Data Format
```javascript
{
    totalPicks: 1200,           // Total predictions made
    totalWins: 780,             // Total winning predictions
    totalLosses: 420,           // Total losing predictions
    totalUnits: 85.6,           // Total units profit
    avgWinRate: 65.0,           // Average win rate
    avgROI: 7.1,                // Average ROI
    bestWeek: {                 // Best performing week
        date: "2024-01-15",
        winRate: 91.7,
        units: 8.5
    },
    worstWeek: {                // Worst performing week
        date: "2023-12-04",
        winRate: 54.2,
        units: -1.2
    }
}
```

---

## Styling Guide

### CSS Custom Properties
Key CSS variables used:

```css
--primary: #00d4ff;           /* Primary accent color */
--secondary: #7b2cbf;         /* Secondary accent color */
--success: #00c853;           /* Positive values */
--error: #ff5252;             /* Negative values */
--background: #1a1a2e;        /* Main background */
--surface: rgba(255,255,255,0.05); /* Card backgrounds */
```

### Key CSS Classes

- `.coach-performance-history` - Main container
- `.performance-header` - Header section
- `.period-selector` - Time period buttons
- `.metric-selector` - Metric selection controls
- `.chart-container` - Chart wrapper
- `.chart-area` - SVG chart area
- `.chart-line` - Individual coach line
- `.chart-point` - Interactive data points
- `.stat-card` - Coach statistic cards
- `.performance-table` - Data table

---

## Mobile Responsiveness

The component is fully responsive with breakpoints at:

- **1024px**: Adjusts grid layouts
- **768px**: Stacks header elements, reduces chart height
- **480px**: Single-column layout, compact table view

---

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## Performance Considerations

### Optimization Tips

1. **Lazy Loading**: Only render when user navigates to performance page
2. **Data Caching**: Historical data is generated once on initialization
3. **Selective Re-rendering**: Only updates affected sections on filter changes
4. **SVG Performance**: Uses single SVG element for all lines

### Memory Usage
Approximate memory footprint:
- Historical data: ~50KB
- DOM elements: Varies by selected coaches (typically 100-200 elements)

---

## Troubleshooting

### Chart Not Displaying
**Issue**: Chart area is blank
**Solution**: Ensure at least one coach is selected

### Locked Coaches Not Showing
**Issue**: All coaches appear unlocked
**Solution**: Check that stripe-integration.js is properly imported and initialized

### Export Not Working
**Issue**: Download doesn't start
**Solution**: Check browser's download settings and popup blockers

### Tooltip Not Appearing
**Issue**: Hovering over data points doesn't show tooltip
**Solution**: Verify chart-tooltip class exists in CSS

---

## Future Enhancements

Potential features for future versions:

1. **Real-Time Updates**: Live data streaming from backend
2. **Advanced Filtering**: Filter by sport, bet type, odds range
3. **Prediction Accuracy**: Track actual vs predicted outcomes
4. **Confidence Intervals**: Show statistical confidence bands
5. **Comparative Analytics**: Compare against user's own performance
6. **Social Features**: Share performance charts
7. **Notifications**: Alert when coach hits certain thresholds
8. **Historical Playback**: "Replay" performance over time

---

## Demo Access

Try the standalone demo:

```
coach-performance-demo.html
```

Features:
- Toggle between FREE and VIP modes
- All interactive features enabled
- Mock data for demonstration
- Navigation to other demo pages

---

## Integration Checklist

- [ ] Include CSS stylesheet
- [ ] Import JavaScript module
- [ ] Add container element to page
- [ ] Call render() method
- [ ] Test access control with different subscription tiers
- [ ] Verify chart displays correctly on mobile
- [ ] Test export functionality
- [ ] Customize colors/styling as needed
- [ ] Add to navigation menu
- [ ] Test with real user data (when available)

---

## Support & Feedback

For questions or issues:
1. Check this documentation
2. Review demo implementation
3. Inspect browser console for errors
4. Check access control settings

---

**Last Updated**: January 2024
**Version**: 1.0.0
**Component**: AI Coach Performance History System
