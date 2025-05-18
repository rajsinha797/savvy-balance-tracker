
import { ResultSetHeader, RowDataPacket, OkPacket } from 'mysql2';

// Define the types for MySQL query results
export type QueryResult = RowDataPacket[] | RowDataPacket[][] | ResultSetHeader | OkPacket | OkPacket[] | null;

/**
 * Helper function to check if a query result is an array of rows
 */
export const isResultArray = (result: QueryResult): result is RowDataPacket[] | RowDataPacket[][] => {
  return Array.isArray(result);
};

/**
 * Enhanced helper function to safely get UUID from query result
 */
export const getUuidFromResult = (result: QueryResult): string | null => {
  // Handle case when result is an array with objects
  if (result && Array.isArray(result) && result.length > 0 && result[0] && 'id' in result[0]) {
    return String(result[0].id);
  }
  
  // Handle case when result itself is an object with id (some queries return this format)
  if (result && typeof result === 'object' && !Array.isArray(result) && 'id' in result) {
    return String(result.id);
  }
  
  // Handle OkPacket case that might have insertId
  if (result && typeof result === 'object' && !Array.isArray(result) && 'insertId' in result) {
    return String(result.insertId);
  }
  
  // For handling SELECT UUID() - in mysql2 the first element might be rows array, second is fields
  if (result && Array.isArray(result) && result.length >= 1 && Array.isArray(result[0]) && result[0].length > 0 && result[0][0] && 'id' in result[0][0]) {
    return String(result[0][0].id);
  }

  // Another possible format for UUID() results
  if (result && Array.isArray(result) && result.length >= 1 && Array.isArray(result[0]) && result[0].length > 0) {
    const firstRow = result[0][0];
    if (firstRow && typeof firstRow === 'object') {
      const firstKey = Object.keys(firstRow)[0];
      if (firstKey) {
        return String(firstRow[firstKey]);
      }
    }
  }
  
  return null;
};

/**
 * Safe function to get rows from a query result
 */
export const getSafeRows = (result: QueryResult): any[] => {
  // If result is directly an array (most common case)
  if (Array.isArray(result)) {
    return result;
  }
  
  // Handle the [rows, fields] format from mysql2
  if (Array.isArray(result) && result.length > 0) {
    if (Array.isArray(result[0])) {
      return result[0];
    }
  }
  
  // Return empty array as fallback
  return [];
};

/**
 * Helper function to safely handle OkPacket results
 * OkPacket is returned for INSERT, UPDATE, DELETE operations
 */
export const handleOkPacket = (result: QueryResult) => {
  if (!result) return { success: false, affectedRows: 0, insertId: null };
  
  // Handle direct OkPacket
  if (result && typeof result === 'object' && !Array.isArray(result) && ('affectedRows' in result || 'insertId' in result)) {
    return {
      success: true,
      affectedRows: result.affectedRows || 0,
      insertId: result.insertId || null
    };
  }
  
  // Handle [OkPacket] format
  if (Array.isArray(result) && result.length > 0 && 
      typeof result[0] === 'object' && ('affectedRows' in result[0] || 'insertId' in result[0])) {
    return {
      success: true,
      affectedRows: result[0].affectedRows || 0,
      insertId: result[0].insertId || null
    };
  }
  
  return { success: false, affectedRows: 0, insertId: null };
};
