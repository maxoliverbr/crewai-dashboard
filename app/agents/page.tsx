"use client"

import type React from "react"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Search, Trash2, Edit } from "lucide-react"
import { toast } from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{agent ? "Update Agent" : "Create Agent"}</Button>
      </DialogFooter>
    </form>
  )
}

export default function AgentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAgent, setSelectedAgent] = useState<AgentConfig | undefined>()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const queryClient = useQueryClient()

  const { data: agents = [], isLoading } = useQuery({
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

  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
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
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteAgentMutation.mutate(agent.id!)}>
                          <Trash2 className="h-4 w-4" />
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
