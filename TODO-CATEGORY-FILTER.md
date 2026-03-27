# Category/Subcategory Filtering Fix Plan

## Status: 🔄 Analysis Complete - Ready for Implementation

**Current State:**
```
✅ main.js: filterCategory('men') filters p.category === 'men'
✅ Category banners call filterCategory('men'/'women'/'kids')
❌ No "Saree"/"Shirt"/"Jacket" buttons found 
❌ data.js: category:"men" only (no subCategory field)
❌ search.html suggestions redirect to search page (name search)
```

**Files Analyzed:**
```
✅ js/main.js: renderProducts(), filterCategory()
✅ js/data.js: products (45 items, category:"men"/"women"/"kids", mood:"formal"/"casual"/"party")
✅ index.html: Category banners (Men/Women/Kids) ✓ working
✅ search.html: Suggestions (Shirt/Jacket/Saree) → q=search
```

**Plan:**

### 1. **Enhanced Product Data** (js/data.js)
```
Add subCategory field to products:
Men Shirts → subCategory: "shirt"  
Men Jackets → subCategory: "jacket"
Women Saree → subCategory: "saree" 
Women Dresses → subCategory: "dress"
```

### 2. **New Filter Function** (js/main.js)
```
filterBySubCategory('shirt') → filter p.subCategory === 'shirt' OR p.name includes 'shirt'
Show 6-10 matching products
```

### 3. **search.html Integration**
```
searchFromSuggestion('shirt') → filterBySubCategory('shirt') 
Instead of redirect → show filtered products inline
```

### 4. **Category Page Buttons** (if exist)
```
Add onclick="filterBySubCategory('saree')" to Shirt/Jacket/Saree buttons
```

**Dependent Files:**
```
js/main.js (add filterBySubCategory)
js/data.js (add subCategory to products) 
search.html (update searchFromSuggestion)
```

**Followup Steps:**
```
1. Update data.js with subCategory
2. Add filterBySubCategory to main.js
3. Test: Click "Shirt" → see 6-10 shirt products
4. Test search suggestions inline filtering
```

Ready to implement - confirm plan?

