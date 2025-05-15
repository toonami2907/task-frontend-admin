import { useState, useEffect } from "react"
import { Trash2, Check, ChevronsUpDown, Calendar, Clock, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DateTimePicker } from "@/components/date-time-picker"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { z } from "zod"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "@/hooks/use-toast"
import Cookies from 'js-cookie'
import axios from 'axios'
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { api, useGlobalContext } from "@/context/StateProvider"

// Define Zod schema for form validation with reminder, excluding endTime
const jobSchema = z.object({
  jobTitle: z.string().min(1, "Job title is required"),
  jobDescription: z.string().min(1, "Job description is required"),
  jobDeadline: z.date({
    required_error: "Job deadline is required",
    invalid_type_error: "Job deadline must be a valid date",
  }).optional(),
  tasks: z.array(
    z.object({
      id: z.number(),
      title: z.string().min(1, "Task title is required"),
      description: z.string().optional(),
      deadline: z.date().optional(),
      resources: z.object({
        teams: z.array(z.string()),
        employees: z.array(z.string()),
      }).refine(data => {
        return data.teams.length > 0 || data.employees.length > 0;
      }, {
        message: "At least one team or employee must be assigned",
        path: ["resources"]
      }),
      reminder: z.object({
        frequency: z.enum(['once', 'daily', 'weekdays', 'weekly', 'custom']),
        channels: z.object({
          email: z.boolean(),
          pwaNotification: z.boolean()
        }),
        daysOfWeek: z.object({
          monday: z.boolean(),
          tuesday: z.boolean(),
          wednesday: z.boolean(),
          thursday: z.boolean(),
          friday: z.boolean(),
          saturday: z.boolean(),
          sunday: z.boolean()
        }).optional(),
        startTime: z.string()
      }).optional()
    }),
  ).min(1, "At least one task is required"),
})

export default function AddNewJobForm({ onCancel, onSubmit }) {
  const { api } = useGlobalContext();
  const [jobTitle, setJobTitle] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [jobDeadline, setJobDeadline] = useState(null)
  const [tasks, setTasks] = useState([])
  const [taskIdCounter, setTaskIdCounter] = useState(1)
  const [teams, setTeams] = useState([])
  const [employees, setEmployees] = useState([])
  const [popoverOpenState, setPopoverOpenState] = useState({})
  const [errors, setErrors] = useState({})
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [availableTeams, setAvailableTeams] = useState([]);
  const [availableEmployees, setAvailableEmployees] = useState([]);

  useEffect(() => {
    const storedCompany = localStorage.getItem("selectedCompany");
    if (storedCompany) {
      const company = JSON.parse(storedCompany);
      setSelectedCompany(company);
      fetchTeams(company.id);
      fetchEmployees(company.id);
    }
  }, []);

  const fetchTeams = async (companyId) => {
    try {
      const response = await axios.get(`${api}/api/v1/companies/${companyId}/teams`, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${Cookies.get('admin_access_token')}`
        }
      });
      setAvailableTeams(response.data.teams);
      setTeams(response.data.teams);
    } catch (error) {
      console.error("Error fetching teams:", error);
      toast.error("Failed to fetch teams");
    }
  };

  const fetchEmployees = async (companyId) => {
    try {
      const response = await axios.get(`${api}/api/v1/companies/${companyId}/employees`, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${Cookies.get('admin_access_token')}`
        }
      });
      setAvailableEmployees(response.data.employees);
      setEmployees(response.data.employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to fetch employees");
    }
  };

  const addTask = () => {
    // Dynamically set the default startTime to the current time in HH:MM format
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const defaultStartTime = `${hours}:${minutes}`;

    const newTask = {
      id: taskIdCounter,
      title: "",
      description: "",
      deadline: null,
      resources: { teams: [], employees: [] },
      reminder: {
        frequency: "once",
        channels: {
          email: true,
          pwaNotification: true
        },
        daysOfWeek: {
          monday: false,
          tuesday: false,
          wednesday: false,
          thursday: false,
          friday: false,
          saturday: false,
          sunday: false
        },
        startTime: defaultStartTime
      }
    }
    setTasks([...tasks, newTask])
    setTaskIdCounter(taskIdCounter + 1)

    setErrors(prev => ({
      ...prev,
      tasks: undefined
    }))
  }

  const updateTask = (id, field, value) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === id) {
          if (field === "resources") {
            return { ...task, resources: { ...task.resources, ...value } }
          }
          return { ...task, [field]: value }
        }
        return task
      }),
    )

    setErrors(prev => {
      const newErrors = { ...prev }
      if (newErrors.taskErrors && newErrors.taskErrors[id]) {
        delete newErrors.taskErrors[id][field]
        if (Object.keys(newErrors.taskErrors[id]).length === 0) {
          delete newErrors.taskErrors[id]
        }
      }
      return newErrors
    })
  }

  const updateTaskReminder = (taskId, field, value) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          if (field.includes('.')) {
            const [parent, child] = field.split('.');
            return {
              ...task,
              reminder: {
                ...task.reminder,
                [parent]: {
                  ...task.reminder[parent],
                  [child]: value
                }
              }
            };
          } else {
            return {
              ...task,
              reminder: {
                ...task.reminder,
                [field]: value
              }
            };
          }
        }
        return task
      })
    );

    setErrors(prev => {
      const newErrors = { ...prev }
      if (newErrors.taskErrors && newErrors.taskErrors[taskId]) {
        delete newErrors.taskErrors[taskId].reminder
        if (Object.keys(newErrors.taskErrors[taskId]).length === 0) {
          delete newErrors.taskErrors[taskId]
        }
      }
      return newErrors
    })
  }

  const removeTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id))

    setErrors(prev => {
      const newErrors = { ...prev }
      if (newErrors.taskErrors) {
        delete newErrors.taskErrors[id]
      }
      return newErrors
    })
  }

  const stopPropagation = (e) => {
    if (e) {
      e.stopPropagation()
      if (e.nativeEvent) {
        e.nativeEvent.stopImmediatePropagation()
      }
    }
  }

  const toggleResourceSelection = (type, resourceId, taskId, e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    const resId = String(resourceId)

    console.log(`Toggling ${type} with ID ${resId} for task ${taskId}`)

    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          const currentResources = task.resources[type] || []
          const isSelected = currentResources.includes(resId)

          console.log(`Current ${type}:`, currentResources)
          console.log(`Is already selected:`, isSelected)

          const newResources = isSelected
            ? currentResources.filter(id => id !== resId)
            : [...currentResources, resId]

          console.log(`New ${type}:`, newResources)

          return { 
            ...task, 
            resources: { 
              ...task.resources, 
              [type]: newResources 
            } 
          }
        }
        return task
      }),
    )

    setErrors(prev => {
      const newErrors = { ...prev }
      if (newErrors.taskErrors && newErrors.taskErrors[taskId]) {
        delete newErrors.taskErrors[taskId].resources
        if (Object.keys(newErrors.taskErrors[taskId]).length === 0) {
          delete newErrors.taskErrors[taskId]
        }
      }
      return newErrors
    })

    setPopoverOpenState({
      ...popoverOpenState,
      [taskId]: true
    })
  }

  const handleSelectAll = (type, taskId, e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    console.log(`Select all ${type} for task ${taskId}`)

    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          const allIds = type === "teams" 
            ? teams.map(t => String(t.id)) 
            : employees.map(e => String(e.id))

          const currentResources = task.resources[type] || []
          const isAllSelected = currentResources.length === allIds.length && 
            allIds.every(id => currentResources.includes(id))

          const newResources = isAllSelected ? [] : allIds

          console.log(`Current ${type}:`, currentResources)
          console.log(`All ${type} IDs:`, allIds)
          console.log(`Is all selected:`, isAllSelected)
          console.log(`New ${type}:`, newResources)

          return { 
            ...task, 
            resources: { 
              ...task.resources, 
              [type]: newResources 
            } 
          }
        }
        return task
      }),
    )

    setErrors(prev => {
      const newErrors = { ...prev }
      if (newErrors.taskErrors && newErrors.taskErrors[taskId]) {
        delete newErrors.taskErrors[taskId].resources
        if (Object.keys(newErrors.taskErrors[taskId]).length === 0) {
          delete newErrors.taskErrors[taskId]
        }
      }
      return newErrors
    })

    setPopoverOpenState({
      ...popoverOpenState,
      [taskId]: true
    })
  }

  const validateForm = () => {
    try {
      const formData = {
        jobTitle,
        jobDescription,
        jobDeadline,
        tasks,
      }

      jobSchema.parse(formData)
      return { valid: true, errors: {} }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = {}

        error.errors.forEach(err => {
          const path = err.path

          if (path[0] === 'tasks') {
            if (path.length > 1) {
              const taskIndex = path[1]
              const taskId = tasks[taskIndex]?.id

              if (taskId !== undefined) {
                if (!formattedErrors.taskErrors) {
                  formattedErrors.taskErrors = {}
                }
                if (!formattedErrors.taskErrors[taskId]) {
                  formattedErrors.taskErrors[taskId] = {}
                }

                if (path.length > 2) {
                  const fieldName = path[2]
                  formattedErrors.taskErrors[taskId][fieldName] = err.message
                } else {
                  formattedErrors.taskErrors[taskId].general = err.message
                }
              }
            } else {
              formattedErrors.tasks = err.message
            }
          } else {
            formattedErrors[path[0]] = err.message
          }
        })

        return { valid: false, errors: formattedErrors }
      }

      console.error("Validation error:", error)
      return { 
        valid: false, 
        errors: { general: "An unexpected error occurred during validation." } 
      }
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const validation = validateForm()

    if (!validation.valid) {
      setErrors(validation.errors)

      if (typeof toast === 'function') {
        toast({
          title: "Validation Error",
          description: "Please fix the errors in the form.",
          variant: "destructive",
        })
      }

      return
    }

    setErrors({})

    const formData = {
      jobTitle,
      jobDescription,
      jobDeadline,
      tasks,
      companyId: selectedCompany?.id
    }
    console.log("Submitting job form:", formData)

    if (onSubmit) {
      onSubmit(formData)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
  }

  const getResourceName = (type, id) => {
    const idStr = String(id)
    if (type === "teams") {
      const team = availableTeams.find(t => String(t.id) === idStr)
      return team ? team.name : "Unknown team"
    } else {
      const employee = availableEmployees.find(e => String(e.id) === idStr)
      return employee ? (employee.fullName || employee.name || "Unknown employee") : "Unknown employee"
    }
  }

  const getSelectedResourcesText = (task) => {
    const teamCount = task.resources.teams.length
    const employeeCount = task.resources.employees.length
    const total = teamCount + employeeCount

    if (total === 0) return "Select Teams or Employees"

    let text = `${total} selected`
    if (teamCount > 0 && employeeCount > 0) {
      text += ` (${teamCount} teams, ${employeeCount} employees)`
    } else if (teamCount > 0) {
      text += ` (${teamCount} teams)`
    } else if (employeeCount > 0) {
      text += ` (${employeeCount} employees)`
    }

    return text
  }

  const hasTaskErrors = (taskId) => {
    return errors.taskErrors && errors.taskErrors[taskId]
  }

  const getTaskError = (taskId, field) => {
    if (errors.taskErrors && errors.taskErrors[taskId]) {
      return errors.taskErrors[taskId][field]
    }
    return null
  }

  return (
    <div className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-black">Add New Job</CardTitle>
        <p className="text-md text-gray-900 font-medium">Job has multiple tasks assigned to teams or employees</p>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {errors.general}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title" className="text-md text-gray-900 font-semibold">Title</Label>
            <Input 
              id="title" 
              placeholder="Job Name" 
              value={jobTitle} 
              onChange={(e) => {
                setJobTitle(e.target.value)
                setErrors(prev => ({ ...prev, jobTitle: undefined }))
              }}
              className={errors.jobTitle ? "border-red-500" : ""}
            />
            {errors.jobTitle && (
              <p className="text-red-500 text-sm">{errors.jobTitle}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-md text-gray-900 font-semibold">Job Description</Label>
            <Textarea
              id="description"
              placeholder="Start typing..."
              value={jobDescription}
              onChange={(e) => {
                setJobDescription(e.target.value)
                setErrors(prev => ({ ...prev, jobDescription: undefined }))
              }}
              className={`min-h-[100px] ${errors.jobDescription ? "border-red-500" : ""}`}
            />
            {errors.jobDescription && (
              <p className="text-red-500 text-sm">{errors.jobDescription}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="deadline" className="text-md text-gray-900 font-semibold">Job Deadline</Label>
            <DateTimePicker 
              date={jobDeadline} 
              setDate={(date) => {
                setJobDeadline(date)
                setErrors(prev => ({ ...prev, jobDeadline: undefined }))
              }} 
              placeholder="Pick a date" 
            />
            {errors.jobDeadline && (
              <p className="text-red-500 text-sm">{errors.jobDeadline}</p>
            )}
          </div>

          {tasks.length > 0 && (
            <div className="space-y-4">
              {tasks.map((task, index) => (
                <div 
                  key={task.id} 
                  className={`rounded-md border ${hasTaskErrors(task.id) ? "border-red-300 bg-red-50" : "border-blue-100 bg-blue-50"} p-4`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-medium text-blue-900">Tasks {index + 1}</h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTask(task.id)}
                      className="h-6 w-6 text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove task</span>
                    </Button>
                  </div>

                  {getTaskError(task.id, 'general') && (
                    <div className="mb-3 text-sm text-red-600 bg-red-100 px-3 py-2 rounded-md">
                      {getTaskError(task.id, 'general')}
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor={`task-title-${task.id}`}>Task</Label>
                      <Input
                        id={`task-title-${task.id}`}
                        placeholder="Task Title"
                        value={task.title}
                        onChange={(e) => updateTask(task.id, "title", e.target.value)}
                        className={`mt-1 ${getTaskError(task.id, 'title') ? "border-red-500" : ""}`}
                      />
                      {getTaskError(task.id, 'title') && (
                        <p className="text-red-500 text-sm">{getTaskError(task.id, 'title')}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor={`task-description-${task.id}`}>Description</Label>
                      <Textarea
                        id={`task-description-${task.id}`}
                        placeholder="Task Desc"
                        value={task.description}
                        onChange={(e) => updateTask(task.id, "description", e.target.value)}
                        className={`mt-1 min-h-[80px] ${getTaskError(task.id, 'description') ? "border-red-500" : ""}`}
                      />
                      {getTaskError(task.id, 'description') && (
                        <p className="text-red-500 text-sm">{getTaskError(task.id, 'description')}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor={`task-deadline-${task.id}`}>Task Deadline</Label>
                      <DateTimePicker
                        date={task.deadline}
                        setDate={(date) => updateTask(task.id, "deadline", date)}
                        placeholder="Pick a date"
                      />
                      {getTaskError(task.id, 'deadline') && (
                        <p className="text-red-500 text-sm">{getTaskError(task.id, 'deadline')}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor={`task-resources-${task.id}`}>Assigned Resources</Label>
                      <Popover
                        open={popoverOpenState[task.id]}
                        onOpenChange={(open) => {
                          if (!open) {
                            const activeElement = document.activeElement;
                            if (activeElement &&
                                (activeElement.closest('[cmdk-item]') ||
                                activeElement.closest('[cmdk-input]'))) {
                              return;
                            }
                          }
                          setPopoverOpenState({...popoverOpenState, [task.id]: open});
                        }}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={`w-full justify-between mt-1 ${getTaskError(task.id, 'resources') ? "border-red-500" : ""}`}
                            onClick={(e) => {
                              stopPropagation(e);
                              setPopoverOpenState({...popoverOpenState, [task.id]: !popoverOpenState[task.id]});
                            }}
                          >
                            {getSelectedResourcesText(task)}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-full p-0"
                          onClick={stopPropagation}
                          onInteractOutside={(e) => {
                            const target = e.target;
                            if (target.closest('[cmdk-item]') || target.closest('[cmdk-input]')) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <Command>
                            <CommandInput placeholder="Search..." />
                            <CommandList>
                              <CommandEmpty>No resources found.</CommandEmpty>
                              <CommandGroup heading="Teams">
                                <div
                                  className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100"
                                  onClick={(e) => handleSelectAll("teams", task.id, e)}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      task.resources.teams.length === teams.length ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <span>(Select All Teams)</span>
                                </div>
                                {teams.map((team) => (
                                  <div
                                    key={team.id}
                                    className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100"
                                    onClick={(e) => toggleResourceSelection("teams", team.id, task.id, e)}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        task.resources.teams.includes(String(team.id)) ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <span>{team.name}</span>
                                  </div>
                                ))}
                              </CommandGroup>
                              <CommandGroup heading="Employees">
                                <div
                                  className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100"
                                  onClick={(e) => handleSelectAll("employees", task.id, e)}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      task.resources.employees.length === employees.length ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <span>(Select All Employees)</span>
                                </div>
                                {employees.map((employee) => (
                                  <div
                                    key={employee.id}
                                    className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100"
                                    onClick={(e) => toggleResourceSelection("employees", employee.id, task.id, e)}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        task.resources.employees.includes(String(employee.id)) ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <span>{employee.fullName || employee.name}</span>
                                  </div>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>

                      {getTaskError(task.id, 'resources') && (
                        <p className="text-red-500 text-sm mt-1">{getTaskError(task.id, 'resources')}</p>
                      )}

                      {(task.resources.teams.length > 0 || task.resources.employees.length > 0) && (
                        <div className="mt-2 text-sm">
                          {task.resources.teams.length > 0 && (
                            <div className="mb-1">
                              <span className="font-medium">Teams:</span>{" "}
                              {task.resources.teams.map(id => getResourceName("teams", id)).join(", ")}
                            </div>
                          )}
                          {task.resources.employees.length > 0 && (
                            <div>
                              <span className="font-medium">Employees:</span>{" "}
                              {task.resources.employees.map(id => getResourceName("employees", id)).join(", ")}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor={`task-reminder-${task.id}`}>Reminders</Label>
                      <Accordion type="single" collapsible className="mt-2 border rounded-md">
                        <AccordionItem value="reminder">
                          <AccordionTrigger className="px-4 py-2 text-sm">
                            <div className="flex items-center">
                              <Bell className="mr-2 h-4 w-4" />
                              <span>Reminder Settings</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <div className="space-y-4">
                              <div>
                                <Label className="text-sm font-medium">Frequency</Label>
                                <RadioGroup
                                  value={task.reminder?.frequency || "once"}
                                  onValueChange={(value) => updateTaskReminder(task.id, "frequency", value)}
                                  className="mt-2 space-y-1"
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="once" id={`once-${task.id}`} />
                                    <Label htmlFor={`once-${task.id}`} className="text-sm font-normal">Once</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="daily" id={`daily-${task.id}`} />
                                    <Label htmlFor={`daily-${task.id}`} className="text-sm font-normal">Daily</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="weekdays" id={`weekdays-${task.id}`} />
                                    <Label htmlFor={`weekdays-${task.id}`} className="text-sm font-normal">Weekdays (Mon-Fri)</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="weekly" id={`weekly-${task.id}`} />
                                    <Label htmlFor={`weekly-${task.id}`} className="text-sm font-normal">Weekly</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="custom" id={`custom-${task.id}`} />
                                    <Label htmlFor={`custom-${task.id}`} className="text-sm font-normal">Custom</Label>
                                  </div>
                                </RadioGroup>
                              </div>

                              {task.reminder?.frequency === "custom" && (
                                <div>
                                  <Label className="text-sm font-medium">Days of Week</Label>
                                  <div className="grid grid-cols-4 gap-2 mt-2">
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`monday-${task.id}`}
                                        checked={task.reminder?.daysOfWeek?.monday || false}
                                        onCheckedChange={(checked) =>
                                          updateTaskReminder(task.id, "daysOfWeek.monday", checked)
                                        }
                                      />
                                      <Label htmlFor={`monday-${task.id}`} className="text-sm font-normal">Mon</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`tuesday-${task.id}`}
                                        checked={task.reminder?.daysOfWeek?.tuesday || false}
                                        onCheckedChange={(checked) =>
                                          updateTaskReminder(task.id, "daysOfWeek.tuesday", checked)
                                        }
                                      />
                                      <Label htmlFor={`tuesday-${task.id}`} className="text-sm font-normal">Tue</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`wednesday-${task.id}`}
                                        checked={task.reminder?.daysOfWeek?.wednesday || false}
                                        onCheckedChange={(checked) =>
                                          updateTaskReminder(task.id, "daysOfWeek.wednesday", checked)
                                        }
                                      />
                                      <Label htmlFor={`wednesday-${task.id}`} className="text-sm font-normal">Wed</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`thursday-${task.id}`}
                                        checked={task.reminder?.daysOfWeek?.thursday || false}
                                        onCheckedChange={(checked) =>
                                          updateTaskReminder(task.id, "daysOfWeek.thursday", checked)
                                        }
                                      />
                                      <Label htmlFor={`thursday-${task.id}`} className="text-sm font-normal">Thu</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`friday-${task.id}`}
                                        checked={task.reminder?.daysOfWeek?.friday || false}
                                        onCheckedChange={(checked) =>
                                          updateTaskReminder(task.id, "daysOfWeek.friday", checked)
                                        }
                                      />
                                      <Label htmlFor={`friday-${task.id}`} className="text-sm font-normal">Fri</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`saturday-${task.id}`}
                                        checked={task.reminder?.daysOfWeek?.saturday || false}
                                        onCheckedChange={(checked) =>
                                          updateTaskReminder(task.id, "daysOfWeek.saturday", checked)
                                        }
                                      />
                                      <Label htmlFor={`saturday-${task.id}`} className="text-sm font-normal">Sat</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`sunday-${task.id}`}
                                        checked={task.reminder?.daysOfWeek?.sunday || false}
                                        onCheckedChange={(checked) =>
                                          updateTaskReminder(task.id, "daysOfWeek.sunday", checked)
                                        }
                                      />
                                      <Label htmlFor={`sunday-${task.id}`} className="text-sm font-normal">Sun</Label>
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div>
                                <Label className="text-sm font-medium">Reminder Start Time</Label>
                                <div className="flex items-center mt-2">
                                  <Clock className="mr-2 h-4 w-4 text-gray-500" />
                                  <Input
                                    type="time"
                                    value={task.reminder?.startTime}
                                    onChange={(e) => updateTaskReminder(task.id, "startTime", e.target.value)}
                                    className="w-full"
                                  />
                                </div>
                              </div>

                              <div>
                                <Label className="text-sm font-medium">Notification Channels</Label>
                                <div className="space-y-2 mt-2">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`email-${task.id}`}
                                      checked={task.reminder?.channels?.email !== false}
                                      onCheckedChange={(checked) =>
                                        updateTaskReminder(task.id, "channels.email", checked)
                                      }
                                    />
                                    <Label htmlFor={`email-${task.id}`} className="text-sm font-normal">Email</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`pwa-${task.id}`}
                                      checked={task.reminder?.channels?.pwaNotification !== false}
                                      onCheckedChange={(checked) =>
                                        updateTaskReminder(task.id, "channels.pwaNotification", checked)
                                      }
                                    />
                                    <Label htmlFor={`pwa-${task.id}`} className="text-sm font-normal">Push Notification</Label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {errors.tasks && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {errors.tasks}
            </div>
          )}

          {tasks.length === 0 ? (
            <Button type="button" variant="outline" onClick={addTask} className="mt-2 font-semibold text-black text-md">
              Add Task
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={addTask} className="mt-2 font-semibold text-black text-md">
              Add More
            </Button>
          )}

          {tasks.length > 0 && <p className="text-sm text-muted-foreground">{tasks.length} Tasks Added</p>}
        </CardContent>
        <CardFooter className="flex justify-end gap-2 border-t p-4">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="default" className="bg-black text-white hover:bg-black/90">
            Submit
          </Button>
        </CardFooter>
      </form>
    </div>
  )
}