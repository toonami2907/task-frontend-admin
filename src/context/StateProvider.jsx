// import adminService from "@/hooks/admin.axios";
import { checkAdminAuth } from "@/hooks/admin_auth_checker";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Cookie from 'js-cookie'

export const StateContext = createContext();
export const api = import.meta.env.VITE_API_URL;

export default function StateProvider({ children }) {
  const [adminStats, setAdminStats] = useState([]);
  const [adminInfo, setAdminInfo] = useState({});
  const [companies, setCompanies] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [employeesCount, setEmployeesCount] = useState(0);
  const [teams, setTeams] = useState([]);
  const [teamsCount, setTeamsCount] = useState(0); // Add teams count state
  const [jobs, setJobs] = useState([]);
  const [jobsCount, setJobsCount] = useState(0);
  const [companiesCount, setCompaniesCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const adminId = localStorage.getItem("adminId");

  // Fetch companies from backend on mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${api}/api/v1/companies`,  {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Cookie.get('admin_access_token')}`
          },
        });
        setCompanies(response.data.companies);
        setCompaniesCount(response.data.count);
      } catch (error) {
        console.error("Error fetching companies:", error);
        // toast.error("Failed to fetch companies");
      } finally {
        setLoading(false);
      }
    };

    const fetchAdminById = async () => {
      try {
        const response = await axios.get(`${api}/api/v1/admin/${adminId}/admin`,  {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Cookie.get('admin_access_token')}`
          },
        });
        setAdminInfo(response.data.admin);
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchAllTeams = async () => {
      try {
        const storedCompany = localStorage.getItem("selectedCompany");
        if (!storedCompany) {
          setTeams([]);
          setTeamsCount(0);
          return;
        }
        const parsedCompany = JSON.parse(storedCompany);
        if (!parsedCompany?.id) {
          setTeams([]);
          setTeamsCount(0);
          return;
        }

        setLoading(true);
        const response = await axios.get(`${api}/api/v1/teams`,  {
          params: { companyId: parsedCompany.id },
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Cookie.get('admin_access_token')}`
          },
        });
        setTeams(response.data.teams);
        setTeamsCount(response.data.count);
      } catch (error) {
        console.error("Error fetching teams:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchJobs = async () => {
      try {
        // Fallback to localStorage for jobs until backend is implemented
        const storedJobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        setJobs(storedJobs);
        setJobsCount(storedJobs.length);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };

    fetchCompanies();
    // fetchAllEmployees();
    fetchAllTeams(); // Add teams fetch
    fetchJobs();
    fetchAdminById()
  }, []);

  // Method to add a new company to backend
  const addCompany = useCallback(async (newCompany) => {
    try {
      setLoading(true);
      // Send company data to backend
      const response = await axios.post(`${api}/api/v1/companies`, {
        name: newCompany.name,
        nature: newCompany.nature || "Not specified",
        natureOther: newCompany.nature === "Other" ? newCompany.natureOther : undefined
      },  {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookie.get('admin_access_token')}`
        },
      });

      // Update state with the returned company data
      const createdCompany = response.data.company;
      setCompanies(prevCompanies => [...prevCompanies, createdCompany]);
      setCompaniesCount(prev => prev + 1);
      
      toast.success("Company created successfully");
      return createdCompany;
    } catch (error) {
      console.error("Error creating company:", error);
      
      if (error.response) {
        toast.error(error.response.data.error || "Failed to create company");
      } else {
        toast.error("Network error. Please try again.");
      }
      
      throw error; // Re-throw to allow handling in the component
    } finally {
      setLoading(false);
    }
  }, [api]);

  // Method to add a new employee and update count
  const addEmployee = useCallback(async (employeeData) => {
    try {
      setLoading(true);
      const response = await axios.post(`${api}/api/v1/employees`, employeeData,  {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookie.get('admin_access_token')}`
        },
      });
      
      const newEmployee = response.data.employee;
      
      // Update employees state and count
      setEmployees(prev => [...prev, newEmployee]);
      setEmployeesCount(prev => prev + 1);
      
      return newEmployee;
    } catch (error) {
      console.error("Error creating employee:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [api]);

  // Method to add a new team and update count
  const addTeam = useCallback(async (teamData) => {
    try {
      setLoading(true);
      const response = await axios.post(`${api}/api/v1/teams`, teamData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookie.get('admin_access_token')}`
        },
      });
      
      const newTeam = response.data.team;
      
      // Update teams state and count
      setTeams(prev => [...prev, newTeam]);
      setTeamsCount(prev => prev + 1);
      
      return newTeam;
    } catch (error) {
      console.error("Error creating team:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [api]);

  // Method to fetch employees by company
  const fetchEmployeesByCompany = useCallback(async (companyId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${api}/api/v1/companies/${companyId}/employees`,  {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookie.get('admin_access_token')}`
        },
      });
      setEmployees(response.data.employees);
      setEmployeesCount(response.data.count);
      // console.log("Response data:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching employees by company:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [api]);

  // Method to fetch teams by company
  const fetchTeamsByCompany = useCallback(async (companyId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${api}/api/v1/companies/${companyId}/teams`,  {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookie.get('admin_access_token')}`
        },
      });
      
      return response.data;
    } catch (error) {
      console.error("Error fetching teams by company:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [api]);

  // Method to add a new job
  const addJob = useCallback(async (jobData) => {
    try {
      setLoading(true);
      const response = await axios.post(`${api}/api/v1/jobs`, jobData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookie.get('admin_access_token')}`
        },
      });
      
      const newJob = response.data.job;
      
      // Update jobs state and count
      setJobs(prev => [...prev, newJob]);
      setJobsCount(prev => prev + 1);
      
      return newJob;
    } catch (error) {
      console.error("Error creating job:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [api]);

  // Method to fetch jobs by company
  const fetchJobsByCompany = useCallback(async (companyId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${api}/api/v1/companies/${companyId}/jobs`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookie.get('admin_access_token')}`
        },
      });
      
      setJobs(response.data.jobs);
      setJobsCount(response.data.count);
      
      return response.data;
    } catch (error) {
      console.error("Error fetching jobs by company:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [api]);

  return (
    <StateContext.Provider
      value={{
        companies,
        addCompany,
        adminStats,
        setAdminStats,
        companiesCount,
        jobs,
        setJobs,
        jobsCount,
        setJobsCount,
        employees,
        employeesCount,
        setEmployeesCount,
        addEmployee,
        fetchEmployeesByCompany,
        teams,
        teamsCount,
        setCompaniesCount,
        setTeamsCount,
        addTeam,
        setCompanies,
        adminInfo,
        fetchTeamsByCompany,
        addJob,
        fetchJobsByCompany,
        loading,
        api
      }}
    >
      {children}
    </StateContext.Provider>
  );
}

export const useGlobalContext = () => {
  const context = useContext(StateContext);
  if (!context) throw new Error("useGlobalContext must be used within a StateProvider");
  return context;
};
