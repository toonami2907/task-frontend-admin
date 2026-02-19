"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { z } from "zod"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronsUpDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import axios from "axios"
import toast, { Toaster } from "react-hot-toast"
import { api, useGlobalContext } from "@/context/StateProvider"
import Cookies from "js-cookie"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"

const isActiveEmployee = (employee) =>
  !employee?.isDeleted && String(employee?.status || "").toLowerCase() !== "deleted"

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
  const [searchTerm, setSearchTerm] = useState("")
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()

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

  useEffect(() => {
    const shouldOpenCreate = searchParams.get("modal") === "create"
    if (shouldOpenCreate) {
      setIsModalOpen(true)
      setEditTeamId(null)
    } else {
      setIsModalOpen(false)
    }
  }, [searchParams])

  const closeTeamModal = () => {
    setIsModalOpen(false)
    if (searchParams.get("modal") === "create") {
      navigate(location.pathname, { replace: true })
    }
  }

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
      setEmployees((response.data.employees || []).filter(isActiveEmployee))
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
      closeTeamModal()
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

  const filteredTeams = teams.filter((team) =>
    team.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const totalPages = Math.ceil(filteredTeams.length / teamsPerPage)
  const startIndex = (currentPage - 1) * teamsPerPage
  const currentTeams = filteredTeams.slice(startIndex, startIndex + teamsPerPage)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredTeams.length / teamsPerPage))
    if (currentPage > maxPage) {
      setCurrentPage(maxPage)
    }
  }, [filteredTeams.length, currentPage])

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto min-h-screen">
  <Toaster position="top-center" />
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3 sm:mb-4">
    <div>
      <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Teams</h1>
      <p className="text-xs sm:text-sm text-slate-500 mt-1">
        Total: {filteredTeams.length} team{filteredTeams.length !== 1 ? "s" : ""}
      </p>
    </div>
    <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
      <Input
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        placeholder="Search teams"
        className="h-10 w-full sm:w-64 border-slate-300"
      />
      <Button
        onClick={() => {
          setFormData({ name: "", employees: [] });
          setEditTeamId(null);
          setIsModalOpen(true);
        }}
        className="h-10 w-full sm:w-auto bg-blue-700 text-white hover:bg-blue-600"
      >
        New Team
      </Button>
    </div>
  </div>

  {(isLoading || loading) && !isModalOpen ? (
    <div className="flex justify-center items-center h-40">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  ) : (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="grid grid-cols-1 sm:grid-cols-3 p-3 font-semibold bg-slate-50 text-[11px] uppercase tracking-wide text-slate-600">
        <div>Team</div>
        <div>Employees</div>
        <div className="text-center">Actions</div>
      </div>
      <div className="overflow-y-auto max-h-[calc(100vh-300px)] divide-y divide-slate-100">
        {currentTeams.length > 0 ? (
          currentTeams.map((team) => (
            <div key={team.id} className="grid grid-cols-1 sm:grid-cols-3 p-3 text-sm hover:bg-slate-50/70 transition-colors">
              <div>
                <p className="line-clamp-1 font-medium text-slate-900">{team.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {team.employees?.length || 0} member{(team.employees?.length || 0) !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="line-clamp-1 text-slate-700">
                {team.employees
                  .map((emp) =>
                    typeof emp === "object"
                      ? emp.fullName
                      : employees.find((e) => e.id.toString() === emp)?.fullName || "Unknown"
                  )
                  .join(", ")}
              </div>
              <div className="flex justify-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-slate-600 hover:text-slate-900">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onClick={() => handleEdit(team)} className="text-sm">
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Team
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(team.id)}
                      className="text-sm text-red-600 focus:text-red-700"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Team
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-slate-500 text-sm">
            {searchTerm ? "No teams match your search." : "No teams found."}
          </div>
        )}
      </div>
    </div>
  )}

  <div className="flex justify-end mt-3 sm:mt-4 gap-2">
    <Button
      variant="outline"
      onClick={handlePrevious}
      disabled={currentPage === 1}
      className="h-9 px-3 text-sm border-slate-300"
    >
      Previous
    </Button>
    <Button
      variant="outline"
      onClick={handleNext}
      disabled={currentPage === totalPages || totalPages === 0}
      className="h-9 px-3 text-sm border-slate-300"
    >
      Next
    </Button>
  </div>

  <Modal
    isOpen={isModalOpen}
    onClose={closeTeamModal}
    title={editTeamId !== null ? "Edit Team" : "Create New Team"}
    className="w-[92%] sm:max-w-xl"
  >
    <div className="px-4 sm:px-6 pb-4 sm:pb-6">
      <p className="text-sm text-slate-600 mb-4">
        {editTeamId !== null ? "Edit team details" : "Create a new employee team"}
      </p>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name" className="text-sm font-medium text-slate-700">Team Name</Label>
          <Input
            id="name"
            placeholder="Team Name"
            value={formData.name}
            onChange={handleInputChange}
            disabled={isLoading || loading}
            className="h-10 text-sm border-slate-300"
          />
          {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
        </div>
        <div className="grid gap-2">
          <Label className="text-sm font-medium text-slate-700">Employees</Label>
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="h-10 w-full justify-between text-sm border-slate-300"
                disabled={isLoading || loading}
              >
                {formData.employees.length > 0
                  ? `${formData.employees.length} selected`
                  : "Select Employees"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 border-slate-200">
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
        <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-slate-200">
          <Button
            type="button"
            variant="outline"
            onClick={closeTeamModal}
            disabled={isLoading || loading}
            className="h-10 px-4 text-sm border-slate-300"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || loading}
            className="h-10 px-4 text-sm bg-blue-700 text-white hover:bg-blue-600"
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


