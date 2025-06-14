"use client"

import type React from "react"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Play,
  Pause,
  Settings,
  Activity,
  Users,
  FileText,
  BarChart3,
} from "lucide-react"
import { toast } from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

// Add this after the existing imports
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock data and types
interface Agent {
  id: string
  name: string
  role: string
  status: "active" | "idle" | "error" | "stopped"
  description: string
  avatar?: string
  lastActive: string
  tasksCompleted: number
  successRate: number
  currentTask?: string
  crew?: string
}

// Add these interfaces after the existing ones
interface AgentConfig {
  id?: string
  name: string
  role: string
  description: string
  goal: string
  backstory: string
  tools: string[]
  maxIter: number
  verbose: boolean
  allowDelegation: boolean
}

interface LogEntry {
  id: string
  agentId: string
  agentName: string
  timestamp: string
  level: "info" | "warning" | "error" | "success"
  message: string
  details?: string
}

interface CrewStats {
  totalAgents: number
  activeAgents: number
  completedTasks: number
  averageSuccessRate: number
}

// Mock data
const mockAgents: Agent[] = [
  {
    id: "1",
    name: "Research Agent Alpha",
    role: "Researcher",
    status: "active",
    description: "Specialized in market research and data analysis",
    lastActive: "2 minutes ago",
    tasksCompleted: 47,
    successRate: 94,
    currentTask: "Analyzing competitor pricing strategies",
    crew: "Market Analysis Crew",
  },
  {
    id: "2",
    name: "Content Writer Beta",
    role: "Writer",
    status: "idle",
    description: "Creates engaging content and documentation",
    lastActive: "15 minutes ago",
    tasksCompleted: 32,
    successRate: 89,
    crew: "Content Creation Crew",
  },
  {
    id: "3",
    name: "Data Analyst Gamma",
    role: "Analyst",
    status: "active",
    description: "Processes and interprets complex datasets",
    lastActive: "1 minute ago",
    tasksCompleted: 28,
    successRate: 97,
    currentTask: "Processing quarterly sales data",
    crew: "Analytics Crew",
  },
  {
    id: "4",
    name: "QA Specialist Delta",
    role: "Quality Assurance",
    status: "error",
    description: "Ensures quality and accuracy of outputs",
    lastActive: "5 minutes ago",
    tasksCompleted: 15,
    successRate: 85,
    crew: "Quality Control Crew",
  },
]

// Add this mock data after the existing mock data
const mockAgentConfigs: AgentConfig[] = [
  {
    id: "1",
    name: "Research Agent Alpha",
    role: "Researcher",
    description: "Specialized in market research and data analysis",
    goal: "Conduct thorough market research and provide actionable insights",
    backstory: "An experienced market researcher with 10+ years in the industry",
    tools: ["web_search", "data_analysis", "report_generator"],
    maxIter: 5,
    verbose: true,
    allowDelegation: false,
  },
  {
    id: "2",
    name: "Content Writer Beta",
    role: "Writer",
    description: "Creates engaging content and documentation",
    goal: "Create high-quality, engaging content that resonates with the target audience",
    backstory: "A creative writer with expertise in technical and marketing content",
    tools: ["text_generator", "grammar_checker", "seo_optimizer"],
    maxIter: 3,
    verbose: false,
    allowDelegation: true,
  },
]

const availableTools = [
  "web_search",
  "data_analysis",
  "report_generator",
  "text_generator",
  "grammar_checker",
  "seo_optimizer",
  "email_sender",
  "file_manager",
  "api_caller",
]

const mockLogs: LogEntry[] = [
  {
    id: "1",
    agentId: "1",
    agentName: "Research Agent Alpha",
    timestamp: "2024-01-15 14:30:25",
    level: "success",
    message: "Task completed successfully",
    details: "Market research analysis completed with 94% confidence score",
  },
  {
    id: "2",
    agentId: "3",
    agentName: "Data Analyst Gamma",
    timestamp: "2024-01-15 14:28:15",
    level: "info",
    message: "Processing data batch",
    details: "Processing 1,247 records from quarterly sales dataset",
  },
  {
    id: "3",
    agentId: "4",
    agentName: "QA Specialist Delta",
    timestamp: "2024-01-15 14:25:10",
    level: "error",
    message: "Quality check failed",
    details: "Output quality below threshold (75%). Requires manual review.",
  },
  {
    id: "4",
    agentId: "2",
    agentName: "Content Writer Beta",
    timestamp: "2024-01-15 14:20:05",
    level: "warning",
    message: "Low confidence score",
    details: "Content generation completed with 68% confidence. Consider review.",
  },
]

// API functions
const fetchAgents = async (): Promise<Agent[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return mockAgents
}

const fetchLogs = async (): Promise<LogEntry[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockLogs
}

const fetchStats = async (): Promise<CrewStats> => {
  await new Promise((resolve) => setTimeout(resolve, 200))
  return {
    totalAgents: mockAgents.length,
    activeAgents: mockAgents.filter((a) => a.status === "active").length,
    completedTasks: mockAgents.reduce((sum, agent) => sum + agent.tasksCompleted, 0),
    averageSuccessRate: Math.round(mockAgents.reduce((sum, agent) => sum + agent.successRate, 0) / mockAgents.length),
  }
}

// Add this new component after the existing components
function AgentConfigForm({
  agent,
  onSave,
  onCancel,
}: {
  agent?: AgentConfig
  onSave: (config: AgentConfig) => void
  onCancel: () => void
}) {
  const [config, setConfig] = useState<AgentConfig>(
    agent || {
      name: "",
      role: "",
      description: "",
      goal: "",
      backstory: "",
      tools: [],
      maxIter: 5,
      verbose: true,
      allowDelegation: false,
    },
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(config)
  }

  const toggleTool = (tool: string) => {
    setConfig((prev) => ({
      ...prev,
      tools: prev.tools.includes(tool) ? prev.tools.filter((t) => t !== tool) : [...prev.tools, tool],
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Agent Name</Label>
          <Input
            id="name"
            value={config.name}
            onChange={(e) => setConfig((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Input
            id="role"
            value={config.role}
            onChange={(e) => setConfig((prev) => ({ ...prev, role: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={config.description}
          onChange={(e) => setConfig((prev) => ({ ...prev, description: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="goal">Goal</Label>
        <Textarea
          id="goal"
          value={config.goal}
          onChange={(e) => setConfig((prev) => ({ ...prev, goal: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="backstory">Backstory</Label>
        <Textarea
          id="backstory"
          value={config.backstory}
          onChange={(e) => setConfig((prev) => ({ ...prev, backstory: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Tools</Label>
        <div className="grid grid-cols-3 gap-2">
          {availableTools.map((tool) => (
            <div key={tool} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={tool}
                checked={config.tools.includes(tool)}
                onChange={() => toggleTool(tool)}
                className="rounded"
              />
              <Label htmlFor={tool} className="text-sm">
                {tool}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="maxIter">Max Iterations</Label>
          <Input
            id="maxIter"
            type="number"
            min="1"
            max="10"
            value={config.maxIter}
            onChange={(e) => setConfig((prev) => ({ ...prev, maxIter: Number.parseInt(e.target.value) }))}
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="verbose"
            checked={config.verbose}
            onChange={(e) => setConfig((prev) => ({ ...prev, verbose: e.target.checked }))}
          />
          <Label htmlFor="verbose">Verbose</Label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="allowDelegation"
            checked={config.allowDelegation}
            onChange={(e) => setConfig((prev) => ({ ...prev, allowDelegation: e.target.checked }))}
          />
          <Label htmlFor="allowDelegation">Allow Delegation</Label>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{agent ? "Update Agent" : "Create Agent"}</Button>
      </div>
    </form>
  )
}

// Add this new component after AgentConfigForm
function AgentsSection() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAgent, setSelectedAgent] = useState<AgentConfig | undefined>()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const queryClient = useQueryClient()

  const { data: agentConfigs = [], isLoading } = useQuery({
    queryKey: ["agent-configs"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      return mockAgentConfigs
    },
  })

  const createAgentMutation = useMutation({
    mutationFn: async (config: AgentConfig) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return { ...config, id: Date.now().toString() }
    },
    onSuccess: () => {
      toast.success("Agent created successfully")
      setIsCreateDialogOpen(false)
      queryClient.invalidateQueries({ queryKey: ["agent-configs"] })
    },
    onError: () => {
      toast.error("Failed to create agent")
    },
  })

  const updateAgentMutation = useMutation({
    mutationFn: async (config: AgentConfig) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return config
    },
    onSuccess: () => {
      toast.success("Agent updated successfully")
      setIsEditDialogOpen(false)
      setSelectedAgent(undefined)
      queryClient.invalidateQueries({ queryKey: ["agent-configs"] })
    },
    onError: () => {
      toast.error("Failed to update agent")
    },
  })

  const deleteAgentMutation = useMutation({
    mutationFn: async (id: string) => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      return id
    },
    onSuccess: () => {
      toast.success("Agent deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["agent-configs"] })
    },
    onError: () => {
      toast.error("Failed to delete agent")
    },
  })

  const filteredAgents = agentConfigs.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agent Management</h1>
          <p className="text-muted-foreground">Configure and manage your CrewAI agents</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Agent
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Agent</DialogTitle>
              <DialogDescription>Configure a new CrewAI agent with custom settings and tools.</DialogDescription>
            </DialogHeader>
            <AgentConfigForm
              onSave={(config) => createAgentMutation.mutate(config)}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agent Configurations</CardTitle>
          <CardDescription>Manage your CrewAI agent configurations and settings</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Tools</TableHead>
                  <TableHead>Settings</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {agent.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{agent.name}</div>
                          <div className="text-sm text-muted-foreground">{agent.description}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{agent.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {agent.tools.slice(0, 2).map((tool) => (
                          <Badge key={tool} variant="secondary" className="text-xs">
                            {tool}
                          </Badge>
                        ))}
                        {agent.tools.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{agent.tools.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        <div>Max Iter: {agent.maxIter}</div>
                        <div className="flex space-x-2">
                          {agent.verbose && (
                            <Badge variant="outline" className="text-xs">
                              Verbose
                            </Badge>
                          )}
                          {agent.allowDelegation && (
                            <Badge variant="outline" className="text-xs">
                              Delegation
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedAgent(agent)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteAgentMutation.mutate(agent.id!)}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Agent Configuration</DialogTitle>
            <DialogDescription>Update the agent configuration and settings.</DialogDescription>
          </DialogHeader>
          {selectedAgent && (
            <AgentConfigForm
              agent={selectedAgent}
              onSave={(config) => updateAgentMutation.mutate(config)}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setSelectedAgent(undefined)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Components
function AgentCard({ agent }: { agent: Agent }) {
  const queryClient = useQueryClient()

  const toggleAgentMutation = useMutation({
    mutationFn: async (action: "start" | "stop") => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return action
    },
    onSuccess: (action) => {
      toast.success(`Agent ${action === "start" ? "started" : "stopped"} successfully`)
      queryClient.invalidateQueries({ queryKey: ["agents"] })
    },
    onError: () => {
      toast.error("Failed to update agent status")
    },
  })

  const getStatusColor = (status: Agent["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "idle":
        return "bg-yellow-500"
      case "error":
        return "bg-red-500"
      case "stopped":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusBadgeVariant = (status: Agent["status"]) => {
    switch (status) {
      case "active":
        return "default"
      case "idle":
        return "secondary"
      case "error":
        return "destructive"
      case "stopped":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={agent.avatar || "/placeholder.svg"} />
                <AvatarFallback>
                  {agent.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(agent.status)}`}
              />
            </div>
            <div>
              <CardTitle className="text-lg">{agent.name}</CardTitle>
              <CardDescription>{agent.role}</CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => toggleAgentMutation.mutate("start")}>
                <Play className="h-4 w-4 mr-2" />
                Start
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleAgentMutation.mutate("stop")}>
                <Pause className="h-4 w-4 mr-2" />
                Stop
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant={getStatusBadgeVariant(agent.status)}>
              {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
            </Badge>
            <span className="text-sm text-muted-foreground">{agent.lastActive}</span>
          </div>

          <p className="text-sm text-muted-foreground">{agent.description}</p>

          {agent.currentTask && (
            <div className="p-2 bg-muted rounded-md">
              <p className="text-sm font-medium">Current Task:</p>
              <p className="text-sm text-muted-foreground">{agent.currentTask}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">{agent.tasksCompleted}</p>
              <p className="text-muted-foreground">Tasks Completed</p>
            </div>
            <div>
              <p className="font-medium">{agent.successRate}%</p>
              <p className="text-muted-foreground">Success Rate</p>
            </div>
          </div>

          {agent.crew && (
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">Crew: {agent.crew}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Modify the AppSidebar component to use onClick handlers instead of links
function AppSidebar({
  activeSection,
  setActiveSection,
}: { activeSection: string; setActiveSection: (section: string) => void }) {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center space-x-2 px-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Users className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold">CrewAI Dashboard</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeSection === "dashboard"}
                  onClick={() => setActiveSection("dashboard")}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeSection === "agents"} onClick={() => setActiveSection("agents")}>
                  <Users className="h-4 w-4" />
                  <span>Agents</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeSection === "monitoring"}
                  onClick={() => setActiveSection("monitoring")}
                >
                  <Activity className="h-4 w-4" />
                  <span>Monitoring</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeSection === "logs"} onClick={() => setActiveSection("logs")}>
                  <FileText className="h-4 w-4" />
                  <span>Logs</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeSection === "settings"} onClick={() => setActiveSection("settings")}>
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-2">
          <Card>
            <CardContent className="p-3">
              <div className="text-sm font-medium">System Status</div>
              <div className="text-xs text-muted-foreground">All systems operational</div>
              <div className="flex items-center mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                <span className="text-xs">Healthy</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

// Update the main Dashboard component to include navigation state and conditional rendering
export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeSection, setActiveSection] = useState("dashboard")

  const { data: agents = [], isLoading } = useQuery({
    queryKey: ["agents"],
    queryFn: fetchAgents,
    refetchInterval: 5000,
  })

  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const renderMainContent = () => {
    switch (activeSection) {
      case "agents":
        return <AgentsSection />
      case "monitoring":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Monitoring</h1>
              <p className="text-muted-foreground">Real-time monitoring and performance metrics</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Agent Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {agents.map((agent) => (
                      <div key={agent.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {agent.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{agent.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress value={agent.successRate} className="w-20" />
                          <span className="text-sm font-medium">{agent.successRate}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Real-time Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {agents
                      .filter((a) => a.status === "active")
                      .map((agent) => (
                        <div key={agent.id} className="flex items-center space-x-3 p-2 bg-muted rounded-md">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <div>
                            <p className="font-medium text-sm">{agent.name}</p>
                            <p className="text-xs text-muted-foreground">{agent.currentTask}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      case "logs":
        const LogsPanel = () => {
          return <div>Logs Panel Content</div>
        }
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Logs</h1>
              <p className="text-muted-foreground">System logs and agent activity history</p>
            </div>
            <LogsPanel />
          </div>
        )
      case "settings":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">Configure dashboard and system settings</p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Dashboard Settings</CardTitle>
                <CardDescription>Customize your dashboard experience</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Settings panel coming soon...</p>
              </CardContent>
            </Card>
          </div>
        )
      default:
        const StatsOverview = () => {
          return <div>Stats Overview Content</div>
        }
        const LogsPanelContent = () => {
          return <div>Logs Panel Content</div>
        }
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">CrewAI Dashboard</h1>
              <p className="text-muted-foreground">Monitor and manage your CrewAI agents in real-time</p>
            </div>

            <StatsOverview />

            <Tabs defaultValue="agents" className="space-y-4">
              <TabsList>
                <TabsTrigger value="agents">Agents</TabsTrigger>
                <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
              </TabsList>

              <TabsContent value="agents" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Active Agents</h2>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>

                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardHeader>
                          <div className="h-4 bg-muted rounded w-3/4" />
                          <div className="h-3 bg-muted rounded w-1/2" />
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="h-3 bg-muted rounded" />
                            <div className="h-3 bg-muted rounded w-2/3" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAgents.map((agent) => (
                      <AgentCard key={agent.id} agent={agent} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="monitoring" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Agent Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {agents.map((agent) => (
                          <div key={agent.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {agent.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{agent.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Progress value={agent.successRate} className="w-20" />
                              <span className="text-sm font-medium">{agent.successRate}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Real-time Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {agents
                          .filter((a) => a.status === "active")
                          .map((agent) => (
                            <div key={agent.id} className="flex items-center space-x-3 p-2 bg-muted rounded-md">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                              <div>
                                <p className="font-medium text-sm">{agent.name}</p>
                                <p className="text-xs text-muted-foreground">{agent.currentTask}</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="logs">
                <LogsPanelContent />
              </TabsContent>
            </Tabs>
          </div>
        )
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar activeSection={activeSection} setActiveSection={setActiveSection} />

        <div className="flex-1 flex flex-col">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center px-4 lg:px-6">
              <SidebarTrigger />
              <div className="ml-auto flex items-center space-x-4">
                {activeSection === "dashboard" && (
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search agents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                )}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Agent
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Agent</DialogTitle>
                      <DialogDescription>Configure a new CrewAI agent for your workflow.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input placeholder="Agent Name" />
                      <Input placeholder="Role" />
                      <Input placeholder="Description" />
                      <Button className="w-full">Create Agent</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 lg:p-6">{renderMainContent()}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
