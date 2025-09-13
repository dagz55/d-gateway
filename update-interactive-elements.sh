#!/bin/bash

# This script updates all interactive elements in the project to have proper cursor and hover effects

echo "Starting to update interactive elements with cursor and hover effects..."

# Create a backup directory
BACKUP_DIR="./backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Function to update files with specific patterns
update_file() {
    local file=$1
    local backup_file="$BACKUP_DIR/$(basename $file)"
    
    # Create backup
    cp "$file" "$backup_file" 2>/dev/null || true
    
    # Update clickable divs with onClick but missing cursor-pointer
    # Look for className patterns that have onClick but no cursor-pointer
    sed -i '' -E 's/(className="[^"]*)(hover:[^"]*[^"]*)("[^>]*onClick)/\1cursor-pointer \2\3/g' "$file" 2>/dev/null || true
    sed -i '' -E "s/(className='[^']*)(hover:[^']*[^']*)('[^>]*onClick)/\1cursor-pointer \2\3/g" "$file" 2>/dev/null || true
    
    # Add transition-colors to elements with hover: color changes
    sed -i '' -E 's/(className="[^"]*hover:(bg|text|border)[^"]*)(")([^>]*onClick)/\1 transition-colors duration-200\3\4/g' "$file" 2>/dev/null || true
    
    # Update elements with role="button" to have cursor-pointer
    sed -i '' -E 's/(role="button"[^>]*className="[^"]*)/\1 cursor-pointer/g' "$file" 2>/dev/null || true
}

# Find all TypeScript/React files and update them
find src/components -name "*.tsx" -o -name "*.jsx" | while read file; do
    echo "Processing: $file"
    update_file "$file"
done

echo "Update complete! Backup created in: $BACKUP_DIR"
echo ""
echo "Now running validation checks..."

# Check for any remaining issues
echo "Checking for onClick handlers without cursor styling..."
grep -r "onClick" src/components --include="*.tsx" --include="*.jsx" | grep -v "cursor-pointer" | grep -v "Button" | head -10 || echo "✓ All onClick handlers appear to have proper cursor styling"

echo ""
echo "Manual review needed for the following files (they contain onClick handlers):"
grep -l "onClick" src/components/**/*.tsx 2>/dev/null | head -20

echo ""
echo "Script completed. Please review the changes and test the application."