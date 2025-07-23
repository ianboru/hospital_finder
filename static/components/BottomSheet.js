import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import "./BottomSheet.css";

const BottomSheet = forwardRef(function BottomSheet(props, ref) {
  const { children, onHeightChange } = props;
  const [height, setHeight] = useState(30);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(30);
  const sheetRef = useRef(null);

  const SNAP_POINTS = [10, 30, 80];
  const MIN_HEIGHT = 5;
  const MAX_HEIGHT = 80;

  // Expose methods to parent components via ref
  useImperativeHandle(
    ref,
    function () {
      return {
        // Snap to a specific height
        snapTo: function (targetHeight) {
          const clampedHeight = Math.max(
            MIN_HEIGHT,
            Math.min(MAX_HEIGHT, targetHeight)
          );
          setHeight(clampedHeight);
          if (onHeightChange) {
            onHeightChange(clampedHeight);
          }
        },

        // Snap to the closest snap point
        snapToClosest: function () {
          const targetHeight = findClosestSnapPoint(height);
          setHeight(targetHeight);
          if (onHeightChange) {
            onHeightChange(targetHeight);
          }
        },

        // Expand to maximum height
        expand: function () {
          setHeight(MAX_HEIGHT);
          if (onHeightChange) {
            onHeightChange(MAX_HEIGHT);
          }
        },

        // Collapse to minimum height
        collapse: function () {
          setHeight(MIN_HEIGHT);
          if (onHeightChange) {
            onHeightChange(MIN_HEIGHT);
          }
        },

        // Toggle between snap points
        toggle: function () {
          const currentSnapIndex = SNAP_POINTS.indexOf(
            findClosestSnapPoint(height)
          );
          const nextSnapIndex = (currentSnapIndex + 1) % SNAP_POINTS.length;
          const nextHeight = SNAP_POINTS[nextSnapIndex];
          setHeight(nextHeight);
          if (onHeightChange) {
            onHeightChange(nextHeight);
          }
        },

        // Get current height
        getHeight: function () {
          return height;
        },

        // Check if sheet is expanded
        isExpanded: function () {
          return height >= MAX_HEIGHT * 0.9; // 90% of max height
        },

        // Check if sheet is collapsed
        isCollapsed: function () {
          return height <= MIN_HEIGHT * 1.1; // 110% of min height
        },
      };
    },
    [height, onHeightChange]
  );

  function findClosestSnapPoint(currentHeight) {
    return SNAP_POINTS.reduce(function (closest, snapPoint) {
      return Math.abs(snapPoint - currentHeight) <
        Math.abs(closest - currentHeight)
        ? snapPoint
        : closest;
    });
  }

  function handleDragStart(clientY) {
    setIsDragging(true);
    setStartY(clientY);
    setStartHeight(height);
    document.body.style.userSelect = "none";
  }

  function handleDragMove(clientY) {
    if (!isDragging) return;

    const deltaY = startY - clientY;
    const viewportHeight = window.innerHeight;
    const deltaPercent = (deltaY / viewportHeight) * 100;
    const newHeight = Math.max(
      MIN_HEIGHT,
      Math.min(MAX_HEIGHT, startHeight + deltaPercent)
    );

    setHeight(newHeight);
    if (onHeightChange) {
      onHeightChange(newHeight);
    }
  }

  function handleDragEnd() {
    if (!isDragging) return;

    setIsDragging(false);
    document.body.style.userSelect = "";

    const targetHeight = findClosestSnapPoint(height);
    setHeight(targetHeight);
    if (onHeightChange) {
      onHeightChange(targetHeight);
    }
  }

  function handleMouseDown(e) {
    // Only handle mouse down on the drag handle area
    const target = e.target;
    const isDragHandle = target.closest(".drag-handle-container");

    if (isDragHandle) {
      e.preventDefault();
      handleDragStart(e.clientY);
    }
  }

  function handleTouchStart(e) {
    // Only handle touch start on the drag handle area
    const target = e.target;
    const isDragHandle = target.closest(".drag-handle-container");

    if (isDragHandle) {
      // Prevent any default behavior when starting drag
      e.preventDefault();
      handleDragStart(e.touches[0].clientY);
    }
  }

  useEffect(
    function () {
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
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        document.addEventListener("touchmove", handleTouchMove, {
          passive: false,
        });
        document.addEventListener("touchend", handleTouchEnd);

        return function () {
          document.removeEventListener("mousemove", handleMouseMove);
          document.removeEventListener("mouseup", handleMouseUp);
          document.removeEventListener("touchmove", handleTouchMove);
          document.removeEventListener("touchend", handleTouchEnd);
        };
      }
    },
    [isDragging, startY, startHeight, height]
  );

  function snapTo(targetHeight) {
    const clampedHeight = Math.max(
      MIN_HEIGHT,
      Math.min(MAX_HEIGHT, targetHeight)
    );
    setHeight(clampedHeight);
    if (onHeightChange) {
      onHeightChange(clampedHeight);
    }
  }

  const transformY = 100 - height;

  return (
    <>
      {/* Backdrop to prevent background interaction when sheet is expanded */}
      {height > 50 && (
        <div
          className="bottom-sheet-backdrop"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 40,
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            pointerEvents: "auto",
          }}
        />
      )}
      <div
        ref={sheetRef}
        className={
          isDragging ? "bottom-sheet dragging" : "bottom-sheet not-dragging"
        }
        style={{
          transform: `translateY(${transformY}%)`,
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="drag-handle-container">
          <div className="drag-handle" />
        </div>
        <div
          className="sheet-content"
          style={{
            height: `${height}%`,
          }}
        >
          <div className="sheet-main-content">{children}</div>
        </div>
      </div>
    </>
  );
});

export default BottomSheet;
