import React from 'react';

const ResponsiveGrid = ({
  children,
  cols = { xs: 1, sm: 2, md: 3, lg: 4, xl: 5, '2xl': 6 },
  gap = 4,
  className = '',
  autoFit = false,
  minChildWidth = '250px'
}) => {
  // Build responsive grid classes
  const buildGridClasses = () => {
    if (autoFit) {
      return `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5`;
    }

    const classes = [];
    
    if (cols.xs) classes.push(`grid-cols-${cols.xs}`);
    if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);
    if (cols['2xl']) classes.push(`2xl:grid-cols-${cols['2xl']}`);
    
    return `grid ${classes.join(' ')}`;
  };

  // Build gap classes
  const buildGapClasses = () => {
    if (typeof gap === 'object') {
      const classes = [];
      if (gap.xs) classes.push(`gap-${gap.xs}`);
      if (gap.sm) classes.push(`sm:gap-${gap.sm}`);
      if (gap.md) classes.push(`md:gap-${gap.md}`);
      if (gap.lg) classes.push(`lg:gap-${gap.lg}`);
      if (gap.xl) classes.push(`xl:gap-${gap.xl}`);
      return classes.join(' ');
    }
    return `gap-${gap}`;
  };

  // Auto-fit style
  const autoFitStyle = autoFit 
    ? { 
        gridTemplateColumns: `repeat(auto-fit, minmax(min(${minChildWidth}, 100%), 1fr))` 
      }
    : {};

  return (
    <div
      className={`${buildGridClasses()} ${buildGapClasses()} ${className}`}
      style={autoFitStyle}
    >
      {children}
    </div>
  );
};

// Responsive Grid Item
const GridItem = ({ 
  children, 
  span = 1,
  start = 'auto',
  className = '',
  onClick
}) => {
  // Build span classes
  const buildSpanClasses = () => {
    if (typeof span === 'object') {
      const classes = [];
      if (span.xs) classes.push(`col-span-${span.xs}`);
      if (span.sm) classes.push(`sm:col-span-${span.sm}`);
      if (span.md) classes.push(`md:col-span-${span.md}`);
      if (span.lg) classes.push(`lg:col-span-${span.lg}`);
      if (span.xl) classes.push(`xl:col-span-${span.xl}`);
      return classes.join(' ');
    }
    return `col-span-${span}`;
  };

  // Build start classes
  const buildStartClasses = () => {
    if (typeof start === 'object') {
      const classes = [];
      if (start.xs) classes.push(`col-start-${start.xs}`);
      if (start.sm) classes.push(`sm:col-start-${start.sm}`);
      if (start.md) classes.push(`md:col-start-${start.md}`);
      if (start.lg) classes.push(`lg:col-start-${start.lg}`);
      if (start.xl) classes.push(`xl:col-start-${start.xl}`);
      return classes.join(' ');
    }
    return start !== 'auto' ? `col-start-${start}` : '';
  };

  const gridClasses = [buildSpanClasses(), buildStartClasses(), className]
    .filter(Boolean)
    .join(' ');

  return (
    <div 
      className={gridClasses}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
};

// Masonry Grid Layout
const MasonryGrid = ({
  children,
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 4,
  className = ''
}) => {
  // Convert children to array
  const items = React.Children.toArray(children);
  
  // Calculate column distribution for masonry layout
  const getColumnItems = () => {
    const columnCount = {
      xs: columns.xs || 1,
      sm: columns.sm || 2,
      md: columns.md || 3,
      lg: columns.lg || 4
    };

    const maxColumns = Math.max(...Object.values(columnCount));
    const columnsArray = Array.from({ length: maxColumns }, () => []);

    items.forEach((item, index) => {
      const columnIndex = index % maxColumns;
      columnsArray[columnIndex].push(item);
    });

    return columnsArray;
  };

  const columnItems = getColumnItems();

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-${gap} ${className}`}>
      {columnItems.map((column, columnIndex) => (
        <div key={columnIndex} className="flex flex-col gap-4">
          {column.map((item, itemIndex) => (
            <div key={itemIndex}>
              {item}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

// Responsive Sidebar Layout
const SidebarLayout = ({
  sidebar,
  main,
  sidebarWidth = '1/4',
  reverse = false,
  gap = 6,
  className = '',
  collapseAt = 'lg'
}) => {
  const sidebarClasses = {
    '1/4': 'lg:w-1/4',
    '1/3': 'lg:w-1/3',
    '1/5': 'lg:w-1/5',
    '2/5': 'lg:w-2/5',
    '3/5': 'lg:w-3/5'
  };

  const collapseClass = {
    sm: 'sm:flex-col',
    md: 'md:flex-col',
    lg: 'lg:flex-col',
    xl: 'xl:flex-col'
  }[collapseAt] || 'lg:flex-col';

  return (
    <div className={`flex flex-col ${collapseClass} lg:flex-row gap-${gap} ${className}`}>
      {reverse ? (
        <>
          <div className={`flex-1 ${sidebarWidth === 'full' ? 'w-full' : sidebarClasses[sidebarWidth]}`}>
            {main}
          </div>
          <div className={`flex-shrink-0 ${sidebarWidth === 'full' ? 'w-full' : `lg:w-${sidebarWidth}`}`}>
            {sidebar}
          </div>
        </>
      ) : (
        <>
          <div className={`flex-shrink-0 ${sidebarWidth === 'full' ? 'w-full' : sidebarClasses[sidebarWidth]}`}>
            {sidebar}
          </div>
          <div className={`flex-1 ${sidebarWidth === 'full' ? 'w-full' : ''}`}>
            {main}
          </div>
        </>
      )}
    </div>
  );
};

ResponsiveGrid.Item = GridItem;
ResponsiveGrid.Masonry = MasonryGrid;
ResponsiveGrid.Sidebar = SidebarLayout;

export default ResponsiveGrid;