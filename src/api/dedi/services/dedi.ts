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
        const url = `${BASE_URL}${endpoint}`;
        const options: RequestInit = {
            method,
            headers: { "Content-Type": "application/json" },
            body: body ? JSON.stringify(body) : undefined
        };

        try {
            const response = await fetch(url, options);
            const result = await response.json();

            if (!response.ok) {
                const errorMessage = response.status === 400 && result.error 
                    ? result.error 
                    : result.message || `Request to ${endpoint} failed with status ${response.status}`;
                throw new Error(errorMessage);
            }

            return result;
        } catch (error: any) {
            strapi.log.error(`DeDi API Error (${endpoint}):`, error.message);
            throw error; // Preserve original error stack trace
        }
    },
};
