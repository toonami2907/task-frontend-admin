// import { url } from "@/data/url";
// import adminService from "@/hooks/axios.config";
import axios from "axios";
import Cookies from "js-cookie";

export const apiUrl = import.meta.env.VITE_API_URL;
export const url = import.meta.env.VITE_API_URL
/**
 * Retrieves the value of a cookie by name using `document.cookie`.
 * Fallback in case js-cookie doesn't work or isn't used.
 *
 * @param {string} name - The name of the cookie to retrieve.
 * @returns {string | null} - The cookie value or null if not found.
 */
function getCookie(name) {
  const cookies = document.cookie.split("; ");
  const cookie = cookies.find((row) => row.startsWith(name + "="));
  return cookie ? cookie.split("=")[1] : null;
}

/**
 * Checks if the admin is authenticated by:
 * - Retrieving the `admin_access_token` from cookies.
 * - Sending a GET request to `/api/v1/admin/profile` with the token.
 *
 * @async
 * @returns {Promise<boolean>} - `true` if authenticated, `false` otherwise.
 */
export async function checkAdminAuth() {
  try {
    // console.log(document.cookie); // 🔍 All cookies
    // console.log(Cookies.get("admin_access_token")); // 🔍 Specific token

    const token = Cookies.get("admin_access_token"); // 🍪 Using js-cookie
    const adminToken = getCookie("admin_access_token"); // 🍪 Manual fallback
    const adminId = localStorage.getItem("adminId"); // 🔐 Optional reference


    const response = await axios.get(`${url}/api/v1/admin/profile`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const { success, message } = response.data;
    return success === true && message === "admin is authenticated";
  } catch (error) {
    console.error("Auth check failed:", error.message);
    return false;
  }
}
