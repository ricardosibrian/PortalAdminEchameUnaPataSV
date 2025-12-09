import { apiGet, apiPut } from "../utils/apiClient";

export const GetApplicationById = async (id) => {
    try {
        const res = await apiGet(`/adoption/applications/find-by-id/${id}`);

        if (!res.ok) {
            const errorData = await res.json();
            throw errorData;
        }
        
        const data = await res.json();
        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const UpdateApplicationStatus = async (payload) => {
  try {
    const res = await apiPut(`/adoption/applications/update-application`, payload);

    if (!res.ok) {
      const errorData = await res.json();
      throw errorData;
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

