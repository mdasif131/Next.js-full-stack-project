'use client';
import { Board, Column, JobApplication } from '@/lib/models/models.types';
import {
  Award,
  Calendar,
  CheckCircle2,
  Mic,
  EllipsisVertical,
  Trash2,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import CreateJobDialog from './CreateJobDialog';
import JobApplicationCard from './JobApplicationCard';

interface KanvanBoardProps {
  board: Board;
  userId: string;
}
interface ColConfig {
  color: string;
  icon: React.ReactNode;
}
const COLUMN_CONFIG: Array<ColConfig> = [
  {
    color: 'bg-cyan-500',
    icon: <Calendar className="h-4 w-4" />,
  },
  {
    color: 'bg-purple-500',
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  {
    color: 'bg-green-500',
    icon: <Mic className="h-4 w-4" />,
  },
  {
    color: 'bg-yellow-500',
    icon: <Award className="h-4 w-4" />,
  },
  {
    color: 'bg-red-500',
    icon: <XCircle className="h-4 w-4" />,
  },
];
const DroppableColumn = ({
  column,
  config,
  boardId,
  sortedColumns,
}: {
  column: Column;
  config: ColConfig;
  boardId: string;
  sortedColumns: Column[];
}) => {
  const sortedJobs =
    column.jobApplications.sort((a, b) => a.order - b.order) || [];
  return (
    <Card className="min-w-75 shrink-0 shadow-md p-0">
      <CardHeader
        className={`${config.color}  text-white rounded-t-lg pb-3 pt-3`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {config.icon}
            <CardTitle className="text-white text-base font-semibold">
              {column.name}
            </CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="hover:cursor-pointer">
              <EllipsisVertical />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Trash2 />
                Delete Column
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent
        className={`space-y-2 pt-4 bg-gray-50/50 min-h-100 rounded-b-lg `}
      >
        {sortedJobs.map((job, key) => (
          <SortableJobCard
            key={key}
            job={{ ...job, columnId: job.columnId || column._id }}
            columns={sortedColumns}
          />
        ))}
        <CreateJobDialog columnId={column._id} boardId={boardId} />
      </CardContent>
    </Card>
  );
};

const SortableJobCard = ({
  job,
  columns,
}: {
  job: JobApplication;
  columns: Column[];
}) => {
  return (
    <div>
      <JobApplicationCard job={job} columns={columns} />
    </div>
  );
};
const KabanBoard = ({ board, userId }: KanvanBoardProps) => {
  const columns = board?.columns || [];
  const sortedJobs = columns?.sort((a, b) => a.order - b.order) || [];
  return (
    <>
      <div>
        <div>
          {columns.map((col, index) => {
            const config = COLUMN_CONFIG[index] || {
              color: 'bg-gray-500',
              icon: <Calendar className="h-4 w-4" />,
            };
            return (
              <DroppableColumn
                key={index}
                column={col}
                config={config}
                boardId={board._id}
                sortedColumns={sortedJobs}
              />
            );
          })}
        </div>
      </div>
    </>
  );
};

export default KabanBoard;
