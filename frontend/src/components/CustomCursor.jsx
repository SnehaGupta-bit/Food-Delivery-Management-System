import { useEffect, useState } from "react";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [followerPosition, setFollowerPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    const updateCursor = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const updateFollower = () => {
      setFollowerPosition((prev) => ({
        x: prev.x + (position.x - prev.x) * 0.15,
        y: prev.y + (position.y - prev.y) * 0.15,
      }));
    };

    const handleMouseOver = (e) => {
      if (
        e.target.tagName === "BUTTON" ||
        e.target.tagName === "A" ||
        e.target.closest("button") ||
        e.target.closest("a") ||
        e.target.classList.contains("food-card") ||
        e.target.classList.contains("cat-card")
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener("mousemove", updateCursor);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    const followerInterval = setInterval(updateFollower, 16);

    return () => {
      window.removeEventListener("mousemove", updateCursor);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      clearInterval(followerInterval);
    };
  }, [position]);

  return (
    <>
      <div
        className={`custom-cursor ${isHovering ? "hover" : ""} ${isClicking ? "click" : ""}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      />
      <div
        className="custom-cursor-follower"
        style={{
          left: `${followerPosition.x}px`,
          top: `${followerPosition.y}px`,
        }}
      />
    </>
  );
}
