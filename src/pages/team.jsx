"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { z } from "zod"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronsUpDown, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import axios from "axios"
import toast, { Toaster } from "react-hot-toast"
import { api, useGlobalContext } from "@/context/StateProvider"
import Cookies from "js-cookie"

// Define Zod schema for team form validation
const teamSchema = z.object({
  name: z.string().min(1, "Team Name is required"),
  employees: z.array(z.string()).min(1, "At least one employee must be selected")
})

export default function TeamsPage() {
  const { addTeam, fetchTeamsByCompany, loading, setTeamsCount } = useGlobalContext()
  const [teams, setTeams] = useState([])
  const [employees, setEmployees] = useState([])
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editTeamId, setEditTeamId] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [formData, setFormData] = useState({ name: "", employees: [] })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const teamsPerPage = 10
  const [popoverOpen, setPopoverOpen] = useState(false)

  // Load selected company from localStorage on component mount
  useEffect(() => {
    const storedCompany = localStorage.getItem("selectedCompany")
    if (storedCompany) {
      const company = JSON.parse(storedCompany)
      setSelectedCompany(company)
      fetchTeams(company.id)
      fetchEmployees(company.id)
    } else {
      toast.error("No company selected")
    }
  }, [])

  // Fetch teams from backend
  const fetchTeams = async (companyId) => {
    try {
      setIsLoading(true)
      const response = await fetchTeamsByCompany(companyId)
      setTeams(response.teams)
      setTeamsCount(response.count) // Update global teams count
    } catch (error) {
      console.error("Error fetching teams:", error)
      toast.error("Failed to fetch teams")
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch employees from backend
  const fetchEmployees = async (companyId) => {
    try {
      setIsLoading(true)
      const response = await axios.get(`${api}/api/v1/companies/${companyId}/employees`, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${Cookies.get('admin_access_token')}`
        }
      })
      setEmployees(response.data.employees)
    } catch (error) {
      console.error("Error fetching employees:", error)
      toast.error("Failed to fetch employees")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
    setErrors(prev => ({ ...prev, [id]: undefined }))
  }

  const toggleEmployeeSelection = (employeeId, e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    const empId = String(employeeId)
    setFormData(prev => {
      const newEmployees = prev.employees.includes(empId)
        ? prev.employees.filter(id => id !== empId)
        : [...prev.employees, empId]
      return { ...prev, employees: newEmployees }
    })
    setErrors(prev => ({ ...prev, employees: undefined }))
  }

  const handleSelectAll = (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (formData.employees.length === employees.length) {
      setFormData(prev => ({ ...prev, employees: [] }))
    } else {
      setFormData(prev => ({ ...prev, employees: employees.map(emp => emp.id.toString()) }))
    }
    setErrors(prev => ({ ...prev, employees: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      teamSchema.parse(formData)
      setIsLoading(true)
      
      if (!selectedCompany) {
        toast.error("No company selected")
        return
      }
      
      // Ensure employees are just ID strings
      const cleanedEmployees = formData.employees.map(emp => {
        if (typeof emp === 'object') {
          return emp.id ? emp.id.toString() : emp._id ? emp._id.toString() : emp.toString()
        }
        return emp.toString()
      })
      
      const teamData = {
        name: formData.name,
        companyId: selectedCompany.id,
        employees: cleanedEmployees
      }
      
      if (editTeamId !== null) {
        // Update existing team
        const response = await axios.put(`${api}/api/v1/teams/${editTeamId}`, teamData, {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${Cookies.get('admin_access_token')}`
          }
        })
        
        // Update local state
        setTeams(teams.map(team => team.id === editTeamId ? response.data.team : team))
        toast.success("Team updated successfully")
      } else {
        // Create new team using the global addTeam function
        const newTeam = await addTeam(teamData)
        
        // Update local state
        setTeams(prev => [...prev, newTeam])
        toast.success("Team created successfully")
      }
      
      // Reset form and close modal
      setFormData({ name: "", employees: [] })
      setErrors({})
      setEditTeamId(null)
      setIsModalOpen(false)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors = error.errors.reduce((acc, curr) => {
          acc[curr.path[0]] = curr.message
          return acc
        }, {})
        setErrors(newErrors)
      } else {
        console.error("Error saving team:", error)
        toast.error(error.response?.data?.error || "Failed to save team")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (team) => {
    setFormData({ 
      name: team.name, 
      employees: team.employees.map(emp => {
        // Handle different possible formats of employee data
        if (typeof emp === 'object') {
          return emp.id ? emp.id.toString() : emp._id ? emp._id.toString() : emp.toString()
        }
        return emp.toString()
      }) 
    })
    setEditTeamId(team.id)
    setIsModalOpen(true)
  }

  const handleDelete = async (teamId) => {
    try {
      setIsLoading(true)
      await axios.delete(`${api}/api/v1/teams/${teamId}`, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${Cookies.get('admin_access_token')}`
        }
      })
      
      // Update local state
      setTeams(teams.filter(team => team.id !== teamId))
      setTeamsCount(prev => prev - 1) // Update global teams count
      toast.success("Team deleted successfully")
    } catch (error) {
      console.error("Error deleting team:", error)
      toast.error(error.response?.data?.error || "Failed to delete team")
    } finally {
      setIsLoading(false)
    }
  }

  const totalPages = Math.ceil(teams.length / teamsPerPage)
  const startIndex = (currentPage - 1) * teamsPerPage
  const currentTeams = teams.slice(startIndex, startIndex + teamsPerPage)

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  return (
    <div className="p-4 sm:p-6 max-w-screen-lg mx-auto min-h-screen">
  <Toaster position="top-center" />
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4">
    <h1 className="text-xl sm:text-2xl font-bold">Teams</h1>
    <Button
      onClick={() => {
        setFormData({ name: "", employees: [] });
        setEditTeamId(null);
        setIsModalOpen(true);
      }}
      className="mt-2 sm:mt-0 w-full sm:w-auto"
    >
      New Team
    </Button>
  </div>

  {(isLoading || loading) && !isModalOpen ? (
    <div className="flex justify-center items-center h-40">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  ) : (
    <div className="border rounded-md">
      <div className="grid grid-cols-1 sm:grid-cols-3 p-2 sm:p-3 font-semibold bg-gray-100 text-xs sm:text-sm">
        <div>Team</div>
        <div>Employees</div>
        <div className="text-center">Actions</div>
      </div>
      <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
        {currentTeams.length > 0 ? (
          currentTeams.map((team) => (
            <div key={team.id} className="grid grid-cols-1 sm:grid-cols-3 p-2 sm:p-3 border-t text-sm">
              <div className="line-clamp-1">{team.name}</div>
              <div className="line-clamp-1">
                {team.employees
                  .map((emp) =>
                    typeof emp === "object"
                      ? emp.fullName
                      : employees.find((e) => e.id.toString() === emp)?.fullName || "Unknown"
                  )
                  .join(", ")}
              </div>
              <div className="flex justify-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-40">
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(team)}
                        className="justify-start text-sm"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(team.id)}
                        className="justify-start text-red-600 hover:text-red-600 hover:bg-red-100 text-sm"
                      >
                        Delete
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          ))
        ) : (
          <div className="p-3 text-center text-gray-500 text-sm">No teams found.</div>
        )}
      </div>
    </div>
  )}

  <div className="flex justify-end mt-3 sm:mt-4 gap-2">
    <Button
      variant="outline"
      onClick={handlePrevious}
      disabled={currentPage === 1}
      className="px-2 py-1 sm:px-3 sm:py-1 text-sm"
    >
      Previous
    </Button>
    <Button
      variant="outline"
      onClick={handleNext}
      disabled={currentPage === totalPages || totalPages === 0}
      className="px-2 py-1 sm:px-3 sm:py-1 text-sm"
    >
      Next
    </Button>
  </div>

  <Modal
    isOpen={isModalOpen}
    onClose={() => setIsModalOpen(false)}
    title={editTeamId !== null ? "Edit Team" : "Create New Team"}
    className="w-[90%] sm:max-w-md p-4 sm:p-6"
  >
    <div className="px-2 sm:px-6 pb-2 sm:pb-6">
      <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-4">
        {editTeamId !== null ? "Edit team details" : "Create a new employee team"}
      </p>
      <form onSubmit={handleSubmit} className="grid gap-2 sm:gap-4">
        <div className="grid gap-1 sm:gap-2">
          <Label htmlFor="name" className="text-xs sm:text-sm">Name</Label>
          <Input
            id="name"
            placeholder="Team Name"
            value={formData.name}
            onChange={handleInputChange}
            disabled={isLoading || loading}
            className="text-sm"
          />
          {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
        </div>
        <div className="grid gap-1 sm:gap-2">
          <Label className="text-xs sm:text-sm">Employees</Label>
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between text-sm"
                disabled={isLoading || loading}
              >
                {formData.employees.length > 0
                  ? `${formData.employees.length} selected`
                  : "Select Employees"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command shouldFilter={false}>
                <CommandInput placeholder="Search..." className="text-sm" />
                <CommandList>
                  <CommandEmpty>No employees found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="select-all"
                      onSelect={(value, e) => handleSelectAll(e)}
                      className="text-sm"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          formData.employees.length === employees.length
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      (Select All)
                    </CommandItem>
                    {employees.map((employee) => (
                      <CommandItem
                        key={employee.id}
                        value={employee.fullName}
                        onSelect={(value, e) => toggleEmployeeSelection(employee.id.toString(), e)}
                        className="text-sm"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.employees.includes(employee.id.toString())
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {employee.fullName}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {errors.employees && <p className="text-red-500 text-xs">{errors.employees}</p>}
        </div>
        <div className="flex justify-end gap-2 mt-2 sm:mt-4 pt-2 sm:pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsModalOpen(false)}
            disabled={isLoading || loading}
            className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || loading}
            className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1"
          >
            {(isLoading || loading) ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </div>
  </Modal>
</div>
  )
}
