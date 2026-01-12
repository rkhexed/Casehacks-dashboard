import { getHackers } from './actions';
import Link from 'next/link';

interface Hacker {
  id: string;
  name: string | null;
  email: string;
  school: string | null;
  year: string | null;
  status: string | null;
}

export default async function HackersPage() {
  const hackers: Hacker[] = await getHackers();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-8">Hacker Profiles</h1>
        
        <div className="bg-card rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-background">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">School</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">Year</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">Status</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">View</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {hackers.map((hacker) => (
                  <tr key={hacker.id} className="hover:bg-background/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{hacker.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/80">{hacker.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/80">{hacker.school || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/80">{hacker.year || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${hacker.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {hacker.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/dashboard/hackers/${hacker.id}`} className="text-primary hover:text-primary/80">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
