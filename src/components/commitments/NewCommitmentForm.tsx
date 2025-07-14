import { useForm, FieldValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { NewCommitmentSchema } from '@/lib/schemas/commitment'
import { useCreateCommitmentPost } from '@/hooks/useCreateCommitmentPost'

export default function NewCommitmentForm() {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(NewCommitmentSchema)
  })
  const create = useCreateCommitmentPost()
  
  const onSubmit = (data: FieldValues) => {
    create.mutate(data as any)
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <textarea {...register('content')} placeholder="Describe your pledge…" className="w-full p-2 border rounded" />
      <div className="flex space-x-2">
        <input type="number" {...register('stake')} placeholder="Stake (💎)" className="w-1/3 p-2 border rounded" />
        <input type="number" {...register('duration_days')} placeholder="Days" className="w-1/3 p-2 border rounded" />
        <label className="flex items-center space-x-1">
          <input type="checkbox" {...register('is_public')} />
          <span>Make Public</span>
        </label>
      </div>
      <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg">Create Pledge</button>
    </form>
  )
} 