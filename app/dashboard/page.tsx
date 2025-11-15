export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-8">
          Check-in Monitor
        </h1>
        
        <div className="grid gap-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 bg-card rounded-lg shadow">
              <p className="text-sm text-foreground/60 mb-1">Total Check-ins</p>
              <p className="text-3xl font-bold text-primary">0</p>
            </div>
            <div className="p-6 bg-card rounded-lg shadow">
              <p className="text-sm text-foreground/60 mb-1">Events Today</p>
              <p className="text-3xl font-bold text-primary">0</p>
            </div>
            <div className="p-6 bg-card rounded-lg shadow">
              <p className="text-sm text-foreground/60 mb-1">Total Participants</p>
              <p className="text-3xl font-bold text-primary">0</p>
            </div>
          </div>

          {/* QR Scanner */}
          <div className="p-8 bg-card rounded-lg shadow">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              QR Code Scanner
            </h2>
            <div className="p-12 bg-background rounded border-2 border-dashed border-border flex items-center justify-center">
              <p className="text-foreground/40">
                Scanner
              </p>
            </div>
          </div>

          {/* Recent Check-ins */}
          <div className="p-8 bg-card rounded-lg shadow">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Recent Check-ins
            </h2>
            <div className="p-6 bg-background rounded">
              <p className="text-center text-foreground/60">
                No check-ins yet
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
