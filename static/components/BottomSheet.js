import React, { useState, useRef, useCallback, useEffect } from 'react';
import './BottomSheet.css';
function BottomSheet(props) {
  const { children, onHeightChange } = props;
  const [height, setHeight] = useState(30);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(30);
  const sheetRef = useRef(null);
  
  const SNAP_POINTS = [30, 80];
  const MIN_HEIGHT = 20;
  const MAX_HEIGHT = 80;

  function findClosestSnapPoint(currentHeight) {
    return SNAP_POINTS.reduce(function(closest, snapPoint) {
      return Math.abs(snapPoint - currentHeight) < Math.abs(closest - currentHeight)
        ? snapPoint
        : closest;
    });
  }

  function handleDragStart(clientY) {
    setIsDragging(true);
    setStartY(clientY);
    setStartHeight(height);
    document.body.style.userSelect = 'none';
  }

  function handleDragMove(clientY) {
    if (!isDragging) return;
    
    const deltaY = startY - clientY;
    const viewportHeight = window.innerHeight;
    const deltaPercent = (deltaY / viewportHeight) * 100;
    const newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, startHeight + deltaPercent));
    
    setHeight(newHeight);
    if (onHeightChange) {
      onHeightChange(newHeight);
    }
  }

  function handleDragEnd() {
    if (!isDragging) return;
    
    setIsDragging(false);
    document.body.style.userSelect = '';
    
    const targetHeight = findClosestSnapPoint(height);
    setHeight(targetHeight);
    if (onHeightChange) {
      onHeightChange(targetHeight);
    }
  }

  function handleMouseDown(e) {
    // Only handle mouse down on the drag handle area
    const target = e.target;
    const isDragHandle = target.closest('.drag-handle-container');
    
    if (isDragHandle) {
      e.preventDefault();
      handleDragStart(e.clientY);
    }
  }

  function handleTouchStart(e) {
    // Only handle touch start on the drag handle area
    const target = e.target;
    const isDragHandle = target.closest('.drag-handle-container');
    
    if (isDragHandle) {
      // Prevent any default behavior when starting drag
      e.preventDefault();
      handleDragStart(e.touches[0].clientY);
    }
  }

  useEffect(function() {
    function handleMouseMove(e) {
      handleDragMove(e.clientY);
    }

    function handleMouseUp() {
      handleDragEnd();
    }

    function handleTouchMove(e) {
      if (isDragging) {
        e.preventDefault();
        handleDragMove(e.touches[0].clientY);
      }
      // If not dragging, allow normal touch behavior for scrolling
    }

    function handleTouchEnd() {
      if (isDragging) {
        handleDragEnd();
      }
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      
      return function() {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, startY, startHeight, height]);

  function snapTo(targetHeight) {
    setHeight(targetHeight);
    if (onHeightChange) {
      onHeightChange(targetHeight);
    }
  }

  const transformY = 100 - height;

  return (
    <div
      ref={sheetRef}
      className={isDragging ? 'bottom-sheet dragging' : 'bottom-sheet not-dragging'}
      style={{
        transform: `translateY(${transformY}%)`
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div className="drag-handle-container">
        <div className="drag-handle" />
      </div>
      
      <div className="sheet-content">
        <div className="sheet-main-content">
          {children}
        </div>
      </div>
    </div>
  );
}

function BottomSheetDemo() {
  const [currentHeight, setCurrentHeight] = useState(30);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [listItems, setListItems] = useState(
    Array.from({ length: 50 }, function(_, i) {
      return {
        id: i + 1,
        title: `Item ${i + 1}`,
        description: `This is the description for item ${i + 1}. You can interact with this content even when the bottom sheet is open.`,
        status: Math.random() > 0.5 ? 'active' : 'inactive',
        priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)]
      };
    })
  );

  function handleItemClick(id) {
    setSelectedItems(function(prev) {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  function handleDeleteItem(id) {
    setListItems(function(prev) {
      return prev.filter(function(item) {
        return item.id !== id;
      });
    });
    setSelectedItems(function(prev) {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }

  function getPriorityClass(priority) {
    switch (priority) {
      case 'high': 
        return 'badge-high';
      case 'medium': 
        return 'badge-medium';
      case 'low': 
        return 'badge-low';
      default: 
        return 'badge-medium';
    }
  }

  function addMoreItems() {
    setListItems(
      Array.from({ length: 10 }, function(_, i) {
        return {
          id: Date.now() + i,
          title: `New Item ${i + 1}`,
          description: `This is a newly generated item ${i + 1}.`,
          status: Math.random() > 0.5 ? 'active' : 'inactive',
          priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)]
        };
      })
    );
  }

  function clearSelection() {
    setSelectedItems(new Set());
  }
  
  return (
    <div className="app-container">
      <div className="header">
        <div className="header-content">
          <h1 className="header-title">Interactive Background Demo</h1>
          <p className="header-subtitle">
            Selected items: {selectedItems.size} | Total items: {listItems.length}
          </p>
        </div>
      </div>

      <div className="content-container">
        <div className="items-list">
          {listItems.map(function(item) {
            return (
              <div
                key={item.id}
                className={selectedItems.has(item.id) ? 'list-item selected' : 'list-item'}
                onClick={function() { handleItemClick(item.id); }}
              >
                <div className="item-content">
                  <div className="item-header">
                    <div className="item-main">
                      <div className="item-meta">
                        <h3 className="item-title">{item.title}</h3>
                        <span className={`badge ${getPriorityClass(item.priority)}`}>
                          {item.priority}
                        </span>
                        <span className={item.status === 'active' ? 'badge badge-active' : 'badge badge-inactive'}>
                          {item.status}
                        </span>
                      </div>
                      <p className="item-description">{item.description}</p>
                    </div>
                    <button
                      onClick={function(e) {
                        e.stopPropagation();
                        handleDeleteItem(item.id);
                      }}
                      className="delete-button"
                      title="Delete item"
                    >
                      <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {selectedItems.has(item.id) && (
                    <div className="selected-details">
                      <p className="selected-text">✓ Selected</p>
                      <div className="action-buttons">
                        <button className="action-button action-button-primary">
                          Edit
                        </button>
                        <button className="action-button action-button-secondary">
                          Duplicate
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {listItems.length === 0 && (
          <div className="empty-state">
            <p className="empty-text">No items remaining</p>
            <button onClick={addMoreItems} className="add-items-button">
              Add More Items
            </button>
          </div>
        )}
      </div>
      
      <BottomSheet onHeightChange={setCurrentHeight}>
        <div className="sheet-section">
          <h2 className="sheet-title">Bottom Sheet Controls</h2>
          <p className="sheet-subtitle">
            Current height: <span style={{fontWeight: 600}}>{Math.round(currentHeight)}%</span>
          </p>
          <p className="sheet-status">
            Background selected items: {selectedItems.size}
          </p>
        </div>
        
        <div className="sheet-cards">
          <div className="info-card info-card-gray">
            <h3 className="card-title card-title-gray">Interactive Background</h3>
            <ul className="feature-list card-content card-content-gray">
              <li>• Click items in the background to select them</li>
              <li>• Scroll the background list while sheet is open</li>
              <li>• Delete items using the × button</li>
              <li>• Background remains fully interactive</li>
              <li>• No backdrop blocking interactions</li>
            </ul>
          </div>
          
          <div className="info-card info-card-blue">
            <h3 className="card-title card-title-blue">Sheet Features</h3>
            <p className="card-content card-content-blue">
              Drag this sheet up and down while still being able to interact with the 
              background content. The list behind this sheet is fully functional!
            </p>
          </div>

          {selectedItems.size > 0 && (
            <div className="info-card info-card-green">
              <h3 className="card-title card-title-green">Selected Items</h3>
              <p className="card-content card-content-green">
                You have {selectedItems.size} items selected in the background.
              </p>
              <button onClick={clearSelection} className="clear-button">
                Clear Selection
              </button>
            </div>
          )}
        </div>
      </BottomSheet>
    </div>
  );
}

export default BottomSheet;

export { BottomSheetDemo };