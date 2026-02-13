export default function Loading() {
    return (
        <div className="mx-auto max-w-lg px-4 py-20">
            <div className="glass-card p-8">
                <div className="mb-6 flex items-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
                    <div className="skeleton h-6 w-48" />
                </div>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="skeleton h-2 w-2 rounded-full" />
                            <div className="skeleton h-4 flex-1" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
