
import KabanBoard from '@/components/KabanBoard';
import { getSession } from '@/lib/auth/auth';
import connectDB from '@/lib/db';
import { Board } from '@/lib/models';

import { redirect } from 'next/navigation';
import { Suspense } from 'react';

const getBoard = async (userId: string) => {
  'use cache';
  await connectDB();
  const board = await Board.findOne({
    userId: userId,
    name: 'Job Hunt',
  })
    .populate({
      path: 'columns',
      populate: {
        path: 'jobApplications',
      },
    })
    .lean();
  return board ? JSON.parse(JSON.stringify(board)) : null;
};
const DashboardPage = async () => {
   const session = await getSession();
   const board = await getBoard(session?.user.id ?? '');
   if (!session?.user) {
     redirect('/sign-in');
  }
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-black">Job Hunt</h1>
          <p className="text-gray-600">Trak you job application</p>
        </div>

        <KabanBoard board={board} userId={session.user.id} />
      </div>
    </div>
  );
}
const Dashboard = async () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardPage />
    </Suspense>
  )

};
export default Dashboard;
