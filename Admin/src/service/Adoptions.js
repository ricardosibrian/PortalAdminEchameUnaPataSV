import { API_BASE_URL, AUTH_TOKEN } from "../config";

export const GetApplicationById = async (id) => {
    try {
        const res = await fetch(`${API_BASE_URL}/adoption/applications/find-by-id/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${AUTH_TOKEN}`,
            },
        });

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
    const res = await fetch(`${API_BASE_URL}/adoption/applications/update-application`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AUTH_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

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
