/**
 * Export data to CSV file
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the file to download
 * @param {Array} columns - Array of column names to include (if not provided, uses all keys from first object)
 */
export const exportToCSV = (data, filename, columns = null) => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Determine columns
  const cols = columns || Object.keys(data[0]);
  const columnDefinitions = cols.map((col) => {
    if (typeof col === 'string') {
      return { key: col, label: col };
    }

    return {
      key: col.key,
      label: col.label || col.key,
    };
  });

  // Create CSV header
  const header = columnDefinitions.map((col) => col.label).join(',');

  // Create CSV rows
  const rows = data.map(item => {
    return columnDefinitions.map(({ key }) => {
      let value = item[key];

      // Handle nested objects (e.g., studentId?.name)
      if (key.includes('.')) {
        const keys = key.split('.');
        value = keys.reduce((obj, key) => obj?.[key], item);
      } else if (typeof value === 'object' && value !== null) {
        // If value is object but not nested by dot notation, convert to string
        value = JSON.stringify(value);
      }

      // Handle null/undefined
      if (value === null || value === undefined) {
        value = '';
      }

      // Escape quotes and wrap in quotes if contains comma, newline, or quotes
      value = String(value).replace(/"/g, '""');
      if (String(value).includes(',') || String(value).includes('\n') || String(value).includes('"')) {
        value = `"${value}"`;
      }

      return value;
    }).join(',');
  });

  // Combine header and rows
  const csv = [header, ...rows].join('\n');

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Flatten nested object data for CSV export
 * @param {Array} data - Array of objects with nested properties
 * @param {Object} config - Configuration for flattening { mappings: { 'old.nested.path': 'New Header Name' } }
 */
export const flattenForCSV = (data, config = {}) => {
  return data.map(item => {
    const flattened = {};

    // Apply custom mappings if provided
    if (config.mappings) {
      Object.entries(config.mappings).forEach(([path, header]) => {
        const keys = path.split('.');
        const value = keys.reduce((obj, key) => obj?.[key], item);
        flattened[header] = value ?? '';
      });
    } else {
      // Default: flatten all nested objects
      Object.entries(item).forEach(([key, value]) => {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          Object.entries(value).forEach(([nestedKey, nestedValue]) => {
            flattened[`${key}_${nestedKey}`] = nestedValue;
          });
        } else if (Array.isArray(value)) {
          flattened[key] = value.join('; ');
        } else {
          flattened[key] = value ?? '';
        }
      });
    }

    return flattened;
  });
};
