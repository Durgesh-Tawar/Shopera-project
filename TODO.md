# Fix Reels Comment Panel Overlap Issue

## Issue Summary
When opening the comment section on the first reel and scrolling to the next reel, the comment panel of the first reel remains visible and overlaps the second reel.

## Root Cause
1. Missing scroll-based comment closing logic in `handleScroll()` function
2. No IntersectionObserver callback to close comments when reel goes out of view
3. Each reel's comment panel isn't automatically closed when scrolling to a different reel

## Plan
- [ ] 1. Add `closeAllComments()` function to close all open comment panels
- [ ] 2. Update `handleScroll()` to close comments when scrolling to a different reel
- [ ] 3. Update IntersectionObserver to close comments when reel becomes invisible
- [ ] 4. Update keyboard navigation (`scrollToReel`) to close comments
- [ ] 5. Ensure comment panel is properly positioned within each reel
