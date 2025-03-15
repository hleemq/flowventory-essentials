
/**
 * Database Service Module
 * Centralizes database operations with optimized queries, caching, and error handling
 */
import { supabase } from './client';
import { toast } from 'sonner';

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache: Record<string, { data: any; timestamp: number }> = {};

/**
 * Generic function to fetch data with caching support
 * @param cacheKey - Unique key for caching the result
 * @param queryFn - Async function that performs the actual query
 * @param ttl - Time to live for cache in milliseconds (defaults to CACHE_TTL)
 * @returns Query result
 */
async function fetchWithCache<T>(
  cacheKey: string,
  queryFn: () => Promise<T>,
  ttl: number = CACHE_TTL
): Promise<T> {
  // Check if data exists in cache and is not expired
  const cached = cache[cacheKey];
  const now = Date.now();
  
  if (cached && now - cached.timestamp < ttl) {
    console.log(`Using cached data for ${cacheKey}`);
    return cached.data;
  }
  
  try {
    // Execute query and cache the result
    const result = await queryFn();
    cache[cacheKey] = { data: result, timestamp: now };
    return result;
  } catch (error) {
    console.error(`Error fetching data for ${cacheKey}:`, error);
    throw error;
  }
}

/**
 * Clears all cached data or specific cache entries
 * @param keys - Optional array of specific cache keys to clear
 */
export function clearCache(keys?: string[]) {
  if (keys && keys.length > 0) {
    keys.forEach(key => {
      delete cache[key];
    });
    console.log(`Cleared specific cache keys: ${keys.join(', ')}`);
  } else {
    Object.keys(cache).forEach(key => {
      delete cache[key];
    });
    console.log('Cleared all cache');
  }
}

/**
 * Fetch organizations with optimized query and caching
 * @param options - Optional configuration for pagination and filtering
 * @returns Promise resolving to array of organizations
 */
export async function fetchOrganizations(options: {
  page?: number;
  pageSize?: number;
  isActive?: boolean;
} = {}) {
  const { page = 1, pageSize = 20, isActive } = options;
  const offset = (page - 1) * pageSize;
  
  // Create cache key based on query parameters
  const cacheKey = `organizations_${page}_${pageSize}_${isActive}`;
  
  return fetchWithCache(
    cacheKey,
    async () => {
      console.log("Fetching organizations with params:", { page, pageSize, isActive });
      
      let query = supabase
        .from("organizations")
        .select("id, name, is_active, created_at", { count: 'exact' });
      
      // Apply filters if provided
      if (isActive !== undefined) {
        query = query.eq('is_active', isActive);
      }
      
      // Apply pagination
      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(offset, offset + pageSize - 1);
      
      if (error) {
        console.error("Error fetching organizations:", error);
        throw error;
      }
      
      console.log(`Successfully fetched ${data?.length} organizations out of ${count} total`);
      return { 
        data: data || [], 
        count: count || 0,
        page,
        pageSize,
        totalPages: count ? Math.ceil(count / pageSize) : 0
      };
    }
  );
}

/**
 * Fetch warehouses with optimized query and caching
 * @param options - Optional configuration for pagination and filtering
 * @returns Promise resolving to array of warehouses with pagination info
 */
export async function fetchWarehouses(options: {
  page?: number;
  pageSize?: number;
  organizationId?: string;
} = {}) {
  const { page = 1, pageSize = 20, organizationId } = options;
  const offset = (page - 1) * pageSize;
  
  // Create cache key based on query parameters
  const cacheKey = `warehouses_${page}_${pageSize}_${organizationId || 'all'}`;
  
  return fetchWithCache(
    cacheKey,
    async () => {
      console.log("Fetching warehouses with params:", { page, pageSize, organizationId });
      
      let query = supabase
        .from("warehouses")
        .select("*", { count: 'exact' });
      
      // Apply filters if provided
      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }
      
      // Apply pagination
      const { data, error, count } = await query
        .order("name", { ascending: true })
        .range(offset, offset + pageSize - 1);
      
      if (error) {
        console.error("Error fetching warehouses:", error);
        throw error;
      }
      
      console.log(`Successfully fetched ${data?.length} warehouses out of ${count} total`);
      return { 
        data: data || [], 
        count: count || 0,
        page,
        pageSize,
        totalPages: count ? Math.ceil(count / pageSize) : 0
      };
    }
  );
}

/**
 * Fetch items with optimized query, filtering, and caching
 * @param options - Pagination, filtering, and other options
 * @returns Promise resolving to array of items with pagination info
 */
export async function fetchItems(options: {
  page?: number;
  pageSize?: number;
  warehouseId?: string;
  searchTerm?: string;
  isDeleted?: boolean;
  lowStock?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} = {}) {
  const { 
    page = 1, 
    pageSize = 20, 
    warehouseId, 
    searchTerm, 
    isDeleted = false,
    lowStock = false,
    sortBy = 'name',
    sortOrder = 'asc'
  } = options;
  
  const offset = (page - 1) * pageSize;
  
  // Create cache key based on query parameters
  const cacheKey = `items_${page}_${pageSize}_${warehouseId || 'all'}_${searchTerm || ''}_${isDeleted}_${lowStock}_${sortBy}_${sortOrder}`;
  
  // Clear cache when sorting or filtering changes to ensure fresh data
  if (searchTerm || warehouseId || lowStock) {
    delete cache[cacheKey];
  }
  
  return fetchWithCache(
    cacheKey,
    async () => {
      console.log("Fetching items with params:", options);
      
      // Build query with join to warehouses table
      let query = supabase
        .from('items')
        .select(`
          id,
          image,
          sku,
          name,
          boxes,
          units_per_box,
          bought_price,
          shipment_fees,
          selling_price,
          quantity,
          warehouse_id,
          currency,
          warehouses:warehouses!items_warehouse_id_fkey (
            name,
            location
          )
        `, { count: 'exact' });
      
      // Filter based on deleted status
      if (isDeleted) {
        query = query.not('deleted_at', 'is', null);
      } else {
        query = query.is('deleted_at', null);
      }
      
      // Apply additional filters
      if (warehouseId) {
        query = query.eq('warehouse_id', warehouseId);
      }
      
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`);
      }
      
      if (lowStock) {
        query = query.lt('quantity', query.eq('low_stock_threshold'));
      }
      
      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      
      // Apply pagination
      const { data, error, count } = await query.range(offset, offset + pageSize - 1);
      
      if (error) {
        console.error("Error fetching items:", error);
        throw error;
      }
      
      console.log(`Successfully fetched ${data?.length} items out of ${count} total`);
      
      // Transform the data from database format to application format
      const formattedItems = (data || []).map((item: any) => {
        let warehouseName = '';
        
        if (item.warehouses) {
          warehouseName = item.warehouses.name || '';
        }
        
        return {
          id: item.id,
          image: item.image || "/placeholder.svg",
          stockCode: item.sku,
          productName: item.name,
          boxes: item.boxes,
          unitsPerBox: item.units_per_box,
          initialPrice: item.bought_price + item.shipment_fees,
          sellingPrice: item.selling_price,
          location: warehouseName,
          stockStatus: item.quantity > 0 ? "In Stock" : "Out of Stock",
          unitsLeft: item.quantity,
          currency: item.currency || "MAD",
        };
      });
      
      return { 
        data: formattedItems, 
        count: count || 0,
        page,
        pageSize,
        totalPages: count ? Math.ceil(count / pageSize) : 0
      };
    },
    // Set shorter TTL for item queries since they change more frequently
    2 * 60 * 1000 // 2 minutes
  );
}

/**
 * Creates or updates a warehouse with validation and error handling
 * @param warehouse - Warehouse data
 * @returns Created or updated warehouse
 */
export async function saveWarehouse(warehouse: {
  id?: string;
  name: string;
  location: string;
  organization_id?: string;
}) {
  try {
    // Validate input
    if (!warehouse.name || !warehouse.location) {
      throw new Error('Warehouse name and location are required');
    }
    
    // Check if updating existing or creating new
    let result;
    
    if (warehouse.id) {
      // Update existing warehouse
      result = await supabase
        .from('warehouses')
        .update({
          name: warehouse.name,
          location: warehouse.location,
          updated_at: new Date().toISOString(),
        })
        .eq('id', warehouse.id)
        .select()
        .single();
    } else {
      // Create new warehouse
      result = await supabase
        .from('warehouses')
        .insert({
          name: warehouse.name,
          location: warehouse.location,
          organization_id: warehouse.organization_id,
        })
        .select()
        .single();
    }
    
    if (result.error) throw result.error;
    
    // Clear warehouse cache to ensure fresh data
    clearCache(['warehouses']);
    
    return result.data;
  } catch (error: any) {
    console.error('Error saving warehouse:', error);
    toast.error(`Failed to save warehouse: ${error.message || 'Unknown error'}`);
    throw error;
  }
}

/**
 * Uploads an image file to Supabase storage with retry logic
 * @param file - The file object to upload
 * @param folder - Target folder (default: 'items')
 * @param retries - Number of retries on failure
 * @returns URL of the uploaded file
 */
export async function uploadImage(
  file: File, 
  folder: string = 'items',
  retries: number = 3
): Promise<string> {
  // Generate unique filename to prevent collisions
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;
  
  let attempt = 0;
  
  while (attempt < retries) {
    try {
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('public')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        throw error;
      }
      
      // Get public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);
      
      return urlData.publicUrl;
    } catch (error: any) {
      console.error(`Error uploading image (attempt ${attempt + 1}/${retries}):`, error);
      
      // If we've reached max retries, throw the error
      if (attempt === retries - 1) {
        throw error;
      }
      
      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      attempt++;
    }
  }
  
  throw new Error('Failed to upload image after multiple attempts');
}

/**
 * Execute raw SQL queries safely through RPC with improved error handling
 * @param query - SQL query string
 * @param params - Array of parameters for the query
 * @returns Query result or error
 */
export async function executeRawQuery(query: string, params?: any[]) {
  try {
    // Validate query to prevent SQL injection
    if (!query.trim() || /;(.+)$/g.test(query)) {
      throw new Error('Invalid query format');
    }
    
    // Use rpc function to execute raw SQL safely
    const { data, error } = await supabase.rpc('execute_sql', { 
      sql_query: query,
      params: params || []
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error executing raw query:', error);
    return { 
      data: null, 
      error: { 
        message: error.message || 'Failed to execute query',
        details: error.details || '',
        code: error.code || 'UNKNOWN'
      } 
    };
  }
}

/**
 * Fetch user notifications with pagination and filtering
 * @param options - Optional configuration for pagination and filtering
 * @returns Promise resolving to array of notifications with pagination info
 */
export async function fetchNotifications(options: {
  page?: number;
  pageSize?: number;
  unreadOnly?: boolean;
} = {}) {
  const { page = 1, pageSize = 10, unreadOnly = false } = options;
  const offset = (page - 1) * pageSize;
  
  try {
    console.log("Fetching notifications with params:", { page, pageSize, unreadOnly });
    
    let query = supabase
      .from("notifications")
      .select("*", { count: 'exact' });
    
    // Filter for unread notifications if requested
    if (unreadOnly) {
      query = query.eq('is_read', false);
    }
    
    // Apply pagination
    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);
    
    if (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
    
    console.log(`Successfully fetched ${data?.length} notifications out of ${count} total`);
    return { 
      data: data || [], 
      count: count || 0,
      page,
      pageSize,
      totalPages: count ? Math.ceil(count / pageSize) : 0
    };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    toast.error('Failed to fetch notifications');
    throw error;
  }
}

/**
 * Mark notifications as read
 * @param notificationIds - Array of notification IDs to mark as read
 * @returns Success status
 */
export async function markNotificationsAsRead(notificationIds: string[]) {
  try {
    if (!notificationIds.length) return { success: true, count: 0 };
    
    const { data, error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .in('id', notificationIds)
      .select();
    
    if (error) throw error;
    
    return { success: true, count: data?.length || 0 };
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    toast.error('Failed to update notifications');
    throw error;
  }
}
