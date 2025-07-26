'use client';

import { useState } from 'react';
import { useHousekeeping, useHousekeepingStats } from '@/hooks/use-housekeeping';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Sparkles, 
  Wrench, 
  CheckCircle, 
  Clock, 
  Play, 
  Pause, 
  Plus,
  Filter,
  Search
} from 'lucide-react';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  on_hold: 'bg-gray-100 text-gray-800',
};

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

const taskTypeIcons = {
  cleaning: Sparkles,
  maintenance: Wrench,
  inspection: CheckCircle,
};

export default function HousekeepingPage() {
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  
  const { tasks, isLoading, error, updateTask, createTask, deleteTask } = useHousekeeping(filterStatus || undefined);
  const { stats } = useHousekeepingStats();

  const filteredTasks = tasks?.filter((task: any) => {
    const matchesSearch = task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) || [];

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const updates: any = { status: newStatus };
      
      if (newStatus === 'in_progress') {
        updates.startedAt = new Date().toISOString();
      } else if (newStatus === 'completed') {
        updates.completedAt = new Date().toISOString();
      }
      
      await updateTask(taskId, updates);
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleCreateTask = async (taskData: any) => {
    try {
      await createTask(taskData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  if (isLoading) {
    return (
      <div className=\"flex items-center justify-center min-h-[400px]\">
        <div className=\"text-center\">
          <div className=\"animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto\"></div>
          <p className=\"mt-2 text-gray-600\">Loading housekeeping tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className=\"text-center py-8\">
        <p className=\"text-red-600\">Error loading housekeeping tasks. Please try again.</p>
      </div>
    );
  }

  return (
    <div className=\"space-y-6\">
      {/* Header */}
      <div className=\"flex justify-between items-center\">
        <div>
          <h1 className=\"text-2xl font-bold text-gray-900\">Housekeeping Management</h1>
          <p className=\"text-gray-600\">Manage room cleaning, maintenance, and inspection tasks</p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className=\"bg-indigo-600 hover:bg-indigo-700\"
        >
          <Plus className=\"w-4 h-4 mr-2\" />
          Create Task
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className=\"grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4\">
          <Card className=\"p-4\">
            <div className=\"text-2xl font-bold text-gray-900\">{stats.totalTasks}</div>
            <div className=\"text-sm text-gray-600\">Total Tasks</div>
          </Card>
          <Card className=\"p-4\">
            <div className=\"text-2xl font-bold text-yellow-600\">{stats.pendingTasks}</div>
            <div className=\"text-sm text-gray-600\">Pending</div>
          </Card>
          <Card className=\"p-4\">
            <div className=\"text-2xl font-bold text-blue-600\">{stats.inProgressTasks}</div>
            <div className=\"text-sm text-gray-600\">In Progress</div>
          </Card>
          <Card className=\"p-4\">
            <div className=\"text-2xl font-bold text-green-600\">{stats.completedTasks}</div>
            <div className=\"text-sm text-gray-600\">Completed</div>
          </Card>
          <Card className=\"p-4\">
            <div className=\"text-2xl font-bold text-gray-600\">{stats.onHoldTasks}</div>
            <div className=\"text-sm text-gray-600\">On Hold</div>
          </Card>
          <Card className=\"p-4\">
            <div className=\"text-2xl font-bold text-red-600\">{stats.urgentTasks}</div>
            <div className=\"text-sm text-gray-600\">Urgent</div>
          </Card>
          <Card className=\"p-4\">
            <div className=\"text-2xl font-bold text-indigo-600\">{Math.round(stats.averageCompletionTime)}m</div>
            <div className=\"text-sm text-gray-600\">Avg Time</div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className=\"p-4\">
        <div className=\"flex flex-wrap gap-4 items-center\">
          <div className=\"flex items-center gap-2\">
            <Search className=\"w-4 h-4 text-gray-500\" />
            <Input
              placeholder=\"Search tasks or rooms...\"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className=\"w-64\"
            />
          </div>
          <div className=\"flex items-center gap-2\">
            <Filter className=\"w-4 h-4 text-gray-500\" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className=\"px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500\"
            >
              <option value=\"\">All Status</option>
              <option value=\"pending\">Pending</option>
              <option value=\"in_progress\">In Progress</option>
              <option value=\"completed\">Completed</option>
              <option value=\"on_hold\">On Hold</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Tasks Grid */}
      <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4\">
        {filteredTasks.map((task: any) => {
          const TaskIcon = taskTypeIcons[task.taskType as keyof typeof taskTypeIcons];
          
          return (
            <Card key={task.id} className=\"p-4 hover:shadow-md transition-shadow\">
              <div className=\"flex items-start justify-between mb-3\">
                <div className=\"flex items-center gap-2\">
                  <TaskIcon className=\"w-5 h-5 text-indigo-600\" />
                  <div>
                    <h3 className=\"font-semibold text-gray-900\">Room {task.roomNumber}</h3>
                    <p className=\"text-sm text-gray-600\">{task.roomType} • Floor {task.roomFloor}</p>
                  </div>
                </div>
                <Badge className={priorityColors[task.priority as keyof typeof priorityColors]}>
                  {task.priority}
                </Badge>
              </div>
              
              <p className=\"text-sm text-gray-700 mb-3\">{task.description}</p>
              
              <div className=\"flex items-center justify-between mb-3\">
                <Badge className={statusColors[task.status as keyof typeof statusColors]}>
                  {task.status.replace('_', ' ')}
                </Badge>
                <span className=\"text-sm text-gray-600\">{task.formattedDuration}</span>
              </div>
              
              <div className=\"flex gap-2\">
                {task.status === 'pending' && (
                  <Button
                    size=\"sm\"
                    onClick={() => handleStatusChange(task.id, 'in_progress')}
                    className=\"bg-blue-600 hover:bg-blue-700\"
                  >
                    <Play className=\"w-4 h-4 mr-1\" />
                    Start
                  </Button>
                )}
                {task.status === 'in_progress' && (
                  <>
                    <Button
                      size=\"sm\"
                      onClick={() => handleStatusChange(task.id, 'completed')}
                      className=\"bg-green-600 hover:bg-green-700\"
                    >
                      <CheckCircle className=\"w-4 h-4 mr-1\" />
                      Complete
                    </Button>
                    <Button
                      size=\"sm\"
                      variant=\"outline\"
                      onClick={() => handleStatusChange(task.id, 'on_hold')}
                    >
                      <Pause className=\"w-4 h-4 mr-1\" />
                      Hold
                    </Button>
                  </>
                )}
                {task.status === 'on_hold' && (
                  <Button
                    size=\"sm\"
                    onClick={() => handleStatusChange(task.id, 'in_progress')}
                    className=\"bg-blue-600 hover:bg-blue-700\"
                  >
                    <Play className=\"w-4 h-4 mr-1\" />
                    Resume
                  </Button>
                )}
                <Button
                  size=\"sm\"
                  variant=\"outline\"
                  onClick={() => setSelectedTask(task)}
                >
                  Details
                </Button>
              </div>
              
              {task.notes && (
                <p className=\"text-xs text-gray-500 mt-2 italic\">{task.notes}</p>
              )}
            </Card>
          );
        })}
      </div>

      {filteredTasks.length === 0 && (
        <div className=\"text-center py-8\">
          <Clock className=\"w-12 h-12 text-gray-400 mx-auto mb-4\" />
          <p className=\"text-gray-600\">No housekeeping tasks found.</p>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className=\"mt-4 bg-indigo-600 hover:bg-indigo-700\"
          >
            Create First Task
          </Button>
        </div>
      )}
    </div>
  );
}