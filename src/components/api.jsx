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
