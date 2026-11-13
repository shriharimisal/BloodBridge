import { Link } from 'react-router-dom'
import { PageHeader } from '../components/ui'

export default function About() {
  return (
    <div className="page max-w-2xl">
      <PageHeader title="About BloodBridge" />
      <div className="space-y-4 text-slate-700">
        <p>BloodBridge helps people find blood quickly and helps willing donors know where they are needed.</p>
        <p>Search nearby blood banks, post an emergency request, or register as a donor. Every request shows the blood group, units, hospital and urgency so people can act fast.</p>
        <p>BloodBridge does not replace medical care. In an emergency, contact your hospital or local emergency services first.</p>
        <p>Sample blood bank names, phone numbers and stock figures are for preview only. They must be replaced with verified listings before public use.</p>
      </div>
      <Link to="/register" className="btn-primary mt-8">Become a Donor</Link>
    </div>
  )
}
