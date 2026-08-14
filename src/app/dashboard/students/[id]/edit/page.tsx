import { redirect } from "next/navigation"

export default async function EditStudentRedirect(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  redirect(`/dashboard/students/${params.id}`)
}
