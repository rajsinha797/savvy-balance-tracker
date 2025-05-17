
/**
 * Helper function to check if a query result is an array
 */
export const isResultArray = (result) => {
  return Array.isArray(result);
};

/**
 * Enhanced helper function to safely get UUID from query result
 */
export const getUuidFromResult = (result) => {
  // Handle case when result is an array with objects
  if (result && Array.isArray(result) && result.length > 0 && result[0] && 'id' in result[0]) {
    return result[0].id;
  }
  
  // Handle case when result itself is an object with id (some queries return this format)
  if (result && typeof result === 'object' && 'id' in result) {
    return result.id;
  }
  
  // Handle OkPacket case that might have insertId
  if (result && typeof result === 'object' && 'insertId' in result) {
    return result.insertId.toString();
  }
  
  // For handling SELECT UUID() - in mysql2 the first element might be rows array, second is fields
  if (result && Array.isArray(result) && result.length >= 1 && Array.isArray(result[0]) && result[0].length > 0 && result[0][0] && 'id' in result[0][0]) {
    return result[0][0].id;
  }

  // Another possible format for UUID() results
  if (result && Array.isArray(result) && result.length >= 1 && Array.isArray(result[0]) && result[0].length > 0) {
    const firstRow = result[0][0];
    const firstKey = Object.keys(firstRow)[0];
    if (firstKey) {
      return firstRow[firstKey];
    }
  }
  
  return null;
};
