const BASE_URL = process.env.DEDI_BASE_URL || "https://fallback-url.com";

interface RegistryData {
    registryName: string;
    description: string;
    schema: Record<string, string>;
    query_allowed: boolean;
}

interface RecordData {
    recordName: string;
    description: string;
    details: Record<string, string>;
}

export default {
    async addRegistry(namespace: string, data: RegistryData): Promise<any> {
        return await this._makeRequest(`/dedi/${namespace}/add-registry`, "POST", data);
    },

    async addRecord(namespace: string, registryName: string, data: RecordData): Promise<any> {
        return await this._makeRequest(`/dedi/${namespace}/${registryName}/add-record`, "POST", data);
    },

    async updateRecord(
        namespace: string,
        registryName: string,
        recordName: string,
        data: Partial<RecordData>
    ): Promise<any> {
        return await this._makeRequest(`/dedi/${namespace}/${registryName}/${recordName}/update-record`, "POST", data);
    },

    async revokeRecord(namespace: string, registryName: string, recordName: string): Promise<any> {
        return await this._makeRequest(`/dedi/${namespace}/${registryName}/${recordName}/revoke-record`, "POST");
    },

    async reinstateRecord(namespace: string, registryName: string, recordName: string): Promise<any> {
        return await this._makeRequest(`/dedi/${namespace}/${registryName}/${recordName}/reinstate-record`, "POST");
    },

    async _makeRequest(endpoint: string, method: string, body?: object): Promise<any> {
        // Construct the full URL by combining base URL and endpoint
        const fullUrl = BASE_URL + endpoint;

        // Create headers object
        const requestHeaders = {
            "Content-Type": "application/json"
        };

        // Create request options object
        const requestOptions = {
            method: method,
            headers: requestHeaders,
            body: body ? JSON.stringify(body) : undefined
        };

        // Make the HTTP request
        let response;
        try {
            response = await fetch(fullUrl, requestOptions);
        } catch (fetchError) {
            strapi.log.error(`Failed to make request to ${endpoint}:`, fetchError);
            throw fetchError;
        }
        
        // Log response status and headers for debugging
        strapi.log.debug(`Response status from ${endpoint}: ${response.status}`);
          strapi.log.debug(`Response headers from ${endpoint}:`, response.headers);

        // Check for empty response body
        const contentLengt = response.headers.get('content-length');
        if(contentLengt === '0') {
            strapi.log.warn(`Empty response body from ${endpoint}`);
            return null;
        }

        // Parse response body
        let result;
        try {
            result = await response.json();
        } catch (parseError) {
            strapi.log.error(`Failed to parse response from ${endpoint}:`, parseError);
            throw parseError;
        }

        // Check if response was successful
        if (response.ok === false) {
            // Handle error response
            let errorMessage;
            if (response.status === 400 && result.error) {
                errorMessage = result.error;
            } else if (result.message) {
                errorMessage = result.message;
            } else {
                errorMessage = `Request to ${endpoint} failed with status ${response.status}`;
            }

            // Log and throw error
            strapi.log.error(`Request failed: ${errorMessage}`);
            throw new Error(errorMessage);
        }

        // Return successful response
        return result;
    },
};
