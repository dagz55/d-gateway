import { useCallback, useEffect, useState } from 'react';
import { useWorkOSAuth } from '@/contexts/WorkOSAuthContext';

/**
 * Custom hook for making CSRF-protected API requests
 * Automatically handles CSRF token inclusion and refresh
 */
export function useCSRFProtectedFetch() {
  const { csrfToken, refreshCSRFToken, makeAuthenticatedRequest } = useWorkOSAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Make a CSRF-protected fetch request
   */
  const csrfFetch = useCallback(async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    setIsLoading(true);
    setError(null);

    try {
      // Use the authenticated request method from context
      const response = await makeAuthenticatedRequest(url, options);
      
      // Handle CSRF token refresh automatically
      if (response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.code === 'CSRF_INVALID' || errorData.code === 'CSRF_ERROR') {
          // Token was invalid, context should have refreshed it
          // Retry the request once
          console.log('Retrying request with refreshed CSRF token...');
          return await makeAuthenticatedRequest(url, options);
        }
      }

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Request failed';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [makeAuthenticatedRequest]);

  /**
   * Convenience method for GET requests
   */
  const get = useCallback(async (url: string, options: RequestInit = {}) => {
    return csrfFetch(url, { ...options, method: 'GET' });
  }, [csrfFetch]);

  /**
   * Convenience method for POST requests
   */
  const post = useCallback(async (url: string, data?: any, options: RequestInit = {}) => {
    const requestOptions: RequestInit = {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    if (data) {
      requestOptions.body = JSON.stringify(data);
    }

    return csrfFetch(url, requestOptions);
  }, [csrfFetch]);

  /**
   * Convenience method for PUT requests
   */
  const put = useCallback(async (url: string, data?: any, options: RequestInit = {}) => {
    const requestOptions: RequestInit = {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    if (data) {
      requestOptions.body = JSON.stringify(data);
    }

    return csrfFetch(url, requestOptions);
  }, [csrfFetch]);

  /**
   * Convenience method for DELETE requests
   */
  const del = useCallback(async (url: string, options: RequestInit = {}) => {
    return csrfFetch(url, { ...options, method: 'DELETE' });
  }, [csrfFetch]);

  /**
   * Convenience method for PATCH requests
   */
  const patch = useCallback(async (url: string, data?: any, options: RequestInit = {}) => {
    const requestOptions: RequestInit = {
      ...options,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    if (data) {
      requestOptions.body = JSON.stringify(data);
    }

    return csrfFetch(url, requestOptions);
  }, [csrfFetch]);

  return {
    // Main fetch function
    csrfFetch,
    
    // Convenience methods
    get,
    post,
    put,
    delete: del,
    patch,
    
    // State
    isLoading,
    error,
    csrfToken,
    
    // Actions
    refreshCSRFToken,
    clearError: () => setError(null)
  };
}

/**
 * Hook for protected form submissions with CSRF
 */
export function useCSRFProtectedForm() {
  const { post, put, patch, delete: del, isLoading, error, clearError } = useCSRFProtectedFetch();
  const [formData, setFormData] = useState<any>({});
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  /**
   * Submit form data with CSRF protection
   */
  const submitForm = useCallback(async (
    url: string,
    data: any,
    method: 'POST' | 'PUT' | 'PATCH' = 'POST'
  ) => {
    setSubmitStatus('submitting');
    clearError();

    try {
      let response: Response;
      
      switch (method) {
        case 'POST':
          response = await post(url, data);
          break;
        case 'PUT':
          response = await put(url, data);
          break;
        case 'PATCH':
          response = await patch(url, data);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      if (response.ok) {
        setSubmitStatus('success');
        return await response.json();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }
    } catch (error) {
      setSubmitStatus('error');
      throw error;
    }
  }, [post, put, patch, clearError]);

  /**
   * Delete resource with CSRF protection
   */
  const deleteResource = useCallback(async (url: string) => {
    setSubmitStatus('submitting');
    clearError();

    try {
      const response = await del(url);

      if (response.ok) {
        setSubmitStatus('success');
        return await response.json().catch(() => ({ success: true }));
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Delete failed with status ${response.status}`);
      }
    } catch (error) {
      setSubmitStatus('error');
      throw error;
    }
  }, [del, clearError]);

  /**
   * Reset form state
   */
  const resetForm = useCallback(() => {
    setFormData({});
    setSubmitStatus('idle');
    clearError();
  }, [clearError]);

  return {
    // Form actions
    submitForm,
    deleteResource,
    resetForm,
    
    // Form state
    formData,
    setFormData,
    submitStatus,
    isLoading,
    error,
    
    // Status checks
    isSubmitting: submitStatus === 'submitting',
    isSuccess: submitStatus === 'success',
    isError: submitStatus === 'error',
    
    // Actions
    clearError
  };
}

/**
 * Hook for file uploads with CSRF protection
 */
export function useCSRFProtectedFileUpload() {
  const { csrfToken, makeAuthenticatedRequest } = useWorkOSAuth();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Upload file with CSRF protection
   */
  const uploadFile = useCallback(async (
    url: string,
    file: File,
    additionalData?: Record<string, string>
  ) => {
    if (!csrfToken) {
      throw new Error('CSRF token not available');
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Add additional form data if provided
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      // Create a request with progress tracking
      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            setUploadProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch {
              resolve({ success: true });
            }
          } else {
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              reject(new Error(errorResponse.message || `Upload failed with status ${xhr.status}`));
            } catch {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed due to network error'));
        });

        xhr.open('POST', url);
        xhr.setRequestHeader('x-csrf-token', csrfToken);
        xhr.withCredentials = true;
        xhr.send(formData);
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setError(errorMessage);
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [csrfToken]);

  return {
    uploadFile,
    uploadProgress,
    isUploading,
    error,
    clearError: () => setError(null)
  };
}