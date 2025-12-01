// Тип за обобщена отговорна структура
interface ApiResponse {
  success: boolean;
  error?: string;
  message?: string;
}

export const login = async (username: string, password: string): Promise<ApiResponse> => {
  try {
    const response = await fetch("http://localhost/api/login.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    const text = await response.text();
    alert(text);
    
    try {
      const data = JSON.parse(text);
      return data;
    } catch {
      console.error("Failed to parse server response:", text);
      return { success: false, error: "Грешка при връзка със сървъра" };
    }
  } catch (err) {
    console.error("Fetch error:", err);
    return { success: false, error: err.message || "Грешка при връзка със сървъра" };
  }
};

export const session = async (): Promise<ApiResponse> => {
  try {
    const response = await fetch("http://localhost/api/session.php", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include"
    });

    const text = await response.text();

    try {
      const data = JSON.parse(text);
      return data;
    } catch (err) {
      console.error("Fetch JSON parse error:", err);
      return { success: false, error: err.message || "Грешка при връзка със сървъра" };
    }
  } catch (err) {
    console.error("Fetch error:", err);
    return { success: false, error: err.message || "Грешка при връзка със сървъра" };
  }
};

export const logout = async (): Promise<ApiResponse> => {
  try {
    const response = await fetch("http://localhost/api/logout.php", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Logout failed:", error);
    return { success: false, error: "Logout failed" };
  }
};
