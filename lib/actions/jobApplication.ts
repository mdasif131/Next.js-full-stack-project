'use server';
import { revalidatePath } from 'next/cache';
import { getSession } from '../auth/auth';
import connectDB from '../db';
import { Board, Column, JobApplications } from '../models';

interface JobApplicationData {
  company: string;
  position: string;
  location?: string;
  notes?: string;
  salary?: string;
  jobUrl?: string;
  columnId: string;
  boardId: string;
  tags?: string[];
  description?: string;
}
export async function createJobApplication(data: JobApplicationData) {
  const session = await getSession();
  if (!session?.user) {
    return { error: 'Unauthorized' };
  }
  await connectDB();

  const {
    company,
    position,
    location,
    notes,
    salary,
    jobUrl,
    columnId,
    boardId,
    tags,
    description,
  } = data;

  if (!company || !position || !columnId || !boardId) {
    return { error: 'Missing required fields' };
  }

  // Verify board ownership
  const board = await Board.findOne({
    _id: boardId,
    userId: session.user.id,
  });
  if (!board) {
    return { error: 'Board not found' };
  }

  // Verify column belongs to board
  const column = await Column.findOne({
    _id: columnId,
    boardId: boardId,
  });
  if (!column) {
    return { error: 'Column not found' };
  }
  const maxOrder = (await JobApplications.findOne({ columnId })
    .sort({ order: -1 })
    .select('order')
    .lean()) as { order: number } | null;
  const jobApplication = await JobApplications.create({
    company,
    position,
    location,
    notes,
    salary,
    jobUrl,
    columnId,
    boardId,
    tags: tags || [],
    description,
    userId: session.user.id,
    status: 'applied',
    order: maxOrder ? maxOrder.order + 1 : 0,
  });

  await Column.findByIdAndUpdate(columnId, {
    $push: { jobApplications: jobApplication._id },
  });

  revalidatePath('/dashboard');
  return { data: JSON.parse(JSON.stringify(jobApplication)) };
}

export async function updateJobApplication(
  id: string,
  updates: {
    company?: string;
    position?: string;
    location?: string;
    notes?: string;
    salary?: string;
    jobUrl?: string;
    columnId?: string;
    order?: number;
    tags?: string[];
    description?: string;
  },
) {
  const session = await getSession();
  if (!session?.user) {
    return { error: 'Unauthorized' };
  }

  const jobApplication = await JobApplications.findById(id);
  if (!jobApplication) {
    return { error: 'Job application not found' };
  }

  if (jobApplication.userId !== session.user.id) {
    return { error: 'Unauthorized' };
  }

  const { columnId, order, ...otherUpdates } = updates;

  const updatesToApply: any = { ...otherUpdates };

  const currentColumnId = jobApplication.columnId.toString();
  const newColumnId = columnId?.toString() || currentColumnId;

  const isMovingToDifferentColumn =
    newColumnId && newColumnId !== currentColumnId;

  // If moving to different column, remove from old column
  if (isMovingToDifferentColumn) {
    await Column.findByIdAndUpdate(currentColumnId, {
      $pull: { jobApplications: id },
    });
  }

  // Get jobs in target column (excluding this job)
  const jobsInTargetColumn = await JobApplications.find({
    columnId: newColumnId,
    _id: { $ne: id },
  })
    .sort({ order: 1 })
    .lean();

  let newOrderValue: number;

  if (order !== undefined && order !== null) {
    newOrderValue = order * 100;

    if (isMovingToDifferentColumn) {
      // Insert into new column at position
      const jobsThatNeedToShift = jobsInTargetColumn.slice(order);

      for (const job of jobsThatNeedToShift) {
        await JobApplications.findByIdAndUpdate(job._id, {
          $set: { order: job.order + 100 },
        });
      }

      await Column.findByIdAndUpdate(newColumnId, {
        $push: { jobApplications: id },
      });

      updatesToApply.columnId = newColumnId;
      updatesToApply.order = newOrderValue;
    } else {
      // Reordering within same column
      const otherJobsInColumn = jobsInTargetColumn;

      const currentJobOrder = jobApplication.order || 0;
      const currentPositionIndex = otherJobsInColumn.findIndex(
        job => job.order > currentJobOrder,
      );

      const oldPositionIndex =
        currentPositionIndex === -1
          ? otherJobsInColumn.length
          : currentPositionIndex;

      if (order < oldPositionIndex) {
        const jobsToShiftDown = otherJobsInColumn.slice(
          order,
          oldPositionIndex,
        );

        for (const job of jobsToShiftDown) {
          await JobApplications.findByIdAndUpdate(job._id, {
            $set: { order: job.order + 100 },
          });
        }
      } else if (order > oldPositionIndex) {
        const jobsToShiftUp = otherJobsInColumn.slice(oldPositionIndex, order);

        for (const job of jobsToShiftUp) {
          const newOrder = Math.max(0, job.order - 100);
          await JobApplications.findByIdAndUpdate(job._id, {
            $set: { order: newOrder },
          });
        }
      }

      updatesToApply.order = newOrderValue;
    }
  } else {
    // No order provided → append to end
    if (jobsInTargetColumn.length > 0) {
      const lastJobOrder =
        jobsInTargetColumn[jobsInTargetColumn.length - 1].order || 0;
      newOrderValue = lastJobOrder + 100;
    } else {
      newOrderValue = 0;
    }

    updatesToApply.columnId = newColumnId;
    updatesToApply.order = newOrderValue;

    if (isMovingToDifferentColumn) {
      await Column.findByIdAndUpdate(newColumnId, {
        $push: { jobApplications: id },
      });
    }
  }

  const updated = await JobApplications.findByIdAndUpdate(id, updatesToApply, {
    new: true,
  });

  revalidatePath('/dashboard');

  return { data: JSON.parse(JSON.stringify(updated)) };
}

