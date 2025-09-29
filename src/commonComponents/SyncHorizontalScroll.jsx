import React, { useRef, useEffect } from "react";

const SyncHorizontalScroll = ({
  children,
  contentWidth,
  scrollbarHeight = "16px",
  topClassName = "",
  bottomClassName = "",
}) => {
  const topScrollRef = useRef(null);
  const bottomScrollRef = useRef(null);

  useEffect(() => {
    const top = topScrollRef.current;
    const bottom = bottomScrollRef.current;
    if (!top || !bottom) return;

    const handleTopScroll = () => {
      bottom.scrollLeft = top.scrollLeft;
    };
    const handleBottomScroll = () => {
      top.scrollLeft = bottom.scrollLeft;
    };

    top.addEventListener("scroll", handleTopScroll, { passive: true });
    bottom.addEventListener("scroll", handleBottomScroll, { passive: true });

    top.scrollLeft = bottom.scrollLeft;

    return () => {
      top.removeEventListener("scroll", handleTopScroll);
      bottom.removeEventListener("scroll", handleBottomScroll);
    };
  }, []);

  return (
    <div className="relative w-full">
      {/* Sticky Top Scrollbar */}
      <div
        className={`sticky top-0 z-50 bg-white border-b border-gray-200 ${topClassName}`}
        ref={topScrollRef}
        style={{
          height: scrollbarHeight,
          overflowX: "auto",
          overflowY: "hidden",
        }}
      >
        <div style={{ width: `${contentWidth}px`, height: "1px" }} />
      </div>

      {/* Bottom Scrollable Content */}
      <div
        className={`overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 ${bottomClassName}`}
        ref={bottomScrollRef}
      >
        {children}
      </div>
    </div>
  );
};

export default SyncHorizontalScroll;
