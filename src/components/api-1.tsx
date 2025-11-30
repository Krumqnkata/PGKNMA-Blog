export type LoginResponse = {
  success?: boolean;
  userId?: number;
  username?: string;
  error?: string;
};

const API_URL = "http://localhost/api/sessions.php";

// Login
export async function login(username: string, password: string): Promise<LoginResponse> {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Fetch login error:", err);
    return { error: "Неуспешна връзка със сървъра" };
  }
}

// Check login
export async function checkLogin(): Promise<LoginResponse> {
  try {
    const res = await fetch(API_URL, {
      method: "GET",
      credentials: "include",
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Fetch checkLogin error:", err);
    return { success: false, error: "Неуспешна връзка със сървъра" };
  }
}

// Logout
export async function logout(): Promise<LoginResponse> {
  try {
    const res = await fetch(API_URL, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Fetch logout error:", err);
    return { success: false, error: "Неуспешна връзка със сървъра" };
  }
}
