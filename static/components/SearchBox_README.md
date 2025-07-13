# SearchBox Component

The `SearchBox` component is a unified search interface that combines multiple search-related components into absolutely positioned tiles that overlay the map. This creates a modern, floating UI that allows users to see the map underneath while interacting with search controls.

## Features

- **Absolutely positioned tiles** that overlay the map
- **Transparent backgrounds** with backdrop blur for modern glass-morphism effect
- **Responsive design** that adapts to mobile and desktop screens
- **Smooth animations** for dropdown appearance
- **Hover effects** with subtle elevation changes
- **Non-intrusive** - allows map interactions to pass through when not hovering

## Components Included

1. **Search Bar** - Main search input with clear functionality
2. **Care Type Filter** - Dropdown for selecting care types (Hospital, ED, Outpatient, etc.)
3. **Sort Button** - Button for sorting results (customizable functionality)
4. **Filter Button** - Toggle for showing/hiding the care type filter

## Usage

```jsx
import SearchBox from './components/SearchBox';

// In your component
<SearchBox
  searchValue={searchTerm}
  onSearchChange={handleSearchChange}
  onSearchClear={handleSearchClear}
  selectedCareType={selectedCareType}
  onSelectCareType={handleCareTypeSelect}
  onSortClick={handleSortClick}
  placeholder="Search facilities or locations here"
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `searchValue` | string | Yes | Current search input value |
| `onSearchChange` | function | Yes | Handler for search input changes |
| `onSearchClear` | function | Yes | Handler for clearing search input |
| `selectedCareType` | string | Yes | Currently selected care type |
| `onSelectCareType` | function | Yes | Handler for care type selection |
| `onSortClick` | function | Yes | Handler for sort button clicks |
| `placeholder` | string | No | Placeholder text for search input (default: "Search facilities or locations here") |

## Styling

The component uses CSS with the following key features:

- **Backdrop blur** for modern glass effect
- **Semi-transparent backgrounds** (rgba(255, 255, 255, 0.85-0.95))
- **Box shadows** for depth and separation
- **Border radius** (30px) for rounded corners
- **Smooth transitions** for hover and animation effects
- **Responsive breakpoints** for mobile optimization

## Tile Positioning

- **Search Bar Tile**: Full width at the top
- **Filter Button Tile**: Right-aligned, below search bar
- **Sort Button Tile**: Right-aligned, below filter button
- **Care Type Filter Tile**: Left-aligned, below search bar (appears when filter is clicked)

## Integration Example

To replace the existing search components in your app:

```jsx
// Instead of separate components:
<CareTypeFilter selectedCareType={careType} onSelectCareType={handleSelect} />
<SearchButton searchTerm={term} onSearchInputChange={handleChange} />

// Use the unified SearchBox:
<SearchBox
  searchValue={term}
  onSearchChange={handleChange}
  onSearchClear={() => setTerm("")}
  selectedCareType={careType}
  onSelectCareType={handleSelect}
  onSortClick={handleSort}
/>
```

## Customization

You can customize the appearance by modifying `SearchBox.css`:

- Change tile positions by adjusting the `top`, `left`, `right` properties
- Modify transparency levels by changing the `rgba` values
- Adjust blur intensity by changing `backdrop-filter: blur()` values
- Customize animations by modifying the `@keyframes` rules

## Browser Support

- Modern browsers with CSS backdrop-filter support
- Fallback to solid backgrounds for older browsers
- Responsive design works across all screen sizes 