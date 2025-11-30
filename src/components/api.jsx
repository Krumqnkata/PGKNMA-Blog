export const login = async (username, password) => {
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
      return JSON.parse(text);
    } catch {
      console.error("Failed to parse server response:", text);
      return { success: false, error: "Грешка при връзка със сървъра" };
    }
  } catch (err) {
    alert.error("Fetch error:", err);
    return { success: false, error: err.message || "Грешка при връзка със сървъра" };
  }
};

export const session = async () => {
  try {
    const response = await fetch("http://localhost/api/session.php", {
      method: 'GET', // session.php е само за проверка, не трябва POST
      headers: { "Content-Type": "application/json" }, // поправка: headers, не headersL
      credentials: "include" // задължително за PHP сесия
    });

    const text = await response.text();

    try {
      return JSON.parse(text); // връща JSON от PHP
    } catch (err) {
      console.error("Fetch JSON parse error:", err);
      return { success: false, error: err.message || "Грешка при връзка със сървъра" };
    }

  } catch (err) {
    console.error("Fetch error:", err);
    return { success: false, error: err.message || "Грешка при връзка със сървъра" };
  }
};






export const logout = async () => {
  try {
    const response = await fetch("http://localhost/api/logout.php", {
      method: "POST",
      credentials: "include", // важно за session cookie
      headers: {
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();
    return data; // { success: true, message: 'Logged out successfully' }
  } catch (error) {
    console.error("Logout failed:", error);
    return { success: false, error: "Logout failed" };
  }
};
