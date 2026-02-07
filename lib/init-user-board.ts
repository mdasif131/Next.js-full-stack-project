import { Board, Column } from './models';
import connectDB from './db';

const defaultColumns = [
  { name: 'Wish List', order: 0 },
  { name: 'Applied', order: 1 },
  { name: 'Interviewing', order: 2 },
  { name: 'Offer', order: 3 },
  { name: 'Rejected', order: 6 },
  { name: 'Approve', order: 4 },
];
export async function initializeUserBoard(userId: string) {
  try {
    await connectDB();

    // Check if the user already exists
    const existingBoard = await Board.findOne({ userId, name: 'Job Hunt' });
    if (existingBoard) {
      return existingBoard;
    }

    // Create the board
    const board = await Board.create({
      name: 'Job Hunt',
      userId,
      columns: [],
    });

    // Create the default columns
    const columns = await Promise.all(
      defaultColumns.map(col =>
        Column.create({
          name: col.name,
          order: col.order,
          boardId: board._id,
          jobApplication: [],
        }),
      ),
    );

    // Update the board with the  new columns IDs
    board.columns = columns.map(col => col._id);
    await board.save();

    return board;
  } catch (error) {
    console.error('initializeUserBoard error:', error);
    throw error;
  }
}
