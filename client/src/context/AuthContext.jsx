import { createContext, useState, useEffect, useContext } from "react";
import { login as loginApi, register as registerApi, fetchUser } from "../api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const { data } = await fetchUser();
                    setUser(data);
                } catch (error) {
                    console.error("Failed to load user", error);
                    localStorage.removeItem("token");
                }
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    const login = async (formData) => {
        const { data } = await loginApi(formData);
        localStorage.setItem("token", data.token);
        setUser(data);
    };

    const register = async (formData) => {
        const { data } = await registerApi(formData);
        localStorage.setItem("token", data.token);
        setUser(data);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
