import { UserProfile } from '@clerk/nextjs';

export default function ProfileViewPage() {
  return (
    <div className='flex w-full flex-col p-4'>
      {/* <UserProfile /> */}
      <div className='flex h-96 items-center justify-center rounded-lg border-2 border-dashed'>
        <p className='text-muted-foreground'>User Profile (Clerk component disabled)</p>
      </div>
    </div>
  );
}
